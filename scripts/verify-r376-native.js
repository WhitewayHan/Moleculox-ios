#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.resolve(__dirname,'..');
const platform=process.argv[2];
if(!['ios','android'].includes(platform)) throw new Error('Usage: verify-r376-native.js ios|android');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const must=(c,m)=>{if(!c)throw new Error(m)};
const idx=read('www/index.html');
const game=read('www/js/game-r160.js');
const firebase=read('www/js/firebase.js');
const css=read('www/css/app-r160.css');
must(idx.includes("window.__MX_BUILD_ID__='8.7.215-r383-ios-app-attest-sync';"),'wrong native build id');
must(idx.includes("window.__MX_DISTRIBUTION__='"+platform+"';"),'wrong distribution');
must(idx.includes('window.__MX_NATIVE_SHELL__=true;'),'native shell flag not enabled');
must(idx.includes('window.MX_QA_TEST_GAME=false;'),'QA test-game flag must be false');
must(idx.includes('window.MX_QA_ALL_LEVELS_OPEN=false;'),'all-levels QA flag must be false');
must(idx.includes('window.MX_QA_NO_CLOUD=false;'),'cloud must be enabled');
must(game.includes('const APP_VERSION="v8.7.215 · R383 iOS CLOUD REPAIR";'),'R373 visible version mismatch');
must(css.includes('R376 iOS NATIVE · TRUE PHYSICAL BOTTOM ANCHOR'),'R376 iOS physical-bottom CSS marker missing');
must(css.includes('body.mxIOSNative #splash #einBoxS'),'native iOS Edward selector missing');
must(css.includes('top:auto!important;'),'native iOS Edward top anchor was not cleared');
must(css.includes('bottom:calc(0px - var(--sab) - clamp(14px,2.2svh,22px))!important;'),'native iOS Edward physical-bottom offset mismatch');
must(game.includes('const SCIENCE_LEGEND_SCHEMA=5;'),'Science Legends schema missing');
const legendLevels=[...game.matchAll(/campaignLevel:(\d+)/g)].map(m=>Number(m[1]));
const expected=[48,64,96,128,144,176,193,208,232,256,280,304,342,366,396,430,470,502,540,570,602,633,702,770].sort((a,b)=>a-b);
const unique=[...new Set(legendLevels)].sort((a,b)=>a-b);
must(JSON.stringify(unique)===JSON.stringify(expected),'Science Legends 24-level map mismatch: '+JSON.stringify(unique));
must(fs.existsSync(path.join(root,'www/js/story-502-801-r282.js')),'502-801 story file missing');
must(read('www/js/story-502-801-r282.js').includes('lastLevel:801'),'801 story endpoint missing');
must(firebase.includes('FirebaseAppCheck'),'native/web App Check bridge missing');
must(firebase.includes('normalizeProfileForRules'),'rules-compatible profile projection missing');
must(fs.existsSync(path.join(root,'www/js/profile-rules-compat.js')),'R383 profile validation module missing');
if(platform==='ios'){
  must(game.includes('async function nativeAppleSignIn(button)'),'native Apple Sign-In missing');
  must(game.includes('const MX_SHOW_APPLE_BTN=MX_IOS_NATIVE&&MX_APPLE_NATIVE_READY;'),'iOS Apple button not enabled');
  must(!game.includes('MX_IOS_APPLE_ONLY'),'iOS Google/email sign-in must not be gated by Apple-only mode');
  must(game.includes('id="accGoogle"')&&game.includes('id="accEmailLogin"')&&game.includes('id="accEmailCreate"'),'iOS Google/email buttons missing');
  must(game.includes('async function nativeGoogleSignIn(button)'),'iOS native Google bridge missing');

  const capCfg=JSON.parse(read('capacitor.config.json'));
  must(JSON.stringify(capCfg.plugins.FirebaseAuthentication.providers)===JSON.stringify(['apple.com','google.com']),'iOS must keep Apple and restore Google provider');
  const podPatch=read('scripts/patch-podfile.py');
  must(podPatch.includes("pod 'CapacitorFirebaseAuthentication/Google'"),'Google iOS CocoaPod missing');
}else{
  must(game.includes('const MX_SHOW_APPLE_BTN=false;'),'Android must not expose Apple button');
}
const langs=['en','tr','de','es','pt','ja','fr','zh','it','ko','ru'];
for(const lang of langs){
  const dir=path.join(root,'www/assets/audio/voices');
  const names=fs.readdirSync(dir);
  must(names.some(n=>n.startsWith('dre-voice-sprite-'+lang+'-')&&n.endsWith('.mp3')),'missing voice sprite: '+lang);
}
// Syntax-check every JS file, including modules, without executing game code.
function walk(d){for(const ent of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,ent.name);if(ent.isDirectory())walk(p);else if(ent.isFile()&&p.endsWith('.js'))cp.execFileSync(process.execPath,['--check',p],{stdio:'pipe'});}}
walk(path.join(root,'www/js'));
for(const p of ['www/index.html','www/css/app-r160.css','www/js/game-r160.js','www/js/firebase.js','www/manifest.webmanifest']) must(fs.existsSync(path.join(root,p)),'missing '+p);
// Validate local index src/href targets (ignore data/http/mail/hash links).
for(const m of idx.matchAll(/(?:src|href)="([^"]+)"/g)){
  let u=m[1].split('?')[0];
  if(!u||/^(?:https?:|data:|mailto:|#)/.test(u))continue;
  u=u.replace(/^\.\//,'');
  must(fs.existsSync(path.join(root,'www',u)),'index local reference missing: '+u);
}
must(game.includes('// R372 · Campaign PAR / zero-star hard reset'),'R376 PAR hard-reset section missing');
must(game.includes('return campaignOneStarLimit()+3;'),'three-move zero-star cap missing');
must(game.includes('gained=!zeroStarCampaignClear&&stars>prev?(stars-prev)*10:0;'),'zero-star MoleCoin guard missing');
must(game.includes('rpGained=zeroStarCampaignClear?0:awardLevelResearch'),'zero-star RP guard missing');
must(game.includes('if(!zeroStarCampaignClear)checkAchievements();'),'zero-star achievement guard missing');
must(game.includes('DEVAM ET seçeneği yoktur.'),'How to Play no-Continue rule missing');
// R383 parity checks: native platform flags are intentionally different.
must(game.includes('id="cloudLinkGoogle"') && game.includes('id="cloudLinkEmail"'),'native account-status links missing');
must(!idx.includes('8.7.165-r335'),'stale R335 script cache version');
must(css.includes('R377 / 8.7.209: Collection phone-width'),'itch collection CSS missing');

console.log('R383 '+platform+' native source verification PASS');

for(const rel of ['index.html','js/firebase.js','js/game-r160.js','js/profile-rules-compat.js']) {
  must(read('www/'+rel)===read('r383-overrides/'+rel),'restored overlay mismatch: '+rel);
}
const nativePatch=read('scripts/patch-ios.py');
must(!nativePatch.includes('AppCheck.setAppCheckProviderFactory(MXAppCheckProviderFactory())'),'unprovisioned App Attest factory must not be installed');
must(!read('ios-config/App.entitlements').includes('com.apple.developer.devicecheck.appattest-environment'),'App Attest entitlement cannot be signed by current provisioning profile');
must(read('ios-config/App.entitlements').includes('com.apple.developer.applesignin'),'native Apple sign-in entitlement missing');
must(firebase.includes('const MX_NATIVE_APP_CHECK_ENABLED = false;'),'unenforced iOS App Check gate must be disabled');
must(firebase.includes('experimentalForceLongPolling: true'),'iOS cloud transport configuration missing');

for(const [alias,canonical] of [['js/game.js','js/game-r160.js'],['css/app.css','css/app-r160.css'],['sw.js','sw-r160.js']]) {
  must(read('www/'+alias)===read('www/'+canonical),'Game Hub alias missing or stale: '+alias);
}
