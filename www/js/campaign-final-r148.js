/* Moleculox R148 FINAL · campaign certification + choreography closure
   Final late patch for the 501-level campaign.
   Goals:
   - no level may begin already solved;
   - every certified route must finish exactly on its declared mn move;
   - remove known repeated rolling-window solution choreography;
   - separate the remaining visibly-close starts where a certified redesign was needed;
   - preserve mechanics, story assets, Firebase and sync behavior.
*/
(function(root){
  'use strict';
  const START_OVERRIDES={
    77:[[0,1,8]],
    343:[[1,1,3]],
    415:[[5,6,8]],
    429:[[2,5,4]]
  };
  const ROUTES={
    5:[[0,0],[1,0],[1,1],[2,0]],
    19:[[2,1],[0,1],[1,0],[3,1],[0,2],[2,3],[1,2]],
    44:[[1,3],[1,0],[0,0],[2,0],[2,3],[2,0]],
    105:[[0,3],[0,0],[1,3],[0,1],[1,0],[0,3],[2,1],[1,0]],
    111:[[1,1],[0,1],[1,0],[0,0],[0,1],[0,2],[0,1],[2,0]],
    113:[[0,2],[0,1],[0,2],[0,1],[1,1],[2,1],[2,2]],
    138:[[2,0],[1,3],[1,2],[1,3],[0,2],[0,1],[1,1],[1,0]],
    158:[[2,1],[0,1],[1,0],[3,1],[0,2],[2,3],[1,2]],
    159:[[1,1],[1,2],[1,3],[3,0],[3,1]],
    180:[[2,1],[0,1],[4,1],[3,0],[3,1]],
    181:[[1,0],[0,1],[2,0],[2,3],[2,0],[2,1],[2,2]],
    188:[[2,2],[1,2],[1,3],[2,1],[1,2],[1,1],[0,1],[0,2]],
    77:[[1,2],[0,1],[0,0],[2,1],[4,1],[4,0],[0,1],[2,0],[3,2]],
    112:[[1,2],[5,1],[1,1],[2,2],[3,2],[3,1],[0,2],[4,1]],
    118:[[1,2],[1,1],[5,1],[3,2],[3,1],[0,2],[2,2],[4,1]],
    131:[[3,1],[1,1],[1,2],[3,3],[0,3],[1,3],[2,0],[2,3],[2,0]],
    149:[[7,0],[1,1],[6,1],[6,0],[5,3],[0,2],[0,1],[0,2]],
    155:[[2,1],[1,0],[0,1],[1,2],[3,3]],
    217:[[0,3],[0,2],[0,3],[1,3],[0,0],[1,1],[0,1],[0,2],[0,3],[1,2]],
    218:[[1,2],[1,1],[5,1],[3,2],[3,1],[0,2],[2,2],[4,1]],
    237:[[0,3],[1,3],[0,2],[0,3],[0,0],[0,1],[0,2],[0,3],[1,2],[1,1],[1,2]],
    292:[[3,0],[0,1],[0,0],[1,2],[1,1]],
    339:[[3,1],[3,0],[3,1],[0,2],[0,0],[3,3],[0,2],[4,2],[0,0]],
    343:[[3,1],[0,1],[0,3],[1,1],[1,0],[3,3]],
    344:[[5,2],[3,0],[0,3],[5,2],[3,1],[0,0]],
    345:[[1,2],[3,3],[3,2],[0,3],[0,2],[4,3],[4,2]],
    346:null,
    349:[[3,3],[0,3],[0,2],[3,2],[1,2],[4,2],[4,3],[4,2]],
    352:[[0,3],[1,2],[4,2],[0,2],[3,3],[3,2]],
    372:[[1,1],[3,2],[4,1],[5,1],[5,0],[3,1],[0,2],[1,1]],
    376:[[1,2],[5,1],[1,1],[2,2],[3,2],[3,1],[0,2],[4,1]],
    380:[[5,1],[5,2],[1,1],[3,2],[3,1],[0,2],[2,2],[4,1]],
    382:[[1,2],[1,1],[2,2],[5,1],[3,2],[3,1],[0,2],[4,1]],
    390:[[0,1],[0,0],[4,1],[3,2],[0,3],[4,3],[4,0],[2,2],[2,1]],
    394:[[2,2],[4,1],[0,1],[0,0],[3,2],[4,3],[0,3],[2,1],[4,0]],
    395:[[0,0],[2,3],[0,1],[0,0],[0,3],[2,2],[1,1],[3,2],[3,1],[1,0],[0,3],[4,2]],
    411:[[5,1],[4,1],[4,0],[5,2],[4,3],[5,0]],
    415:[[5,0],[5,3],[2,3],[5,2],[0,3],[1,3],[3,3],[4,2]],
    425:[[4,2],[2,3],[1,2],[4,3],[1,3],[0,3],[2,2],[2,3],[3,3],[0,0],[4,2],[2,1],[1,0]],
    426:[[1,2],[4,2],[1,3],[1,1],[2,3],[4,3],[1,3],[0,3],[2,2],[2,3],[3,3],[4,2],[0,0],[2,1],[1,0]],
    429:[[2,3],[4,2],[4,3],[1,2],[1,3],[0,3],[3,2],[4,2],[2,2],[2,3],[4,3],[0,0],[2,1],[1,0]],
    430:[[1,2],[2,3],[4,2],[4,3],[1,3],[0,3],[3,2],[4,2],[2,2],[2,3],[4,3],[0,0],[2,1],[1,0]],
    441:[[4,2],[0,3],[1,2],[2,3],[4,3],[2,2],[3,3],[4,2],[0,0],[0,1],[1,3],[1,0]],
    443:null,
    445:[[1,2],[4,2],[1,1],[2,3],[4,3],[2,2],[1,3],[0,3],[3,2],[4,2],[2,2],[2,3],[4,3],[0,0],[2,1],[1,0]]
  };
  const TAIL_TRIMS={346:5,443:14};
  function setRoute(lv,fs){
    lv.fs=fs.map(v=>[Number(v[0]),Number(v[1])]);
    lv.mn=lv.fs.length;
    if(!Number.isFinite(+lv.p)||+lv.p<lv.mn+1)lv.p=lv.mn+1;
    const f=lv.fs[0],a=f&&lv.a&&lv.a[Number(f[0])];if(a)lv.h=[Number(a[0]),Number(a[1]),Number(f[1])];
    lv.finalCertification='r148-exact-finish';
  }
  function apply(){
    const L=root.MX_CAMPAIGN_LEVELS;if(!Array.isArray(L)||L.length<501)return false;
    for(const [nStr,moves] of Object.entries(START_OVERRIDES)){
      const lv=L[Number(nStr)-1];if(!lv||!Array.isArray(lv.a))continue;
      for(const row of moves){const a=lv.a[Number(row[0])];if(a){a[0]=Number(row[1]);a[1]=Number(row[2]);}}
      lv.startGeometry='r148-final-separated';
    }
    for(const [nStr,fs] of Object.entries(ROUTES))if(Array.isArray(fs)){const lv=L[Number(nStr)-1];if(lv)setRoute(lv,fs);}
    for(const [nStr,count] of Object.entries(TAIL_TRIMS)){
      const lv=L[Number(nStr)-1];if(!lv||!Array.isArray(lv.fs))continue;
      setRoute(lv,lv.fs.slice(0,Number(count)));
    }
    root.MX_R148_FINAL={build:'8.7.45-r148-final',levels:501,startRedesign:Object.keys(START_OVERRIDES).map(Number),routeReauthored:Object.keys(ROUTES).filter(k=>Array.isArray(ROUTES[k])).map(Number),tailTrimmed:Object.keys(TAIL_TRIMS).map(Number),storyAssetsPreserved:true,onlineUntouched:true};
    return true;
  }
  root.MXApplyR148Final=apply;apply();
})(window);
