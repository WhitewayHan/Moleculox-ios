/* Optional complete offline media pack. No account traffic is cached. */
(function(){
  'use strict';
  window.MXOfflinePack={async download(onProgress){
    if(!('serviceWorker' in navigator))throw new Error('offline-unavailable');
    let readyTimer;
    const registration=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>{readyTimer=setTimeout(()=>reject(new Error('offline-unavailable')),15000);})]).finally(()=>clearTimeout(readyTimer)),worker=registration.active;
    if(!worker)throw new Error('offline-unavailable');
    return new Promise((resolve,reject)=>{
      const channel=new MessageChannel();let timer;
      const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>{channel.port1.close();reject(new Error('offline-timeout'));},30000);};
      channel.port1.onmessage=e=>{
        reset();const data=e.data||{};if(onProgress)onProgress(data);
        if(data.done){clearTimeout(timer);channel.port1.close();data.failed?reject(new Error('offline-incomplete')):resolve(data);}
      };
      reset();worker.postMessage({type:'DOWNLOAD_OFFLINE_PACK',version:182},[channel.port2]);
    });
  }};
})();
