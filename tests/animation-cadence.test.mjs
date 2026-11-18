import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Execute the shipped particle renderer and scheduler. Canvas, display ticks and
// browser visibility are controlled so wall-clock timing assertions are repeatable.
const source = readFileSync(new URL('../www/js/game-r160.js', import.meta.url), 'utf8');
const fxSource = source.slice(source.indexOf("const fxc=$('#fx')"),
  source.indexOf('/* ================= TUTORIAL DEMO'));
const loopSource = source.slice(source.indexOf('function hasRealtimeFxParts()'),
  source.indexOf('/* ================= INPUT ================= */'));

function runtime({playing = true, mobile = true, low = false, reduced = false, frameRate = '60'} = {}) {
  let now = 1000, nextId = 1;
  const callbacks = {}, rafs = new Map(), timers = new Map(), boardFrames = [], fxFrames = [];
  const canvasContext = new Proxy({globalAlpha: 1}, {get: (target, key) => key in target ? target[key] : () => {}});
  const canvas = {width: 393, height: 852, style: {}, getContext: () => canvasContext};
  const document = {
    hidden: false,
    body: {classList: {contains: value => value === 'mxGameplayActive' && playing}},
    addEventListener: (name, callback) => {(callbacks[name] ||= []).push(callback);},
  };
  const context = vm.createContext({
    performance: {now: () => now}, document,
    innerWidth: mobile ? 393 : 1280, innerHeight: 852,
    $: () => canvas,
    requestAnimationFrame: callback => {const id = nextId++; rafs.set(id, callback); return id;},
    setTimeout: (callback, delay) => {const id = nextId++; timers.set(id, {callback, delay}); return id;},
    clearTimeout: id => timers.delete(id),
    save: {performanceMode: low ? 'low' : 'high', effects: true, effectLevel: 'normal'},
    motionReduced: () => reduced, performanceLow: () => low, performancePressure: () => false,
    mobileGameplayRender: () => mobile, mxFxQuality: () => 'high', mxFrameRateMode: () => frameRate,
    effectiveDpr: () => 1,
    atoms: [{x: 1, y: 1, e: 'H'}], anim: null, bounce: null, nudge: null,
    movingWallAnimating: false, chainAutoActive: false, won: false, winT: 0,
    dailyMode: false, duelMode: false, crystalMode: false, chainMode: false, reactorMode: false,
    lv: 530, enzymeGate: null, crystals: [], hintMark: null, curMol: {}, solveClock: {eligible: false},
    movingWalls: [], pressureSystems: [], rotationPads: new Map(), riftPairs: new Map(),
    portalPairs: new Map(), temporaryBarriers: new Map(),
    reactorActive: () => false, crystalActive: () => false,
    replicatorLabActive: () => false, photonBoostLabActive: () => false,
    synthesizerLabActive: () => false, repulsorLabActive: () => false, rotatingChamberLabActive: () => false,
    scr: {game: {classList: {contains: () => playing}}},
    renderBoard: timestamp => boardFrames.push(timestamp),
  });
  const evaluate = code => vm.runInContext(code, context);
  evaluate(fxSource + '\n' + loopSource);
  const realRenderFx = evaluate('renderFx');
  context.renderFx = (timestamp, elapsed) => {fxFrames.push({timestamp, elapsed}); realRenderFx(timestamp, elapsed);};
  evaluate('lastBoardFrame=performance.now(); lastFxFrame=performance.now();');
  return {
    context, document, rafs, timers, boardFrames, fxFrames, evaluate,
    setNow: value => {now = value;},
    tick(timestamp) {
      now = timestamp;
      // Supply an actual display tick, independent of the host machine's refresh rate.
      rafs.clear(); timers.clear();
      evaluate('mainLoopTimer=0; mainLoopRaf=0;');
      evaluate(`loop(${timestamp});`);
    },
    run(seconds, hz) {
      const start = now;
      for (let i = 1; i <= Math.round(seconds * hz); i++) this.tick(start + i * 1000 / hz);
    },
    visibility(hidden, timestamp) {
      now = timestamp; document.hidden = hidden;
      for (const callback of callbacks.visibilitychange || []) callback();
    },
    particle(options = {}) {
      context.options = {k: 'ring', x: 0, y: 0, r: 1, vr2: 0, c: '#fff', life: 20, ...options};
      return evaluate('P(options); PARTS[PARTS.length-1];');
    },
  };
}

for (const hz of [60, 90, 120, 144]) {
  test(`particle age follows elapsed time on a ${hz} Hz display`, () => {
    const game = runtime();
    const particle = game.particle();
    game.run(10, hz);
    assert.ok(Math.abs(particle.t - 10) < 0.025, `age=${particle.t}`);
    assert.ok(game.fxFrames.length >= 598 && game.fxFrames.length <= 601);
    const elapsed = game.fxFrames.reduce((sum, frame) => sum + frame.elapsed, 0);
    assert.ok(Math.abs(elapsed - 10000) < 25, `integrated=${elapsed}`);
  });
}

test('decorative boards render at 30 Hz, or 20 Hz in low mode', () => {
  for (const low of [false, true]) {
    const game = runtime({low});
    game.run(10, 120);
    assert.ok(Math.abs(game.boardFrames.length - (low ? 200 : 300)) <= 1);
  }
});

test('menu ambient particles follow real time at 30 Hz', () => {
  const game = runtime({playing: false});
  const particle = game.particle({amb: 1});
  game.run(2, 144);
  assert.ok(Math.abs(game.fxFrames.length - 60) <= 1);
  assert.ok(Math.abs(particle.t - 2) < 0.04, `age=${particle.t}`);
});

test('mobile slides keep live particle effects moving at their authored cadence', () => {
  const game = runtime();
  const particle = game.particle({k: 'glit', r: 1, vx: 1, vy: 0});
  game.context.anim = {};
  game.run(1, 60);
  assert.equal(game.boardFrames.length, 60);
  assert.equal(game.fxFrames.length, 60);
  assert.ok(Math.abs(particle.t - 1) < 1e-10);
  assert.ok(Math.abs(particle.x - 1000 / 16.7) < 1e-8);
  assert.equal(game.timers.size, 0, 'live particles use display rAF, including on mobile');
});

test('120 Hz opt-in changes sampling while particle speed remains unchanged', () => {
  const game = runtime({frameRate: '120'});
  const particle = game.particle();
  game.context.anim = {};
  game.run(1, 120);
  assert.equal(game.boardFrames.length, 120);
  assert.equal(game.fxFrames.length, 60, 'FX retain the existing 60 Hz target');
  assert.ok(Math.abs(particle.t - 1) < 1e-10);
});

test('new particles do not inherit the time before their emission', () => {
  const game = runtime();
  game.setNow(5000);
  const particle = game.particle({k: 'glit', r: 1, vx: 1, vy: 0});
  game.tick(5005);
  assert.ok(Math.abs(particle.t - 0.005) < 1e-10);
  assert.ok(Math.abs(particle.x - 5 / 16.7) < 1e-10);
});

test('a delayed particle travels only for the part of a frame after its delay', () => {
  const game = runtime();
  const particle = game.particle({k: 'glit', r: 1, vx: 1, vy: 0, d: 0.1});
  game.evaluate('renderFx(1050,50);');
  assert.equal(particle.x, 0);
  game.evaluate('renderFx(1110,60);');
  assert.ok(Math.abs(particle.t - 0.11) < 1e-10);
  assert.ok(Math.abs(particle.x - 10 / 16.7) < 1e-10);
});

test('background pages do no periodic work and resume without advancing hidden time', () => {
  const game = runtime();
  const particle = game.particle();
  game.tick(1100);
  const age = particle.t;
  const boards = game.boardFrames.length, fx = game.fxFrames.length;
  game.visibility(true, 1100);
  game.tick(101100);
  assert.equal(game.boardFrames.length, boards);
  assert.equal(game.fxFrames.length, fx);
  assert.equal(game.rafs.size, 0);
  assert.equal(game.timers.size, 0);
  game.visibility(false, 101100);
  game.tick(101116);
  assert.ok(Math.abs(particle.t - age - 0.016) < 1e-10);
});

test('a burst wakes an idle timer once, without duplicating animation frames', () => {
  const game = runtime({reduced: false});
  game.tick(1034);
  assert.equal(game.timers.size, 1);
  game.particle();
  game.particle();
  assert.equal(game.timers.size, 0);
  assert.equal(game.rafs.size, 1);
});

test('reduced-motion and truly empty boards retain the idle cadence', () => {
  const reduced = runtime({reduced: true});
  reduced.run(10, 60);
  assert.equal(reduced.boardFrames.length, 40);
  const empty = runtime();
  empty.context.atoms = [];
  empty.run(10, 60);
  assert.equal(empty.boardFrames.length, 40);
});
