/* Moleculox R147 · CAMPAIGN CHOREOGRAPHY + STORY PRESERVATION
   - Diversifies visual atom starts without changing molecule identity.
   - Reauthors a small set of certified routes where start geometry needed deeper change.
   - Adds three deliberate Hammer opportunities to break repeated mechanic profiles.
   - Exported as a late patch so Levels 302–501 receive it after async expansion load.
   Online/Firebase data is intentionally untouched. */
(function(root){
  'use strict';
  const START_OVERRIDES = {"84":[[2,2,2]],"112":[[0,5,2]],"131":[[1,1,1]],"218":[[4,1,5]],"277":[[1,2,2]],"292":[[0,4,5]],"329":[[3,1,8]],"333":[[3,4,2]],"336":[[2,4,1],[5,2,5]],"337":[[3,4,3]],"338":[[0,2,6],[1,5,4]],"339":[[4,5,3]],"340":[[3,3,2],[4,1,4]],"341":[[3,6,2]],"342":[[0,3,3],[2,2,3]],"343":[[1,3,4]],"344":[[4,3,7],[5,3,1]],"345":[[1,1,4],[3,2,2]],"346":[[5,4,6]],"348":[[4,2,2]],"349":[[3,2,3]],"350":[[3,3,2],[4,6,4]],"352":[[4,1,1]],"353":[[3,4,6]],"360":[[3,1,8]],"373":[[0,5,2],[1,2,2]],"376":[[0,5,5],[1,2,5]],"380":[[1,2,6]],"382":[[0,5,5],[3,2,3]],"390":[[2,2,1],[3,4,4]],"391":[[2,4,5],[3,1,4]],"394":[[4,1,5]],"395":[[2,6,5],[3,1,3],[4,4,4]],"411":[[4,1,8]],"415":[[4,4,4],[5,5,5]],"418":[[2,4,5]],"419":[[3,1,1]],"420":[[4,4,4]],"422":[[1,2,8],[2,3,4]],"423":[[0,3,8],[2,3,4]],"426":[[0,3,8],[4,5,3]],"427":[[0,3,8],[1,2,8],[2,3,4]],"428":[[4,5,3]],"429":[[0,3,8]],"430":[[4,5,3]],"433":[[2,4,5],[4,4,4]],"434":[[4,4,4]],"435":[[2,6,5],[3,1,1]],"436":[[0,3,8],[1,2,4]],"437":[[2,3,4]],"438":[[0,3,8],[1,2,8]],"440":[[1,2,4]],"441":[[0,3,8],[4,5,3]],"442":[[1,2,8]],"443":[[3,3,6]],"445":[[4,5,3]]};
  const ROUTE_OVERRIDES = {"336":{"fs":[[5,0],[0,1],[0,2],[3,1],[0,0],[2,3],[2,2],[1,3],[4,0],[4,3]],"mn":10,"p":11,"h":[2,5,0]},"338":{"fs":[[1,0],[3,3],[3,0],[0,0],[0,1],[0,3],[0,1],[0,0]],"mn":8,"p":9,"h":[5,4,0]},"340":{"fs":[[0,2],[0,3],[4,1],[0,0],[3,2],[4,0],[0,1],[0,3],[0,0],[4,3]],"mn":10,"p":11,"h":[4,3,2]},"342":{"fs":[[0,2],[3,0],[3,3],[1,0],[2,2],[2,1],[0,0],[3,1]],"mn":8,"p":9,"h":[3,3,2]},"350":{"fs":[[3,2],[4,2],[0,2],[0,3],[0,0],[4,0],[4,3]],"mn":7,"p":8,"h":[3,2,2]}};
  const EXTRA_HAMMER = {
    387:[[2,2],[5,4]],
    411:[[3,2],[2,4]],
    425:[[4,5],[3,7]]
  };
  let applied=false;
  function apply(){
    const L=root.MX_CAMPAIGN_LEVELS;
    if(!Array.isArray(L)||L.length<501)return false;
    // Idempotence: always assign authored final values rather than incrementally mutating.
    for(const [nStr,moves] of Object.entries(START_OVERRIDES)){
      const n=Number(nStr),lv=L[n-1]; if(!lv||!Array.isArray(lv.a))continue;
      for(const row of moves){const ai=Number(row[0]);if(lv.a[ai]){lv.a[ai][0]=Number(row[1]);lv.a[ai][1]=Number(row[2]);}}
    }
    for(const [nStr,r] of Object.entries(ROUTE_OVERRIDES)){
      const lv=L[Number(nStr)-1];if(!lv)continue;
      lv.fs=r.fs.map(v=>[Number(v[0]),Number(v[1])]);lv.mn=Number(r.mn);lv.p=Number(r.p);lv.h=r.h.map(Number);
      lv.choreography='r147-reauthored';
    }
    // Recompute hint origin after start relocations for routes that did not need reauthoring.
    for(const nStr of Object.keys(START_OVERRIDES)){
      const n=Number(nStr),lv=L[n-1],step=lv&&Array.isArray(lv.fs)?lv.fs[0]:null,atom=step&&lv.a&&lv.a[Number(step[0])];
      if(atom&&step)lv.h=[Number(atom[0]),Number(atom[1]),Number(step[1])];
      if(lv)lv.startGeometry='r147-diversified';
    }
    for(const [nStr,walls] of Object.entries(EXTRA_HAMMER)){
      const n=Number(nStr),lv=L[n-1];if(!lv)continue;
      const valid=walls.filter(v=>lv.g?.[Number(v[1])]?.[Number(v[0])]==='1');
      if(valid.length){lv.bw=valid.map(v=>[Number(v[0]),Number(v[1])]);lv.hammerOpportunity='r147-rhythm';}
    }
    root.MX_R147_CHOREOGRAPHY={
      build:'8.7.44-r147-choreography-story-preserve',
      startDiversified:Object.keys(START_OVERRIDES).map(Number),
      routeReauthored:Object.keys(ROUTE_OVERRIDES).map(Number),
      hammerAdded:Object.keys(EXTRA_HAMMER).map(Number),
      noStoryAssetsReplaced:true
    };
    applied=true;return true;
  }
  root.MXApplyR147CampaignChoreography=apply;
  apply();
})(window);
