/* R200 FINAL: R199 gameplay/hints preserved; larger menu-style science doodles restored on sparse wall stones. */
importScripts('./offline-manifest-r193.js');
const CACHE_NAME='moleculox-8.7.97-r200-final-ios';
const MEDIA_CACHE='moleculox-media-v1';
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
    if(cached)return rangeResponse(req,cached);
    if(req.mode==='navigate'){const shell=await cache.match('./index.html');if(shell)return shell;}
    try{
      const response=await fetch(req);
      if(response.ok&&response.status!==206){const copy=response.clone();event.waitUntil(cache.put(req,copy).catch(()=>{}));}
      return response;
    }catch(e){
      if(cached)return rangeResponse(req,cached);
      if(req.mode==='navigate'){const index=await cache.match('./index.html');if(index)return index;}
      if(isMedia&&req.destination==='image'){
        const shell=await caches.open(CACHE_NAME);const fallback=await shell.match('./assets/images/bg-default.webp');if(fallback)return fallback;
      }
      return Response.error();
    }
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='DOWNLOAD_OFFLINE_PACK'||event.data.version!==182)return;
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
