/* Build-time extraction only. The native Godot game never embeds the HTML game. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const {gzipSync}=require('node:zlib');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const source=path.resolve(process.env.MOLECULOX_WEB_SOURCE||'/workspace/Moleculox-web/www');
const dest=path.join(root,'godot/data');
const expose=String.raw`
window.__godotExport={
 async prepare(){await ensureFullCampaignReady();Object.assign(save,defaultSave(),{tutorialDone:true,tutorialTips:false,cur:0});
  clearTimeout(mainLoopTimer);cancelAnimationFrame(mainLoopRaf);mainLoopTimer=mainLoopRaf=0;
  window.setTimeout=()=>0;window.setInterval=()=>0;window.requestAnimationFrame=()=>0;
  LANG='en';MOLS=MOLS_EN;
  return LEVELS.length;
 },
 data(){
  const languages={en:MOLS_EN,tr:MOLS_TR,de:MOLS_DE,es:MOLS_ES,pt:MOLS_PT,ja:MOLS_JA,fr:MOLS_FR,zh:MOLS_ZH,it:MOLS_IT,ko:MOLS_KO,ru:MOLS_RU};
  const info={en:ELINFO_EN,tr:ELINFO_TR,de:ELINFO_DE,es:ELINFO_ES,pt:ELINFO_PT,ja:ELINFO_JA,fr:ELINFO_FR,zh:ELINFO_ZH,it:ELINFO_IT,ko:ELINFO_KO,ru:ELINFO_RU};
  const locales={};for(const code of SUPPORTED_LANGS){locales[code]={};for(const[k,v]of Object.entries(I18N[code]||{})){try{locales[code][k]=k==='trackLabel'?'{0}':typeof v==='function'?v(...Array.from({length:10},(_,i)=>'{'+i+'}')):v;}catch(_){locales[code][k]=String(v);}}}
  const stories={},epilogues={},voiceEvents={},voiceCueGain={},guides={mechanics:{},supports:{},labs:{},basic:{},duel:{}},legends=SCIENCE_LEGENDS.map(x=>({...x}));
  const resolveFunctions=(value)=>JSON.parse(JSON.stringify(value,(_,v)=>typeof v==='function'?v():v));
  for(const code of SUPPORTED_LANGS){LANG=code;MOLS=languages[code];stories[code]=LEVELS.map((l,i)=>storyPagesFor(l,i));
   voiceEvents[code]={};voiceCueGain[code]={};for(const event of new Set([...Object.keys(VOICE_BANK.drE),...Object.keys(VOICE_PARITY_BANK_EN),...Object.keys(VOICE_PARITY_BANK_LOCALIZED)])){const bank=semanticVoiceBank('drE',event)||[];voiceEvents[code][event]=bank.filter(name=>VOICE_PACKS[code]?.sprite?.[name]);}
   for(const name of Object.keys(VOICE_PACKS[code]?.sprite||{}))voiceCueGain[code][name]=voiceCueGainFor(name);
   for(let i=0;i<legends.length;i++)for(const[k,v]of Object.entries(SCIENCE_LEGENDS[i]))if(typeof v==='function'){if(!legends[i][k]||typeof legends[i][k]==='function')legends[i][k]={};legends[i][k][code]=v();}
   guides.mechanics[code]=trainingMechanicCatalog().map(([id,flag,title])=>({id,flag,title,desc:t(MECHANIC_INFO[id]?.descKey||''),demo:resolveFunctions(mechanicTutorialDemo(id)),unlock:0}));
   guides.supports[code]=Object.keys(SUPPORT_INFO).map(id=>({id,...supportInfoText(id),art:mxSupportDrESrc(id),unlock:0}));
   guides.labs[code]=LAB_ITEMS.map(item=>({...resolveFunctions(item),title:lx(item.name),desc:lx(item.desc)}));
   guides.basic[code]=guideContent();guides.duel[code]=onlineDuelGuideRulesHtml();
   showExpansionFinalEpilogue(()=>{});epilogues[code]={nobel:storyPagesFor(LEVELS[NOBEL_LEVEL_INDEX],NOBEL_LEVEL_INDEX),final801:storyPageList.map(page=>({...page}))};
   for(const id of Object.keys(languages[code])){const info=richMoleculeInfo(id);if(info)languages[code][id].info={description:info.about,use:info.use,fact:info.fact};}
  }LANG='en';MOLS=MOLS_EN;
  // Locale packs can precede a certified campaign geometry revision. Text is
  // localized; molecule topology must remain the same in every language.
  const corrections=[];
  for(const[code,items]of Object.entries(languages))if(code!=='en')for(const[id,mol]of Object.entries(items)){
   const canonical=languages.en[id];if(!canonical)continue;const changed=[];
   const comparable=v=>JSON.stringify(v instanceof Set?[...v].sort():v);
   for(const key of ['s','key','bs','xb'])if(comparable(mol[key])!==comparable(canonical[key])){changed.push(key);if(canonical[key]===undefined)delete mol[key];else mol[key]=canonical[key] instanceof Set?new Set(canonical[key]):JSON.parse(JSON.stringify(canonical[key]));}
   if(changed.length)corrections.push({language:code,molecule:id,fields:changed});
  }
  const packs=JSON.parse(JSON.stringify(VOICE_PACKS));for(const p of Object.values(packs))p.url=p.url.split('?')[0];
  const previousMol=curMol;const fxRecipes=LEVELS.map((l,i)=>{curMol=MOLS_EN[l.m];return mxLevelFxRecipe(i)});curMol=previousMol;
  return {catalog:{sourceVersion:'8.7.239-web-smooth1',languages:SUPPORTED_LANGS,elements:EL,elementInfo:info,tierBackgrounds:TIER_BG,tierAccents:TIER_ACCENT,tierStone:TIER_STONE,postNobelStone:POST_NOBEL_STONE,diplomas:DIPLOMAS,guides,audio:{tracks:TRACKS,trackNames:TRACK_NAMES,voicePacks:packs,voiceEvents,voiceCueGain,musicTrackTrim:MUSIC_TRACK_TRIM,masterOutputGain:.75,sfx:Object.fromEntries(Object.keys(SFX).map(k=>[k,'assets/audio/sfx/'+k+'.wav']))},fxRecipes,mechanicInfo:MECHANIC_INFO},
   levels:{campaign:LEVELS,daily:DAILY_LEVEL_POOL,tutorials:[TUT_LEVEL_1,TUT_LEVEL_2]},molecules:{byLang:languages},localization:{byLang:locales},story:{byLang:stories},
   science:{legends},epilogues:{byLang:epilogues},economy:{defaultSave:defaultSave(),ACHV,ACHV_RP,LAB_ITEMS,BOOSTER_ITEMS,LAB_MISSIONS},contentCorrections:{reason:'Localized geometry aligned with certified canonical source topology; localized text retained.',items:corrections}};
 },
 snapshot(index,mode='campaign'){
  currentCrystalLayout=null;currentChainPlan=null;currentReactorPlan=null;
  if(mode==='classic'){duelState={round:0,turn:0,players:['P1','P2'],rounds:[{level:index,gameType:'classic'}]};startLevel(index,'duel');}
  else startLevel(index,mode);
  return {initial:smartHintSnapshot(),feature:campaignFeature,targetKey:curMol.key,breakableWalls:[...breakableWalls.values()],palette:currentStonePalette(),chainPlan,reactorPlan:reactorGates,crystalLayout:crystals,background:expansionBackgroundUri(index)||'',mode};
 },
 eligible(){return LEVELS.map((l,i)=>({duel:isDuelBaseLevelSafe(i),classic:isDuelLevelEligibleForType(i,'classic'),crystal:isDuelLevelEligibleForType(i,'crystal'),chain:isDuelLevelEligibleForType(i,'chain'),reactor:isDuelLevelEligibleForType(i,'reactor'),dailyAdvanced:dailyAdvancedMechanicLevelEligible(l,i)}));},
 sprites(){T=55;dpr=2;const out={atoms:{},components:{},enzyme:{}};
  for(const e of Object.keys(EL)){const s=atomBaseSprite(e,22);out.atoms[e]={logicalW:s.logicalW,logicalH:s.logicalH,cx:s.cx,cy:s.cy,r:s.r,png:s.cv.toDataURL('image/png')};}
  for(const type of ['catalyst','energy','stabilizer','substrate','cofactor','atp','atPair','cgPair','backbone']){const s=componentTokenSprite(type);out.components[type]={logical:s.logical,png:s.cv.toDataURL('image/png')};}
  for(const bio of [false,true])for(const open of [false,true])for(let phase=0;phase<12;phase++){const s=enzymeGateSprite(bio,open,phase);out.enzyme[(bio?'bio':'enzyme')+'-'+(open?'open':'closed')+'-'+phase]={logical:s.logical,png:s.cv.toDataURL('image/png')};}return out;
 },
 stones(){T=55;dpr=2;const original=currentStonePalette,out={};
  for(const palette of [...TIER_STONE,...Object.values(POST_NOBEL_STONE)]){const key=palette.join('|');if(out[key])continue;currentStonePalette=()=>palette;const variants=[];
   for(let type=-1;type<8;type++){const cv=document.createElement('canvas');cv.width=110;cv.height=110;const c=cv.getContext('2d');c.scale(2,2);drawStone(0,0,undefined,undefined,c,false);if(type>=0)stoneDoodle(27.5,27.5,55*.43,type,c);variants.push(cv.toDataURL('image/png'));}out[key]=variants;
  }currentStonePalette=original;return out;
 },
 async sound(event,args=[]){
  const ctx=new OfflineAudioContext(1,48000*4,48000);AC=ctx;masterG=ctx.createGain();
  const limiter=ctx.createDynamicsCompressor(),output=ctx.createGain();limiter.threshold.value=-8;limiter.knee.value=0;limiter.ratio.value=20;limiter.attack.value=.003;limiter.release.value=.16;output.gain.value=.75;masterG.connect(limiter);limiter.connect(output);output.connect(ctx.destination);
  sfxG=ctx.createGain();sfxG.connect(masterG);voiceG=ctx.createGain();voiceG.connect(masterG);noiseB=null;externalMusicMode=false;
  for(const k of Object.keys(sfxGateTimes))delete sfxGateTimes[k];ac=()=>AC;
  if(event==='signature')mxLevelSignatureTone(args[0]);else SFX[event](...args);const rendered=await ctx.startRendering();const samples=rendered.getChannelData(0);let end=samples.length;while(end>100&&Math.abs(samples[end-1])<.00002)end--;end=Math.min(samples.length,end+480);
  const bytes=new Uint8Array(end*2);const view=new DataView(bytes.buffer);for(let i=0;i<end;i++)view.setInt16(i*2,Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),true);
  let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary);
 },
 soundNames(){return Object.keys(SFX);}
};
`;
function json(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,(_,v)=>typeof v==='function'?undefined:v)+'\n');}
async function main(){
 const game=fs.readFileSync(path.join(source,'js/game-r160.js'),'utf8');
 if(!game.includes('/* ================= INIT ================= */'))throw Error('Source injection marker missing');
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(source,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(source+path.sep)){res.writeHead(403).end();return;}
  try{let body=fs.readFileSync(file);if(pathname==='/js/game-r160.js')body=game.replace('/* ================= INIT ================= */',expose+'/* ================= INIT ================= */');
   const mime={'.js':'application/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg'}[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'content-type':mime});res.end(body);
  }catch(_){res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:480,height:900},serviceWorkers:'block'});
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  page.on('pageerror',e=>process.stderr.write('PAGE: '+e.message+'\n'));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
  await page.waitForFunction(()=>window.__godotExport);
  const count=await page.evaluate(()=>window.__godotExport.prepare());
  if(count!==801)throw Error('Expected 801 levels, got '+count);
  async function exportSounds(catalog){
   const variants={};
   function wav(relative,pcm){
    const bytes=Buffer.alloc(44+pcm.length);bytes.write('RIFF');bytes.writeUInt32LE(36+pcm.length,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(48000,24);bytes.writeUInt32LE(96000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(pcm.length,40);pcm.copy(bytes,44);
    const file=path.join(root,'godot',relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
   }
   const entries=[];for(let d=1;d<=12;d++)entries.push(['slide',String(d),[d]]);
   for(let i=0;i<4;i++)entries.push(['star',String(i),[i]]);
   for(let i=2;i<=4;i++)entries.push(['chainPulse',String(i),[i]]);
   for(const stars of [1,3])entries.push(['rewardSeal',String(stars),[stars]]);
   for(const strong of [false,true])entries.push(['bulbTick',String(strong),[strong]]);
   const signatureKeys=new Set();for(const recipe of catalog.fxRecipes){const key=(recipe.seed%9)+'|'+recipe.tone;if(!signatureKeys.has(key)){signatureKeys.add(key);entries.push(['signature',key,[recipe]]);}}
   for(const[event,key,args]of entries){
    const pcm=Buffer.from(await page.evaluate(({event,args})=>window.__godotExport.sound(event,args),{event,args}),'base64');
    const relative='assets/audio/sfx/'+event+'-'+key.replaceAll('|','-')+'.wav';wav(relative,pcm);(variants[event]||={})[key]=relative;
   }
   catalog.audio.sfxVariants=variants;
   json(path.join(dest,'catalog.json'),catalog);process.stdout.write('Audio variants exported: '+entries.length+'\n');
  }
  if(process.argv.includes('--sounds-only')){await exportSounds(JSON.parse(fs.readFileSync(path.join(dest,'catalog.json'),'utf8')));return;}
  async function exportSprites(){
   const sprites=await page.evaluate(()=>window.__godotExport.sprites());
   for(const[k,values]of Object.entries(sprites))for(const[id,s]of Object.entries(values)){
    const file=path.join(root,'godot/assets/generated',k,id+'.png');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from(s.png.split(',')[1],'base64'));delete s.png;
   }json(path.join(dest,'sprites.json'),sprites);
   const stones=await page.evaluate(()=>window.__godotExport.stones());const manifest={byPalette:{}};
   for(const[key,variants]of Object.entries(stones)){
    const hash=crypto.createHash('sha256').update(key).digest('hex').slice(0,12);const paths=[];
    for(let i=0;i<variants.length;i++){const relative='assets/generated/stones/'+hash+'-'+(i===0?'plain':i-1)+'.png';const file=path.join(root,'godot',relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from(variants[i].split(',')[1],'base64'));paths.push('res://'+relative);}
    manifest.byPalette[key]={plain:paths[0],doodles:paths.slice(1)};
   }json(path.join(dest,'stones.json'),manifest);
  }
  if(process.argv.includes('--sprites-only')){await exportSprites();process.stdout.write('Sprites export complete\n');return;}
  const data=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__godotExport.data(),(_,v)=>v instanceof Set?[...v]:v)));
  const oldCatalog=path.join(dest,'catalog.json');
  if(fs.existsSync(oldCatalog))data.catalog.audio.sfxVariants=JSON.parse(fs.readFileSync(oldCatalog,'utf8')).audio?.sfxVariants||{};
  for(const[k,v]of Object.entries(data))json(path.join(dest,k+'.json'),v);
  if(process.argv.includes('--metadata-only')){process.stdout.write('Metadata export complete\n');return;}
  const eligible=await page.evaluate(()=>window.__godotExport.eligible());
  const campaign=[];const modes={classic:[],crystal:[],chain:[],reactor:[]};
  for(let base=0;base<count;base+=20){
   const chunk=await page.evaluate(({base,count})=>{
    const out=[];for(let i=base;i<Math.min(count,base+20);i++)out.push(window.__godotExport.snapshot(i));return out;
   },{base,count});campaign.push(...chunk);
   if(base%100===0)process.stdout.write('Campaign '+Math.min(base+20,count)+'/'+count+'\n');
  }
  json(path.join(dest,'parity.json'),{levels:campaign});
  for(const mode of Object.keys(modes)){
   for(let base=0;base<count;base+=20){
    const chunk=await page.evaluate(({base,count,eligible,mode})=>{
     const out=[];for(let i=base;i<Math.min(count,base+20);i++)out.push(eligible[i][mode]?window.__godotExport.snapshot(i,mode):null);return out;
    },{base,count,eligible,mode});modes[mode].push(...chunk);
   }process.stdout.write('Mode '+mode+' exported\n');
  }
  json(path.join(dest,'modes.json'),{modes,eligible});
  await exportSprites();
  const sfx={};const names=await page.evaluate(()=>window.__godotExport.soundNames());
  for(const event of names){
   const pcm=Buffer.from(await page.evaluate(({event})=>window.__godotExport.sound(event),{event}),'base64');
   const wav=Buffer.alloc(44+pcm.length);wav.write('RIFF');wav.writeUInt32LE(36+pcm.length,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(48000,24);wav.writeUInt32LE(96000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length,40);pcm.copy(wav,44);
   const relative='assets/audio/sfx/'+event+'.wav';fs.mkdirSync(path.dirname(path.join(root,'godot',relative)),{recursive:true});fs.writeFileSync(path.join(root,'godot',relative),wav);sfx[event]=relative;
  }
  data.catalog.audio.sfx=sfx;json(path.join(dest,'catalog.json'),data.catalog);
  await exportSounds(data.catalog);
  // Differential fixtures exercise each possible first action and every certified route action.
  const worker=require(path.join(source,'js/smart-hint-worker.js'));
  const fixtures=[];
  for(let level=0;level<count;level++){
   const raw=campaign[level].initial;
   const initial=worker.__setup(raw);
   const actions=[];
   for(let i=0;i<initial.atoms.length;i++)for(let d=0;d<4;d++){
    const next=worker.__applyAction(initial,i,d,raw.targetKey);actions.push({i,d,expected:next?worker.__serializable(next):null,expectedKey:next?worker.__stateKey(next):null});
   }
   for(let i=0;i<(initial.rotatingChambers||[]).length;i++){
    const action={i:-1,d:4,chamberIndex:i};const next=worker.__applyAction(initial,-1,4,raw.targetKey,i);actions.push({...action,expected:next?worker.__serializable(next):null,expectedKey:next?worker.__stateKey(next):null});
   }
   const route=[];let state=initial;for(const step of data.levels.campaign[level].fs||[]){const action={i:step[0],d:step[1],chamberIndex:step[2]||0};const next=worker.__applyAction(state,action.i,action.d,raw.targetKey,action.chamberIndex);route.push({...action,expected:next?worker.__serializable(next):null});if(!next)break;state=next;}
   for(const action of actions)if(action.i>=0)action.slide=worker.__slidePlan(initial,action.i,action.d);
   fixtures.push({level,state:raw,targetKey:raw.targetKey,initialKey:worker.__stateKey(initial),actions,route});
  }
  fs.mkdirSync(path.join(root,'godot/tests/fixtures'),{recursive:true});
  fs.writeFileSync(path.join(root,'godot/tests/fixtures/rules-oracle.json.gz'),gzipSync(JSON.stringify(fixtures)+'\n',{level:9}));
  const hashes={};for(const file of fs.readdirSync(dest).sort())hashes[file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(dest,file))).digest('hex');
  json(path.join(dest,'provenance.json'),{source:'WhitewayHan/Moleculox-ios',sourceCommit:'af91729',gameSha256:crypto.createHash('sha256').update(game).digest('hex'),levels:count,languages:data.catalog.languages,hashes});
  process.stdout.write('Export complete: '+count+' levels, '+data.catalog.languages.length+' languages\n');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1});
