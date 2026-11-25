import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const listeners = new Map();
const roomCallbacks = new Map();
let authCallback;
let stopped = 0;
let resolveLate;
const cloud = {
 uid:'alpha', authFailed:false, ready:Promise.resolve('alpha'), duelClientId:'dc_test',
 account:{uid:'alpha', authGeneration:1,signedIn:true,isAnonymous:false,email:'test@example.invalid'},
 security:{secureBackendEnabled:false,appCheckConfigured:false,region:'europe-west1'},
 subscribeAuth(fn){authCallback=fn;fn(this.account);return ()=>{};},
 listProfiles:async()=>[{profileId:'p1',unknownFuture:{value:3}}],
 loadProfile:()=>new Promise(resolve=>{resolveLate=resolve;}),
 saveProgressNow:async()=>null,
 createDuelRoom:async()=>({ok:false,reason:'invalid-rounds'}),
 connectGoogle:async()=>({uid:'alpha'}),
 subscribeDuelRoom(code,onData){roomCallbacks.set(code,onData);return ()=>{stopped++;roomCallbacks.delete(code);};},
};
const context=vm.createContext({console,setTimeout,clearTimeout,addEventListener:(name,fn)=>listeners.set(name,fn)});
vm.runInContext(fs.readFileSync(new URL('../bridge/cloud-adapter.js',import.meta.url),'utf8'),context);
const adapter=context.MXGodotCloudAdapter;
await adapter.start({cloud});
let packets=JSON.parse(adapter.drain_events_json());
assert.equal(packets.at(-1).type,'ready');
assert.equal(packets.at(-1).data.available,true);
async function invoke(id,method,args=[]){adapter.invoke(id,method,JSON.stringify(args));await new Promise(setImmediate);return JSON.parse(adapter.drain_events_json());}
packets=await invoke(1,'listProfiles');
assert.equal(packets.find(p=>p.type==='profiles').data[0].unknownFuture.value,3);
assert.equal(packets.find(p=>p.type==='result').data.ok,true);
packets=await invoke(2,'saveProgressNow',[{},'p1']);
assert.equal(packets.find(p=>p.type==='result').data.error.code,'cloud/save-failed');
packets=await invoke(3,'createDuelRoom',[{}]);
assert.equal(packets.find(p=>p.type==='result').data.error.code,'invalid-rounds');
packets=await invoke(4,'arbitraryDangerousFunction');
assert.equal(packets.find(p=>p.type==='result').data.error.code,'cloud/unsupported-method');
packets=await invoke(5,'subscribeDuelRoom',['ABCDEF']);
assert.equal(packets.find(p=>p.type==='result').data.ok,true);
roomCallbacks.get('ABCDEF')({round:1,turn:0});
assert.equal(JSON.parse(adapter.drain_events_json())[0].data.value.round,1);
adapter.invoke(6,'loadProfile','["p1"]');
await new Promise(setImmediate);
cloud.uid='beta';cloud.account={uid:'beta',authGeneration:2,signedIn:true,isAnonymous:false};authCallback(cloud.account);
resolveLate({profileId:'p1'});
await new Promise(setImmediate);
packets=JSON.parse(adapter.drain_events_json());
assert.equal(stopped,1);
assert.equal(packets.find(p=>p.type==='result').data.error.code,'cloud/account-context-changed');
cloud.listProfiles=async()=>null;
packets=await invoke(7,'listProfiles');
assert.equal(packets.find(p=>p.type==='result').data.error.code,'cloud/list-unavailable');
listeners.get('mx-cloud-profile-merged')({detail:{profileId:'p2',data:{coins:20},accountUid:'beta'}});
assert.equal(JSON.parse(adapter.drain_events_json())[0].type,'profile_merged');
adapter.dispose();
assert.equal(JSON.parse(adapter.drain_events_json()).length,0);
console.log('CLOUD_ADAPTER_TESTS_OK');
