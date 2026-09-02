/* Moleculox R140 · exact-board uniqueness hotfix for legacy campaign levels.
   Five later occurrences of byte-identical board wall maps receive one certified,
   route-safe interior wall adjustment. Molecules, stories, mechanics, save IDs and
   Firebase/online are untouched. */
(function(root){
  'use strict';
  const L=root.MX_CAMPAIGN_LEVELS;if(!Array.isArray(L))return;
  const fixes={
    77:[4,4,'1'],
    107:[4,4,'1'],
    131:[3,5,'1'],
    277:[3,5,'1'],
    299:[5,5,'1']
  };
  const changed=[];
  for(const [n,v] of Object.entries(fixes)){
    const lv=L[Number(n)-1];if(!lv||!Array.isArray(lv.g))continue;
    const [x,y,to]=v;if(!lv.g[y]||x<0||x>=lv.g[y].length)continue;
    const row=lv.g[y].split('');if(row[x]===to)continue;row[x]=to;lv.g[y]=row.join('');changed.push(Number(n));
    lv.uniqueDesign=(lv.uniqueDesign?String(lv.uniqueDesign)+'+':'')+'r140-exact-board-unique';
  }
  root.MX_R140_BOARD_UNIQUENESS={changedLevels:changed};
})(window);
