import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeProfileForRules, compatibleProfileFields} from '../www/js/profile-rules-compat.js';
const stamp={__serverTimestamp:true};
const uid='uid_abcdefgh123';
const pid='p_mttv8f9g_926epfii';
function saved(data={}){return normalizeProfileForRules({uid,profileId:pid,playerName:'wHiTeWaY',saveSchema:10,rpSchema:4,
 coins:198,maxCoins:205,researchPoints:47055,stars:{'2':3},disc:{'H2O':1},
 researchAchievements:{__coinEarned:300,__coinSpent:102},
 ...data},uid,pid,stamp);}
test('keeps real UID/profile, cloud progress and daily-coin ledger',()=>{
 const p=saved();
 assert.equal(p.uid,uid);assert.equal(p.profileId,pid);assert.equal(p.coins,198);
 assert.equal(p.maxCoins,205);assert.equal(p.researchPoints,47055);
 assert.equal(p.stars['2'],3);assert.equal(p.disc.H2O,1);
 assert.deepEqual(p.researchAchievements,{__coinEarned:300,__coinSpent:102});
 assert.strictEqual(p.updatedAt,stamp);
});
test('forces compatible schema in legacy iOS profile while leaving progress intact',()=>{
 const p=saved({saveSchema:6,rpSchema:7,seenPrecision:'YES',volM:NaN,
   effectLevel:'ultra',duelPeakRating:null,oldR373Only:true});
 assert.equal(p.saveSchema,5);assert.equal(p.rpSchema,3);
 assert.equal(p.seenPrecision,true);assert.equal(p.volM,1);
 assert.equal(p.effectLevel,'low');assert.equal(p.duelPeakRating,800);
 assert.ok(!('oldR373Only' in p));
});
test('all sent fields are in the client profile allowlist',()=>{
 const p=saved({seenRift:'truthy',streak3:0,hugeBadOption:'sneaked',lastDailyRPDate:'2026-09-28'});
 const fields=compatibleProfileFields();
 for(const field of Object.keys(p))assert.ok(fields.has(field),`Unknown field ${field}`);
 assert.equal(p.seenRift,true);
});
test('normalizes map bounds without silently dropping currency or achievements',()=>{
 const tooMany=Object.fromEntries(Array.from({length:513},(_,i)=>['a'+i,1]));
 assert.throws(()=>saved({researchAchievements:tooMany}),e=>e.code==='cloud/local-map-limit');
});
test('clamps bad legacy numeric values but never awards coins',()=>{
 const p=saved({coins:100,maxCoins:30,weekRP:-10,seasonRP:'100000000',
  volS:0.6,activeDuelTitle:'Long'.repeat(20)});
 assert.equal(p.coins,100);assert.equal(p.maxCoins,100);
 assert.equal(p.weekRP,0);assert.equal(p.seasonRP,1000000);
 assert.equal(p.volS,0.6);assert.equal(p.activeDuelTitle.length,40);
});
test('auth account mismatch fails locally before touching Firestore',()=>{
 assert.throws(()=>normalizeProfileForRules({playerName:'wHiTeWaY'},uid,'bad profile id!',stamp),e=>e.code==='cloud/invalid-profile-id');
});
test('Codemagic restores R383 overrides after older payload and never strips schema',()=>{
 const source=fs.readFileSync(new URL('../www/js/firebase.js',import.meta.url),'utf8');
 const restore=fs.readFileSync(new URL('../scripts/restore-www.sh',import.meta.url),'utf8');
 assert.ok(source.includes('merged=normalizeProfileForRules(merged, ownerUid, profileId, serverTimestamp());'));
 assert.ok(source.includes('tx.set(ref, merged, {merge: true});'));
 assert.ok(!source.includes('"seenPrecisionSupport", "tutorialDone", "saveSchema"'));
 assert.ok(!source.includes('["rpSchema", "researchPoints"'));
 assert.ok(restore.includes('r383-overrides/$rel'));
});
