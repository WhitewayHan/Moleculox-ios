/* Moleculox v8.7.41 — R144 structural-clarity and active-mechanic pass.
   Offline campaign data only. This layer:
   - replaces decorative/adjacent portal pairs with route-active separated pairs;
   - removes floor mechanics that the certified route never exercises;
   - removes floor-feature overlaps that produced visually nonsensical stacks;
   - never touches story, progression, localization, Firebase or sync. */
(function(root){
  'use strict';

  const ACTIVE_PORTALS={
    40:[[2,6],[6,6]],
    85:[[3,2],[1,6]],
    155:[[4,2],[4,6]],
    290:[[6,1],[5,4]],
    300:[[1,1],[6,7]],
    436:[[3,1],[2,7]],
    440:[[6,3],[2,7]],
    442:[[2,3],[2,7]],
    444:[[4,1],[2,7]],
    445:[[2,3],[2,8]]
  };
  const REMOVE_PORTALS=[25,55,288,293,298,301,450,452,453,455,456,457,459];
  const ACTIVE_RIFTS={
    403:[[1,2],[6,3]],404:[[1,1],[4,7]],406:[[6,2],[1,8]],
    411:[[6,5],[4,8]],439:[[1,6],[5,6]]
  };
  const ROUTE_INSERTS={404:{pos:0,move:[5,1]},406:{pos:1,move:[0,1]},411:{pos:0,move:[5,1]}};
  const REMOVE_RIFTS=[443];
  const ACTIVE_ONE_WAY={
    30:[[4,7,3]],90:[[2,4,2]],152:[[4,3,2]],378:[[4,4,2]],
    392:[[4,5,2]],402:[[6,3,2]],410:[[4,6,2]],461:[[6,4,0]]
  };
  const ACTIVE_MOVING_WALL={80:[[[1,5],[2,5]]]};
  const ACTIVE_PRESSURE={
    157:[[[4,6],[3,1]]],292:[[[1,2],[6,7]]],296:[[[6,1],[1,8]]],
    360:[[[4,6],[1,2]]],367:[[[4,6],[5,2]]],386:[[[4,6],[6,3]]],
    404:[[[6,8],[2,1]]],411:[[[4,4],[1,3]]],438:[[[2,7],[5,1]]],
    441:[[[2,7],[6,4]]],442:[[[1,3],[6,6]]],455:[[[3,5],[6,8]]],
    456:[[[3,7],[5,1]]],457:[[[4,2],[2,8]]],460:[[[3,8],[3,1]]]
  };
  // Bare atom-position silhouettes are now unique in every rolling ten-level
  // window. Most boards only need one route-safe relocation; tightly coupled
  // boards receive one or two fully certified setup moves and matching PAR.
  const START_REBUILDS={
    77:{atom:1,from:[2,7],to:[3,5],prepend:[[1,2]]},
    112:{atom:4,from:[4,5],to:[1,5]},131:{atom:0,from:[5,4],to:[4,2]},
    151:{atom:1,from:[5,5],to:[2,5]},218:{atom:3,from:[2,1],to:[2,3]},
    277:{atom:0,from:[5,4],to:[5,7]},292:{atom:3,from:[5,3],to:[5,6]},
    315:{atom:2,from:[6,7],to:[6,4],prepend:[[2,2]]},
    347:{atom:1,from:[1,4],to:[3,5]},352:{atom:1,from:[1,2],to:[1,5]},
    355:{atom:1,from:[5,1],to:[2,1],prepend:[[1,1]]},
    367:{atom:0,from:[6,8],to:[5,6],prepend:[[0,2]]},
    376:{atom:1,from:[2,4],to:[2,2]},380:{atom:5,from:[2,7],to:[5,5]},
    387:{atom:0,from:[5,1],to:[4,3],prepend:[[0,0]]},
    394:{atom:3,from:[4,2],to:[4,4]},395:{atom:3,from:[1,2],to:[1,4]},
    410:{atom:3,from:[4,1],to:[4,4],prepend:[[3,0]]},
    411:{atom:5,from:[2,7],to:[4,6]},
    419:{atom:4,from:[4,3],to:[3,4],prepend:[[4,1]]},
    423:{atom:1,from:[3,8],to:[2,7],prepend:[[1,2]]},
    424:{atom:4,from:[5,2],to:[6,3],prepend:[[4,3]]},
    425:{atom:1,from:[3,8],to:[2,6],prepend:[[1,2]]},
    426:{atom:1,from:[3,8],to:[2,6],prepend:[[1,2]]},
    427:{atom:4,from:[5,2],to:[6,3],prepend:[[4,3]]},
    429:{atom:1,from:[3,8],to:[2,5],prepend:[[1,2]]},
    430:{atom:1,from:[3,8],to:[2,7],prepend:[[1,2]]},
    435:{atom:4,from:[4,3],to:[4,5],prepend:[[4,0]]},
    436:{atom:1,from:[3,8],to:[2,6],prepend:[[1,2]]},
    439:{atom:4,from:[5,2],to:[6,3],prepend:[[4,3]]},
    440:{atom:1,from:[3,8],to:[2,5],prepend:[[1,2]]},
    441:{atom:1,from:[3,8],to:[2,6],prepend:[[1,2]]},
    442:{atom:4,from:[5,2],to:[5,4],prepend:[[4,0]]},
    443:{atom:4,from:[5,2],to:[4,1],prepend:[[4,2],[4,1]]},
    444:{atom:1,from:[3,8],to:[1,8],prepend:[[1,1]]},
    445:{atom:1,from:[3,8],to:[1,7],prepend:[[1,2],[1,1]]}
  };
  const POST_START_ROUTE_INSERTS={300:{pos:2,move:[0,2]},445:{pos:5,move:[2,2]}};

  function clone(value){return JSON.parse(JSON.stringify(value));}
  function tag(level,value){
    const current=String(level.uniqueDesign||'').split('+').filter(Boolean);
    if(!current.includes(value))current.push(value);level.uniqueDesign=current.join('+');
  }
  function levelAt(levels,number){return levels[number-1]||null;}
  function apply(){
    const levels=root.MX_CAMPAIGN_LEVELS;if(!Array.isArray(levels)||levels.length!==501)return false;
    const changed=new Set();
    for(const [number,pair] of Object.entries(ACTIVE_PORTALS)){
      const level=levelAt(levels,Number(number));if(!level)continue;level.pt=clone(pair);delete level.noPortal;
      tag(level,'r144-active-separated-portal');changed.add(Number(number));
    }
    for(const number of REMOVE_PORTALS){
      const level=levelAt(levels,number);if(!level)continue;delete level.pt;level.noPortal=true;
      tag(level,'r144-remove-decorative-portal');changed.add(number);
    }
    for(const [number,pair] of Object.entries(ACTIVE_RIFTS)){
      const level=levelAt(levels,Number(number));if(!level)continue;level.rt=clone(pair);delete level.noRift;
      tag(level,'r144-active-separated-rift');changed.add(Number(number));
    }
    for(const [number,spec] of Object.entries(ROUTE_INSERTS)){
      const n=Number(number),level=levelAt(levels,n);if(!level||!Array.isArray(level.fs))continue;
      level.fs.splice(spec.pos,0,spec.move.slice());level.mn++;level.p++;
      const first=level.fs[0],atom=level.a[first[0]];if(atom)level.h=[atom[0],atom[1],first[1]];
      tag(level,'r144-separated-rift-route');changed.add(n);
    }
    for(const number of REMOVE_RIFTS){
      const level=levelAt(levels,number);if(!level)continue;delete level.rt;level.noRift=true;
      tag(level,'r144-remove-decorative-rift');changed.add(number);
    }
    for(const [number,tiles] of Object.entries(ACTIVE_ONE_WAY)){
      const level=levelAt(levels,Number(number));if(!level)continue;level.ow=clone(tiles);delete level.noOneWay;
      tag(level,'r144-active-one-way');changed.add(Number(number));
    }
    for(const [number,paths] of Object.entries(ACTIVE_MOVING_WALL)){
      const level=levelAt(levels,Number(number));if(!level)continue;level.mw=clone(paths);delete level.noMovingWall;
      tag(level,'r144-active-moving-wall');changed.add(Number(number));
    }
    for(const [number,systems] of Object.entries(ACTIVE_PRESSURE)){
      const level=levelAt(levels,Number(number));if(!level)continue;level.pd=clone(systems);delete level.noPressure;
      tag(level,'r144-active-pressure');changed.add(Number(number));
    }
    for(const [number,spec] of Object.entries(START_REBUILDS)){
      const n=Number(number),level=levelAt(levels,n),atom=level&&level.a&&level.a[spec.atom];if(!atom)continue;
      if(+atom[0]!==spec.from[0]||+atom[1]!==spec.from[1])continue;
      atom[0]=spec.to[0];atom[1]=spec.to[1];
      if(Array.isArray(spec.prepend)&&spec.prepend.length){
        level.fs=clone(spec.prepend).concat(level.fs.map(step=>step.slice()));
        level.mn+=spec.prepend.length;level.p+=spec.prepend.length;
        level.h=[spec.to[0],spec.to[1],spec.prepend[0][1]];
      }else if(Array.isArray(level.h)&&+level.h[0]===spec.from[0]&&+level.h[1]===spec.from[1]){
        level.h[0]=spec.to[0];level.h[1]=spec.to[1];
      }
      tag(level,'r144-rolling-ten-start-rebuild');changed.add(n);
    }
    for(const [number,spec] of Object.entries(POST_START_ROUTE_INSERTS)){
      const n=Number(number),level=levelAt(levels,n);if(!level||!Array.isArray(level.fs))continue;
      level.fs.splice(spec.pos,0,spec.move.slice());level.mn++;level.p++;
      tag(level,'r144-distinct-portal-route');changed.add(n);
    }

    root.MX_R144_CAMPAIGN_QUALITY={
      build:'R144-ACTIVE-MECHANICS-STRUCTURAL-CLARITY',
      changedLevels:[...changed].sort((a,b)=>a-b),
      activeSeparatedPortals:Object.keys(ACTIVE_PORTALS).map(Number),
      removedDecorativePortals:REMOVE_PORTALS.slice(),
      activeSeparatedRifts:Object.keys(ACTIVE_RIFTS).map(Number),
      separatedRiftRouteRebuilds:Object.keys(ROUTE_INSERTS).map(Number),
      removedDecorativeRifts:REMOVE_RIFTS.slice(),
      activatedOneWays:Object.keys(ACTIVE_ONE_WAY).map(Number),
      activatedMovingWalls:Object.keys(ACTIVE_MOVING_WALL).map(Number),
      activatedPressureSystems:Object.keys(ACTIVE_PRESSURE).map(Number),
      rollingTenStartRebuilds:Object.keys(START_REBUILDS).map(Number),
      distinctPortalRouteRebuilds:Object.keys(POST_START_ROUTE_INSERTS).map(Number),
      protectedScope:'story, progression, localization, Firebase and sync unchanged'
    };
    return true;
  }

  root.MXApplyR144CampaignQuality=apply;apply();
})(window);
