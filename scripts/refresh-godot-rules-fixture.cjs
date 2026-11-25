'use strict';
// Rebuild differential expectations from the actual shipped JavaScript worker.
const fs=require('node:fs'),path=require('node:path');
const {gzipSync}=require('node:zlib');
const root=path.resolve(__dirname,'..');
const source=process.env.MOLECULOX_WEB_SOURCE||'/workspace/Moleculox-web/www';
const worker=require(path.join(source,'js/smart-hint-worker.js'));
const records=JSON.parse(fs.readFileSync(path.join(root,'godot/data/parity.json'),'utf8')).levels;
const levels=JSON.parse(fs.readFileSync(path.join(root,'godot/data/levels.json'),'utf8')).campaign;
const fixtures=records.map((record,level)=>{
 const raw=record.initial,state=worker.__setup(raw),targetKey=raw.targetKey,actions=[],route=[];
 function expected(i,d,chamberIndex=0){const next=worker.__applyAction(state,i,d,targetKey,chamberIndex);return {i,d,chamberIndex,expected:next?worker.__serializable(next):null,expectedKey:next?worker.__stateKey(next):null};}
 for(let i=0;i<state.atoms.length;i++)for(let d=0;d<4;d++)actions.push({...expected(i,d),slide:worker.__slidePlan(state,i,d)});
 for(let i=0;i<state.rotatingChambers.length;i++)actions.push(expected(-1,4,i));
 let next=state;for(const[i,d,chamberIndex=0]of levels[level].fs||[]){next=worker.__applyAction(next,i,d,targetKey,chamberIndex);route.push({i,d,chamberIndex,expected:next?worker.__serializable(next):null});if(!next)throw Error('Broken certified source route '+(level+1));}
 if(worker.__normGoal(next.atoms)!==targetKey||(next.crystals||[]).some(c=>!c.collected))throw Error('Source route did not finish '+(level+1));
 return {level,state:raw,targetKey,initialKey:worker.__stateKey(state),actions,route};
});
const dest=path.join(root,'godot/tests/fixtures/rules-oracle.json.gz');
fs.writeFileSync(dest,gzipSync(JSON.stringify(fixtures)+'\n',{level:9}));
console.log(JSON.stringify({levels:fixtures.length,firstActions:fixtures.reduce((n,x)=>n+x.actions.length,0),routeActions:fixtures.reduce((n,x)=>n+x.route.length,0),sourceGoalsVerified:fixtures.length}));
