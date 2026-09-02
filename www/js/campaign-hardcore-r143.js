/* Moleculox v8.7.40 — R143 ruthless ten-level diversity and near-clone rebuild.
   Offline campaign data only. This layer:
   - removes every fixed/rolling ten-level molecule-formula repeat found in R142;
   - breaks all 54 exact rotated/mirrored full-puzzle near-clone pairs with two
     certified-route-safe wall changes on the later board;
   - replaces the repeated Level 287–296 mechanic core with a genuinely
     alternating Grand Master sequence;
   - never touches story checkpoints, progression, localization, Firebase or sync. */
(function(root){
  'use strict';

  const WALL_ADDITIONS={
    152:[[3,4],[2,5]],153:[[3,4],[4,5]],154:[[3,4],[4,3]],155:[[3,4],[2,5]],
    156:[[2,5],[4,6]],157:[[3,4],[4,3]],159:[[4,4],[4,6]],161:[[4,4],[3,3]],
    162:[[3,4],[4,5]],163:[[4,4],[5,5]],164:[[3,4],[4,3]],166:[[4,5],[3,3]],
    167:[[3,4],[2,5]],168:[[3,4],[4,5]],169:[[4,3],[2,4]],170:[[3,3],[2,5]],
    171:[[3,4],[4,3]],172:[[4,5],[2,5]],173:[[3,4],[4,5]],174:[[3,4],[4,3]],
    175:[[2,5],[5,5]],176:[[3,4],[4,5]],177:[[3,4],[4,5]],178:[[4,4],[2,4]],
    179:[[5,5],[3,6]],180:[[4,4],[3,3]],181:[[2,4],[3,6]],182:[[3,3],[3,7]],
    184:[[3,4],[4,6]],187:[[3,5],[5,5]],188:[[4,4],[5,5]],189:[[3,3],[2,5]],
    194:[[4,3],[5,5]],195:[[3,4],[2,5]],197:[[4,4],[4,6]],198:[[2,4],[5,4]],
    199:[[3,3],[1,4]],201:[[4,5],[4,3]],202:[[2,4],[5,4]],204:[[4,3],[2,4]],
    207:[[3,5],[3,3]],208:[[4,5],[4,3]],209:[[3,3],[5,4]],212:[[3,4],[4,3]],
    215:[[4,4],[2,4]],216:[[3,4],[3,2]],217:[[3,5],[3,3]],219:[[3,5],[1,4]],
    220:[[3,4],[5,5]],221:[[3,5],[5,5]],222:[[3,5],[2,4]],223:[[4,4],[3,6]],
    224:[[4,4],[6,4]],226:[[4,4],[4,2]]
  };

  // Extra route-safe geometry edits for every fixed ten-level package whose
  // closest two interiors still shared at least 80% of their wall pattern.
  const SIMILARITY_WALL_ADDITIONS={
    77:[[4,5],[4,3],[2,5]],118:[[3,5],[3,2],[4,2],[5,3]],277:[[4,2],[1,4]],
    420:[[6,4],[6,5]],424:[[4,2]],425:[[6,5],[1,3],[6,3]],426:[[1,3]],
    427:[[4,6],[1,3]],428:[[4,2]],429:[[4,6],[2,3],[3,1],[6,5],[1,1]],
    430:[[2,3],[6,7]],439:[[4,2]],440:[[2,3]],443:[[3,3],[1,2]],
    444:[[2,3],[6,5],[6,3]],445:[[1,3],[4,6]]
  };

  // Atom labels are mapped by the certified final coordinate. Geometry and
  // route stay intact while the target becomes a different, fully localized
  // real molecule already present in the Moleculox science database.
  const TARGET_REBUILDS={
    182:{from:'SnF4',to:'POF3',labels:['P','F','F','F','O']},
    268:{from:'GeH4',to:'GeI4',labels:['Ge','I','I','I','I']},
    283:{from:'AlBr3',to:'AlI3',labels:['Al','I','I','I']},
    285:{from:'BCl3',to:'NH2Cl',labels:['N','Cl','H','H']}
  };

  const MECHANIC_REBUILDS={
    145:{set:{fragile:[3]},emphasis:'lightning-thaw+active-fragile'},
    243:{set:{fragile:[3]},emphasis:'thermal-melt+active-fragile'},
    287:{set:{},emphasis:'grand-master-one-way-fragile'},
    288:{drop:['ow','fragile'],set:{pt:[[5,1],[6,1]],mw:[[[2,1],[1,1]]]},emphasis:'grand-master-portal-moving-wall'},
    289:{drop:['fragile'],set:{bw:[[1,1]]},emphasis:'grand-master-one-way-breakable-wall'},
    290:{drop:['ow'],set:{pt:[[3,1],[2,3]]},emphasis:'grand-master-portal-fragile'},
    291:{drop:['fragile'],set:{mw:[[[2,1],[3,1]]]},emphasis:'grand-master-one-way-moving-wall'},
    292:{drop:['ow'],set:{pd:[[[3,1],[2,1]]]},emphasis:'grand-master-pressure-fragile'},
    293:{drop:['fragile'],set:{pt:[[1,1],[3,4]]},emphasis:'grand-master-one-way-portal'},
    294:{drop:['ow','linked'],set:{bw:[[3,1]]},emphasis:'grand-master-breakable-wall-fragile'},
    295:{drop:['fragile'],set:{mw:[[[1,1],[2,1]]]},emphasis:'grand-master-one-way-moving-wall-ii'},
    296:{drop:['ow','fragile'],set:{pd:[[[1,1],[2,1]]],bw:[[2,2]]},emphasis:'grand-master-pressure-breakable-wall'}
  };

  function clone(value){return JSON.parse(JSON.stringify(value));}
  function tag(level,value){
    const current=String(level.uniqueDesign||'').split('+').filter(Boolean);
    if(!current.includes(value))current.push(value);
    level.uniqueDesign=current.join('+');
  }
  function addWall(level,x,y){
    if(!level||!Array.isArray(level.g)||!level.g[y]||x<1||y<1||y>=level.g.length-1||x>=level.g[y].length-1)return false;
    if(level.g[y][x]==='1')return true;
    const row=level.g[y].split('');row[x]='1';level.g[y]=row.join('');return true;
  }
  function apply(){
    const levels=root.MX_CAMPAIGN_LEVELS;
    if(!Array.isArray(levels)||levels.length<301)return false;
    const changed=new Set();

    for(const [number,cells] of Object.entries(WALL_ADDITIONS)){
      const n=Number(number),level=levels[n-1];if(!level)continue;
      let ok=true;for(const [x,y] of cells)ok=addWall(level,x,y)&&ok;
      if(ok){tag(level,'r143-two-wall-nearclone-rebuild');changed.add(n);}
    }

    for(const [number,cells] of Object.entries(SIMILARITY_WALL_ADDITIONS)){
      const n=Number(number),level=levels[n-1];if(!level)continue;
      let ok=true;for(const [x,y] of cells)ok=addWall(level,x,y)&&ok;
      if(ok){tag(level,'r143-interior-similarity-rebuild');changed.add(n);}
    }

    for(const [number,spec] of Object.entries(TARGET_REBUILDS)){
      const n=Number(number),level=levels[n-1];if(!level||!Array.isArray(level.a))continue;
      if(level.m!==spec.from&&level.m!==spec.to)continue;
      if(level.a.length!==spec.labels.length)continue;
      level.m=spec.to;spec.labels.forEach((label,index)=>{level.a[index][2]=label;});
      tag(level,'r143-scientific-target-rebuild');changed.add(n);
    }

    for(const [number,spec] of Object.entries(MECHANIC_REBUILDS)){
      const n=Number(number),level=levels[n-1];if(!level)continue;
      for(const key of spec.drop||[])delete level[key];
      for(const [key,value] of Object.entries(spec.set||{}))level[key]=clone(value);
      level.mechanicEmphasis=spec.emphasis;
      tag(level,'r143-alternating-mechanic-rebuild');changed.add(n);
    }

    root.MX_R143_HARDCORE_CAMPAIGN={
      build:'R143-HARDCORE-TEN-LEVEL-DIVERSITY',
      changedLevels:[...changed].sort((a,b)=>a-b),
      targetRebuilds:Object.fromEntries(Object.entries(TARGET_REBUILDS).map(([n,s])=>[n,s.from+'→'+s.to])),
      nearCloneBoards:Object.keys(WALL_ADDITIONS).map(Number),
      similarityRebuildBoards:Object.keys(SIMILARITY_WALL_ADDITIONS).map(Number),
      mechanicRebuilds:Object.keys(MECHANIC_REBUILDS).map(Number),
      protectedScope:'story checkpoints, progression, localization, Firebase and sync unchanged'
    };
    return true;
  }

  root.MXApplyR143HardcoreCampaign=apply;
  apply();
})(window);
