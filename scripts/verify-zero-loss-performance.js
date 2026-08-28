'use strict';
const fs=require('fs');
const game=fs.readFileSync('www/js/game.js','utf8');
const css=fs.readFileSync('www/css/app.css','utf8');
function ok(c,m){if(!c){console.error('FAIL:',m);process.exitCode=1;}else console.log('PASS:',m);}
ok(game.includes("function performanceLow(){return save.performanceMode==='low';}"),'automatic governor is separate from user Low power mode');
ok(game.includes("classList.toggle('mxPerfPressure',nextLow)"),'automatic pressure uses non-feature-suppressing class');
ok(game.includes("classList.remove('mxIOSSafePerf','mxAndroidSafePerf')"),'legacy automatic FX-suppression classes are disabled');
ok(game.includes('const boardEvery=gameVisible?(realtimeBoard?ACTIVE_FRAME_MS:'),'interactive board remains ~60fps target');
ok(game.includes("PARTS.length?(performanceLow()?33:ACTIVE_FRAME_MS)"),'automatic pressure keeps active particle FX cadence at ~60fps');
ok(game.includes("const dynamicLow=document.body.classList.contains('mxPerfPressure')"),'pressure can lower internal DPR without deleting effects');
ok(css.includes('R81 / R5 — ZERO-LOSS MOBILE PERFORMANCE PASS'),'R5 zero-loss CSS guard present');
ok(css.includes('.screen:not(.on):not(.mxLeaving)'),'hidden screens are suspended only when invisible');
const r5=css.slice(css.indexOf('R81 / R5 — ZERO-LOSS MOBILE PERFORMANCE PASS'));
ok(!/mxPerf(?:Pressure|Severe)[^\n{]*\{[^}]*\bdisplay\s*:\s*none/i.test(r5),'pressure classes never hide visual elements');
ok(!/mxPerf(?:Pressure|Severe)[^\n{]*\{[^}]*\banimation\s*:\s*none/i.test(r5),'pressure classes never disable visible animations');
ok(!/mxPerf(?:Pressure|Severe)[^\n{]*\{[^}]*\bfilter\s*:\s*none/i.test(r5),'pressure classes never strip authored filters');
if(process.exitCode)process.exit(process.exitCode);
