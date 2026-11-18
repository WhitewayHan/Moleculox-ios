import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Execute production recognizers/listeners. No game copy or Firebase connection.
const game = readFileSync(new URL('../www/js/game-r160.js', import.meta.url), 'utf8');
function section(start, end) {
  const first = game.indexOf(start), last = game.indexOf(end, first);
  assert.ok(first >= 0 && last > first, 'production section exists: ' + start);
  return game.slice(first, last);
}
const input = section('let pd=null;', "[['#dU',0]");

function pointer(type, values = {}) {
  const event = new Event(type, {cancelable: true});
  Object.assign(event, {pointerId: 1, pointerType: 'touch', isPrimary: true,
    clientX: 80, clientY: 90, ...values});
  return event;
}
function bootInput() {
  const board = new EventTarget(), window = new EventTarget(), captures = new Set();
  const moves = [], barriers = [], selections = [];
  board.getBoundingClientRect = () => ({left: 20, top: 30, width: 200, height: 200});
  board.setPointerCapture = id => captures.add(id);
  board.hasPointerCapture = id => captures.has(id);
  board.releasePointerCapture = id => {
    captures.delete(id);
    board.dispatchEvent(pointer('lostpointercapture', {pointerId: id}));
  };
  const context = {
    board, window, navigator: {maxTouchPoints: 1}, performance,
    W: 5, H: 5, atoms: [{x: 1, y: 1, e: 'H'}, {x: 3, y: 3, e: 'O'}],
    atomPressIdx: -1, atomPressAt: 0, sel: 1, selT0: 0,
    won: false, barrierMode: false, hammerMode: false, tutorialActive: false,
    tutorialWaitTap: null, tutorialGuideDir: null, tutorialStep: 0, tut: 9,
    tryRotatingChamberPointer: () => false, resetIdle() {}, mxHaptic() {},
    effectsAllowed: () => false, SFX: {select: () => selections.push(true)},
    move: (i, d) => moves.push([i, d]),
    boardCellAt: (x, y) => ({x: Math.floor((x - 20) / 40), y: Math.floor((y - 30) / 40)}),
    attemptBarrierAt: (x, y) => barriers.push([x, y]),
  };
  vm.runInNewContext(input + '\nglobalThis.state=()=>({pd,atomPressIdx,sel});', context);
  return {board, window, captures, moves, barriers, selections, context,
    send: (type, values) => board.dispatchEvent(pointer(type, values))};
}

test('touch drift below 18 CSS pixels selects; original four swipe directions and diagonal tie remain', () => {
  const tap = bootInput();
  tap.send('pointerdown'); tap.send('pointerup', {clientX: 97});
  assert.equal(tap.context.state().sel, 0);
  assert.equal(tap.selections.length, 1);
  assert.deepEqual(tap.moves, []);
  for (const [dx, dy, expected] of [[18, 0, 1], [-50, 0, 3], [0, -50, 0], [0, 50, 2], [50, 50, 2]]) {
    const h = bootInput(); h.send('pointerdown');
    h.send('pointerup', {clientX: 80 + dx, clientY: 90 + dy});
    assert.deepEqual(h.moves, [[0, expected]]);
  }
});

test('a swipe wholly outside atom targets never moves the previous selection', () => {
  const h = bootInput();
  h.send('pointerdown', {clientX: 210, clientY: 35});
  h.send('pointerup', {clientX: 240, clientY: 35});
  assert.deepEqual(h.moves, []);
  assert.equal(h.context.state().sel, 1);
});

test('original missed-start recovery may select an atom near the release point', () => {
  const h = bootInput();
  h.send('pointerdown', {clientX: 20, clientY: 90});
  h.send('pointerup', {clientX: 80, clientY: 90});
  assert.deepEqual(h.moves, [[0, 1]]);
});

test('secondary fingers and mismatched releases cannot replace the primary gesture', () => {
  const h = bootInput(); h.send('pointerdown');
  h.send('pointerdown', {pointerId: 2, isPrimary: false, clientX: 160});
  h.send('pointerup', {pointerId: 2, clientX: 210});
  assert.equal(h.context.state().pd.id, 1);
  assert.deepEqual(h.moves, []);
  h.send('pointerup', {clientX: 130});
  assert.deepEqual(h.moves, [[0, 1]]);
});

test('cancel, lost capture, blur, and explicit level reset discard held input and release capture', () => {
  for (const reason of ['pointercancel', 'lostpointercapture', 'blur', 'level-reset']) {
    const h = bootInput(); h.send('pointerdown');
    assert.equal(h.captures.has(1), true);
    if (reason === 'blur') h.window.dispatchEvent(new Event('blur'));
    else if (reason === 'level-reset') h.context.resetBoardPointer();
    else h.send(reason);
    assert.equal(h.context.state().pd, null, reason);
    assert.equal(h.context.state().atomPressIdx, -1, reason);
    assert.equal(h.captures.size, 0, reason);
    h.send('pointerup', {clientX: 130});
    assert.deepEqual(h.moves, [], reason);
    // Cancellation must not leave the next legitimate gesture blocked.
    h.send('pointerdown', {pointerId: 3});
    h.send('pointerup', {pointerId: 3, clientX: 130});
    assert.deepEqual(h.moves, [[0, 1]], reason);
  }
});

test('an unrelated pointer cancellation leaves the active gesture intact', () => {
  const h = bootInput(); h.send('pointerdown');
  h.send('pointercancel', {pointerId: 2});
  assert.equal(h.context.state().pd.id, 1);
  h.send('pointerup', {clientX: 130});
  assert.deepEqual(h.moves, [[0, 1]]);
});

test('a removed, reindexed, or replaced atom cancels the held gesture safely', () => {
  for (const mutate of [atoms => atoms.splice(0, 1), atoms => atoms.splice(0),
    atoms => {atoms[0] = {...atoms[0]};}]) {
    const h = bootInput(); h.send('pointerdown');
    mutate(h.context.atoms);
    h.send('pointerup', {clientX: 130});
    assert.deepEqual(h.moves, []);
    assert.equal(h.context.state().pd, null);
    assert.equal(h.context.state().atomPressIdx, -1);
  }
});

test('barrier drift keeps the original placement cell and never becomes an atom swipe', () => {
  const h = bootInput(); h.context.barrierMode = true;
  h.send('pointerdown'); h.send('pointerup', {clientX: 160, clientY: 170});
  assert.deepEqual(h.barriers, [[1, 1]]);
  assert.deepEqual(h.moves, []);
});

test('move rejects stale indices before both regular and precision movement', () => {
  const moveSource = section('function move(i,d){', 'function applyLightningAtoms(');
  const context = {atoms: [], hardMoveCapBlocksNextMove() {throw new Error('must reject invalid atom first');}};
  vm.runInNewContext(moveSource, context);
  for (const i of [-1, 0, 5, undefined, NaN]) assert.doesNotThrow(() => context.move(i, 1));
});

test('production level, tutorial, and suspend transitions invoke pointer cleanup', () => {
  // Abort real transition functions at their first subsequent dependency: cleanup
  // must already have occurred, without building an artificial game state.
  for (const [start, end, stop] of [
    ["function startLevel(i,mode='campaign',expectedKey=''){", 'function tutorialSpotEl(', 'clearTimeout'],
    ['function loadTutorialPuzzle(tl){', 'function tutorialGoStep(', 'MOLS'],
  ]) {
    const source = section(start, end), sentinel = new Error('transition body reached');
    let resets = 0;
    const context = {resetBoardPointer() {resets++;}};
    if (stop === 'clearTimeout') context.clearTimeout = () => {throw sentinel;};
    else context.MOLS = new Proxy({}, {get() {throw sentinel;}});
    vm.runInNewContext(source, context);
    try {
      if (stop === 'clearTimeout') context.startLevel(0);
      else context.loadTutorialPuzzle({m: 'test'});
      assert.fail('transition should reach sentinel');
    } catch (error) {assert.equal(error, sentinel);}
    assert.equal(resets, 1);
  }
  let resets = 0;
  const context = {pd: {}, AC: null, document: {getElementById: () => null}, resetBoardPointer() {resets++;}};
  vm.runInNewContext(section('function releaseTransientResourcesForSuspend(){', 'function restoreTransientResourcesAfterResume(){'), context);
  context.releaseTransientResourcesForSuspend();
  assert.equal(resets, 1);
});

function bootRematch(result) {
  const button = new EventTarget(), request = new EventTarget(), timers = [], messages = [];
  button.disabled = request.disabled = false;
  const context = {
    $: id => id === '#mOnlineRematch' ? button : request,
    SFX: {play() {}, click() {}}, duelState: {pool: 'mixed', gameKind: 'classic'},
    duelMakeRounds: () => [], duelBuildLevels: () => [], s: {code: '123456'},
    window: {MXCloud: {rematchDuelRoom: () => Promise.resolve(result)}},
    onlinePromiseTimeout: promise => promise, sendOnlineQuickMessage: message => messages.push(message),
    setTimeout: callback => timers.push(callback),
  };
  vm.runInNewContext(section("  const rematch=$('#mOnlineRematch');", "  bindOnlineQuickMessageButtons($('#modalBox'));"), context);
  return {button, request, timers, messages};
}

test('failed online rematch re-enables its actual button after event.currentTarget expires', async () => {
  for (const result of [null, {ok: false}, {ok: true}]) {
    const h = bootRematch(result), event = pointer('pointerdown');
    h.button.dispatchEvent(event);
    assert.equal(h.button.disabled, true);
    assert.equal(event.currentTarget, null);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(h.button.disabled, !!result?.ok);
  }
});

test('guest rematch-request cooldown re-enables the button after dispatch', () => {
  const h = bootRematch({ok: true}), event = pointer('pointerdown');
  h.request.dispatchEvent(event);
  assert.equal(event.currentTarget, null);
  assert.equal(h.request.disabled, true);
  assert.deepEqual(h.messages, ['rematch']);
  h.timers[0]();
  assert.equal(h.request.disabled, false);
});
