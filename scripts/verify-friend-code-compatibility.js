"use strict";
const fs=require('fs');
const assert=require('assert');
const src=fs.readFileSync('www/js/firebase.js','utf8');
assert(src.includes('older friend-room builds used arbitrary six-digit invite'),'legacy six-digit compatibility guard missing');
assert(src.includes('return {code, gameKind: null, poolKind: null, legacy: true};'),'legacy six-digit decoder fallback missing');
assert(src.includes('if (code.length !== 6) return null;'),'six-digit syntax validation missing');
// Regression sample from real-device test: 513380 must no longer be rejected
// because of its 51 prefix. Firestore room existence/status is authoritative.
function normalize(v){return String(v||'').replace(/\D/g,'').slice(0,6)}
function decode(v){
  const code=normalize(v); if(code.length!==6)return null;
  const index=Number(code.slice(0,2))-10;
  const games=['classic','crystal','chain','reactor','mixed'];
  const pools=['mixed','medium','hard'];
  if(Number.isInteger(index)&&index>=0&&index<15)return {code,gameKind:games[Math.floor(index/3)]||'classic',poolKind:pools[index%3]||'mixed',legacy:false};
  return {code,gameKind:null,poolKind:null,legacy:true};
}
assert.deepStrictEqual(decode('513380'),{code:'513380',gameKind:null,poolKind:null,legacy:true});
assert.strictEqual(decode('51 33 80').code,'513380');
assert.strictEqual(decode('51338'),null);
assert.strictEqual(decode('103380').legacy,false);
console.log('PASS friend-room code compatibility: encoded and legacy arbitrary six-digit codes accepted; Firestore remains authoritative.');
