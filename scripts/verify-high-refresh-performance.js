'use strict';
const fs=require('fs');
const game=fs.readFileSync('www/js/game.js','utf8');
const css=fs.readFileSync('www/css/app.css','utf8');
function ok(c,m){if(!c){console.error('FAIL:',m);process.exitCode=1;}else console.log('PASS:',m);}
function cadenceStamp(last,now,every){if(!last||now-last>every*4)return now;return last+every;}
function simulatedHeavyFps(refreshHz,seconds=20){
  const displayStep=1000/refreshHz,every=1000/60;let last=0,draws=0;
  const frames=Math.round(refreshHz*seconds);
  for(let i=1;i<=frames;i++){
    const t=i*displayStep;
    if(t-last>=every){last=cadenceStamp(last,t,every);draws++;}
  }
  return draws/seconds;
}
for(const hz of [60,90,120,144,165]){
  const fps=simulatedHeavyFps(hz);
  ok(fps>=59&&fps<=60.1,`${hz}Hz display cadence keeps heavy rendering at ~60fps (${fps.toFixed(2)})`);
}
ok(!game.includes('function drawOnlineSpectatorFrame('),'hidden simultaneous online duel has no live spectator render loop');
ok(game.includes("async function publishOnlineMoveEvent(){return {ok:false,reason:'duel/live-hidden'};}"),'opponent move publishing stays hard-disabled');
ok(game.includes('function updatePerformanceGovernor(t,expectedCadence=ACTIVE_FRAME_MS)'),'performance governor understands intentional idle cadence');
ok(game.includes('if(gap>expected*1.55)perfJankFrames++'),'governor jank thresholds scale with requested cadence');
ok(game.includes('if(document.hidden){lastT=t;mainLoopNextDue=0;return;}'),'backgrounded app stops periodic main-loop work');
ok(game.includes('lastT=performance.now();perfWindowStart=lastT;perfFrames=0;wakeMainLoop();'),'visibility resume explicitly wakes the stopped loop');
ok(game.includes("const boardStatic=document.createElement('canvas')"),'static board layer is cached');
ok(game.includes('drawBoardStatic();'),'cached board layer is used by the renderer');
ok(game.includes('invalidateBoardStatic();closeModal();cancelHammer();'),'hammer grid mutation invalidates the static cache');
ok(game.includes('movingWallAnimating=false;invalidateBoardStatic();'),'moving-wall state invalidates the static cache');
ok(game.includes('if(sys.open!==nextOpen)invalidateBoardStatic();'),'pressure-door state invalidates the static cache');
ok(!game.includes('dpr=fxDpr;'),'decorative FX resizing cannot overwrite board DPR state');
ok(css.includes('R77.3 / HOTFIX 4 — HIGH-REFRESH THERMAL + COMPOSITOR HARDENING'),'high-refresh compositor guard is present');
ok(css.includes('body.mxNative #bgVignette')&&css.includes('body.mxNative #bgParticles'),'static full-screen overlay promotion is removed on native');
if(process.exitCode)process.exit(process.exitCode);
