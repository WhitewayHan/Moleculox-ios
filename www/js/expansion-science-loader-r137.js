/* Moleculox R143 · startup performance preserved: defer heavy expansion science until browser idle. */
(function(){
  'use strict';
  let state=window.MX_EXPANSION_SCIENCE_BUNDLE_READY?'ready':'idle',promise=null;
  function load(){
    if(state==='ready'||window.MX_EXPANSION_SCIENCE_BUNDLE_READY){state='ready';return Promise.resolve(true);}
    if(promise)return promise;
    state='loading';
    promise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='js/expansion-science-bundle-r137.js?v=8.7.40-r143-ruthless-perf';
      s.async=true;
      s.onload=()=>{state='ready';window.MX_EXPANSION_SCIENCE_BUNDLE_READY=true;resolve(true);};
      s.onerror=()=>{state='error';promise=null;reject(new Error('Expansion science bundle failed to load'));};
      document.head.appendChild(s);
    });
    return promise;
  }
  const api={load,get ready(){return state==='ready'||!!window.MX_EXPANSION_SCIENCE_BUNDLE_READY;},get state(){return state;}};
  window.MXExpansionScience=api;
  function idleLoad(){
    if(api.ready)return;
    if('requestIdleCallback' in window)requestIdleCallback(()=>load().catch(()=>{}),{timeout:2200});
    else setTimeout(()=>load().catch(()=>{}),900);
  }
  if(document.readyState==='complete')setTimeout(idleLoad,80);
  else window.addEventListener('load',()=>setTimeout(idleLoad,80),{once:true,passive:true});
})();
