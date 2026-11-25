/* Browser storage transport; gameplay remains in Godot. */
(function(root){
 'use strict';
 const api=root.MXGodotOffline={state:'idle',done:0,total:0,error:'',async start(){
  if(api.state==='downloading')return;
  api.state='downloading';api.error='';api.done=0;
  try{
   if(!navigator.serviceWorker)throw Error('service-worker-unavailable');
   const reg=await navigator.serviceWorker.register(new URL('offline-sw.js',location.href),{scope:'./'});
   const worker=reg.installing||reg.waiting||reg.active;
   if(!worker)throw Error('service-worker-unavailable');
   if(worker.state!=='activated')await new Promise((yes,no)=>{
    const timer=setTimeout(()=>no(Error('activation-timeout')),30000);
    worker.addEventListener('statechange',()=>{if(worker.state==='activated'){clearTimeout(timer);yes()}else if(worker.state==='redundant'){clearTimeout(timer);no(Error('activation-failed'))}});
   });
   const channel=new MessageChannel();channel.port1.onmessage=event=>Object.assign(api,event.data);
   worker.postMessage({type:'cache-game'},[channel.port2]);
  }catch(error){api.state='error';api.error=String(error&&error.message||error);}
 }};
})(globalThis);
