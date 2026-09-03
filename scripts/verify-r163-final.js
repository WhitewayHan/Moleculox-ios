const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const must=(condition,message)=>{if(!condition)throw new Error(message);};

const pkg=JSON.parse(read('package.json'));
const index=read('www/index.html');
const game=read('www/js/game.js');
const sw=read('www/sw.js');
const css=read('www/css/app.css');
const manifest=JSON.parse(read('www/manifest.webmanifest'));
const cap=JSON.parse(read('capacitor.config.json'));
const platform='ios';
const version='8.7.59';
const buildId='8.7.59-r163-codemagic-final-ios';

must(pkg.version===version,'package version mismatch');
must(manifest.version===version,'manifest version mismatch');
must(index.includes(`window.__MX_BUILD_ID__='${buildId}'`),'build id mismatch');
must(index.includes(`window.__MX_DISTRIBUTION__='${platform}'`),'distribution mismatch');
must(index.includes('window.__MX_NATIVE_SHELL__=true;'),'native shell flag missing');
must(index.includes(`css/app.css?v=${buildId}`),'CSS release token mismatch');
must(index.includes(`js/game.js?v=${buildId}`),'game release token mismatch');
must(index.includes(`js/firebase.js?v=${buildId}`),'Firebase release token mismatch');
must(index.includes('minimum-scale=1, maximum-scale=1, user-scalable=no'),'locked viewport missing');
must(game.includes(`const APP_VERSION="v${version}";`),'visible version mismatch');
must(sw.includes(`moleculox-${buildId}`),'source SW identity mismatch');

const zoomAt=game.indexOf('R162 DOUBLE-TAP ZOOM LOCK');
const zoomEnd=game.indexOf('})();',zoomAt);
must(zoomAt>=0&&zoomEnd>zoomAt,'R162 zoom-lock block missing');
const zoomBlock=game.slice(zoomAt,zoomEnd);
for(const eventName of ['dblclick','gesturestart','gesturechange','gestureend']){
  must(zoomBlock.includes(`document.addEventListener('${eventName}',cancelBrowserZoom,{capture:true,passive:false})`),`${eventName} zoom guard missing`);
}
must(!zoomBlock.includes("'touchend'"),'zoom lock must not swallow repeated game taps');
must(css.includes('R162 — PERMANENT DOUBLE-TAP ZOOM LOCK'),'R162 CSS zoom lock missing');
must(css.includes('touch-action:manipulation'),'touch-action manipulation missing');

must(fs.existsSync(path.join(root,'www/js/campaign-levels-expansion-r137.js')),'302-501 campaign expansion missing');
must(game.includes('501 ana deney')||game.includes('501 main experiments'),'501 campaign guide marker missing');
for(const lang of ['en','tr','de','es','pt','ja','fr','zh','it'])must(fs.existsSync(path.join(root,`www/assets/audio/voices/dre-voice-sprite-${lang}.mp3`)),`voice missing: ${lang}`);
must(css.includes('R160')&&css.includes('Guaranteed compact first-use tutorial card'),'R160 tutorial hardfix CSS missing');
must(game.includes('R161 COLLECTION STABILITY'),'R161 collection stability block missing');
must(game.includes('function buildMoleculeCollection()'),'batched molecule builder missing');
must(game.includes('<canvas width="1" height="1"></canvas>'),'lazy 1x1 molecule canvas missing');
must(game.includes('window.IntersectionObserver'),'viewport-only molecule rendering missing');
must(!game.includes('function buildCollectionLegacy()'),'legacy eager collection builder still present');

must(hash('www/js/firebase.js')==='965b74f393f23ec6e5ad1ac5558c72710d7013d65c56741766816979a56d17da','Firebase bridge changed');
must(hash('ios-config/GoogleService-Info.plist')==='87b2f8c28e33502c4eaa2ea1cf413005bd7e7a90f9f651a4d7223ba41a16508d','GoogleService-Info.plist changed');
must(hash('ios-config/App.entitlements')==='48647b4d31e2d803a68cd45f78a6444c95fcb5ec5ffc6f0d5c89fdb8c983c5fb','App entitlements changed');
must(hash('scripts/patch-apple-nonce.py')==='9d1fc21753acb6f7454017d0d540388e3c46da5c06b9a8ee41b80fbfe44fb9e7','Apple nonce patch changed');
must(hash('capacitor.config.json')==='0e514f6929e7cf0919aa3bc7845b77113c2a02f4c967ee95cd80e27d28cdb471','iOS Capacitor identity changed');
must(cap.appId==='com.whitewayhan.moleculox','iOS bundle id mismatch');
must((cap.plugins?.FirebaseAuthentication?.providers||[]).includes('apple.com'),'Apple provider missing');
must(game.includes('const MX_SHOW_APPLE_BTN=MX_IOS_NATIVE&&MX_APPLE_NATIVE_READY;'),'iOS Apple button guard missing');
must(read('scripts/patch-ios.py').includes("'MARKETING_VERSION':'8.7.59'"),'Xcode marketing version mismatch');
must(read('codemagic.yaml').includes('CFBundleShortVersionString 8.7.59'),'Codemagic iOS version mismatch');

const ids=[...index.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>match[1]);
const duplicateIds=[...new Set(ids.filter((id,position)=>ids.indexOf(id)!==position))];
must(!duplicateIds.length,`duplicate HTML ids: ${duplicateIds.join(',')}`);
for(const match of index.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)){
  const asset=match[1].split(/[?#]/)[0];
  if(!asset||/^(?:https?:|mailto:|data:|#)/i.test(asset))continue;
  must(fs.existsSync(path.join(root,'www',asset)),`missing HTML asset: ${asset}`);
}

must(game.includes('function ensureCollectionSaveState()'),'R163 collection save-state guard missing');
must(game.includes('[collection] safe render recovery'),'R163 collection crash recovery missing');
must(game.includes('esc(safeName)')&&game.includes('esc(safeFormula)')&&game.includes('esc(safeFact)'),'R163 collection text safety missing');
must(game.includes("const SUPPORTED_LANGS=['en','tr','de','es','pt','ja','fr','zh','it'];"),'9-language matrix missing');
must(pkg.dependencies&&pkg.dependencies['@capacitor/local-notifications']==='7.0.7','Capacitor local notifications 7.0.7 missing');
must(game.includes('R163 CONSENT-BASED LOCAL RETURN REMINDERS'),'R163 local reminder block missing');
must(game.includes('MX_RETURN_REMINDER_IDS=[873003,873010]'),'Sparse 3/10-day reminder ids missing');
must(game.includes("schedule:{at:mxReminderDate(3)}")&&game.includes("schedule:{at:mxReminderDate(10)}"),'Sparse reminder schedule missing');
must(game.includes("Dr. E: Moleküller sabırsızlanıyor")&&game.includes('分子たちが待ちきれない')&&game.includes('分子们已经等不及了')&&game.includes('Le molecole stanno diventando impazienti'),'Reminder language coverage missing');
must(!game.includes('SCHEDULE_EXACT_ALARM'),'Exact-alarm permission must not be requested by game code');
console.log('R163 iOS final checks passed.');
