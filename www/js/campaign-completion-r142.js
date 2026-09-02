/* Moleculox R142 · late-campaign mechanical diversity pass.
   This layer changes only local campaign level mechanics/metadata. Molecule
   formulas, target science, stories, progression and online systems stay intact.
   It is applied after the asynchronously loaded 302–501 expansion payload. */
(function(root){
  'use strict';

  const OVERRIDES={
    436:{pt:[[1,1],[2,1]],emphasis:'bio-portal-sampling'},
    437:{mw:[[[1,1],[2,1]]],emphasis:'bio-moving-wall-timing'},
    438:{pd:[[[3,1],[1,1]]],emphasis:'bio-pressure-routing'},
    439:{rt:[[1,1],[2,1]],emphasis:'bio-rift-transit'},
    440:{pt:[[1,1],[2,1]],mw:[[[5,1],[4,1]]],emphasis:'bio-portal-moving-wall'},
    441:{mw:[[[2,1],[1,1]]],pd:[[[1,1],[2,1]]],emphasis:'bio-moving-wall-pressure'},
    442:{pt:[[3,1],[1,2]],pd:[[[3,1],[1,1]]],emphasis:'bio-portal-pressure-fragility'},
    443:{rt:[[1,1],[4,1]],mw:[[[2,1],[1,1]]],emphasis:'bio-rift-moving-wall-fragility'},
    444:{pt:[[2,1],[3,1]],emphasis:'bio-portal-lightning'},
    445:{pt:[[1,1],[3,1]],mw:[[[2,1],[1,1]]],emphasis:'bio-portal-moving-wall-finale'},

    446:{ow:[[6,3,2]],mw:[[[1,4],[1,5]]],emphasis:'synthesis-moving-wall'},
    447:{ow:[[2,4,0]],pd:[[[5,1],[6,5]]],emphasis:'synthesis-pressure-thermal'},
    448:{ow:[[3,6,0]],fragile:[11],emphasis:'synthesis-fragile-cofactor'},
    449:{ow:[[1,4,0]],mw:[[[2,4],[2,5]]],emphasis:'synthesis-moving-wall-thermal'},
    450:{ow:[[2,6,2]],fragile:[1],pt:[[1,1],[2,1]],emphasis:'synthesis-portal-fragility'},
    451:{pd:[[[1,1],[3,7]]],emphasis:'synthesis-pressure-fragility'},
    452:{ow:[[3,1,2]],mw:[[[1,2],[1,1]]],pt:[[1,1],[2,1]],emphasis:'synthesis-portal-moving-wall-phase'},
    453:{ow:[[5,8,2]],pt:[[1,1],[2,1]],emphasis:'synthesis-portal-thermal'},
    454:{ow:[[2,2,2]],fragile:[11],mw:[[[3,1],[4,1]]],emphasis:'synthesis-fragile-moving-wall'},
    455:{ow:[[1,4,2]],pd:[[[1,1],[4,2]]],pt:[[1,1],[2,1]],emphasis:'synthesis-portal-pressure-thermal-ii'},
    456:{ow:[[1,7,2]],mw:[[[2,1],[1,1]]],pt:[[3,1],[4,1]],pd:[[[1,1],[2,1]]],emphasis:'synthesis-portal-moving-wall-pressure'},
    457:{pd:[[[2,1],[1,1]]],pt:[[2,1],[3,1]],emphasis:'synthesis-portal-pressure-fragility-ii'},
    458:{ow:[[6,3,2]],mw:[[[1,3],[2,3]]],pd:[[[2,1],[5,6]]],emphasis:'synthesis-four-module-moving-pressure'},
    459:{ow:[[3,1,3]],fragile:[1],mw:[[[1,8],[1,7]]],pt:[[1,1],[2,1]],emphasis:'synthesis-four-module-portal-fragility'},
    460:{ow:[[5,4,3]],fragile:[1],pd:[[[1,1],[3,1]]],mw:[[[5,1],[6,1]]],emphasis:'synthesis-four-module-moving-pressure-fragility'}
  };

  function clone(value){return JSON.parse(JSON.stringify(value));}
  function apply(){
    const levels=root.MX_CAMPAIGN_LEVELS;
    if(!Array.isArray(levels)||levels.length<501)return false;
    const changed=[];
    for(const [number,spec] of Object.entries(OVERRIDES)){
      const n=Number(number),level=levels[n-1];
      if(!level)continue;
      for(const [key,value] of Object.entries(spec)){
        if(key==='emphasis')continue;
        level[key]=clone(value);
      }
      level.mechanicEmphasis=spec.emphasis;
      level.uniqueDesign=(level.uniqueDesign?String(level.uniqueDesign)+'+':'')+'r142-mechanical-combination';
      changed.push(n);
    }
    root.MX_R142_CAMPAIGN_COMPLETION={
      build:'R142-CAMPAIGN-COMPLETION',
      changedLevels:changed,
      protectedRanges:'molecules, stories, progression and online systems unchanged'
    };
    return changed.length===Object.keys(OVERRIDES).length;
  }

  root.MXApplyR142CampaignCompletion=apply;
  apply();
})(window);
