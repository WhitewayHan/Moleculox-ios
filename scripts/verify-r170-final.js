
'use strict';
const fs=require('fs');const path=require('path');const root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');const must=(c,m)=>{if(!c)throw new Error(m);};
const game=read('www/js/game.js'),css=read('www/css/app.css'),fb=read('www/js/firebase.js'),idx=read('www/index.html');
const pkg=JSON.parse(read('package.json')),manifest=JSON.parse(read('www/manifest.webmanifest'));
const buildId='8.7.67-r171-goal-signals-ios';
must(pkg.version==='8.7.67'&&manifest.version==='8.7.67','version mismatch');
must(game.includes('const APP_VERSION="v8.7.67";')&&idx.includes(buildId),'visible/build version mismatch');
must(game.includes('function ensureCollectionSaveState()')&&game.includes('[collection] safe render recovery'),'My Molecules guards missing');
must(game.includes('R162 DOUBLE-TAP ZOOM LOCK'),'double-tap zoom lock missing');
// R171 unstable atom: code-drawn, static, scientific, no warning emoji identity.
must(game.includes('R171 · AAA static Unstable Atom')&&game.includes("zombie:{icon:'◎'")&&game.includes('fixed twin orbits'),'AAA Unstable Atom identity missing');
must(game.includes("return type==='zombie'?{icon:''")&&game.includes('intentionally no ambient animation for the Unstable Atom'),'Unstable Atom must be static and emoji-free on the board');
must(!game.includes("return type==='zombie'?{icon:'⚠️'"),'legacy warning-triangle Unstable Atom remains');
// Per-level helper eligibility and Dr. E explanation.
must(game.includes('function hammerLevelEligible()')&&game.includes('function precisionLevelEligible()')&&game.includes('function barrierLevelEligible()'),'helper eligibility functions missing');
must(game.includes('function supportUnavailable(id)')&&game.includes('Bu bölümde ne yazık ki sana')&&game.includes("supportUnavailable('hammer')")&&game.includes("supportUnavailable('precision')")&&game.includes("supportUnavailable('barrier')"),'Dr. E unavailable-helper explanation missing');
must(game.includes("b.hidden=false;b.disabled=!usable")&&game.includes("c.textContent=eligible?boosterCount('hammer'):'—'")&&game.includes("c.textContent=eligible?boosterCount('precision'):'—'"),'unavailable helpers must stay visible/clickable');
must(css.includes('#btnHammer.mxUnavailable')&&css.includes('#btnPrecision.mxUnavailable')&&css.includes('#btnBarrier.mxUnavailable'),'unavailable helper visual state missing');
// 9-language support tutorials.
must(game.includes("'Indice','提示','Suggerimento'")&&game.includes("'Marteau','锤子','Martello'")&&game.includes("'Nano-Barrière','纳米屏障','Nano Barriera'"),'FR/ZH/IT support tutorial copy missing');
// Existing helper/economy behavior retained.
must(game.includes("$('#btnUndo').addEventListener")&&game.includes('undo()'),'Undo handler missing');
must(game.includes("$('#btnRestart').addEventListener")&&game.includes('startLevel(lv'),'Restart handler missing');
must(game.includes("$('#btnHint').addEventListener")&&game.includes('offerPaidHint()'),'Hint handler/purchase flow missing');
must(game.includes("spendBooster('hammer',1)")&&game.includes("spendBooster('precision',1)"),'Hammer/One-Square consume paths missing');
must(game.includes('const BARRIER_USE_PRICE=300;')&&game.includes('spendCoins(BARRIER_USE_PRICE)')&&game.includes('barrierUsed=true'),'paid one-use Barrier missing');
const hintStart=game.indexOf('function offerPaidHint()'),hintEnd=game.indexOf('function pathStates',hintStart),hintBlock=game.slice(hintStart,hintEnd);
must(hintBlock.includes('moleCoinInline(costs.general)')&&!hintBlock.includes('🪙'),'Hint UI must use Moleculox coin icon');
// Notifications stay completely absent.
must(!pkg.dependencies['@capacitor/local-notifications'],'Local Notifications dependency must be absent');
must(!/LocalNotifications|MX_RETURN_REMINDER_IDS|requestPermissions\s*\(.*notification/i.test(game),'notification runtime must be absent');
must(!fb.includes('savePushToken')&&!fb.includes('updatePushLang')&&!fb.includes('pushTokens/{uid}'),'push-token persistence must be absent');
console.log('R171 ios helper/unstable-atom checks passed.');
