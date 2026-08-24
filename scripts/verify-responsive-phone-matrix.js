const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'www/css/app.css'),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const marker='R77 PHONE-MATRIX RESPONSIVE HARDENING';
must(css.includes(marker),'phone-matrix responsive hardening marker missing');
for(const needle of [
  'body.mxNative #splash #splashBtns',
  'width:min(68vw,278px)!important',
  'width:min(64vw,218px)!important',
  '#btnTrainingDock.learningDockBtn',
  '#btnMoleculopediaDock.learningDockBtn',
  '#btnGuide.guideDockBtn',
  '#btnLabMenu.labDockBtn',
  '#btnDuel.duelBtn',
  '#btnHof.trophyBtn',
  'body.mxNative #gameScr #actionCol',
]) must(css.includes(needle),`responsive contract missing: ${needle}`);


for(const needle of [
  'R77.1 — native intro prompt no-wrap hardening',
  'body.mxNative #studioTap',
  'body.mxNative #btnBootPlay',
  'white-space:nowrap!important',
  'word-break:keep-all!important',
]) must(css.includes(needle),`intro prompt responsive contract missing: ${needle}`);

// Geometry contract mirrors the final CSS. It checks representative portrait
// viewport widths spanning older iPhones through current large Android/iPhone.
const widths=[320,340,350,360,375,390,393,412,414,415,428,430,432,440,480];
for(const w of widths){
  const dockSize=w<=414?48:(w<=430?52:58);
  const dockLeft=w<=414?8:(w<=430?10:14);
  const dockRight=dockLeft+dockSize;
  let mainW;
  if(w<=350) mainW=Math.min(.64*w,218);
  else if(w<=414) mainW=Math.min(.68*w,278);
  else if(w<=430) mainW=Math.min(.69*w,278);
  else mainW=Math.min(.69*w,278);
  const mainLeft=(w-mainW)/2;
  must(mainLeft>=dockRight-0.01,`left rail overlaps CTA stack at ${w}px: rail=${dockRight}, main=${mainLeft.toFixed(2)}`);
  must(dockSize>=44,`dock tap target below 44px at ${w}px`);
  must(mainW>=190,`CTA stack too narrow at ${w}px`);
}
console.log(`Responsive phone matrix passed: ${widths.length} representative widths, no left-rail/CTA overlap.`);
