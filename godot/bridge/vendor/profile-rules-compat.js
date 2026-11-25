// Moleculox R381 native cloud-write payload compatibility.
// Pure client-side preflight: Firebase Rules remain the final authority.
// Never reads or writes another user's profile and never awards currency/RP.
const PROFILE_FIELDS = new Set((`
uid profileId playerName coins maxCoins verifiedCoins disc achv speedRuns bestMoves totalHints
 dailyDate dailyLoginDate dailyLoginStreak streak3 lang volM volMu volS volV
 muM muMu muS muV externalMusic dpad reduceMotion duelMessages duelEffects haptics
 effectLevel performanceMode largeText colorBlind highContrast favoriteMolecules collectionFilter
 storySeen storySchema accountMilestoneInviteSeen accountMilestoneInviteLastLevel nobelCertificateShared
 updatedAt cur stars seenFrozen seenFire seenLightning seenSticky seenZombie seenOneWay
 seenBreakableWall seenPortal seenRift seenMovingWall seenPressureDoor seenFragile seenFragileAtom
 seenLinked seenLinkedAtoms seenFusion seenPrebuiltModule seenRotation seenEnzymeGate seenBioAssembly
 seenReplicator seenPhotonBoost seenSynthesizer seenRepulsor seenRotatingChamber seenPrecision
 seenPrecisionTutorialV2 seenClassicCatalystTutorialV2 seenClassicChainTutorialV2
 seenClassicReactorTutorialV2 seenHintSupport seenUndoSupport seenRestartSupport
 seenLabSupport seenSupportGuide seenHammerSupport seenPrecisionSupport seenBarrierSupport
 seenGoalGlowGuide seenHammerWall seenLabToolsEinsteinIntro tutorialDone tutorialTips
 audioSettingsSchema saveSchema rpSchema researchPoints researchLevels researchAchievements
 researchBonuses bonusClaims dailyScores dailyRPStreak lastDailyRPDate seasonId seasonRP
 weekId weekRP duelRatedMatches duelRewards duelRewardClaims activeDuelFrame activeDuelTitle
 duelPeakRating duelBestStreak labTheme economySchema quantumHintDay
`).trim().split(/\s+/));
const BOOL_FIELDS = new Set((`
seenFrozen seenFire seenLightning seenSticky seenZombie seenOneWay seenBreakableWall
seenPortal seenRift seenMovingWall seenPressureDoor seenFragile seenFragileAtom
seenLinked seenLinkedAtoms seenFusion seenPrebuiltModule seenRotation seenEnzymeGate
seenBioAssembly seenReplicator seenPhotonBoost seenSynthesizer seenRepulsor
seenRotatingChamber seenPrecision seenPrecisionTutorialV2 seenClassicCatalystTutorialV2
seenClassicChainTutorialV2 seenClassicReactorTutorialV2 seenHintSupport seenUndoSupport
seenRestartSupport seenLabSupport seenSupportGuide seenHammerSupport
seenPrecisionSupport seenBarrierSupport seenGoalGlowGuide seenHammerWall
seenLabToolsEinsteinIntro muM muMu muS muV externalMusic dpad reduceMotion
 duelMessages duelEffects haptics largeText colorBlind highContrast
accountMilestoneInviteSeen nobelCertificateShared tutorialDone tutorialTips
`).trim().split(/\s+/));
const MAP_LIMITS = Object.freeze({
  disc:1200, favoriteMolecules:1200, achv:80, stars:801,
  speedRuns:801,bestMoves:801,researchLevels:801,researchAchievements:512,
  researchBonuses:15,bonusClaims:15,dailyScores:130,storySeen:128,
  duelRatedMatches:1000,duelRewards:300,duelRewardClaims:180,
});
const INTEGER_LIMITS = Object.freeze({
 coins:10000000,maxCoins:10000000,verifiedCoins:10000000,cur:801,
 totalHints:1000000,streak3:801,accountMilestoneInviteLastLevel:801,
 dailyLoginStreak:7,storySchema:10,audioSettingsSchema:10,
 researchPoints:5000000,seasonRP:1000000,weekRP:500000,
 dailyRPStreak:5000,duelPeakRating:100000,duelBestStreak:100000,
 economySchema:10,
});
const SHORT_DATES=['dailyDate','dailyLoginDate','lastDailyRPDate','quantumHintDay'];
const MAX_STR = Object.freeze({activeDuelFrame:40,activeDuelTitle:40,collectionFilter:24});
const ENUMS = Object.freeze({
  lang:['en','tr','de','es','pt','ja','fr','zh','it','ko','ru'],
  effectLevel:['low','normal','high'],
  performanceMode:['auto','low','high'],
  labTheme:['basic','collider','arctic','mars'],
});
function boundedInt(value,max,min=0){
  const n=Number(value);
  return Math.max(min,Math.min(max,Number.isFinite(n)?Math.floor(n):min));
}
function compatibleMap(value,max,key){
  const obj=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  // Never silently throw away saved achievements or coin ledger records.
  if(Object.keys(obj).length>max){
    const e=new Error(`Profile ${key} exceeds safe map size (${max})`);
    e.code='cloud/local-map-limit';e.mxStage='profile/preflight';throw e;
  }
  return obj;
}
export function normalizeProfileForRules(candidate,ownerUid,profileId,serverStamp){
  const src=candidate&&typeof candidate==='object'?candidate:{};
  const out={};
  // New/unknown client properties must not appear in Firestore's affectedKeys.
  // Existing unknown cloud fields are preserved separately via tx.set(...,merge:true).
  for(const [key,value] of Object.entries(src)){
    if(PROFILE_FIELDS.has(key) && value!==undefined)out[key]=value;
  }
  out.uid=String(ownerUid||'');
  out.profileId=String(profileId||'');
  if(!out.uid||!/^[A-Za-z0-9_-]{3,80}$/.test(out.profileId)){
    const e=new Error('Cannot save with an invalid account/profile identifier');
    e.code='cloud/invalid-profile-id';e.mxStage='profile/preflight';throw e;
  }
  out.playerName=String(src.playerName||'Player').replace(/[<>]/g,'').trim().slice(0,18)||'Player';
  out.rpSchema=3;
  out.saveSchema=5;
  out.updatedAt=serverStamp;
  for(const key of BOOL_FIELDS){if(key in out)out[key]=Boolean(out[key]);}
  for(const [key,limit] of Object.entries(MAP_LIMITS)){
    if(key in out)out[key]=compatibleMap(out[key],limit,key);
  }
  for(const [key,limit] of Object.entries(INTEGER_LIMITS)){
    if(key in out)out[key]=boundedInt(out[key],limit,key==='duelPeakRating'?800:0);
  }
  out.coins=boundedInt(out.coins,INTEGER_LIMITS.coins);
  out.maxCoins=Math.max(out.coins,boundedInt(out.maxCoins,INTEGER_LIMITS.maxCoins));
  if('verifiedCoins' in out)out.verifiedCoins=boundedInt(out.verifiedCoins,INTEGER_LIMITS.verifiedCoins);
  for(const key of ['volM','volMu','volS','volV']){
    if(key in out){const v=Number(out[key]);out[key]=Number.isFinite(v)?Math.min(1,Math.max(0,v)):(key==='volMu'?0.8:1);}
  }
  for(const key of SHORT_DATES){if(key in out)out[key]=String(out[key]||'').slice(0,16);}
  for(const [key,len] of Object.entries(MAX_STR))if(key in out)out[key]=String(out[key]||'').slice(0,len);
  for(const [key,options] of Object.entries(ENUMS)){
    if(key in out && !options.includes(out[key]))out[key]=options[0];
  }
  for(const key of ['seasonId','weekId']){
    if(key in out){const str=String(out[key]||'');
      out[key]=key==='seasonId'?(/^\d{4}-\d{2}$/.test(str)?str:''):(/^\d{4}-W\d{2}$/.test(str)?str:'');
    }
  }
  return out;
}
export function compatibleProfileFields(){return new Set(PROFILE_FIELDS);}
