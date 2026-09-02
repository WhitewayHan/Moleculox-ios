/* Moleculox R143 · performance architecture preserved: fetch/parse Levels 302–501 in parallel with the cinematic intro. */
(function(){
  'use strict';
  let state=(Array.isArray(window.MX_CAMPAIGN_LEVELS)&&window.MX_CAMPAIGN_LEVELS.length>=501)?'ready':'idle';
  let promise=null;
  function applyLatePatches(){
    if(typeof window.MXApplyR142CampaignCompletion==='function')window.MXApplyR142CampaignCompletion();
    if(typeof window.MXApplyR143HardcoreCampaign==='function')window.MXApplyR143HardcoreCampaign();
    if(typeof window.MXApplyR144CampaignQuality==='function')window.MXApplyR144CampaignQuality();
    if(typeof window.MXApplyR145CampaignPolish==='function')window.MXApplyR145CampaignPolish();
    if(typeof window.MXApplyR146GameFeel==='function')window.MXApplyR146GameFeel();
    if(typeof window.MXApplyR147CampaignChoreography==='function')window.MXApplyR147CampaignChoreography();
    if(typeof window.MXApplyR148Final==='function')window.MXApplyR148Final();
    if(typeof window.MXApplyR149Final==='function')window.MXApplyR149Final();
    if(typeof window.MXApplyR150Final==='function')window.MXApplyR150Final();
    if(typeof window.MXApplyR151Final==='function')window.MXApplyR151Final();
  }
  function load(){
    if(state==='ready'||(Array.isArray(window.MX_CAMPAIGN_LEVELS)&&window.MX_CAMPAIGN_LEVELS.length>=501)){
      state='ready';window.MX_CAMPAIGN_EXPANSION_READY=true;
      applyLatePatches();
      return Promise.resolve(true);
    }
    if(promise)return promise;
    state='loading';
    promise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='js/campaign-levels-expansion-r137.js?v=8.7.46-r149-final';
      s.async=true;
      s.onload=()=>{
        const ok=Array.isArray(window.MX_CAMPAIGN_LEVELS)&&window.MX_CAMPAIGN_LEVELS.length>=501;
        if(!ok){state='error';promise=null;reject(new Error('Campaign expansion loaded but 501 levels are not ready'));return;}
        applyLatePatches();
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
