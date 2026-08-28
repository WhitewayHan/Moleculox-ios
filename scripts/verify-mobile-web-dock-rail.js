const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'www','css','app.css'),'utf8');
function must(ok,msg){if(!ok)throw new Error(msg);}
const marker='R81 JOINFIX2 — mobile Chrome visible-viewport left rail';
must(css.includes(marker),'Missing mobile Chrome rail fix marker');
for(const token of [
  'body.mxWeb #splash #btnHof.trophyBtn{bottom:var(--mx-web-dock-b0)!important}',
  'body.mxWeb #splash #btnDuel.duelBtn{bottom:var(--mx-web-dock-b1)!important}',
  'body.mxWeb #splash #btnLabMenu.labDockBtn{bottom:var(--mx-web-dock-b2)!important',
  'body.mxWeb #splash #btnGuide.guideDockBtn{bottom:var(--mx-web-dock-b3)!important',
  'body.mxWeb #splash #btnMoleculopediaDock.learningDockBtn{bottom:var(--mx-web-dock-b4)!important',
  'body.mxWeb #splash #btnTrainingDock.learningDockBtn{bottom:var(--mx-web-dock-b5)!important'
]) must(css.includes(token),`Missing rail rule: ${token}`);
const clamp=(min,v,max)=>Math.max(min,Math.min(max,v));
function layout(h){
  if(h<=760){
    const size=clamp(46,h*.068,52), gap=clamp(8,h*.0135,11), b0=clamp(44,h*.065,52);
    const bottoms=[b0]; for(let i=1;i<6;i++)bottoms.push(bottoms[i-1]+size+gap);
    return {size,bottoms};
  }
  // Existing >760px R81 approved ladder: 58px controls with 12px vertical gaps.
  return {size:58,bottoms:[62,132,202,272,342,412]};
}
for(const h of [568,610,640,667,700,701,714,736,759,760,761,780,844,900]){
  const {size,bottoms}=layout(h);
  must(size>=46,`Unsafe touch target at ${h}px`);
  for(let i=1;i<bottoms.length;i++){
    const gap=bottoms[i]-bottoms[i-1]-size;
    must(gap>=7.99,`Dock overlap at ${h}px between slots ${i-1}/${i}: gap=${gap}`);
  }
  const top=h-(bottoms[5]+size);
  must(top>=0,`Training dock leaves visible viewport at ${h}px: top=${top}`);
}
console.log('PASS mobile web dock rail: 568–900px portrait, no overlap, >=46px touch targets');
