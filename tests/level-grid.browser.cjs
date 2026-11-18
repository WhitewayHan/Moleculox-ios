#!/usr/bin/env node
/* Browser regression + benchmark (no npm install):
 *   node tests/level-grid.browser.cjs
 * Requires Playwright, Chromium and Python Pillow; override PLAYWRIGHT_MODULE / CHROMIUM_PATH.
 * ARTIFACT_DIR defaults to /workspace/moleculox-audit-results.
 * TRIALS=12 CPU_RATE=4 set benchmark repetitions and CDP CPU throttling.
 * BASELINE_WWW optionally serves an independent original www directory.
 * Only browser responses are instrumented; production files are never rewritten.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.ARTIFACT_DIR || path.join(ROOT,'..','moleculox-audit-results');
const PATCHES=JSON.parse(execFileSync('python3',['-c',"import json,sys;sys.path.insert(0,'scripts');from web_bundle_patches import PATCHES;print(json.dumps({k:v.decode('utf-8') for k,v in PATCHES.items()}))"],{cwd:ROOT,encoding:'utf8'}));
const MANIFEST=JSON.parse(fs.readFileSync(path.join(ROOT,'WEB-BUNDLE-SHA256.json'),'utf8'));
function assertOriginal(relative,source){assert.equal(crypto.createHash('sha256').update(source).digest('hex'),MANIFEST[relative],relative+': baseline matches pinned original hash');return source;}
const TRIALS = Number(process.env.TRIALS || 12);
const CPU_RATE = Number(process.env.CPU_RATE || 4);
const API = `window.__levelGridQA={buildLevels,startLevel,show,bootPlay,closeModal,ensureFullCampaignReady,wakeMainLoop,
 stop(){clearTimeout(mainLoopTimer);cancelAnimationFrame(mainLoopRaf);mainLoopTimer=mainLoopRaf=0},
 setSave(p){Object.assign(save,p)}, get state(){return {lv,moves,won,sel,atoms:atoms.map(a=>({x:a.x,y:a.y,e:a.e})),anim:!!anim}},
 prepare(unlocked){save.cur=unlocked?800:0;save.tutorialDone=true;save.tutorialTips=false;save.effects=false;
 save.storySeen=Object.fromEntries(LEVELS.map((_,i)=>[String(i+1),true]));
 save.researchAchievements=Object.fromEntries(LEVELS.map((_,i)=>['__onboarding_level_'+i,1]));}
};\n`;
const results = { environment: { node: process.version, cpuRate: CPU_RATE, trials: TRIALS, baselineManifest:'WEB-BUNDLE-SHA256.json',baselineSources:Object.fromEntries(['css/app-r160.css','js/game-r160.js'].map(f=>[f,MANIFEST[f]])),baselineMode:process.env.BASELINE_WWW?'independent original files, hash checked before instrumentation':'original git revision 11637bb5 for game; approved CSS suffix removal; original hashes checked' }, checks: [], benchmark: {}, pageErrors: [], blockedOrigins: [] };
function serve() {
  const types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.json':'application/json'};
  const server = http.createServer((req,res) => {
    const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(ROOT,'www','.'+(name==='/'?'/index.html':name));
    if (!file.startsWith(path.join(ROOT,'www')+path.sep)) {res.writeHead(403).end();return;}
    fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});
  });
  return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server)));
}
async function open(browser, url, variant, viewport) {
  const context = await browser.newContext({viewport,deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page = await context.newPage();
  page.on('pageerror', e => results.pageErrors.push({variant,message:e.message}));
  await page.addInitScript(() => {let seed=123456;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);});
  await page.route('**/*', async route => {
    const u = new URL(route.request().url());
    if(u.hostname!=='127.0.0.1'){results.blockedOrigins.push(u.origin);await route.abort();return;}
    if(u.pathname==='/js/game-r160.js') {
      const sourceRoot=variant==='baseline'&&process.env.BASELINE_WWW?process.env.BASELINE_WWW:path.join(ROOT,'www');
      let source = fs.readFileSync(path.join(sourceRoot,u.pathname),'utf8');
      if(variant==='baseline'&&!process.env.BASELINE_WWW)source=execFileSync('git',['show','11637bb5:www/js/game-r160.js'],{cwd:ROOT,encoding:'utf8'});
      if(variant==='baseline')assertOriginal(u.pathname.slice(1),source);
      assert(source.includes('/* ================= INIT ================= */'));
      await route.fulfill({contentType:'application/javascript',body:source.replace('/* ================= INIT ================= */',API+'/* ================= INIT ================= */')});return;
    }
    if(u.pathname.endsWith('.css')) {
      const source = fs.readFileSync(path.join(ROOT,'www',u.pathname),'utf8');
      if(variant==='baseline') {
        const suffix=PATCHES[u.pathname.slice(1)];
        const body=process.env.BASELINE_WWW?fs.readFileSync(path.join(process.env.BASELINE_WWW,u.pathname),'utf8'):suffix&&source.endsWith(suffix)?source.slice(0,-suffix.length):source;
        assertOriginal(u.pathname.slice(1),body);
        await route.fulfill({contentType:'text/css',body});return;
      }
    }
    await route.continue();
  });
  await page.goto(url,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__levelGridQA);
  await page.evaluate(async()=>{await __levelGridQA.ensureFullCampaignReady();__levelGridQA.bootPlay();});
  await page.locator('#splash.on').waitFor();
  await page.waitForTimeout(400);
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}#levelsScr,#levelsScr *,#bgA,#bgA::before,#bgA::after,#bgB,#bgB::before,#bgB::after{animation:none!important;transition:none!important}#levelsScr{transform:scale(1)!important;opacity:1!important}#bgParticles,#fx{visibility:hidden!important}'});
  await page.evaluate(()=>{__levelGridQA.stop();__levelGridQA.closeModal();});
  return {context,page};
}
async function levels(page, unlocked, largeText=false) {
  await page.evaluate(({unlocked,largeText})=>{const q=__levelGridQA;q.prepare(unlocked);document.body.classList.toggle('mxLargeText',largeText);q.closeModal();q.show('levels');q.buildLevels();},{unlocked,largeText});
  await page.waitForTimeout(350);
  await page.evaluate(()=>{__levelGridQA.stop();for(const a of document.getAnimations()){if(a.effect?.getComputedTiming().iterations===Infinity){a.currentTime=0;a.pause();}else a.finish();}});
}
async function snapshot(page) {
  return page.evaluate(()=>{
    const grid=document.querySelector('#lvGrid'),sa=document.querySelector('#lvScrollArea');
    const round=n=>Math.round(n*1000)/1000;
    return {scrollHeight:sa.scrollHeight,clientHeight:sa.clientHeight,cards:[...grid.children].map(b=>{const r=b.getBoundingClientRect();return {x:round(r.x),y:round(r.y+sa.scrollTop),width:round(r.width),height:round(r.height),label:b.getAttribute('aria-label'),locked:b.classList.contains('lock'),role:b.tagName};})};
  });
}
async function picture(page, file, fraction) {
  await page.evaluate(f=>{const s=document.querySelector('#lvScrollArea');s.scrollTop=(s.scrollHeight-s.clientHeight)*f;},fraction);
  await page.waitForTimeout(150);
  const clip=await page.locator('#lvScrollArea').boundingBox();
  // Crop only the list, excluding animated screen furniture outside its viewport.
  const buffer=await page.screenshot({path:file,clip,animations:'disabled',caret:'hide'});
  return buffer;
}
function rasterDifference(a,b){
  return JSON.parse(execFileSync('python3',['-c',"from PIL import Image,ImageChops,ImageStat;import json,sys;d=ImageChops.difference(Image.open(sys.argv[1]).convert('RGB'),Image.open(sys.argv[2]).convert('RGB'));n=d.width*d.height;changed=sum(1 for p in (d.get_flattened_data() if hasattr(d,'get_flattened_data') else d.getdata()) if any(p));print(json.dumps({'changedPixels':changed,'pixelFraction':changed/n,'meanChannelError':sum(ImageStat.Stat(d).mean)/3,'maxChannelError':max(v[1] for v in d.getextrema())}))",a,b],{encoding:'utf8'}));
}
async function visualChecks(browser,url) {
  const cases=[{width:320,height:852},{width:393,height:852},{width:430,height:852},{width:852,height:393},{width:393,height:852,largeText:true}];
  for(const c of cases) {
    const key=`${c.width}x${c.height}${c.largeText?'-large-text':''}`,data={};
    for(const variant of ['baseline','candidate']) {
      const {context,page}=await open(browser,url,variant,{width:c.width,height:c.height});
      data[variant]={};
      for(const unlocked of [false,true]) {
        const state=unlocked?'unlocked':'new-player';
        await levels(page,unlocked,!!c.largeText);
        const geometry=await snapshot(page);
        assert.equal(geometry.cards.length,801);
        assert.equal(geometry.cards.filter(x=>!x.locked).length,unlocked?801:1);
        assert.equal(await page.getByRole('button',{name:unlocked?'Level 801 ·':'Locked level 801',exact:false}).count(),1);
        data[variant][state]={geometry,pictures:[]};
        for(const [name,fraction] of [['top',0],['middle',.5],['bottom',1]]) {
          const file=path.join(OUT,`${key}-${state}-${name}-${variant}.png`);
          data[variant][state].pictures.push(await picture(page,file,fraction));
        }
        if(unlocked){
          await page.evaluate(()=>{document.querySelector('#lvScrollArea').scrollTop=0;document.querySelector('#lvGrid').lastElementChild.focus();});
          await page.waitForTimeout(100);
          assert(await page.evaluate(()=>{const b=document.querySelector('#lvGrid').lastElementChild,r=b.getBoundingClientRect(),s=document.querySelector('#lvScrollArea').getBoundingClientRect();return document.activeElement===b&&r.top>=s.top&&r.bottom<=s.bottom&&!!b.querySelector('.lvFormula').textContent;}),'focusing distant card scrolls it into view and preserves formula');
        }
      }
      await context.close();
    }
    for(const state of ['new-player','unlocked']) {
      assert.deepEqual(data.candidate[state].geometry,data.baseline[state].geometry,`${key} ${state}: all 801 rectangles and accessible labels`);
      const equal=data.candidate[state].pictures.map((b,i)=>b.equals(data.baseline[state].pictures[i]));
      const raster=equal.map((same,i)=>same?{changedPixels:0,pixelFraction:0,meanChannelError:0,maxChannelError:0}:rasterDifference(path.join(OUT,`${key}-${state}-${['top','middle','bottom'][i]}-baseline.png`),path.join(OUT,`${key}-${state}-${['top','middle','bottom'][i]}-candidate.png`)));
      // Chromium may rasterize the same vector badge edges slightly differently
      // after retiring containment layers. Geometry/names remain exact; expose
      // bounded pixel differences rather than claiming pixel identity.
      for(const diff of raster)assert(diff.pixelFraction<=.005&&diff.meanChannelError<=.015&&diff.maxChannelError<=32,`${key} ${state}: screenshot raster difference ${JSON.stringify(diff)}`);
      results.checks.push({viewport:key,state,cardGeometryCount:801,accessibleNamesEqual:true,screenshotsEqual:equal,rasterDifferences:raster,rasterLimits:{pixelFraction:.005,meanChannelError:.015,maxChannelError:32}});
    }
    console.log(`PASS geometry/accessibility/screenshots ${key}`);
  }
}
async function gestures(browser,url) {
  const states={};
  for(const variant of ['baseline','candidate']) {
    const {context,page}=await open(browser,url,variant,{width:393,height:852});
    const cdp=await context.newCDPSession(page);states[variant]={};
    for(const i of [0,800]) {
      await levels(page,true);
      await page.locator('#lvGrid > button').nth(i).scrollIntoViewIfNeeded();
      await page.locator('#lvGrid > button').nth(i).tap();
      await page.waitForFunction(i=>__levelGridQA.state.lv===i,i);
      await page.locator('#gameScr.on').waitFor();
      states[variant]['tapLevel'+(i+1)]=await page.evaluate(()=>__levelGridQA.state.lv);
      await page.waitForTimeout(500);
    }
    await levels(page,true);
    await page.evaluate(()=>{const b=document.querySelector('#lvGrid > button');b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',pointerId:71,clientX:30,clientY:300}));b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',pointerId:71,clientX:30,clientY:330}));});
    await page.waitForTimeout(300);
    assert(await page.locator('#levelsScr.on').count(),'30px list scroll drift must not activate a card');
    states[variant].listScrollDidNotNavigate=true;
    await levels(page,false);
    await page.locator('#lvGrid > button').nth(1).tap();
    await page.waitForTimeout(250);
    assert(await page.locator('#levelsScr.on').count(),'locked card must not navigate');
    states[variant].lockedDidNotNavigate=true;
    for(const [name,dx,dy] of [['up',0,-70],['right',70,0],['down',0,70],['left',-70,0],['tap',3,3],['cancel',0,70]]) {
      await page.evaluate(()=>{__levelGridQA.prepare(false);__levelGridQA.startLevel(0);__levelGridQA.closeModal();__levelGridQA.wakeMainLoop();});
      await page.waitForTimeout(700);
      const point=await page.evaluate(()=>{const b=document.querySelector('#board'),r=b.getBoundingClientRect(),a=__levelGridQA.state.atoms[0];return{x:r.x+(a.x+.5)*r.width/8,y:r.y+(a.y+.5)*r.height/10}});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
      if(name!=='tap')await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x+dx,y:point.y+dy}]});
      await cdp.send('Input.dispatchTouchEvent',{type:name==='cancel'?'touchCancel':'touchEnd',touchPoints:[]});
      await page.waitForTimeout(600);
      states[variant][name]=await page.evaluate(()=>__levelGridQA.state);
      assert.equal(states[variant][name].anim,false);
      if(name==='tap'||name==='cancel')assert.equal(states[variant][name].moves,0);
    }
    await context.close();
  }
  assert.deepEqual(states.candidate,states.baseline,'touch/click handlers and game states must match');
  assert.equal(states.candidate.left.atoms[0].x,1,'left swipe slides to wall');
  assert.equal(states.candidate.down.atoms[0].y,8,'down swipe slides to wall');
  assert.equal(states.candidate.up.atoms[0].y,2,'up swipe stops at other atom');
  results.checks.push({mobileInputs:states,notes:'Board gestures use trusted CDP touchStart/touchMove/touchEnd/touchCancel; list scroll-drift threshold uses synthetic PointerEvents. Chromium emulation, not physical iOS.'});
  console.log('PASS first/last/locked/list-scroll and board touch gestures');
}
function stats(a) {const s=a.toSorted((a,b)=>a-b);return {median:s.length%2?s[Math.floor(s.length/2)]:(s[s.length/2-1]+s[s.length/2])/2,p95:s[Math.min(s.length-1,Math.ceil(s.length*.95)-1)],min:s[0],max:s.at(-1)};}
async function benchmark(browser,url) {
  const sessions={};
  for(const variant of ['baseline','candidate']) {
    sessions[variant]=await open(browser,url,variant,{width:393,height:852});
    await levels(sessions[variant].page,true);
    sessions[variant].cdp=await sessions[variant].context.newCDPSession(sessions[variant].page);
    await sessions[variant].cdp.send('Emulation.setCPUThrottlingRate',{rate:CPU_RATE});
    await sessions[variant].cdp.send('Performance.enable');
  }
  const raw={baseline:[],candidate:[]};
  const metrics=async cdp=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
  for(let i=0;i<TRIALS+2;i++) {
    for(const variant of i%2?['candidate','baseline']:['baseline','candidate']) {
      const {page,cdp}=sessions[variant];
      const before=await metrics(cdp);
      const timing=await page.evaluate(async()=>{
        const q=__levelGridQA;q.stop();document.querySelector('#lvScrollArea').scrollTop=0;
        const start=performance.now();q.buildLevels();const built=performance.now();
        const height=document.querySelector('#lvScrollArea').scrollHeight;const layout=performance.now();
        await new Promise(requestAnimationFrame);const firstFrame=performance.now();
        await new Promise(requestAnimationFrame);const frame=performance.now();
        return {jsMs:built-start,layoutMs:layout-built,firstFrameMs:firstFrame-start,toFrameMs:frame-start,height};
      });
      const after=await metrics(cdp);
      if(i>=2)raw[variant].push({...timing,cdpLayoutMs:(after.LayoutDuration-before.LayoutDuration)*1000,cdpTaskMs:(after.TaskDuration-before.TaskDuration)*1000});
    }
  }
  results.benchmark={raw,summary:Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,Object.fromEntries(['jsMs','layoutMs','toFrameMs','cdpLayoutMs','cdpTaskMs'].map(f=>[f,stats(v.map(x=>x[f]))]))]))};
  for(const s of Object.values(sessions))await s.context.close();
  console.log('BENCHMARK',JSON.stringify(results.benchmark.summary));
}
module.exports={open,serve,levels,snapshot,picture};
if(require.main===module)(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  for(const [file,suffix] of Object.entries(PATCHES))assert(fs.readFileSync(path.join(ROOT,'www',file),'utf8').endsWith(suffix),`${file}: expected performance suffix`);
  const server=await serve();let browser;
  try {
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    results.environment.browser=browser.version();
    const url=`http://127.0.0.1:${server.address().port}/`;
    await visualChecks(browser,url);
    const visual=results.checks.filter(c=>c.rasterDifferences),diffs=visual.flatMap(c=>c.rasterDifferences);
    results.visualSummary={pairs:diffs.length,pixelIdenticalPairs:visual.reduce((n,c)=>n+c.screenshotsEqual.filter(Boolean).length,0),maxChangedPixelFraction:Math.max(...diffs.map(d=>d.pixelFraction)),maxMeanChannelError:Math.max(...diffs.map(d=>d.meanChannelError)),maxChannelError:Math.max(...diffs.map(d=>d.maxChannelError)),geometryCardComparisons:visual.reduce((n,c)=>n+c.cardGeometryCount,0)};
    await gestures(browser,url);await benchmark(browser,url);
    assert.deepEqual(results.pageErrors,[],'no runtime exceptions');
    results.passed=true;
  } catch(error) {results.passed=false;results.failure=error.stack;console.error(error.stack?.slice(0,1500)||error.message);process.exitCode=1;}
  finally {results.blockedOrigins=[...new Set(results.blockedOrigins)];fs.writeFileSync(path.join(OUT,'level-grid-browser.json'),JSON.stringify(results,null,2)+'\n');if(browser)await browser.close();await new Promise(r=>server.close(r));}
})();
