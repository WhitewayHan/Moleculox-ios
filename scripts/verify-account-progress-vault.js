'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const game=fs.readFileSync(path.join(root,'www/js/game.js'),'utf8');
const required=[
  'ACCOUNT_PROGRESS_VAULT_PREFIX',
  'currentPermanentAccountUid',
  'writeAccountProgressVault(save,save.profileId)',
  'accountUid:currentPermanentAccountUid()',
  'job.accountUid!==activeUid',
  'local=mergeAccountProgressVault(local||{},vaultProfileId)',
];
for(const x of required)if(!game.includes(x))throw new Error('Missing R31 guard: '+x);
const sync=fs.readFileSync(path.join(root,'www/js/sync-core.js'),'utf8');
const ctx={window:{},console,Date,Object,Math,Number,String,Array,Set,Map};ctx.window.window=ctx.window;vm.createContext(ctx);vm.runInContext(sync,ctx);
const core=ctx.window.MXSyncCore;
const cloud={uid:'apple-uid',profileId:'p1',playerName:'wHiTeWaY',cur:56,stars:{'55':3}};
const vault={uid:'apple-uid',profileId:'p1',playerName:'wHiTeWaY',cur:59,stars:{'55':3,'56':3,'57':3,'58':3}};
const merged=core.mergeProfiles(vault,cloud,{settings:'right',identity:'right',includeBonus:true,now:new Date()});
if(merged.cur!==59)throw new Error('Apple vault rollback regression: '+merged.cur);
if(!merged.stars['58'])throw new Error('Apple vault lost newest stars');
console.log('R31 account-scoped progress vault checks passed.');
