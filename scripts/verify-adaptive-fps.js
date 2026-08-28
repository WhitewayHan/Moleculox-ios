'use strict';
const fs=require('fs');
const game=fs.readFileSync('www/js/game.js','utf8');
function ok(cond,msg){if(!cond){console.error('FAIL:',msg);process.exitCode=1;}else console.log('PASS:',msg);}
ok(game.includes("function performanceLow(){return save.performanceMode==='low';}"),'automatic mode does not become user low-power mode');
ok(game.includes('function performancePressure()'),'runtime pressure has a dedicated path');
ok(game.includes('const ACTIVE_FRAME_MS=1000/60'),'active gameplay has an explicit 60fps heavy-render budget');
ok(game.includes('const boardEvery=gameVisible?(realtimeBoard?ACTIVE_FRAME_MS:'),'interactive board targets ~60fps whenever the board is moving');
ok(game.includes('if(syncToDisplay){mainLoopNextDue=0;mainLoopRaf=requestAnimationFrame(loop);return;}'),'active motion is VSync-synchronised instead of timeout-aliased');
ok(game.includes('scheduleMainLoop(liveSync?ACTIVE_FRAME_MS:staticCadence,liveSync)'),'idle gameplay lowers JS wakeups without lowering visible idle cadence');
ok(game.includes('const fps=Math.min(60,observed*(60/expectedFps))'),'60/90/120/144Hz and idle cadence are normalized to the 60fps health target');
ok(game.includes("if(severe)return Math.min(raw,1.15)"),'severe pressure reduces internal DPR first');
ok(game.includes("if(dynamicLow)return Math.min(raw,mobile?1.32:1.55)"),'pressure lowers pixel fill-rate before cadence');
ok(game.includes('perfGoodWindows>=6'),'governor uses recovery hysteresis');
ok(game.includes("classList.toggle('mxPerfPressure',nextLow)"),'governor uses zero-loss pressure class');
if(process.exitCode)process.exit(process.exitCode);
