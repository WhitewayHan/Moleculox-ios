'use strict';
const fs=require('fs');
const game=fs.readFileSync('www/js/game.js','utf8');
function ok(cond,msg){if(!cond){console.error('FAIL:',msg);process.exitCode=1;}else console.log('PASS:',msg);}
ok(game.includes("function performanceLow(){return save.performanceMode==='low';}"),'automatic mode does not become user low-power mode');
ok(game.includes('function performancePressure()'),'runtime pressure has a dedicated path');
ok(game.includes('boardNeedsRealtime()?16.5'),'interactive board targets ~60fps');
ok(game.includes('Math.min(60,perfFrames*1000'),'90/120Hz displays normalized to 60fps target');
ok(game.includes("if(severe)return Math.min(raw,1.15)"),'severe pressure reduces internal DPR first');
ok(game.includes("if(dynamicLow)return Math.min(raw,mobile?1.32:1.55)"),'pressure lowers pixel fill-rate before cadence');
ok(game.includes('perfGoodWindows>=6'),'governor uses recovery hysteresis');
ok(game.includes("classList.toggle('mxPerfPressure',nextLow)"),'governor uses zero-loss pressure class');
if(process.exitCode)process.exit(process.exitCode);
