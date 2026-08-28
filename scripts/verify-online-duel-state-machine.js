'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');
const {webcrypto}=require('crypto');

function clone(v){ return v == null ? v : structuredClone(v); }
class FakeFirestore {
  constructor(){ this.cols=new Map(); this.listeners=new Map(); this.lock=Promise.resolve(); }
  col(name){ if(!this.cols.has(name)) this.cols.set(name,new Map()); return this.cols.get(name); }
  key(ref){ return ref.collection+'/'+ref.id; }
  snap(ref){ const m=this.col(ref.collection); const exists=m.has(ref.id); const data=exists?clone(m.get(ref.id)):undefined; return {id:ref.id,exists:()=>exists,data:()=>clone(data)}; }
  notify(ref){ const set=this.listeners.get(this.key(ref)); if(!set)return; const snap=this.snap(ref); for(const cb of [...set]) queueMicrotask(()=>cb.next(snap)); }
  api(){
    const self=this;
    return {
      doc(_db,collection,id){ return {collection:String(collection),id:String(id)}; },
      collection(_db,name){ return {collection:String(name),kind:'collection'}; },
      where(field,op,value){ return {kind:'where',field,op,value}; },
      limit(n){ return {kind:'limit',n}; },
      query(col,...constraints){ return {collection:col.collection,kind:'query',constraints}; },
      serverTimestamp(){ return Date.now(); },
      async getDoc(ref){ return self.snap(ref); },
      async deleteDoc(ref){ self.col(ref.collection).delete(ref.id); self.notify(ref); },
      async getDocs(q){
        let rows=[...self.col(q.collection).entries()].map(([id,data])=>({id,data:clone(data)}));
        for(const c of q.constraints||[]){
          if(c.kind==='where' && c.op==='==') rows=rows.filter(r=>r.data && r.data[c.field]===c.value);
          if(c.kind==='limit') rows=rows.slice(0,c.n);
        }
        return {forEach(fn){ for(const r of rows) fn({id:r.id,exists:()=>true,data:()=>clone(r.data)}); }};
      },
      onSnapshot(ref,next,error){
        const key=self.key(ref); if(!self.listeners.has(key))self.listeners.set(key,new Set());
        const entry={next,error}; self.listeners.get(key).add(entry); queueMicrotask(()=>next(self.snap(ref)));
        return ()=>{ const s=self.listeners.get(key); if(s)s.delete(entry); };
      },
      async runTransaction(_db,fn){
        let release; const prior=self.lock; self.lock=new Promise(r=>release=r); await prior;
        try{
          const tx={
            get:async ref=>self.snap(ref),
            set(ref,data){ self.col(ref.collection).set(ref.id,clone(data)); self.notify(ref); },
            update(ref,patch){ const m=self.col(ref.collection); if(!m.has(ref.id))throw new Error('not-found'); m.set(ref.id,Object.assign({},m.get(ref.id),clone(patch))); self.notify(ref); },
            delete(ref){ self.col(ref.collection).delete(ref.id); self.notify(ref); },
          };
          return await fn(tx);
        } finally { release(); }
      },
    };
  }
}

function makeStorage(seed){ const m=new Map(Object.entries(seed||{})); return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}; }
function duelSource(){
  const file=path.join(process.cwd(),'www/js/firebase.js');
  const src=fs.readFileSync(file,'utf8');
  const start=src.indexOf('// ---- Online Atom Duel rooms');
  const end=src.indexOf('// V6.9.3 — lightweight Firestore presence',start);
  assert(start>=0 && end>start,'online duel source block not found');
  return src.slice(start,end)+`\n;globalThis.__duelApi={createDuelRoom,joinDuelRoom,decodeFriendDuelCode,subscribeDuelRoom,createQuickMatchTicket,tryQuickMatch,subscribeQuickMatchTicket,cancelQuickMatch,removeQuickMatchTicket,heartbeatDuelRoom,startDuelDisconnectCountdown,resolveDuelDisconnect,sendDuelQuickMessage,submitDuelTurn,advanceDuelRound,rematchDuelRoom,leaveDuelRoom};`;
}
function makeClient(store,uid,clientId){
  const sdk=store.api(); const storage=makeStorage({'mx_online_duel_client_v1':clientId});
  const ctx={console,Date,Math,JSON,Number,String,Array,Object,Promise,Set,Map,RegExp,Error,Uint32Array,crypto:webcrypto,globalThis:null,localStorage:storage,navigator:{onLine:true},auth:{currentUser:{uid,isAnonymous:true}},db:{},uid,readyPromise:Promise.resolve(),ensureAnonymous:async()=>({uid}),isAllowedPublicName:()=>true,
    withCloudTimeout:async(p)=>await p,
    ...sdk};
  ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(duelSource(),ctx,{filename:'firebase-duel-block.js'}); return {ctx,api:ctx.__duelApi,storage};
}
function rounds(){return [
  {level:3,gameType:'classic'},
  {level:44,gameType:'chain',chainPlan:[1,2,3]},
  {level:88,gameType:'reactor',reactorPlan:[1,2,3]},
];}
async function tick(){await new Promise(r=>setTimeout(r,0));}
async function main(){
  const store=new FakeFirestore();
  const a=makeClient(store,'uid_A','dc_client_A_12345');
  const b=makeClient(store,'uid_B','dc_client_B_12345');

  // Friend room create + subscribe + join.
  const created=await a.api.createDuelRoom({hostName:'Alpha',pool:{kind:'mixed'},gameKind:'classic',rounds:rounds(),playerStyle:{frame:'frame_gold'}});
  assert.equal(created.ok,true,'friend create'); assert.equal(created.playerIndex,0); assert(/^\d{6}$/.test(created.code));
  let hostSnapshots=0,lastHost=null; const unsub=a.api.subscribeDuelRoom(created.code,r=>{hostSnapshots++;lastHost=r;},e=>{throw e;}); await tick();
  const joined=await b.api.joinDuelRoom(created.code,'Beta',{frame:'frame_silver'},rounds()); assert.equal(joined.ok,true,'friend join'); assert.equal(joined.playerIndex,1); await tick();
  assert(lastHost && lastHost.status==='playing' && lastHost.guestUid==='uid_B','host listener receives join');

  // Heartbeat + preset message sequencing.
  assert.equal((await a.api.heartbeatDuelRoom(created.code)).ok,true);
  assert.equal((await b.api.heartbeatDuelRoom(created.code)).ok,true);
  const m1=await a.api.sendDuelQuickMessage(created.code,'hello'); const m2=await b.api.sendDuelQuickMessage(created.code,'good_luck');
  assert(m1.ok&&m2.ok); assert.equal(m2.message.seq,m1.message.seq+1,'quick message sequence');
  const badMsg=await a.api.sendDuelQuickMessage(created.code,'free_text_not_allowed'); assert.equal(badMsg.ok,false,'preset-only chat enforced');

  // Result retry/idempotency while opponent is still solving.
  const ra=await a.api.submitDuelTurn(created.code,0,0,{time:12.4,moves:8,completed:true});
  assert(ra.ok&&ra.data.waitingForOpponent===true,'first result accepted');
  const retry=await a.api.submitDuelTurn(created.code,0,0,{time:12.4,moves:8,completed:true});
  assert(retry.ok&&retry.data&&retry.data.idempotent===true,'duplicate submit is idempotent while round is playing');
  const rb=await b.api.submitDuelTurn(created.code,0,1,{time:13.0,moves:7,completed:true});
  assert(rb.ok,'opponent result accepted');
  const room0=store.col('duelRooms').get(created.code); assert.equal(room0.status,'round_result'); assert(room0.rounds[0].results[0]&&room0.rounds[0].results[1]);

  // Host advances; guest waits if trying to advance.
  const guestAdvance=await b.api.advanceDuelRound(created.code,0); assert(guestAdvance.ok&&guestAdvance.data.waiting===true);
  const hostAdvance=await a.api.advanceDuelRound(created.code,0); assert(hostAdvance.ok&&hostAdvance.data.advanced===true); assert.equal(store.col('duelRooms').get(created.code).round,1);

  // Finish remaining rounds with concurrent writes: B wins round 2, A wins round 3.
  let pair=await Promise.all([
    a.api.submitDuelTurn(created.code,1,0,{time:22,moves:10,completed:true,maxCombo:2,reactions:3}),
    b.api.submitDuelTurn(created.code,1,1,{time:11,moves:6,completed:true,maxCombo:5,reactions:8}),
  ]);
  assert(pair.every(x=>x.ok),'round 2 simultaneous writes');
  assert.equal(store.col('duelRooms').get(created.code).status,'round_result');
  assert((await a.api.advanceDuelRound(created.code,1)).ok);
  pair=await Promise.all([
    a.api.submitDuelTurn(created.code,2,0,{time:10,moves:5,completed:true,hits:1}),
    b.api.submitDuelTurn(created.code,2,1,{time:19,moves:9,completed:true,hits:3}),
  ]);
  assert(pair.every(x=>x.ok),'round 3 simultaneous writes');
  assert.equal(store.col('duelRooms').get(created.code).status,'finished');
  const rematch=await a.api.rematchDuelRoom(created.code,rounds()); assert.equal(rematch.ok,true); const rm=store.col('duelRooms').get(created.code); assert.equal(rm.status,'playing');assert.equal(rm.matchNo,2);assert.deepEqual(rm.wins,[0,0]);

  // Two stale stored timestamps alone must NEVER instantly cancel a returning match.
  let stale=store.col('duelRooms').get(created.code);stale.hostPresenceAt=Date.now()-20000;stale.guestPresenceAt=Date.now()-20000;stale.disconnectState=null;store.col('duelRooms').set(created.code,stale);
  const staleResolve=await a.api.resolveDuelDisconnect(created.code);assert(staleResolve.ok);assert.equal(store.col('duelRooms').get(created.code).status,'playing','both-stale without grace does not cancel');
  await a.api.heartbeatDuelRoom(created.code);await b.api.heartbeatDuelRoom(created.code);

  // Disconnect countdown -> restore when heartbeat returns.
  // Make B stale, A fresh.
  let active=store.col('duelRooms').get(created.code); active.hostPresenceAt=Date.now();active.guestPresenceAt=Date.now()-20000;store.col('duelRooms').set(created.code,active);
  const dc=await a.api.startDuelDisconnectCountdown(created.code,1); assert(dc.ok); assert(store.col('duelRooms').get(created.code).disconnectState,'disconnect state created');
  await b.api.heartbeatDuelRoom(created.code); const restored=await a.api.resolveDuelDisconnect(created.code); assert(restored.ok); assert.equal(store.col('duelRooms').get(created.code).disconnectState,null,'heartbeat clears disconnect');

  // Disconnect deadline -> forfeit.
  active=store.col('duelRooms').get(created.code);active.hostPresenceAt=Date.now();active.guestPresenceAt=Date.now()-20000;active.disconnectState=null;store.col('duelRooms').set(created.code,active);
  await a.api.startDuelDisconnectCountdown(created.code,1); active=store.col('duelRooms').get(created.code);active.disconnectState.deadlineAt=new Date(Date.now()-1000);active.guestPresenceAt=Date.now()-20000;active.hostPresenceAt=Date.now();store.col('duelRooms').set(created.code,active);
  const forfeited=await a.api.resolveDuelDisconnect(created.code); assert(forfeited.ok); const fr=store.col('duelRooms').get(created.code);assert.equal(fr.status,'finished');assert.equal(fr.forfeitWinner,0);assert.equal(fr.forfeitBy,1);
  unsub();

  // Waiting friend-room leave deletes room cleanly.
  const wait=await a.api.createDuelRoom({hostName:'Alpha',pool:{kind:'medium'},gameKind:'crystal',rounds:rounds()});assert(wait.ok);await a.api.leaveDuelRoom(wait.code);assert(!store.col('duelRooms').has(wait.code),'waiting host room deleted');

  // Active leave is an immediate forfeit: remaining player wins and both clients can render a final result.
  const leaveRoom=await a.api.createDuelRoom({hostName:'Alpha',pool:{kind:'hard'},gameKind:'reactor',rounds:rounds()});assert(leaveRoom.ok);assert((await b.api.joinDuelRoom(leaveRoom.code,'Beta',{},rounds())).ok);const leaveRes=await b.api.leaveDuelRoom(leaveRoom.code);assert(leaveRes.ok&&leaveRes.data&&leaveRes.data.status==='finished');const left=store.col('duelRooms').get(leaveRoom.code);assert.equal(left.status,'finished');assert.equal(left.finishReason,'left');assert.equal(left.forfeitWinner,0);assert.equal(left.forfeitBy,1);assert(left.wins[0]>=2);

  // Quick-match race: both create tickets, concurrent matching yields exactly one room and stable indices.
  const qa=await a.api.createQuickMatchTicket('Alpha',{}); const qb=await b.api.createQuickMatchTicket('Beta',{}); assert(qa.ok&&qb.ok);
  const [ma,mb]=await Promise.all([a.api.tryQuickMatch(qa.ticketId,rounds()),b.api.tryQuickMatch(qb.ticketId,rounds())]);
  const ta=store.col('duelMatchQueue').get(qa.ticketId),tb=store.col('duelMatchQueue').get(qb.ticketId);assert(ta&&tb);assert.equal(ta.status,'matched');assert.equal(tb.status,'matched');assert.equal(ta.roomCode,tb.roomCode);assert.notEqual(ta.playerIndex,tb.playerIndex);const qr=store.col('duelRooms').get(ta.roomCode);assert(qr&&qr.matchType==='quick'&&qr.status==='playing');
  // If a caller got waiting due to ordering, its ticket snapshot still resolves the same room on next try.
  const ma2=await a.api.tryQuickMatch(qa.ticketId,rounds()); const mb2=await b.api.tryQuickMatch(qb.ticketId,rounds());assert(ma2.ok&&mb2.ok&&ma2.status==='matched'&&mb2.status==='matched');assert.equal(ma2.code,mb2.code);
  const qLeaveIndex=ta.playerIndex===1?1:0; const qLeaveClient=qLeaveIndex===0?a:b; const qLeaveRes=await qLeaveClient.api.leaveDuelRoom(ta.roomCode);assert(qLeaveRes.ok&&qLeaveRes.data&&qLeaveRes.data.finishReason==='left');const qLeft=store.col('duelRooms').get(ta.roomCode);assert.equal(qLeft.status,'finished');assert.equal(qLeft.forfeitBy,qLeaveIndex);assert.equal(qLeft.forfeitWinner,1-qLeaveIndex);

  console.log(`PASS online duel state machine: friend create/join, listener, chat, simultaneous results, advance, rematch, reconnect restore/forfeit, immediate leave-forfeit, quick-match race. hostSnapshots=${hostSnapshots}`);
}
main().catch(err=>{console.error('FAIL online duel state machine:',err&&err.stack||err);process.exit(1);});
