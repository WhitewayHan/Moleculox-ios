/* Moleculox R180: shared, pure group movement for gameplay and the hint worker. */
(function(root){
'use strict';
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]],key=(x,y)=>x+','+y;
function rigid(s,members,i,d,singleStep){
  if(!members||members.length<2||members.some(k=>!s.atoms[k]||s.atoms[k].frozen))return null;
  const [dx,dy]=DIRS[d]||[],set=new Set(members),cur=new Map(members.map(k=>[k,{x:s.atoms[k].x,y:s.atoms[k].y}]));
  if(dx===undefined)return null;
  let moved=false,barrierHit=null;
  for(let step=0;step<(singleStep?1:32);step++){
    const next=new Map();let stop=false;
    for(const k of members){
      const p=cur.get(k),nx=p.x+dx,ny=p.y+dy;
      if(s.barriers.has(key(nx,ny))){barrierHit=key(nx,ny);stop=true;}
      if(s.grid[ny]?.[nx]!==false||s.atoms.some((a,j)=>!set.has(j)&&a.x===nx&&a.y===ny)||!s.oneWay(p.x,p.y,nx,ny,d))stop=true;
      next.set(k,{x:nx,y:ny});
    }
    if(stop)break;
    for(const [k,p] of next)cur.set(k,p);
    moved=true;
  }
  if(!moved&&!barrierHit)return null;
  return {fusion:true,members:members.slice(),main:moved?cur.get(i):null,aux:members.filter(k=>k!==i).map(k=>({i:k,pos:cur.get(k)})),barrierHit};
}
function linked(s,i,j,d){
  if(j===undefined||!s.atoms[i]||!s.atoms[j]||s.atoms[i].frozen||s.atoms[j].frozen)return null;
  const [dx,dy]=DIRS[d]||[];if(dx===undefined)return null;
  const startI={x:s.atoms[i].x,y:s.atoms[i].y},startJ={x:s.atoms[j].x,y:s.atoms[j].y};
  let pi={...startI},pj={...startJ},ai=true,aj=true,barrierHit=null;
  const blocked=(p,n)=>s.grid[n.y]?.[n.x]!==false||s.atoms.some((a,k)=>k!==i&&k!==j&&a.x===n.x&&a.y===n.y)||!s.oneWay(p.x,p.y,n.x,n.y,d);
  for(let step=0;step<32&&(ai||aj);step++){
    const ni={x:pi.x+dx,y:pi.y+dy},nj={x:pj.x+dx,y:pj.y+dy};
    // A linked command stops both members at the first barrier contact.
    if((ai&&s.barriers.has(key(ni.x,ni.y)))||(aj&&s.barriers.has(key(nj.x,nj.y)))){
      barrierHit=ai&&s.barriers.has(key(ni.x,ni.y))?key(ni.x,ni.y):key(nj.x,nj.y);break;
    }
    let ci=ai&&!blocked(pi,ni),cj=aj&&!blocked(pj,nj);
    if(ci&&cj&&ni.x===nj.x&&ni.y===nj.y)ci=cj=false;
    if(ci&&ni.x===pj.x&&ni.y===pj.y&&!cj)ci=false;
    if(cj&&nj.x===pi.x&&nj.y===pi.y&&!ci)cj=false;
    if(ci)pi=ni;else ai=false;if(cj)pj=nj;else aj=false;
  }
  const moved=pi.x!==startI.x||pi.y!==startI.y||pj.x!==startJ.x||pj.y!==startJ.y;
  return moved||barrierHit?{j,main:moved?pi:null,mate:pj,barrierHit}:null;
}
function sticky(s,i,j,d){
  if(j===undefined)return null;
  const p=rigid(s,[i,j],i,d,false);if(!p)return null;
  return {j,main:p.main,mate:p.aux[0].pos,sticky:true,barrierHit:p.barrierHit};
}
const api={version:180,rigid,linked,sticky};root.MXMovementCore=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
