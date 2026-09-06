/* Moleculox R143 · performance architecture preserved: fetch/parse Levels 302–501 in parallel with the cinematic intro. */
(function(){
  'use strict';
  let state=(Array.isArray(window.MX_CAMPAIGN_LEVELS)&&window.MX_CAMPAIGN_LEVELS.length>=501)?'ready':'idle';
  let promise=null;
  function load(){
    if(state==='ready'||(Array.isArray(window.MX_CAMPAIGN_LEVELS)&&window.MX_CAMPAIGN_LEVELS.length>=501)){
      state='ready';window.MX_CAMPAIGN_EXPANSION_READY=true;

      return Promise.resolve(true);
    }
    if(promise)return promise;
    state='loading';
    promise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='js/campaign-levels-expansion-r137.js?v=8.7.96-r199-free-first-strategic-hint';
      s.async=true;
      s.onload=()=>{
        const ok=Array.isArray(window.MX_CAMPAIGN_LEVELS)&&window.MX_CAMPAIGN_LEVELS.length>=501;
        if(!ok){state='error';promise=null;reject(new Error('Campaign expansion loaded but 501 levels are not ready'));return;}
  
        state='ready';window.MX_CAMPAIGN_EXPANSION_READY=true;resolve(true);
      };
      s.onerror=()=>{state='error';promise=null;reject(new Error('Campaign expansion failed to load'));};
      document.head.appendChild(s);
    });
    return promise;
  }
  window.MXCampaignExpansion={load,get ready(){return state==='ready'||!!window.MX_CAMPAIGN_EXPANSION_READY;},get state(){return state;}};
  // Start only after the browser has had a real paint opportunity. The 302–501 payload then
  // downloads/parses behind the studio/boot cinematic; menu entry still awaits readiness in game.js.
  const warm=()=>load().catch(()=>{});
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>requestAnimationFrame(warm));
  else setTimeout(warm,32);
})();
