'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=process.env.WEB_ROOT||'/workspace/artifacts/Moleculox-Godot-Itch-candidate';
const output=process.env.OUTPUT||'/workspace/artifacts/godot-browser';
fs.mkdirSync(output,{recursive:true});
async function main(){
 const requests=[],report={root,console:[],errors:[],failed:[],checks:[],startedAt:new Date().toISOString()};
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  requests.push(name);
  if(name==='/host'){
   res.writeHead(200,{'content-type':'text/html'}).end(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><iframe id="game" allow="autoplay;fullscreen;gamepad" allowfullscreen sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups" src="http://127.0.0.1:${server.address().port}/html/12345/index.html" style="border:0;width:100vw;height:100vh"></iframe></body></html>`);return;
  }
  if(!name.startsWith('/html/12345/')){res.writeHead(404).end();return;}
  const file=path.join(root,name.slice('/html/12345/'.length));
  try{const body=fs.readFileSync(file);res.writeHead(200,{'content-type':{'.html':'text/html','.js':'application/javascript','.wasm':'application/wasm','.zip':'application/octet-stream','.png':'image/png','.json':'application/json'}[path.extname(file)]||'application/octet-stream'}).end(body)}catch(_){report.failed.push(name);res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const host=http.createServer((req,res)=>{req.url='/host';server.emit('request',req,res)});
 await new Promise(resolve=>host.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 report.browser=browser.version();
 try{
  const page=await browser.newPage({viewport:{width:480,height:900},deviceScaleFactor:1,hasTouch:true,isMobile:true});
  page.on('console',m=>report.console.push({type:m.type(),text:m.text()}));
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  const started=Date.now();
  report.parentOrigin='http://127.0.0.1:'+host.address().port;
  report.gameOrigin='http://127.0.0.1:'+server.address().port;
  await page.goto(report.parentOrigin+'/host',{waitUntil:'load'});
  await page.waitForTimeout(8000);
  await page.screenshot({path:path.join(output,'01-loaded.png')});
  let frame=page.frames().find(f=>f.url().includes('/html/12345/index.html'));
  if(!frame)throw Error('Godot iframe missing');
  report.status=await frame.evaluate(()=>document.getElementById('status')?.innerText||'');
  report.canvas=await frame.locator('#canvas').evaluate(c=>({width:c.width,height:c.height,rect:{x:c.getBoundingClientRect().x,y:c.getBoundingClientRect().y,w:c.getBoundingClientRect().width,h:c.getBoundingClientRect().height}}));
  report.loadMs=Date.now()-started;
  report.checks.push('served real Godot resource ZIP from a nested path without COOP/COEP');
  if(process.env.INTERACTIVE==='1'){
   await page.touchscreen.tap(240,730);await page.waitForTimeout(1900);
   await page.screenshot({path:path.join(output,'02-boot.png')});
   await page.touchscreen.tap(240,775);await page.waitForTimeout(800);
   await page.screenshot({path:path.join(output,'03-menu.png')});
   await page.touchscreen.tap(240,547);await page.waitForTimeout(1200);
   await page.screenshot({path:path.join(output,'04-levels.png')});
   if(process.env.FULL==='1'){
    await page.touchscreen.tap(55,197);await page.waitForTimeout(800);
    await page.screenshot({path:path.join(output,'05-story.png')});
    await page.touchscreen.tap(442,38);await page.waitForTimeout(900);
    await page.screenshot({path:path.join(output,'06-board.png')});
    const cdp=await page.context().newCDPSession(page);
    const swipe=async(x,y,dx,dy)=>{
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
     await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});
     await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     await page.waitForTimeout(450);
    };
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:325,y:397}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
    await swipe(325,397,0,-80);
    await page.screenshot({path:path.join(output,'07-move.png')});
    await swipe(325,350,-80,0);
    await swipe(278,350,0,-80);
    await page.waitForTimeout(4100);
    await page.screenshot({path:path.join(output,'08-complete.png')});
    report.progress=await frame.evaluate(()=>{try{return JSON.parse(localStorage.getItem('moleculox_save_v1')||'null')}catch(e){return {error:e.name}}});
    if(!report.progress||report.progress.cur!==1||report.progress.stars?.['0']!==3||report.progress.bestMoves?.['0']!==3)throw Error('Real mobile swipes did not complete and save level 1 in three moves');
    report.checks.push('cancelled touch then three genuine mobile swipes complete level1 with3stars/bestMoves3/cur1');
    await page.reload({waitUntil:'load'});await page.waitForTimeout(7000);
    const reloaded=page.frames().find(f=>f.url().includes('/html/12345/index.html'));frame=reloaded;
    report.restored=await reloaded.evaluate(()=>JSON.parse(localStorage.getItem('moleculox_save_v1')||'null'));
    if(report.restored?.cur!==1||report.restored?.stars?.['0']!==3)throw Error('Saved progress missing after reload');
    report.checks.push('saved progress survives full browser reload');
    if(process.env.OFFLINE==='1'){
     await frame.evaluate(()=>MXGodotOffline.start());
     await frame.waitForFunction(()=>['done','error'].includes(MXGodotOffline.state),undefined,{timeout:90000});
     report.offlineDownload=await frame.evaluate(()=>({state:MXGodotOffline.state,done:MXGodotOffline.done,total:MXGodotOffline.total,error:MXGodotOffline.error}));
     if(report.offlineDownload.state!=='done')throw Error('Offline cache failed: '+report.offlineDownload.error);
     await frame.waitForFunction(()=>!!navigator.serviceWorker.controller);
     const offlineUrl=frame.url();
     server.close();
     await frame.goto(offlineUrl,{waitUntil:'load'});await page.waitForTimeout(8000);
     await page.screenshot({path:path.join(output,'09-offline.png')});
     report.offlineProgress=await frame.evaluate(()=>JSON.parse(localStorage.getItem('moleculox_save_v1')||'null'));
     if(report.offlineProgress?.cur!==1)throw Error('Offline reload lost progress');
     report.checks.push('all game files cached, HTTP server stopped, actual Godot offline reload preserved progress');
    }
   }
  }
  report.requests=requests;
  report.crossOriginIsolated=await frame.evaluate(()=>crossOriginIsolated);
  report.engineErrors=report.console.filter(m=>m.text.startsWith('ERROR:')||m.text.startsWith('SCRIPT ERROR:'));
  report.passed=report.errors.length===0&&report.failed.length===0&&report.engineErrors.length===0;
 }finally{
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  await browser.close();await new Promise(resolve=>server.close(resolve));await new Promise(resolve=>host.close(resolve));
 }
 console.log(JSON.stringify({passed:report.passed,errors:report.errors,failed:report.failed,loadMs:report.loadMs,status:report.status,console:report.console.slice(-10)}));
 if(!report.passed)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
