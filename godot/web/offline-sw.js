'use strict';
const CACHE=__CACHE_NAME__;
const FILES=__CACHE_FILES__;
const base=new URL(self.registration.scope);
const allowed=new Set(FILES.map(name=>new URL(name,base).pathname));
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 if(event.data?.type!=='cache-game'||!event.ports[0])return;
 const port=event.ports[0];
 event.waitUntil((async()=>{
  try{
   const cache=await caches.open(CACHE);let done=0;
   for(const name of FILES){
    const url=new URL(name,base).href;
    if(!await cache.match(url)){
     const response=await fetch(url,{cache:'reload'});
     if(!response.ok)throw Error('download-'+response.status);
     await cache.put(url,response);
    }
    port.postMessage({state:'downloading',done:++done,total:FILES.length});
   }
   port.postMessage({state:'done',done,total:FILES.length});
  }catch(error){port.postMessage({state:'error',error:String(error&&error.message||error)})}
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==base.origin||!allowed.has(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(request,{ignoreSearch:true});
  return cached||fetch(request);
 })());
});
