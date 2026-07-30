/* Moleculox V5.26 FINAL — deterministic cross-platform profile and Duel-rank merge core. */
(function(root){
  'use strict';

  const MAX_LEVELS=301;
  const MAX_DAILY_SCORES=130;

  function obj(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
  function int(v,min,max){
    const n=Math.floor(Number(v)||0);
    return Math.max(min==null?0:min,Math.min(max==null?Number.MAX_SAFE_INTEGER:max,n));
  }
  function positive(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:0;}
  function cloneMap(v){return Object.assign({},obj(v));}
  function cleanName(v){return String(v||'Player').replace(/[<>]/g,'').trim().slice(0,18)||'Player';}
  function normalizeName(v){return cleanName(v).normalize('NFKC').toLocaleLowerCase('en-US').replace(/\s+/g,' ').trim();}

  function mergeTruthMap(a,b,limit){
    const out={};
    for(const src of [obj(a),obj(b)])for(const k of Object.keys(src))if(src[k])out[k]=1;
    return trimMap(out,limit);
  }
  function mergeMaxMap(a,b,limit,cap){
    const out={};
    for(const src of [obj(a),obj(b)])for(const k of Object.keys(src)){
      const n=int(src[k],0,cap==null?Number.MAX_SAFE_INTEGER:cap);
      if(n>0)out[k]=Math.max(int(out[k],0,cap),n);
    }
    return trimMap(out,limit);
  }
  function mergeMinPositiveMap(a,b,limit){
    const out={};
    for(const src of [obj(a),obj(b)])for(const k of Object.keys(src)){
      const n=positive(src[k]);
      if(!n)continue;
      const old=positive(out[k]);
      out[k]=old?Math.min(old,n):n;
    }
    return trimMap(out,limit);
  }
  function trimMap(map,limit){
    if(!limit)return map;
    const keys=Object.keys(map);
    if(keys.length<=limit)return map;
    const out={};
    keys.sort((a,b)=>String(a).localeCompare(String(b))).slice(keys.length-limit).forEach(k=>{out[k]=map[k];});
    return out;
  }
  function sumMap(map){return Object.entries(obj(map)).reduce((s,[k,v])=>s+(String(k).startsWith('__')?0:int(v,0)),0);}
  function dayFrom(v){
    const s=String(v||'');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
    const d=new Date(s+'T00:00:00Z');
    return Number.isNaN(d.getTime())?null:d;
  }
  function monthId(date){
    date=date instanceof Date?date:new Date();
    return date.getUTCFullYear()+'-'+String(date.getUTCMonth()+1).padStart(2,'0');
  }
  function weekId(date){
    date=date instanceof Date?date:new Date();
    const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
    const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-day);
    const start=new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const week=Math.ceil((((d-start)/86400000)+1)/7);
    return d.getUTCFullYear()+'-W'+String(week).padStart(2,'0');
  }
  function periodTotals(dailyScores,now){
    const month=monthId(now),week=weekId(now);let monthTotal=0,weekTotal=0;
    for(const [day,value] of Object.entries(obj(dailyScores))){
      const score=int(value,0);if(!score)continue;
      if(day.slice(0,7)===month)monthTotal+=score;
      const d=dayFrom(day);if(d&&weekId(d)===week)weekTotal+=score;
    }
    return {month,week,monthTotal,weekTotal};
  }
  function preferField(left,right,side,key,fallback){
    const first=side==='right'?right:left,second=side==='right'?left:right;
    if(first&&first[key]!==undefined&&first[key]!==null)return first[key];
    if(second&&second[key]!==undefined&&second[key]!==null)return second[key];
    return fallback;
  }
  function latestStreak(left,right){
    const ld=String(left.lastDailyRPDate||''),rd=String(right.lastDailyRPDate||'');
    if(ld>rd)return int(left.dailyRPStreak,0,5000);
    if(rd>ld)return int(right.dailyRPStreak,0,5000);
    return Math.max(int(left.dailyRPStreak,0,5000),int(right.dailyRPStreak,0,5000));
  }
  function canonicalResearchTotal(data){
    const sources=sumMap(data.researchLevels)+sumMap(data.researchAchievements)+sumMap(data.researchBonuses)+sumMap(data.dailyScores);
    return Math.max(sources,int(data.researchPoints,0,5000000));
  }

  function mergeProfiles(leftValue,rightValue,options){
    const left=obj(leftValue),right=obj(rightValue);options=options||{};
    const settingsSide=options.settings==='right'?'right':'left';
    const identitySide=options.identity==='right'?'right':'left';
    const now=options.now instanceof Date?options.now:new Date();
    const out={};

    out.uid=String(preferField(left,right,identitySide,'uid','')||'');
    out.profileId=String(preferField(left,right,identitySide,'profileId','')||'');
    out.playerName=cleanName(preferField(left,right,settingsSide,'playerName','Player'));

    out.stars=mergeMaxMap(left.stars,right.stars,MAX_LEVELS,3);
    out.disc=mergeTruthMap(left.disc,right.disc,130);
    out.achv=mergeTruthMap(left.achv,right.achv,80);
    out.speedRuns=mergeMinPositiveMap(left.speedRuns,right.speedRuns,20);
    out.bestMoves=mergeMinPositiveMap(left.bestMoves,right.bestMoves,MAX_LEVELS);
    out.researchLevels=mergeMaxMap(left.researchLevels,right.researchLevels,MAX_LEVELS,100000);
    out.researchAchievements=mergeMaxMap(left.researchAchievements,right.researchAchievements,80,10000000);
    if(options.includeBonus||left.bonusClaims||right.bonusClaims||left.researchBonuses||right.researchBonuses){
      out.bonusClaims=mergeTruthMap(left.bonusClaims,right.bonusClaims,15);
      out.researchBonuses=mergeMaxMap(left.researchBonuses,right.researchBonuses,15,100000);
    }
    out.dailyScores=mergeMaxMap(left.dailyScores,right.dailyScores,MAX_DAILY_SCORES,100000);
    out.duelRatedMatches=mergeMaxMap(left.duelRatedMatches,right.duelRatedMatches,1000,Number.MAX_SAFE_INTEGER);
    out.duelRewards=mergeTruthMap(left.duelRewards,right.duelRewards,300);
    out.duelRewardClaims=mergeMaxMap(left.duelRewardClaims,right.duelRewardClaims,180,1000);

    const completed=Object.keys(out.stars).reduce((m,k)=>out.stars[k]>0?Math.max(m,int(k,0,MAX_LEVELS-1)+1):m,0);
    out.cur=Math.min(MAX_LEVELS,Math.max(int(left.cur,0,MAX_LEVELS),int(right.cur,0,MAX_LEVELS),completed));
    out.coins=Math.max(int(left.coins,0,10000000),int(right.coins,0,10000000),int(left.verifiedCoins,0,10000000),int(right.verifiedCoins,0,10000000));
    out.maxCoins=Math.max(out.coins,int(left.maxCoins,0,10000000),int(right.maxCoins,0,10000000));
    if(left.verifiedCoins!==undefined||right.verifiedCoins!==undefined)out.verifiedCoins=Math.max(int(left.verifiedCoins,0,10000000),int(right.verifiedCoins,0,10000000));
    out.totalHints=Math.max(int(left.totalHints,0,1000000),int(right.totalHints,0,1000000));
    out.streak3=Math.max(int(left.streak3,0,MAX_LEVELS),int(right.streak3,0,MAX_LEVELS));
    out.accountMilestoneInviteLastLevel=Math.max(int(left.accountMilestoneInviteLastLevel,0,MAX_LEVELS),int(right.accountMilestoneInviteLastLevel,0,MAX_LEVELS));
    out.dailyDate=String(left.dailyDate||'')>String(right.dailyDate||'')?String(left.dailyDate||''):String(right.dailyDate||'');
    out.lastDailyRPDate=String(left.lastDailyRPDate||'')>String(right.lastDailyRPDate||'')?String(left.lastDailyRPDate||''):String(right.lastDailyRPDate||'');
    out.dailyRPStreak=latestStreak(left,right);

    for(const key of ['seenFrozen','seenFire','seenSticky','seenZombie','tutorialDone',
      'seenLightning','seenOneWay','seenBreakableWall','seenPortal','seenMovingWall',
      'seenPressureDoor','seenFragile','seenPrecision','seenHintSupport','seenUndoSupport',
      'seenRestartSupport','seenLabSupport','seenSupportGuide','seenHammerSupport',
      'seenPrecisionSupport','accountMilestoneInviteSeen','nobelCertificateShared'])out[key]=!!(left[key]||right[key]);
    out.lang=preferField(left,right,settingsSide,'lang','en')==='tr'?'tr':'en';
    for(const key of ['volM','volMu','volS','volV']){
      const raw=Number(preferField(left,right,settingsSide,key,key==='volMu'?0.8:1));
      out[key]=Number.isFinite(raw)?Math.max(0,Math.min(1,raw)):(key==='volMu'?0.8:1);
    }
    for(const key of ['muM','muMu','muS','muV','externalMusic','dpad','reduceMotion','duelMessages','duelEffects','haptics','largeText','colorBlind','highContrast'])
      out[key]=!!preferField(left,right,settingsSide,key,key==='duelMessages'||key==='duelEffects'||key==='haptics');
    out.effectLevel=['low','normal','high'].includes(preferField(left,right,settingsSide,'effectLevel','normal'))?preferField(left,right,settingsSide,'effectLevel','normal'):'normal';
    out.performanceMode=['auto','low','high'].includes(preferField(left,right,settingsSide,'performanceMode','auto'))?preferField(left,right,settingsSide,'performanceMode','auto'):'auto';
    out.collectionFilter=String(preferField(left,right,settingsSide,'collectionFilter','all')||'all').slice(0,24);
    out.favoriteMolecules=mergeTruthMap(left.favoriteMolecules,right.favoriteMolecules,200);
    out.storySeen=mergeTruthMap(left.storySeen,right.storySeen,25);
    out.storySchema=Math.max(0,int(left.storySchema,0,10),int(right.storySchema,0,10));
    out.labTheme=String(preferField(left,right,settingsSide,'labTheme','basic')||'basic').slice(0,32);
    out.quantumHintDay=String(preferField(left,right,settingsSide,'quantumHintDay','')||'').slice(0,16);
    out.activeDuelFrame=String(preferField(left,right,settingsSide,'activeDuelFrame','frame_bronze')||'frame_bronze').slice(0,40);
    out.activeDuelTitle=String(preferField(left,right,settingsSide,'activeDuelTitle','')||'').slice(0,40);
    for(const key of ['duelPeakRating','duelBestStreak'])out[key]=Math.max(int(left[key],0,100000),int(right[key],0,100000));
    out.economySchema=Math.max(1,int(left.economySchema,0,10),int(right.economySchema,0,10));

    out.rpSchema=Math.max(3,int(left.rpSchema,0,10),int(right.rpSchema,0,10));
    // Hardened 2026-07-26: previously this took Math.max(computed, claimed),
    // so a save with a tampered top-level researchPoints (no matching entries
    // in researchLevels/Achievements/Bonuses/dailyScores) could still inflate
    // the merged total all the way to the 5,000,000 cap. We now trust the
    // recomputed total from the merged component maps as the baseline, and
    // let a higher claimed value through only within a small grace margin —
    // enough to absorb legitimate RP that isn't map-tracked (promo grants,
    // etc.) without leaving the field wide open. Raise RP_TRUST_MARGIN if you
    // have a known legitimate source that can exceed it.
    {
      const computedRP=sumMap(out.researchLevels)+sumMap(out.researchAchievements)+sumMap(out.researchBonuses)+sumMap(out.dailyScores);
      const claimedRP=Math.max(int(left.researchPoints,0,5000000),int(right.researchPoints,0,5000000));
      const RP_TRUST_MARGIN=500;
      out.researchPoints=Math.min(5000000,Math.max(computedRP,Math.min(claimedRP,computedRP+RP_TRUST_MARGIN)));
    }
    const periods=periodTotals(out.dailyScores,now);
    out.seasonId=periods.month;
    out.weekId=periods.week;
    out.seasonRP=Math.min(1000000,Math.max(
      periods.monthTotal,
      left.seasonId===periods.month?int(left.seasonRP,0,1000000):0,
      right.seasonId===periods.month?int(right.seasonRP,0,1000000):0
    ));
    out.weekRP=Math.min(500000,Math.max(
      periods.weekTotal,
      left.weekId===periods.week?int(left.weekRP,0,500000):0,
      right.weekId===periods.week?int(right.weekRP,0,500000):0
    ));
    out.saveSchema=Math.max(5,int(left.saveSchema,0,10),int(right.saveSchema,0,10));
    return out;
  }

  root.MXSyncCore={
    mergeProfiles,mergeMaxMap,mergeMinPositiveMap,mergeTruthMap,
    canonicalResearchTotal,normalizeName,monthId,weekId,periodTotals
  };
})(typeof window!=='undefined'?window:globalThis);
