import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {normalizeProfileForRules} from '../www/js/profile-rules-compat.js';

// Execute the shipped cloud module; only Firebase/network and device APIs are doubles.
async function boot({badAttestation=false}={}) {
  const records=new Map(), calls=[], timers=new Set();
  const user=(provider='password',uid='account-A')=>({uid,isAnonymous:false,emailVerified:true,displayName:'Orhan',providerData:[{providerId:provider}]});
  const auth={currentUser:user(),authStateReady:async()=>{}};
  let observer,provider,settings;
  const sign=async p=>{auth.currentUser=user(p);observer?.(auth.currentUser);return {user:auth.currentUser};};
  const sdk={
    initializeApp:()=>({}),getApps:()=>[],getApp:()=>({}),getAuth:()=>auth,initializeAuth:()=>auth,
    browserLocalPersistence:{},indexedDBLocalPersistence:{},setPersistence:async()=>{},
    onAuthStateChanged:(_,cb)=>{observer=cb;cb(auth.currentUser);},getRedirectResult:async()=>null,
    getFunctions:()=>({}),analyticsIsSupported:async()=>false,
    CustomProvider:class{constructor(options){Object.assign(this,options);}},
    initializeAppCheck:(_,opts)=>{provider=opts.provider;},
    initializeFirestore:(_,opts)=>{settings=opts;return {};},
    persistentLocalCache:()=>({}),persistentMultipleTabManager:()=>({}),
    signInWithEmailAndPassword:()=>sign('password'),
    GoogleAuthProvider:class{static credential(){return {providerId:'google.com'};}},
    OAuthProvider:class{constructor(id){this.id=id;}addScope(){}setCustomParameters(){}credential(){return {providerId:this.id};}},
    linkWithCredential:(_,c)=>sign(c.providerId),signInWithCredential:(_,c)=>sign(c.providerId),
    getIdToken:async()=> 'fake-auth-token', updateProfile:async()=>{},
    doc:(_, ...parts)=>parts.join('/'),collection:(_, ...parts)=>parts.join('/'),
    serverTimestamp:()=>({seconds:1}),
    getDocs:async path=>({forEach:cb=>{for(const [key,value] of records)if(key.startsWith(path+'/'))cb({id:key.split('/').at(-1),data:()=>value});}}),
    getDoc:async path=>({exists:()=>records.has(path),data:()=>records.get(path)}),
    runTransaction:async(_,callback)=>{
      if(provider){try{await provider.getToken();}catch{throw Object.assign(new Error('Rejected attestation'),{code:'permission-denied'});}}
      const staged=[];
      await callback({get:async path=>{calls.push(['read',path]);return {exists:()=>records.has(path),data:()=>records.get(path)};},set:(path,data,options)=>staged.push([path,data,options])});
      for(const [path,data,options] of staged){calls.push(['write',path]);records.set(path,options.merge?{...records.get(path),...data}:data);}
    }
  };
  const store={getItem:()=>null,setItem(){},removeItem(){}};
  const window={addEventListener(){},dispatchEvent(){},Capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'ios',Plugins:{FirebaseAppCheck:{initialize:async()=>{},getToken:async options=>{
    calls.push(['attest',options.forceRefresh]);
    if(badAttestation)throw new Error('App Attest entitlement missing');
    return {token:'fake-app-check-token',expireTimeMillis:Date.now()+3600000};
  }}}}};
  const ctx=vm.createContext({window,document:{addEventListener(){},hidden:false,documentElement:{lang:"en"}},navigator:{userAgent:'iPhone',onLine:true},location:{protocol:'capacitor:',hostname:'localhost'},localStorage:store,sessionStorage:store,
    console:{warn(){},log(){}},CustomEvent:class{},Date,Math,Promise,Set,Map,Error,
    setTimeout:(cb,ms)=>{const t=setTimeout(cb,ms);t.unref();timers.add(t);return t;},clearTimeout,clearInterval,setInterval:()=>0,sdk,normalizeProfileForRules});
  vm.runInContext(fs.readFileSync(new URL('../www/js/sync-core.js',import.meta.url),'utf8'),ctx);
  let source=fs.readFileSync(new URL('../www/js/firebase.js',import.meta.url),'utf8');
  source=source.replace(/import\s*\{([\s\S]*?)\}\s*from\s*["'][^"']+["'];/g,(_,names)=>{
    if(names.trim()==='normalizeProfileForRules')return '';
    return 'const {'+names.replace(/\bisSupported as analyticsIsSupported\b/,'analyticsIsSupported')+'}=sdk;';
  });
  await vm.runInContext('(async()=>{'+source+'\n})()',ctx);
  await window.MXCloud.ready;
  return {cloud:window.MXCloud,records,calls,settings,close:()=>{for(const t of timers)clearTimeout(t);}};
}
for(const method of ['password','google.com','apple.com'])test(`${method}: login, read cloud progress, merge and save to the same UID`,async()=>{
  const h=await boot();try{
    if(method==='password')await h.cloud.signInEmail('test@example.invalid','not-a-real-password');
    if(method==='google.com')await h.cloud.connectGoogleIdToken('fake-google-token');
    if(method==='apple.com')await h.cloud.connectAppleIdToken('fake-apple-token','fake-nonce','Orhan');
    h.records.set('players/account-A/profiles/profile_1',{uid:'account-A',profileId:'profile_1',playerName:'Orhan',cur:42,stars:{1:3,2:3},coins:20,maxCoins:20,saveSchema:5,rpSchema:3});
    const rows=await h.cloud.listProfiles();assert.equal(rows[0].cur,42);
    const saved=await h.cloud.saveProgressNow({playerName:'Orhan',cur:5,stars:{1:2,3:3},coins:20,maxCoins:20},'profile_1');
    assert.equal(saved.cur,42);assert.equal(saved.stars[1],3);assert.equal(saved.stars[2],3);assert.equal(saved.stars[3],3);
    assert.equal(saved.uid,'account-A');assert.equal(h.records.size,1);
    assert.equal(h.settings.experimentalForceLongPolling,true);
    assert(!h.calls.some(x=>x[0]==='attest'), 'Native unregistered App Check must not be called');
    assert.deepEqual(h.calls.filter(x=>x[0]==='write'),[['write','players/account-A/profiles/profile_1']]);
  }finally{h.close();}
});
test('unregistered unenforced native App Check does not block Firebase Authentication and profile write',async()=>{
 const h=await boot({badAttestation:true});try{
   const saved = await h.cloud.saveProgressNow({playerName:'Orhan',coins:10,maxCoins:10},'profile_1');
   assert.equal(saved.uid,'account-A');
   assert.equal(h.records.size,1);
   assert(!h.calls.some(x=>x[0]==='attest'));
   assert.deepEqual(h.calls.filter(x=>x[0]==='write'),[['write','players/account-A/profiles/profile_1']]);
 }finally{h.close();}
});
