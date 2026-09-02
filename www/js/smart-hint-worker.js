/* Moleculox Smart Hint Solver R114 — Grand Synthesis + Bio Assembly + Enzyme Mastery + campaign-only, state-aware Web Worker.
   Finds a safe route from the player's CURRENT board state without mutating gameplay.
   No Firebase / online access. */
(function(root){
'use strict';
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const kxy=(x,y)=>x+','+y;
const clone=o=>JSON.parse(JSON.stringify(o));
function normGoal(atoms){
  if(!atoms||!atoms.length)return '';
  const minX=Math.min(...atoms.map(a=>a.x)),minY=Math.min(...atoms.map(a=>a.y));
  return atoms.map(a=>String(a.e)+','+(a.x-minX)+','+(a.y-minY)).sort().join('|');
}
function atomKey(a){return [a.x,a.y,a.e,a.frozen?1:0,a.fire?1:0,a.sticky?1:0,a.zombie?1:0,a.lightning?1:0,a.zombieGen||0,a.fragile?1:0,a.fragileHits||0,a.fragileMax||3].join(',');}
function stateKey(s){
  const pairs=(s.stickyPairs||[]).map(p=>p.slice().sort((a,b)=>a-b).join('-')).sort().join(';');
  const groups=(s.fusionGroups||[]).map(g=>g.part+':'+g.members.slice().sort((a,b)=>a-b).join(',')).sort().join(';');
  const mw=(s.movingWalls||[]).map(w=>(w.index||0)+':'+w.x+','+w.y).join(';');
  const bars=(s.barriers||[]).map(b=>b.x+','+b.y).sort().join(';');
  const cry=(s.crystals||[]).map(c=>c.collected?1:0).join('');
  return s.atoms.map(atomKey).join('|')+'#S'+pairs+'#F'+groups+'#M'+mw+'#B'+bars+'#C'+cry+'#E'+(s.enzymeGate&&s.enzymeGate.open?1:0);
}
function targetAdjacency(targetKey){
  const cells=(targetKey||'').split('|').filter(Boolean).map(x=>{const p=x.split(',');return{e:p[0],x:+p[1],y:+p[2]};});
  let n=0;for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++)if(Math.abs(cells[i].x-cells[j].x)+Math.abs(cells[i].y-cells[j].y)===1)n++;return n;
}
function adjacencyCount(atoms){let n=0;for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++)if(Math.abs(atoms[i].x-atoms[j].x)+Math.abs(atoms[i].y-atoms[j].y)===1)n++;return n;}
function heuristic(s,targetKey,targetAdj){
  if(normGoal(s.atoms)===targetKey){const miss=(s.crystals||[]).reduce((n,c)=>n+(c.collected?0:1),0);return miss;}
  const adj=adjacencyCount(s.atoms),missCrystal=(s.crystals||[]).reduce((n,c)=>n+(c.collected?0:1),0);
  return Math.max(1,Math.abs(targetAdj-adj))+missCrystal;
}
function setup(raw){
  const s=clone(raw);
  s.grid=s.grid.map(r=>r.slice());
  s.portals=new Map((s.portals||[]).map(p=>[kxy(p.x,p.y),p]));
  s.rifts=new Map((s.rifts||[]).map(p=>[kxy(p.x,p.y),p]));
  s.oneWays=new Map((s.oneWays||[]).map(o=>[kxy(o.x,o.y),o]));
  s.rotationPads=new Map((s.rotationPads||[]).map(p=>[kxy(p.x,p.y),p]));
  s.linkedMate=new Map();for(const p of (s.linkedPairs||[])){s.linkedMate.set(+p[0],+p[1]);s.linkedMate.set(+p[1],+p[0]);}
  s.stickyMate=new Map();for(const p of (s.stickyPairs||[])){s.stickyMate.set(+p[0],+p[1]);s.stickyMate.set(+p[1],+p[0]);}
  s.fusionGroupByAtom=new Map();(s.fusionGroups||[]).forEach((g,gi)=>g.members.forEach(i=>s.fusionGroupByAtom.set(+i,gi)));
  s.barrierSet=new Set((s.barriers||[]).map(b=>kxy(b.x,b.y)));
  if(s.enzymeGate){s.enzymeGate={x:+s.enzymeGate.x,y:+s.enzymeGate.y,open:!!s.enzymeGate.open};if(s.grid[s.enzymeGate.y])s.grid[s.enzymeGate.y][s.enzymeGate.x]=!s.enzymeGate.open;}
  // A Fusion sub-structure may already be complete at level start. Gameplay and
  // Level Guard lock such a structure before the first player move; Smart Hint
  // must begin from the same rigid-group state or its replay can diverge.
  updateFusion(s);
  return s;
}
function serializable(s){
  return {grid:s.grid.map(r=>r.slice()),atoms:s.atoms.map(a=>({...a})),portals:[...s.portals.values()].map(p=>({...p})),rifts:[...s.rifts.values()].map(p=>({...p})),oneWays:[...s.oneWays.values()].map(o=>({...o})),rotationPads:[...s.rotationPads.values()].map(p=>({...p})),movingWalls:(s.movingWalls||[]).map(w=>({...w,path:(w.path||[]).map(c=>({...c}))})),pressureSystems:(s.pressureSystems||[]).map(p=>({plate:{...p.plate},door:{...p.door}})),linkedPairs:(s.linkedPairs||[]).map(p=>p.slice()),stickyPairs:(s.stickyPairs||[]).map(p=>p.slice()),fusionGroups:(s.fusionGroups||[]).map(g=>({part:g.part,members:g.members.slice()})),fusionDefs:(s.fusionDefs||[]).map(d=>({part:d.part,cells:d.cells.map(c=>c.slice())})),barriers:[...s.barrierSet].map(k=>{const [x,y]=k.split(',').map(Number);return{x,y};}),crystals:(s.crystals||[]).map(c=>({...c})),enzymeGate:s.enzymeGate?{x:+s.enzymeGate.x,y:+s.enzymeGate.y,open:!!s.enzymeGate.open}:null,targetKey:s.targetKey};
}
function groupFor(s,i){const gi=s.fusionGroupByAtom.get(i);return gi===undefined?null:s.fusionGroups[gi];}
function oneWayAllows(s,fx,fy,tx,ty,d){const a=s.oneWays.get(kxy(fx,fy)),b=s.oneWays.get(kxy(tx,ty));return !(a&&+a.d!==d)&&!(b&&+b.d!==d);}
function blocked(s,excluded,who,nx,ny,d){return s.grid[ny]?.[nx]!==false||s.barrierSet.has(kxy(nx,ny))||s.atoms.some((a,k)=>!excluded.has(k)&&a.x===nx&&a.y===ny)||!oneWayAllows(s,who.x,who.y,nx,ny,d);}
function fusionMovePlan(s,i,d){
  const g=groupFor(s,i);if(!g)return null;const members=g.members.slice(),set=new Set(members);if(members.some(k=>s.atoms[k]?.frozen))return null;
  const [dx,dy]=DIRS[d],cur=new Map(members.map(k=>[k,{x:s.atoms[k].x,y:s.atoms[k].y}]));let moved=false,barrierHit=null;
  for(let guard=0;guard<32;guard++){
    const nxt=new Map();let stop=false;
    for(const k of members){const p=cur.get(k),nx=p.x+dx,ny=p.y+dy;if(s.barrierSet.has(kxy(nx,ny))){barrierHit=kxy(nx,ny);stop=true;break;}if(s.grid[ny]?.[nx]!==false||s.atoms.some((a,j)=>!set.has(j)&&a.x===nx&&a.y===ny)||!oneWayAllows(s,p.x,p.y,nx,ny,d)){stop=true;break;}nxt.set(k,{x:nx,y:ny});}
    if(stop||new Set([...nxt.values()].map(q=>kxy(q.x,q.y))).size!==members.length)break;for(const [k,p] of nxt)cur.set(k,p);moved=true;
  }
  return moved?{fusion:true,members,main:cur.get(i),aux:members.filter(k=>k!==i).map(k=>({i:k,pos:cur.get(k)})),barrierHit}:null;
}
function stickyPlan(s,i,d){
  const j=s.stickyMate.get(i);if(j===undefined||s.atoms[i]?.frozen||s.atoms[j]?.frozen)return null;
  const [dx,dy]=DIRS[d],ex=new Set([i,j]);let pi={x:s.atoms[i].x,y:s.atoms[i].y},pj={x:s.atoms[j].x,y:s.atoms[j].y},m=false,barrierHit=null;
  for(let z=0;z<32;z++){
    const ni={x:pi.x+dx,y:pi.y+dy},nj={x:pj.x+dx,y:pj.y+dy};
    if(s.barrierSet.has(kxy(ni.x,ni.y))||s.barrierSet.has(kxy(nj.x,nj.y))){barrierHit=s.barrierSet.has(kxy(ni.x,ni.y))?kxy(ni.x,ni.y):kxy(nj.x,nj.y);break;}
    if(blocked(s,ex,pi,ni.x,ni.y,d)||blocked(s,ex,pj,nj.x,nj.y,d)||(ni.x===nj.x&&ni.y===nj.y))break;pi=ni;pj=nj;m=true;
  }
  return m?{j,main:pi,mate:pj,sticky:true,barrierHit}:null;
}
function linkedPlan(s,i,d){
  const j=s.linkedMate.get(i);if(j===undefined)return null;const [dx,dy]=DIRS[d],ex=new Set([i,j]),base=[{x:s.atoms[i].x,y:s.atoms[i].y},{x:s.atoms[j].x,y:s.atoms[j].y}];let pi={...base[0]},pj={...base[1]},ai=true,aj=true,barrierHit=null;
  for(let z=0;z<32&&(ai||aj);z++){
    const ni={x:pi.x+dx,y:pi.y+dy},nj={x:pj.x+dx,y:pj.y+dy};
    if((ai&&s.barrierSet.has(kxy(ni.x,ni.y)))||(aj&&s.barrierSet.has(kxy(nj.x,nj.y)))){barrierHit=ai&&s.barrierSet.has(kxy(ni.x,ni.y))?kxy(ni.x,ni.y):kxy(nj.x,nj.y);break;}
    let ci=ai&&!blocked(s,ex,pi,ni.x,ni.y,d),cj=aj&&!blocked(s,ex,pj,nj.x,nj.y,d);
    if(ci&&cj&&ni.x===nj.x&&ni.y===nj.y)ci=cj=false;if(ci&&ni.x===pj.x&&ni.y===pj.y&&!cj)ci=false;if(cj&&nj.x===pi.x&&nj.y===pi.y&&!ci)cj=false;
    if(ci)pi=ni;else ai=false;if(cj)pj=nj;else aj=false;
  }
  return (pi.x!==base[0].x||pi.y!==base[0].y||pj.x!==base[1].x||pj.y!==base[1].y)?{j,main:pi,mate:pj,barrierHit}:null;
}
function slidePlan(s,i,d){
  const [dx,dy]=DIRS[d],sx=s.atoms[i].x,sy=s.atoms[i].y;let x=sx,y=sy,barrierHit=null,riftUsed=false;const path=[];
  while(true){const nx=x+dx,ny=y+dy;if(s.barrierSet.has(kxy(nx,ny))){barrierHit=kxy(nx,ny);break;}if(s.grid[ny]?.[nx]!==false||s.atoms.some((a,k)=>k!==i&&a.x===nx&&a.y===ny)||!oneWayAllows(s,x,y,nx,ny,d))break;
    if(!riftUsed&&s.rifts.has(kxy(nx,ny))){const p=s.rifts.get(kxy(nx,ny));if(s.grid[p.toY]?.[p.toX]!==false||s.barrierSet.has(kxy(p.toX,p.toY))||s.atoms.some((a,k)=>k!==i&&a.x===p.toX&&a.y===p.toY))break;path.push({x:nx,y:ny});x=p.toX;y=p.toY;path.push({x,y});riftUsed=true;continue;}x=nx;y=ny;path.push({x,y});}
  return {dest:(x===sx&&y===sy)?null:{x,y},barrierHit,path};
}
function linePath(x0,y0,x1,y1){if(x0!==x1&&y0!==y1)return[];const out=[],dx=Math.sign(x1-x0),dy=Math.sign(y1-y0),limit=Math.abs(x1-x0)+Math.abs(y1-y0);let x=x0,y=y0;for(let guard=0;guard<limit;guard++){x+=dx;y+=dy;out.push({x,y});}return out;}
function collectCrystals(s,cells){if(!s.crystals?.length||!Array.isArray(cells))return;for(const p of cells)for(const c of s.crystals)if(!c.collected&&c.x===p.x&&c.y===p.y)c.collected=true;}
function updateEnzymeGate(s){if(!s.enzymeGate)return;const open=!(s.crystals||[]).length||(s.crystals||[]).every(c=>c.collected);s.enzymeGate.open=open;if(s.grid[s.enzymeGate.y])s.grid[s.enzymeGate.y][s.enzymeGate.x]=!open;}
function applyRotation(s,i){
  const g=groupFor(s,i);if(!g||g.members.length<2)return;const pivotIdx=g.members.find(k=>s.rotationPads.has(kxy(s.atoms[k].x,s.atoms[k].y)));if(pivotIdx===undefined)return;
  const pad=s.rotationPads.get(kxy(s.atoms[pivotIdx].x,s.atoms[pivotIdx].y)),p=s.atoms[pivotIdx],set=new Set(g.members),n=[];
  for(const k of g.members){const a=s.atoms[k],dx=a.x-p.x,dy=a.y-p.y,nx=(+pad.d>=0)?p.x-dy:p.x+dy,ny=(+pad.d>=0)?p.y+dx:p.y-dx;if(s.grid[ny]?.[nx]!==false||s.barrierSet.has(kxy(nx,ny))||s.atoms.some((b,j)=>!set.has(j)&&b.x===nx&&b.y===ny))return;n.push({k,x:nx,y:ny});}
  if(new Set(n.map(q=>kxy(q.x,q.y))).size!==n.length)return;for(const q of n){s.atoms[q.k].x=q.x;s.atoms[q.k].y=q.y;}
}
function updateFusion(s){
  if(!s.fusionDefs?.length)return;const claimed=new Set(s.fusionGroups.map(g=>g.part)),used=new Set([...s.fusionGroupByAtom.keys()]);
  for(const def of s.fusionDefs){if(claimed.has(def.part))continue;const first=def.cells[0];let found=null;
    for(let anchor=0;anchor<s.atoms.length&&!found;anchor++){if(used.has(anchor)||s.atoms[anchor].e!==first[0])continue;const ox=s.atoms[anchor].x-first[1],oy=s.atoms[anchor].y-first[2],members=[],taken=new Set();let ok=true;
      for(const cell of def.cells){const tx=ox+cell[1],ty=oy+cell[2],idx=s.atoms.findIndex((a,i)=>!used.has(i)&&!taken.has(i)&&a.e===cell[0]&&a.x===tx&&a.y===ty);if(idx<0){ok=false;break;}members.push(idx);taken.add(idx);}if(ok)found=members;
    }
    if(found){const gi=s.fusionGroups.length;s.fusionGroups.push({part:def.part,members:found.slice()});found.forEach(i=>{used.add(i);s.fusionGroupByAtom.set(i,gi);});claimed.add(def.part);}
  }
}
function lightning(s,i){const src=s.atoms[i];if(!src?.lightning)return;const seen=new Set([i]),q=[i];while(q.length){const x=q.shift(),a=s.atoms[x];for(let j=0;j<s.atoms.length;j++){if(seen.has(j))continue;const b=s.atoms[j];if(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1){seen.add(j);q.push(j);}}}for(const j of seen){const a=s.atoms[j];if(j!==i&&a.frozen){a.frozen=false;if(a.zombie){a.zombie=false;a.zombieGen=0;}}}}
function melt(s){for(const f of s.atoms)if(f.fire)for(const a of s.atoms)if(a.frozen&&Math.abs(f.x-a.x)+Math.abs(f.y-a.y)===1){a.frozen=false;if(a.zombie){a.zombie=false;a.zombieGen=0;}}}
function stick(s,i){const a=s.atoms[i];if(!a||a.frozen||s.stickyMate.has(i)||s.linkedMate.has(i)||groupFor(s,i)||a.sticky)return;const j=s.atoms.findIndex((b,k)=>k!==i&&b.sticky&&!b.frozen&&!s.stickyMate.has(k)&&!s.linkedMate.has(k)&&!groupFor(s,k)&&Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1);if(j<0)return;s.stickyPairs.push([i,j]);s.stickyMate.set(i,j);s.stickyMate.set(j,i);}
function zombie(s,i){const a=s.atoms[i];if(!a||a.frozen||a.zombie)return;for(const z of s.atoms){if(!z.zombie||z===a||(z.zombieGen||0)>=2)continue;if(Math.abs(a.x-z.x)+Math.abs(a.y-z.y)===1){a.frozen=true;a.zombie=true;a.zombieGen=(z.zombieGen||0)+1;return;}}}
function pressure(s){for(const p of s.pressureSystems||[]){const open=s.atoms.some(a=>a.x===p.plate.x&&a.y===p.plate.y)||s.atoms.some(a=>a.x===p.door.x&&a.y===p.door.y);if(s.grid[p.door.y])s.grid[p.door.y][p.door.x]=!open;}}
function moveWalls(s){const plans=[];for(const w of s.movingWalls||[]){const ni=((w.index||0)+1)%w.path.length,to=w.path[ni];if(!to||s.atoms.some(a=>a.x===to.x&&a.y===to.y))continue;if(s.grid[to.y]?.[to.x]&&!(to.x===w.x&&to.y===w.y))continue;plans.push({w,ni,to,from:{x:w.x,y:w.y}});}for(const p of plans){s.grid[p.from.y][p.from.x]=false;s.grid[p.to.y][p.to.x]=true;}for(const p of plans){p.w.x=p.to.x;p.w.y=p.to.y;p.w.index=p.ni;}}
function goal(s,targetKey){return normGoal(s.atoms)===targetKey&&(!(s.crystals||[]).length||(s.crystals||[]).every(c=>c.collected));}
function applyAction(raw,i,d,targetKey){
  const s=setup(serializable(raw));if(!s.atoms[i]||s.atoms[i].frozen)return null;
  const from={x:s.atoms[i].x,y:s.atoms[i].y};const pair=fusionMovePlan(s,i,d)||stickyPlan(s,i,d)||linkedPlan(s,i,d);const normal=pair?null:slidePlan(s,i,d);const dest=pair?pair.main:normal.dest;const barrierHit=(pair&&pair.barrierHit)||(normal&&normal.barrierHit);
  if(!dest){if(barrierHit){s.barrierSet.delete(barrierHit);return s;}return null;}
  s.atoms[i].x=dest.x;s.atoms[i].y=dest.y;if(pair?.fusion){for(const m of pair.aux){s.atoms[m.i].x=m.pos.x;s.atoms[m.i].y=m.pos.y;}}else if(pair&&pair.j!==undefined){s.atoms[pair.j].x=pair.mate.x;s.atoms[pair.j].y=pair.mate.y;}
  collectCrystals(s,normal&&normal.path&&normal.path.length?normal.path:linePath(from.x,from.y,dest.x,dest.y));updateEnzymeGate(s);if(barrierHit)s.barrierSet.delete(barrierHit);
  if(!groupFor(s,i)){const p=s.portals.get(kxy(s.atoms[i].x,s.atoms[i].y));if(p&&s.grid[p.toY]?.[p.toX]===false&&!s.atoms.some((a,k)=>k!==i&&a.x===p.toX&&a.y===p.toY)){s.atoms[i].x=p.toX;s.atoms[i].y=p.toY;}}
  applyRotation(s,i);lightning(s,i);melt(s);updateFusion(s);if(goal(s,targetKey))return s;
  const a=s.atoms[i];if(a.fragile){a.fragileHits=(a.fragileHits||0)+1;if(a.fragileHits>=(a.fragileMax||3))return null;}
  stick(s,i);zombie(s,i);pressure(s);moveWalls(s);return s;
}
class Heap{constructor(){this.a=[];}push(x){const a=this.a;a.push(x);let i=a.length-1;while(i){const p=(i-1)>>1;if(a[p].f<=x.f)break;a[i]=a[p];i=p;}a[i]=x;}pop(){const a=this.a;if(!a.length)return null;const r=a[0],x=a.pop();if(a.length){let i=0;while(true){let l=i*2+1;if(l>=a.length)break;let rr=l+1,c=rr<a.length&&a[rr].f<a[l].f?rr:l;if(a[c].f>=x.f)break;a[i]=a[c];i=c;}a[i]=x;}return r;}get length(){return this.a.length;}}
function solveSmartHint(input){
  const t0=Date.now(),maxNodes=Math.max(2000,Math.min(120000,+input.maxNodes||50000)),maxDepth=Math.max(2,Math.min(30,+input.maxDepth||18)),targetKey=input.targetKey;
  let start=setup(input.state);start.targetKey=targetKey;if(goal(start,targetKey))return{ok:true,path:[],nodes:0,ms:Date.now()-t0};
  // R114 Grand Synthesis fast path: a certified route is only a preference,
  // never a verdict. Replay it through the same full physics first. If the
  // player's CURRENT state is still compatible and it really reaches the
  // target, return that verified route immediately. If the player is off-route
  // or any move is illegal, fall through to the real state-space search below.
  if(Array.isArray(input.prefer)&&input.prefer.length){
    let ps=start,verified=[];
    for(const mv of input.prefer){
      const pi=+mv?.[0],pd=+mv?.[1];
      if(!Number.isInteger(pi)||!Number.isInteger(pd))break;
      const ns=applyAction(ps,pi,pd,targetKey);if(!ns)break;
      verified.push([pi,pd]);ps=ns;
      if(goal(ps,targetKey))return{ok:true,path:verified,nodes:verified.length,ms:Date.now()-t0,verifiedCertified:true};
    }
  }
  const targetAdj=targetAdjacency(targetKey),open=new Heap(),seen=new Map(),sk=stateKey(start);open.push({s:start,g:0,f:heuristic(start,targetKey,targetAdj),path:[]});seen.set(sk,0);let nodes=0,best=null;
  let depthCut=false;
  while(open.length&&nodes<maxNodes){const cur=open.pop();nodes++;if(cur.g>=maxDepth){depthCut=true;continue;}
    const order=[];
    // R114: rigid groups can be selected through any member in gameplay, but
    // every member produces the same group translation. Enumerating all of
    // them multiplied the search tree for 3–4-module Grand Synthesis boards.
    // Search one safe representative per rigid group; off-route solving still
    // starts from the player's exact current state and uses full physics.
    const rigidSeen=new Set();
    for(let i=0;i<cur.s.atoms.length;i++){
      if(cur.s.atoms[i].frozen)continue;
      const gi=cur.s.fusionGroupByAtom.get(i);
      if(gi!==undefined){
        if(rigidSeen.has(gi))continue;
        rigidSeen.add(gi);
        const members=cur.s.fusionGroups[gi]?.members||[i];
        const rep=members.find(k=>cur.s.atoms[k]&&!cur.s.atoms[k].frozen&&!cur.s.atoms[k].fragile) ?? members.find(k=>cur.s.atoms[k]&&!cur.s.atoms[k].frozen) ?? i;
        for(let d=0;d<4;d++)order.push([rep,d]);
      }else for(let d=0;d<4;d++)order.push([i,d]);
    }
    if(Array.isArray(input.prefer)&&input.prefer.length){
      // R114: when a certified route is supplied as a search preference,
      // prefer the action at the CURRENT search depth, not only move zero.
      // This remains a real search: every preferred action is replayed through
      // full physics and any divergence simply falls back to the open set.
      const [pi,pd]=input.prefer[Math.min(cur.g,input.prefer.length-1)]||[];
      order.sort((a,b)=>((a[0]===pi&&a[1]===pd)?-1:0)-((b[0]===pi&&b[1]===pd)?-1:0));
    }
    for(const [i,d] of order){const ns=applyAction(cur.s,i,d,targetKey);if(!ns)continue;const path=cur.path.concat([[i,d]]);if(goal(ns,targetKey))return{ok:true,path,nodes,ms:Date.now()-t0};const key=stateKey(ns),g=cur.g+1;if((seen.get(key)??Infinity)<=g)continue;seen.set(key,g);const h=heuristic(ns,targetKey,targetAdj);if(!best||h<best.h)best={h,path};open.push({s:ns,g,f:g+h*1.35,path});}
  }
  const budgetHit=nodes>=maxNodes;
  const provenDeadEnd=!budgetHit&&!depthCut&&open.length===0;
  return{ok:false,path:[],nodes,ms:Date.now()-t0,bestDepth:best?best.path.length:null,reason:provenDeadEnd?'dead-end':(budgetHit?'node-budget':(depthCut?'depth-budget':'no-solution')),provenDeadEnd};
}
root.solveSmartHint=solveSmartHint;
if(typeof self!=='undefined'&&typeof self.postMessage==='function'&&typeof document==='undefined')self.onmessage=e=>{try{const r=solveSmartHint(e.data||{});self.postMessage({id:e.data&&e.data.id,...r});}catch(err){self.postMessage({id:e.data&&e.data.id,ok:false,error:String(err&&err.stack||err)});}};
if(typeof module!=='undefined'&&module.exports)module.exports={solveSmartHint,__applyAction:applyAction,__setup:setup,__serializable:serializable,__stateKey:stateKey};
})(typeof globalThis!=='undefined'?globalThis:this);
