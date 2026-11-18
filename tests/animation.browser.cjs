/* Real animation profiling; requires Playwright + Chromium, no production hooks.
 * VARIANT=before node tests/animation.browser.cjs
 * VARIANT=after node tests/animation.browser.cjs
 * MODE=smoke WEB_ROOT=/path/to/extracted-itch-zip node tests/animation.browser.cjs
 * MODE=first-party (direct page) / MODE=restricted (cross-site storage boundary)
 * Optional: VIEWPORTS=mobile,desktop LEVELS=1,781 MOVES=3 CPU_RATE=1 OUTPUT=/path.json
 * Before uses original git revision 11637bb5; BASELINE_WWW can supply original assets.
 * Profiles include a lightweight RAF observer: CPU timings measure JS submission,
 * not GPU completion. No hardware-independent FPS threshold is asserted. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const{execFileSync}=require('node:child_process');
const REPO=path.resolve(__dirname,'..'),VARIANT=process.env.VARIANT||'after';
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const ROOT=process.env.WEB_ROOT||(VARIANT==='before'&&process.env.BASELINE_WWW)||path.join(REPO,'www'),ARTIFACTS=path.resolve(REPO,'../moleculox-smooth-results'),OUT=process.env.OUTPUT||path.join(ARTIFACTS,`animation-${VARIANT}.json`);
fs.mkdirSync(path.dirname(OUT),{recursive:true});
const LEVELS=(process.env.LEVELS||'1,781').split(',').map(Number),RATE=Number(process.env.CPU_RATE||1),MOVES=Number(process.env.MOVES||3),VIEWS=(process.env.VIEWPORTS||'mobile,desktop').split(',');
const INSPECT=`
const qa=window.__motionQA={capture:false,token:0,data:null,probeAt:null,probeGone:null,
 prep(){save.tutorialDone=true;save.tutorialTips=false;save.effects=true;save.performanceMode='auto';save.muM=save.muMu=save.muS=save.muV=true;save.storySeen=Object.fromEntries(LEVELS.map((_,i)=>[i+1,true]));save.researchAchievements=Object.fromEntries(LEVELS.map((_,i)=>['__onboarding_level_'+i,1]));},
 boot:bootPlay,ready:ensureFullCampaignReady,start:startLevel,close:closeModal,
 begin(label){this.data={label,startedAt:performance.now(),loop:[],board:[],fx:[],display:[],moves:[]};this.capture=true;this.probeAt=this.probeGone=null;const token=++this.token;const tick=t=>{if(!this.capture||token!==this.token)return;this.data.display.push(t);requestAnimationFrame(tick)};requestAnimationFrame(tick)},
 end(){this.capture=false;this.token++;this.data.endedAt=performance.now();this.data.probeSpawnAt=this.probeAt;this.data.probeGoneAt=this.probeGone;this.data.final=this.state;return this.data},
 burst(kind='spark'){const br=board.getBoundingClientRect(),x=br.x+br.width/2,y=br.y+br.height/2;spawnWinFx(kind,x,y,['#fff','#65ebff','#d6a4ff']);this.probeAt=performance.now();P({k:'ring',x,y,r:4,vr2:60,c:'#fff',life:1,auditProbe:1});return PARTS.length},
 portalBurst(){const p=[...portalPairs.values()][0];if(p){portalBurst(p.x,p.y,p.id,'enter');portalBurst(p.toX,p.toY,'B','exit');return true}return false},
 get route(){return (LV.fs||[]).map(s=>s.slice())},
 get portalLevels(){return LEVELS.map((l,i)=>derivePortals(l,i,'campaign').length?i+1:0).filter(Boolean)},
 get state(){return {lv,moves,won,anim:anim?{i:anim.i,d:anim.d,t0:anim.t0,dur:anim.dur,portal:!!anim.portalTransit,rift:!!anim.riftTransit}:null,busy:landingResolutionBusy,parts:PARTS.length,nonambient:PARTS.filter(p=>!p.amb).length,atoms:atoms.map(a=>({x:a.x,y:a.y,e:a.e,frozen:a.frozen})),portals:portalPairs.size,pressure:document.body.classList.contains('mxPerfPressure'),severe:document.body.classList.contains('mxPerfSevere')}},
 point(i){const a=atoms[i],r=board.getBoundingClientRect();return {x:r.x+(a.x+.5)*r.width/W,y:r.y+(a.y+.5)*r.height/H}},
 choose(){let best=null;for(let i=0;i<atoms.length;i++)if(!atoms[i].frozen)for(let d=0;d<4;d++){const dest=legalMoveDestination(i,d);if(dest){const score=Math.abs(dest.x-atoms[i].x)+Math.abs(dest.y-atoms[i].y)+(portalDestination(dest.x,dest.y,i)?100:0);if(!best||score>best.score)best={i,d,score};}}return best},
 rawMove(i,d){move(i,d)},stop(){clearTimeout(mainLoopTimer);cancelAnimationFrame(mainLoopRaf);mainLoopTimer=mainLoopRaf=0}
};
const auditLoop=loop;loop=function(t){if(qa.capture)qa.data.loop.push({t,anim:!!anim,fx:hasRealtimeFxParts(),parts:PARTS.length,portal:!!anim?.portalTransit});return auditLoop(t)};
const auditBoard=renderBoard;renderBoard=function(t){const start=performance.now(),active=!!anim,segment=anim?.t0,portal=!!anim?.portalTransit;try{return auditBoard(t)}finally{if(qa.capture)qa.data.board.push({t,cost:performance.now()-start,active,segment,portal,after:!!anim})}};
const auditFx=renderFx;renderFx=function(t,dt){const start=performance.now(),count=PARTS.length,probe=PARTS.find(p=>p.auditProbe);try{return auditFx(t,dt)}finally{if(qa.capture){qa.data.fx.push({t,dt,cost:performance.now()-start,count,after:PARTS.length,probeTime:probe?.t});if(qa.probeAt!==null&&qa.probeGone===null&&!PARTS.some(p=>p.auditProbe))qa.probeGone=performance.now()}}};
`;
function stats(a){const s=a.toSorted((a,b)=>a-b),n=s.length;return n?{n,p50:n%2?s[n>>1]:(s[n/2-1]+s[n/2])/2,p95:s[Math.min(n-1,Math.ceil(n*.95)-1)],max:s[n-1],over25:s.filter(x=>x>25).length,over33:s.filter(x=>x>33.5).length,over50:s.filter(x=>x>50.5).length}:null}
function intervals(a){return a.slice(1).map((t,i)=>t-a[i])}
function summarize(d){const active=d.board.filter(x=>x.active);return {label:d.label,duration:d.endedAt-d.startedAt,displayGaps:stats(intervals(d.display)),loopGaps:stats(intervals(d.loop.map(x=>x.t))),boardGaps:stats(intervals(d.board.map(x=>x.t))),activeBoardGaps:stats(active.slice(1).map((x,i)=>x.segment===active[i].segment?x.t-active[i].t:null).filter(x=>x!==null)),fxGaps:stats(intervals(d.fx.filter(x=>x.count).map(x=>x.t))),boardSelfMs:stats(d.board.map(x=>x.cost)),fxSelfMs:stats(d.fx.map(x=>x.cost)),probeLifeWallMs:d.probeGoneAt===null?null:d.probeGoneAt-d.probeSpawnAt,probeLifeNominalMs:d.probeSpawnAt===null?null:1000,peakParts:Math.max(0,...d.loop.map(x=>x.parts)),moveCount:d.moves.length,portalFrames:d.board.filter(x=>x.portal).length,final:d.final}}
async function server(childOrigin=null){const s=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname==='/__host__'){res.setHeader('Content-Type','text/html');res.end(`<html><body style="margin:0;overflow:hidden"><iframe id="itch-game" allow="autoplay; fullscreen; gamepad" allowfullscreen src="${childOrigin||'http://127.0.0.1:'+s.address().port}/index.html" style="border:0;width:100vw;height:100vh"></iframe></body></html>`);return;}const p=path.join(ROOT,u.pathname==='/'?'index.html':u.pathname);fs.readFile(p,(err,b)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.woff2':'font/woff2'}[path.extname(p)]||'application/octet-stream'));res.end(b)})});await new Promise(r=>s.listen(0,'127.0.0.1',r));return s}
async function gesture(page,cdp,i,d,mobile){const p=await page.evaluate(i=>__motionQA.point(i),i),dx=d===1?65:d===3?-65:0,dy=d===2?65:d===0?-65:0;if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+dx,y:p.y+dy}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+dx,p.y+dy);await page.mouse.up()}}
async function runSmoke(){
  const s=await server(),port=s.address().port,browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const restricted=process.env.MODE==='restricted',embedded=process.env.MODE!=='first-party',tag=restricted?'itch-cross-site-restricted':embedded?'itch-iframe':'itch-first-party',host=embedded?await server(`http://127.0.0.1:${port}`):null;
  const report={mode:restricted?'exact ZIP cross-site restricted-storage smoke':embedded?'exact ZIP same-site cross-origin iframe smoke':'exact ZIP first-party smoke',webRoot:ROOT,browser:browser.version(),errors:[],checks:[],consoleWarnings:[]};
  const manifest=path.join(ROOT,'BUILD-INFO.json');if(fs.existsSync(manifest)){report.buildManifestSha256=crypto.createHash('sha256').update(fs.readFileSync(manifest)).digest('hex');report.executedGameSha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'js/game-r160.js'))).digest('hex');assert.equal(report.executedGameSha256,JSON.parse(fs.readFileSync(manifest,'utf8')).files['js/game-r160.js']);if(fs.existsSync(ROOT+'.zip'))report.archiveSha256=crypto.createHash('sha256').update(fs.readFileSync(ROOT+'.zip')).digest('hex');}
  const context=await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:'allow'}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')report.consoleWarnings.push(m.text())});
  // No game response instrumentation: this mode executes exported bytes as-is.
  await context.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.abort());
  try{
    await page.goto(embedded?`http://${restricted?'localhost':'127.0.0.1'}:${host.address().port}/__host__`:`http://127.0.0.1:${port}/index.html`);
    const iframe=embedded?page.frameLocator('#itch-game'):page;
    let frame;
    for(let i=0;i<40;i++){frame=page.frames().find(f=>f.url().startsWith(`http://127.0.0.1:${port}/`));if(frame)break;await page.waitForTimeout(100)}
    assert(frame,'game frame');report.storageProbe=await frame.evaluate(()=>{try{localStorage.setItem('mx_browser_smoke_probe','ok');const saved=localStorage.getItem('mx_browser_smoke_probe');localStorage.removeItem('mx_browser_smoke_probe');return {saved}}catch(e){return {error:e.name+': '+e.message}}});if(!restricted)assert.equal(report.storageProbe.saved,'ok');else assert.match(report.storageProbe.error,/SecurityError|denied/i);
    const boot=async()=>{
      await iframe.locator('#studioScr.on').waitFor();await iframe.locator('#studioScr').tap();
      await iframe.locator('#btnBootPlay.on').waitFor();await iframe.locator('#bootScr').tap({position:{x:190,y:700}});
      await iframe.locator('#splash.on').waitFor();await page.waitForTimeout(500);
    };
    const levelOne=async(unlockedSecond=false)=>{
      await iframe.locator('#btnLevels').tap();await iframe.locator('#levelsScr.on').waitFor();
      assert.equal(await iframe.locator('#lvGrid > button').count(),801);if(unlockedSecond)assert(!(await iframe.locator('#lvGrid > button').nth(1).getAttribute('class')).includes('lock'),'saved progress unlocks level2');
      await iframe.locator('#lvGrid > button').first().tap();await page.waitForTimeout(400);
      if(await iframe.locator('#levelStoryPanel.on').count())await iframe.locator('#storySkip').tap();
      await iframe.locator('#gameScr.on').waitFor();await page.waitForTimeout(900);
      if(await iframe.locator('#mFoundationGo').isVisible())await iframe.locator('#mFoundationGo').tap();
      await page.waitForTimeout(200);assert.match(await iframe.locator('#lvPill').innerText(),/1/);
    };
    await boot();
    report.build=await frame.evaluate(()=>({id:window.__MX_BUILD_ID__,distribution:window.__MX_DISTRIBUTION__,native:window.__MX_NATIVE_SHELL__,qa:window.MX_QA_TEST_GAME,open:window.MX_QA_ALL_LEVELS_OPEN,version:APP_VERSION}));
    assert.equal(report.build.distribution,'web');assert.equal(report.build.native,false);assert.equal(report.build.qa,false);assert.equal(report.build.open,false);
    await levelOne();
    const cdp=await context.newCDPSession(page);
    const swipe=async(x,y,dx,dy,cancel=false)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});await page.waitForTimeout(550)};
    let r=await iframe.locator('#board').boundingBox();
    await swipe(r.x+6.5*r.width/8,r.y+3.5*r.height/10,0,65);
    assert.match(await iframe.locator('#movePill').innerText(),/MOVES 1\b/);
    await swipe(r.x+6.5*r.width/8,r.y+8.5*r.height/10,0,-65,true);
    assert.match(await iframe.locator('#movePill').innerText(),/MOVES 1\b/);
    await swipe(r.x+6.5*r.width/8,r.y+1.5*r.height/10,-65,0);
    assert.match(await iframe.locator('#movePill').innerText(),/MOVES 2\b/);
    report.checks.push('guest boot, 801 cards, first level, trusted swipe, cancel, next swipe');
    if(restricted){report.workerDenied=await frame.evaluate(async()=>{try{await navigator.serviceWorker.getRegistrations();return null}catch(e){return e.name+': '+e.message}});assert.match(report.workerDenied,/denied/i);report.saveWarning=await iframe.getByText('Progress could not be saved.',{exact:false}).first().isVisible();assert.equal(report.saveWarning,true);report.limitations=['Browser denied third-party localStorage and service workers; gameplay remains available, persistence and offline reload unavailable in this context.'];report.passed=true;await page.screenshot({path:path.join(ARTIFACTS,tag+'.png')});return;}
    await iframe.locator('#btnRestart').tap();await page.waitForTimeout(700);r=await iframe.locator('#board').boundingBox();
    await swipe(r.x+6.5*r.width/8,r.y+3.5*r.height/10,0,-65);
    await swipe(r.x+6.5*r.width/8,r.y+2.5*r.height/10,-65,0);
    await swipe(r.x+5.5*r.width/8,r.y+2.5*r.height/10,0,-65);
    await frame.waitForFunction(()=>{const v=JSON.parse(localStorage.getItem('moleculox_profiles_v1')||'null');return v&&Object.values(v.profiles).some(p=>p.cur>=1&&p.stars?.[0]>0)},null,{timeout:6000});
    const readProgress=()=>frame.evaluate(()=>{const v=JSON.parse(localStorage.getItem('moleculox_profiles_v1'));return Object.values(v.profiles).map(p=>({name:p.playerName,cur:p.cur,stars:p.stars,bestMoves:p.bestMoves}))});
    report.savedProgress=await readProgress();report.checks.push('level1 won by real up-left-up touch route and cur/stars saved');
    await page.screenshot({path:path.join(ARTIFACTS,tag+'-game.png')});
    await frame.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:20000});
    report.worker=await frame.evaluate(async()=>{const reg=await navigator.serviceWorker.ready;return {script:reg.active.scriptURL,scope:reg.scope,cacheNames:await caches.keys()}});
    // Exercise the shipped optional media pack before a real offline navigation.
    report.offlinePack=await frame.evaluate(()=>window.MXOfflinePack.download());
    await context.setOffline(true);await new Promise(resolve=>s.close(resolve));report.networkServerClosed=!s.listening;
    await frame.goto(`http://127.0.0.1:${port}/index.html`,{waitUntil:'load'});
    await boot();report.restoredProgress=await readProgress();assert.deepEqual(report.restoredProgress,report.savedProgress);await levelOne(true);
    report.offline=await frame.evaluate(()=>({online:navigator.onLine,worker:!!navigator.serviceWorker.controller,brokenImages:[...document.images].filter(i=>i.offsetParent&&i.complete&&!i.naturalWidth).map(i=>i.src)}));
    assert.equal(report.networkServerClosed,true);assert.equal(report.offline.worker,true);assert.deepEqual(report.offline.brokenImages,[]);
    report.checks.push('service worker controlled, optional complete media download, offline iframe reload and first level');
    await page.screenshot({path:path.join(ARTIFACTS,tag+'-offline.png')});
    assert.deepEqual(report.errors,[]);report.passed=true;
  }catch(e){report.passed=false;report.failure=e.stack;const f=page.frames().find(f=>f.url().startsWith('http://127.0.0.1:'));if(f)report.workerDiagnostic=await f.evaluate(async()=>{let registrations,registerAttempt;try{registrations=(await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,active:r.active?.state,installing:r.installing?.state,waiting:r.waiting?.state}))}catch(e){registrations={error:e.name+': '+e.message}}try{const r=await navigator.serviceWorker.register('./sw.js');registerAttempt={scope:r.scope,active:r.active?.state,installing:r.installing?.state}}catch(e){registerAttempt={error:e.name+': '+e.message}}return {secure:isSecureContext,hasWorker:'serviceWorker' in navigator,ready:document.readyState,registrations,registerAttempt}}).catch(e=>({error:e.message}));throw e}
  finally{fs.mkdirSync(ARTIFACTS,{recursive:true});fs.writeFileSync(path.join(ARTIFACTS,tag+'-smoke.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>s.close(r));if(host)await new Promise(r=>host.close(r));}
  console.log(JSON.stringify(report,null,2));
}

if(['smoke','first-party','restricted'].includes(process.env.MODE))runSmoke().catch(e=>{console.error(e);process.exitCode=1});else (async()=>{const s=await server(),b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),report={variant:VARIANT,webRoot:ROOT,environment:{browser:b.version(),cpuRate:RATE,seed:12345},scenarios:[],errors:[]};try{for(const view of VIEWS){const mobile=view==='mobile',context=await b.newContext({viewport:mobile?{width:393,height:852}:{width:1280,height:900},deviceScaleFactor:mobile?3:1,isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push({view,message:e.message}));await page.addInitScript(()=>{let x=12345;Math.random=()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296)});await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();if(u.pathname==='/js/game-r160.js'||u.pathname==='/js/game.js'){let source=VARIANT==='before'&&!process.env.GAME_PATH&&!process.env.BASELINE_WWW?execFileSync('git',['show','11637bb5:www/js/game-r160.js'],{cwd:REPO,encoding:'utf8'}):fs.readFileSync(process.env.GAME_PATH||path.join(ROOT,u.pathname),'utf8');report.sourceSha256=crypto.createHash('sha256').update(source).digest('hex');if(VARIANT==='before')assert.equal(report.sourceSha256,JSON.parse(fs.readFileSync(path.join(REPO,'WEB-BUNDLE-SHA256.json'),'utf8'))['js/game-r160.js']);if(!source.includes('/* ================= INIT ================= */'))throw Error('Instrumentation marker not found');source=source.replace('/* ================= INIT ================= */',INSPECT+'\n/* ================= INIT ================= */');return r.fulfill({contentType:'application/javascript',body:source})}return r.continue()});await page.goto(`http://127.0.0.1:${s.address().port}/`,{waitUntil:'load'});await page.waitForFunction(()=>window.__motionQA);await page.evaluate(async()=>{await __motionQA.ready();__motionQA.boot()});await page.locator('#splash.on').waitFor();await page.waitForTimeout(700);const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});const portalLevels=await page.evaluate(()=>__motionQA.portalLevels);report.environment.portalLevels=portalLevels;const levels=[...LEVELS];if(process.env.PORTAL!=='0'&&portalLevels.length&&!levels.includes(portalLevels[0]))levels.push(portalLevels[0]);for(const level of levels){await page.evaluate(i=>{__motionQA.prep();__motionQA.close();__motionQA.start(i);},level-1);await page.locator('#gameScr.on').waitFor();await page.waitForTimeout(1000);await page.evaluate(()=>__motionQA.close());const phases=[];
for(const phase of ['idle','moves','burst','burst-motion']){if(phase==='burst-motion'&&(await page.evaluate(()=>__motionQA.state.won))){await page.evaluate(i=>{__motionQA.start(i);__motionQA.close()},level-1);await page.waitForTimeout(700)}await page.evaluate(p=>__motionQA.begin(p),phase);if(phase==='idle')await page.waitForTimeout(1000);else if(phase==='moves'){const route=await page.evaluate(()=>__motionQA.route);for(let k=0;k<MOVES;k++){const state=await page.evaluate(()=>__motionQA.state);if(state.won)break;let step=route[k]&&route[k][0]>=0&&route[k][1]<4?{i:route[k][0],d:route[k][1]}:await page.evaluate(()=>__motionQA.choose());if(!step)break;await page.evaluate(step=>__motionQA.data.moves.push({...step,at:performance.now(),before:__motionQA.state}),step);await gesture(page,cdp,step.i,step.d,mobile);await page.waitForFunction(()=>!__motionQA.state.anim&&!__motionQA.state.busy,{},{timeout:7000});await page.waitForTimeout(100)}await page.waitForTimeout(350)}else{await page.evaluate(()=>{__motionQA.close();__motionQA.burst('spark');if(__motionQA.state.portals)__motionQA.portalBurst()});if(phase==='burst-motion'){const step=await page.evaluate(()=>__motionQA.choose());if(step){await page.evaluate(s=>__motionQA.data.moves.push(s),step);await gesture(page,cdp,step.i,step.d,mobile)}}await page.waitForTimeout(1800)}const raw=await page.evaluate(()=>__motionQA.end());phases.push({summary:summarize(raw),raw});}const scenario={view,level,phases};report.scenarios.push(scenario);fs.writeFileSync(OUT,JSON.stringify(report,null,2));console.log(JSON.stringify({view,level,phases:phases.map(p=>({phase:p.summary.label,board:p.summary.activeBoardGaps,fx:p.summary.fxGaps,probeMs:p.summary.probeLifeWallMs,portalFrames:p.summary.portalFrames}))}));}await context.close()}assert.deepEqual(report.errors,[]);if(VARIANT==='after')for(const scene of report.scenarios)for(const p of scene.phases)if(p.summary.probeLifeNominalMs){assert(p.summary.probeLifeWallMs>=850&&p.summary.probeLifeWallMs<=1200,scene.view+' level'+scene.level+' particle lifetime');}report.passed=true;}catch(e){report.passed=false;report.failure=e.stack;throw e}finally{fs.writeFileSync(OUT,JSON.stringify(report,null,2));await b.close();await new Promise(r=>s.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
