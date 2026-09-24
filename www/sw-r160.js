/* Moleculox R376 PAR hard-reset iOS release · current offline cache namespace. */
importScripts('./offline-manifest-r193.js');
const CACHE_NAME='moleculox-r376-par-hard-reset-ios';
const MEDIA_CACHE='moleculox-media-v2-r376-par-hard-reset-ios';
const REFRESH_MEDIA_PATHS=new Set([
  './assets/images/boot-splash.webp',
  './assets/images/moleculox-logo-r220.png',
  'assets/audio/voices/dre-voice-sprite-en-r316-hybrid44.mp3',
  'assets/audio/voices/dre-voice-sprite-tr-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-de-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-es-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-pt-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-fr-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-it-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-ja-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-zh-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-ko-r324-master.mp3',
  'assets/audio/voices/dre-voice-sprite-ru-r334.mp3',
  './assets/images/dr-edward-atom.png',
  './assets/images/dr-e-poses/idle.webp',
  './assets/images/dr-e-poses/magnifier.webp',
  './assets/images/dr-e-poses/celebrate.webp',
  './assets/images/dr-e-poses/medal.webp',
  './assets/images/dr-e-poses/victory.webp',
  './assets/images/dr-e-poses/clap.webp',
  './assets/images/dr-e-poses/thinking.webp',
  './assets/images/dr-e-poses/experiment.webp',
  './assets/images/dr-e-poses/molecule.webp',
  './assets/images/dr-e-poses/clipboard.webp',
  './assets/images/dr-e-poses/surprised.webp',
  './assets/images/dr-e-poses/confused.webp',
  './assets/images/science-legends/ibn-sina-thumb.webp',
  './assets/images/science-legends/ibn-sina.webp',
  './assets/images/science-legends/jabir-ibn-hayyan-thumb.webp',
  './assets/images/science-legends/jabir-ibn-hayyan.webp',
  './assets/images/science-legends/al-razi-thumb.webp',
  './assets/images/science-legends/al-razi.webp',
  './assets/images/science-legends/lavoisier-thumb.webp',
  './assets/images/science-legends/lavoisier.webp',
  './assets/images/science-legends/avogadro-thumb.webp',
  './assets/images/science-legends/avogadro.webp',
  './assets/images/science-legends/remziye-hisar-thumb.webp',
  './assets/images/science-legends/remziye-hisar.webp',
  './assets/images/science-legends/mendeleev-thumb.webp',
  './assets/images/science-legends/mendeleev.webp',
  './assets/images/science-legends/faraday-thumb.webp',
  './assets/images/science-legends/faraday.webp',
  './assets/images/science-legends/dalton-thumb.webp',
  './assets/images/science-legends/dalton.webp',
  './assets/images/science-legends/robert-boyle-thumb.webp',
  './assets/images/science-legends/robert-boyle.webp',
  './assets/images/science-legends/berzelius-thumb.webp',
  './assets/images/science-legends/berzelius.webp',
  './assets/images/science-legends/humphry-davy-thumb.webp',
  './assets/images/science-legends/humphry-davy.webp',
  './assets/images/science-legends/marie-curie-thumb.webp',
  './assets/images/science-legends/marie-curie.webp',
  './assets/images/science-legends/oktay-sinanoglu-thumb.webp',
  './assets/images/science-legends/oktay-sinanoglu.webp',
  './assets/images/science-legends/cahit-arf-thumb.webp',
  './assets/images/science-legends/cahit-arf.webp',
  './assets/images/science-legends/feza-gursey-thumb.webp',
  './assets/images/science-legends/feza-gursey.webp',
  './assets/images/science-legends/gilbert-lewis-thumb.webp',
  './assets/images/science-legends/gilbert-lewis.webp',
  './assets/images/science-legends/linus-pauling-thumb.webp',
  './assets/images/science-legends/linus-pauling.webp',
  './assets/images/science-legends/dorothy-hodgkin-thumb.webp',
  './assets/images/science-legends/dorothy-hodgkin.webp',
  './assets/images/science-legends/rosalind-franklin-thumb.webp',
  './assets/images/science-legends/rosalind-franklin.webp',
  './assets/images/science-legends/ahmed-zewail-thumb.webp',
  './assets/images/science-legends/ahmed-zewail.webp',
  './assets/images/science-legends/rutherford-thumb.webp',
  './assets/images/science-legends/rutherford.webp',
  './assets/images/science-legends/niels-bohr-thumb.webp',
  './assets/images/science-legends/niels-bohr.webp',
  './assets/images/science-legends/fuat-sezgin-thumb.webp',
  './assets/images/science-legends/fuat-sezgin.webp'
].map(local=>new URL(local,self.location.href).pathname));
const core=self.MX_OFFLINE_CORE,media=self.MX_OFFLINE_MEDIA;
const localPath=url=>new URL(url,self.location.href).pathname;
const mediaPaths=new Set(media.map(localPath));
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await cache.addAll(core);await self.skipWaiting();})());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const target=await caches.open(MEDIA_CACHE);
    for(const name of await caches.keys()){
      if(!name.startsWith('moleculox-')||name===CACHE_NAME||name===MEDIA_CACHE)continue;
      const old=await caches.open(name);
      for(const request of await old.keys()){
        if(!mediaPaths.has(localPath(request.url)))continue;
        if(REFRESH_MEDIA_PATHS.has(localPath(request.url)))continue;
        if(!(await target.match(request,{ignoreSearch:true}))){const response=await old.match(request);if(response?.ok)await target.put(request,response);}
      }
      await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
async function rangeResponse(request,response){
  const range=request.headers.get('range');
  if(!range||!response||!/^audio\//.test(response.headers.get('content-type')||''))return response;
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match)return response;
  const bytes=await response.arrayBuffer(),length=bytes.byteLength;
  const start=match[1]?Number(match[1]):Math.max(0,length-Number(match[2]));
  const end=match[1]&&match[2]?Math.min(length-1,Number(match[2])):length-1;
  if(start>end||start>=length)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+length}});
  const headers=new Headers(response.headers);headers.set('Content-Range',`bytes ${start}-${end}/${length}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(bytes.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  const isMedia=mediaPaths.has(url.pathname),isCode=/\.(html|js|css)$|\.webmanifest$/.test(url.pathname)||req.mode==='navigate';
  if(!isMedia&&!isCode)return;
  event.respondWith((async()=>{
    const cache=await caches.open(isMedia?MEDIA_CACHE:CACHE_NAME);
    const cached=await cache.match(req,{ignoreSearch:true});
    // R257: code and navigations are NETWORK-FIRST. Previous QA workers were
    // cache-first with ignoreSearch:true, which could leave an old R240/R241
    // build running after a new itch upload. Media stays cache-first for speed.
    if(isCode){
      try{
        const response=await fetch(req,{cache:'no-store'});
        if(response.ok&&response.status!==206){const copy=response.clone();event.waitUntil(cache.put(req,copy).catch(()=>{}));}
        return response;
      }catch(e){
        if(cached)return cached;
        if(req.mode==='navigate'){const index=await cache.match('./index.html');if(index)return index;}
        return Response.error();
      }
    }
    if(cached)return rangeResponse(req,cached);
    try{
      const response=await fetch(req);
      if(response.ok&&response.status!==206){const copy=response.clone();event.waitUntil(cache.put(req,copy).catch(()=>{}));}
      return response;
    }catch(e){
      if(cached)return rangeResponse(req,cached);
      if(isMedia&&req.destination==='image'){
        const shell=await caches.open(CACHE_NAME);const fallback=await shell.match('./assets/images/bg-default.webp');if(fallback)return fallback;
      }
      return Response.error();
    }
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='DOWNLOAD_OFFLINE_PACK'||event.data.version!==272)return;
  const port=event.ports[0];if(!port)return;
  event.waitUntil((async()=>{
    const cache=await caches.open(MEDIA_CACHE);let index=0,completed=0,failed=0;
    const report=done=>port.postMessage({completed,total:media.length,failed,done});report(false);
    const heartbeat=setInterval(()=>report(false),5000);
    try{
      async function lane(){while(index<media.length){const url=media[index++];try{
        if(!(await cache.match(url,{ignoreSearch:true}))){const response=await fetch(url);if(!response.ok)throw new Error('asset-unavailable');await cache.put(url,response);}
      }catch(e){failed++;}completed++;report(false);}}
      await Promise.all([lane(),lane(),lane()]);
    }finally{clearInterval(heartbeat);report(true);port.close();}
  })());
});
