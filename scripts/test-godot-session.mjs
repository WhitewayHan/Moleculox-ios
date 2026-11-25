// Generate immutable expectations with the original JavaScript functions, then
// execute the native attempt/mode contracts against them.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const source=fs.readFileSync('/workspace/Moleculox-web/www/js/game-r160.js','utf8');
const levels=JSON.parse(fs.readFileSync(path.join(root,'godot/data/levels.json'),'utf8'));
function fn(name){const start=source.indexOf('function '+name+'(');if(start<0)throw Error(name);let end=source.indexOf('\nfunction ',start+1);if(end<0)end=source.length;const section=source.slice(start,end);let last=section.lastIndexOf('\n}'); if(last>=0)return section.slice(0,last+2); return section.split('\n')[0];}
const context=vm.createContext({LEVELS:levels.campaign,DAILY_LEVEL_POOL:levels.daily,DAILY_EPOCH_SERIAL:20654,DAILY_ADVANCED_START_INDEX:501,DAILY_ADVANCED_END_INDEX:800,DAILY_ADVANCED_CADENCE:3,DAILY_CAMPAIGN_LEVEL_COUNT:300,CAMPAIGN_TARGET_LEVELS:801,Date,console});
vm.runInContext('function utcDayId(d){return d.toISOString().slice(0,10)}',context);
for(const name of ['fullCampaignReady','cloneDailyLevel','dailyAdvancedMechanicLevelEligible','certifiedAdvancedDailyChallenge','certifiedDailyChallenge','starsForMoves','buildChainPlan','duelRoundWinner','reactorGateActive'])vm.runInContext(fn(name),context);
const stars=[];for(let par=1;par<=20;par++)for(let moves=0;moves<55;moves++)stars.push({par,moves,value:context.starsForMoves(moves,par)});
const chains=[];for(let n=0;n<40;n++){context.LEVELS=[{fs:Array(n).fill([0,1])}];chains.push({count:n,plan:context.buildChainPlan(0)});}context.LEVELS=levels.campaign;
const daily=[];for(let offset=-65;offset<=120;offset++){const date=new Date((20654+offset)*86400000+43210000); const result=context.certifiedDailyChallenge(date);daily.push({unixTime:date.getTime()/1000,themeIndex:result.themeIndex,poolIndex:result.poolIndex,variant:result.variant,sourceLevel:result.sourceLevel??null,molecule:result.level.m,firstAtom:result.level.a[0],routeLength:result.level.fs.length,dayId:result.dayId});}
let seed=0x134ac;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const winners=[];for(let i=0;i<400;i++){const result=()=>({time:Math.floor(random()*9000)/100,moves:Math.floor(random()*40),completed:random()>.35,maxCombo:1+Math.floor(random()*3),reactions:Math.floor(random()*5),hits:Math.floor(random()*9)});const a=result(),b=result(),kind=['classic','chain','reactor','crystal'][i%4];winners.push({a,b,kind,winner:context.duelRoundWinner(a,b,kind)});}
context.levelStartT=0;const gates=[];for(let i=0;i<80;i++){const gate={period:1800,safeMs:820,phase:(i*137)%390};const elapsed=i*.073;gates.push({gate,elapsed,active:context.reactorGateActive(gate,elapsed*1000)});}
fs.mkdirSync(path.join(root,'godot/tests/fixtures'),{recursive:true});fs.writeFileSync(path.join(root,'godot/tests/fixtures/session-oracle.json'),JSON.stringify({source:'game-r160.js / 8.7.239-web-smooth1',stars,chains,daily,winners,gates})+'\n');
const result=spawnSync('/usr/local/bin/godot',['--headless','--path',path.join(root,'godot'),'--script','res://tests/session_contract_test.gd'],{stdio:'inherit',env:{...process.env,XDG_DATA_HOME:'/workspace/.godot-runtime',XDG_CONFIG_HOME:'/workspace/.godot-runtime/config'}});process.exit(result.status??1);
