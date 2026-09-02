/* Moleculox R146 · GAME FEEL + RHYTHM — R147 late-load-safe edition */
(function(root){
  'use strict';
  const hammerWalls={
    15:[[4,4],[3,1],[5,2]],30:[[3,5],[2,3],[6,4]],75:[[2,4],[5,4],[4,1]],
    110:[[3,4],[5,2]],120:[[3,4],[5,5]],130:[[2,4],[5,4]],140:[[3,3],[6,6]],
    210:[[3,4],[4,2]],220:[[3,4],[1,5]],230:[[2,5],[5,5]],240:[[4,5],[3,3]],270:[[3,3],[5,6]],
    330:[[5,2],[3,5]],340:[[4,6],[2,2]],360:[[3,5],[2,3]],375:[[4,6],[5,2]],450:[[3,2],[4,4]]
  };
  function apply(){
    const L=root.MX_CAMPAIGN_LEVELS;if(!Array.isArray(L)||L.length<501)return false;
    const changed=[];
    for(const [n,walls] of Object.entries(hammerWalls)){const lv=L[Number(n)-1];if(!lv)continue;const valid=walls.filter(([x,y])=>Number.isInteger(x)&&Number.isInteger(y)&&lv.g?.[y]?.[x]==='1');if(valid.length){lv.bw=valid;lv.hammerOpportunity='r146-explicit';changed.push(Number(n));}}
    if(L[5]&&L[5].onboard)Object.assign(L[5].onboard,{
      tr:'Üç atomlu yapıda HEDEF kartındaki yönü ve sıralamayı birebir koru. Molekül tahtanın başka bir yerinde olabilir.',
      en:'Match the GOAL card’s direction and order exactly. The molecule may be built anywhere on the board.',
      de:'Richtung und Reihenfolge müssen exakt der ZIEL-Karte entsprechen. Das Molekül darf überall auf dem Brett liegen.',
      es:'Iguala exactamente la dirección y el orden de la tarjeta OBJETIVO. La molécula puede quedar en cualquier lugar del tablero.',
      pt:'Iguale exatamente a direção e a ordem do cartão ALVO. A molécula pode ficar em qualquer lugar do tabuleiro.',
      ja:'「目標」カードの向きと順番を完全に合わせてください。分子を作る位置は盤面のどこでも構いません。',
      fr:'Respectez exactement la direction et l’ordre de la carte OBJECTIF. La molécule peut être construite n’importe où sur le plateau.',
      zh:'方向和顺序必须与“目标”卡完全一致；分子可以在棋盘任意位置完成。',
      it:'Direzione e ordine devono corrispondere esattamente alla carta OBIETTIVO. La molecola può essere costruita ovunque sulla tavola.'
    });
    root.MX_R146_GAME_FEEL={build:'8.7.43-r146-game-feel-rhythm',explicitHammerAdded:changed,expectedHammerDataCount:L.filter(v=>Array.isArray(v&&v.bw)&&v.bw.length).length,targetOrientationClarity:true};return true;
  }
  root.MXApplyR146GameFeel=apply;apply();
})(window);
