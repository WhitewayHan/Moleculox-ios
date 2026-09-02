/* Moleculox R151 · final-candidate closure before independent Work review.
   - Removes the last post-tutorial 5-move campaign level (L92 -> Frozen+Fire, 6 certified moves).
   - Further diversifies the 436–445 late-game start geometry while preserving certified routes/mechanics.
   - No online/Firebase/sync changes; no story artwork replaced.
*/
(function(root){
  'use strict';
  const START_OVERRIDES={"437":[[4,8,"C",true,null,null,true],[3,8,"Br",null,true,null,null,false],[3,4,"Br"],[3,5,"Cl",false,false,false,false],[5,3,"F",false,false,false,false]],"445":[[4,8,"C",true,null,null,true],[1,7,"Br",null,false,null,null,true],[3,4,"Br"],[3,5,"F",false,false,false,false],[5,3,"I",false,false,false,false]],"47":[[6,1,"Xe"],[3,7,"F"],[1,7,"F"],[3,1,"F"],[3,8,"F"]],"210":[[5,2,"C"],[2,4,"C"],[6,4,"H"],[2,1,"H"],[4,5,"H"],[2,7,"H"]],"235":[[6,2,"C"],[1,4,"H"],[3,8,"H"],[3,6,"H"],[2,5,"H"]],"236":[[5,6,"Se"],[6,8,"Se"],[1,2,"Se"],[2,4,"Se"]],"237":[[5,4,"F"],[4,3,"O"],[2,6,"F",true]],"240":[[4,8,"Ga"],[5,5,"Cl"],[6,7,"Cl"],[4,7,"Cl"]],"241":[[1,1,"C"],[3,6,"O"],[5,8,"H"],[2,1,"H"]],"243":[[3,4,"C",true,false],[3,3,"Se",false,true],[3,5,"H"],[4,2,"H"]],"254":[[5,5,"Ga"],[6,8,"Cl"],[6,7,"Cl"],[4,7,"Cl"]],"255":[[3,6,"Cl"],[6,2,"Ca"],[4,4,"Cl"]],"259":[[5,8,"N"],[5,1,"H"],[3,5,"H"],[6,4,"H"]],"260":[[4,8,"Si"],[2,7,"Br"],[4,7,"Br"],[2,6,"Br"],[3,5,"Br"]],"263":[[4,7,"Ge"],[4,4,"H"],[2,8,"H"],[4,5,"H"],[4,8,"H"]],"267":[[4,1,"Sn"],[2,1,"F"],[1,3,"F"],[5,1,"F"],[1,5,"F"]],"271":[[4,8,"N",false,false,true,false],[3,3,"Cl"],[4,4,"Cl"],[3,5,"Cl"]],"275":[[4,7,"Si",true,false],[1,8,"H"],[2,3,"H"],[5,2,"H",false,true],[5,3,"H"]],"276":[[5,1,"C"],[2,4,"C"],[6,4,"H"],[2,1,"H"],[4,5,"H"],[2,7,"H"]],"278":[[4,6,"F"],[1,2,"O"],[2,1,"H"]],"279":[[5,2,"Si"],[4,4,"Si"],[6,2,"H"],[4,6,"H"],[3,3,"H"],[2,2,"H"]],"284":[[1,5,"P"],[4,6,"F"],[4,3,"F"],[2,7,"F"]],"287":[[3,1,"Cl"],[5,2,"Mg"],[2,7,"Cl"]],"291":[[3,6,"Cl"],[6,3,"Ca"],[4,4,"Cl"]],"294":[[5,8,"N"],[5,1,"H"],[3,5,"H"],[6,3,"H"]],"295":[[4,8,"Si"],[2,7,"Br"],[4,7,"Br"],[2,6,"Br"],[3,6,"Br"]],"297":[[5,3,"Cl"],[2,3,"N"],[6,2,"O"]],"298":[[3,1,"Sn"],[2,1,"F"],[1,4,"F"],[5,1,"F"],[1,5,"F"]],"299":[[5,4,"C"],[2,2,"C"],[6,4,"H"],[2,1,"H"],[4,5,"H"],[2,7,"H"]]};
  const L92={"a":[[6,3,"H",true],[1,6,"Cl",null,true]],"fs":[[1,1],[1,0],[0,3],[0,0],[1,0],[0,1]],"mn":6,"p":7,"h":[1,6,1]};
  /* R158 release QA: R148's exact-molecule tail trim did not account for the
     campaign Crystal objective. These three routes formed the molecule but
     stopped with one reaction component still uncollected. The repaired
     certified routes finish both requirements and remain within the existing
     PAR; no save, online, Firebase, story, or molecule data changes. */
  const R158_CRYSTAL_ROUTE_REPAIRS={
    19:[[2,1],[0,1],[1,0],[3,1],[0,2],[2,3],[4,2],[1,2],[4,0]],
    155:[[3,3],[3,0],[2,2],[3,3],[0,2],[0,1],[3,2],[1,2]],
    158:[[2,1],[0,1],[1,0],[3,1],[0,2],[2,3],[4,2],[1,2],[4,0]]
  };
  function apply(){
    const L=root.MX_CAMPAIGN_LEVELS;if(!Array.isArray(L)||L.length<501)return false;
    const q=L[91];if(q){q.a=L92.a.map(a=>a.slice());q.fs=L92.fs.map(m=>m.slice());q.mn=L92.mn;q.p=L92.p;q.h=L92.h.slice();q.finalCertification='r151-final-candidate';q.startGeometry='r151-frozen-fire-hardening';}
    for(const [k,a] of Object.entries(START_OVERRIDES)){const lv=L[+k-1];if(!lv)continue;lv.a=a.map(x=>x.slice());const f=Array.isArray(lv.fs)&&lv.fs[0],aa=f&&lv.a[+f[0]];if(aa)lv.h=[+aa[0],+aa[1],+f[1]];lv.startGeometry='r151-late-start-diversity';}
    for(const [n,route] of Object.entries(R158_CRYSTAL_ROUTE_REPAIRS)){
      const lv=L[+n-1];if(!lv)continue;lv.fs=route.map(m=>m.slice());lv.mn=route.length;lv.p=Math.max(Number(lv.p)||0,route.length);
      const first=lv.fs[0],atom=first&&lv.a&&lv.a[+first[0]];if(atom)lv.h=[+atom[0],+atom[1],+first[1]];
      lv.finalCertification='r158-crystal-objective-route-fix';
    }
    root.MX_R151_FINAL={build:'8.7.48-r151-final-candidate',levels:501,level92Hardened:true,startDiversified:Object.keys(START_OVERRIDES).map(Number),crystalRouteRepairs:Object.keys(R158_CRYSTAL_ROUTE_REPAIRS).map(Number),onlineUntouched:true,storyAssetsPreserved:true};
    return true;
  }
  root.MXApplyR151Final=apply;apply();
})(window);
