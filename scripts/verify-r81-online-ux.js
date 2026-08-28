const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const must=(v,m)=>{if(!v)throw new Error(m)};
const game=read('www/js/game.js');
const firebase=read('www/js/firebase.js');
const css=read('www/css/app.css');

// Voluntary exit must become a real final/forfeit result, not a silent abandon.
must(firebase.includes('finishReason: "left"'),'voluntary leave finishReason missing');
must(firebase.includes('forfeitWinner: winner'),'voluntary leave winner missing');
must(firebase.includes('forfeitBy: playerIndex'),'voluntary leave loser missing');
must(firebase.includes('status: "finished"'),'voluntary leave must finish the duel');
must(game.includes("room.finishReason==='left'"),'client does not recognize leave forfeit');
must(game.includes('Opponent left the duel.'),'opponent-left notification missing');

// Ranked/unranked costs must be explicit and truthful.
must(game.includes('−10 DP · 0 MoleCoin'),'ranked leave cost is not explicit');
must(game.includes('DP 0 · MoleCoin 0'),'friend leave cost is not explicit');
must(game.includes('KAZANDIN')&&game.includes('KAYBETTİN'),'winner/loser copy missing');
must(game.includes("win +25 DP, draw +3 DP, loss −10 DP"),'full ranked scoring rules missing from guide');
must(game.includes('MoleCoin is 0 for every result'),'coin rule missing from guide');
must(game.includes('30-second return window'),'reconnect grace missing from guide');

// Ranking rules and personal position must be visible.
must(game.includes('All‑Time moves with DP: +25 / +3 / −10'),'All-Time DP explanation missing');
must(game.includes('Week/Month: +3 / +1 / 0'),'weekly/monthly ranking explanation missing');
must(game.includes('duelRankYouBar'),'current-player ranking bar missing');
must(firebase.includes('rating+=25')&&firebase.includes('rating=Math.max(0,rating-10)'),'leaderboard rating math changed/missing');
must(firebase.includes('points=3')&&firebase.includes('points=1'),'weekly/monthly points math changed/missing');
must(firebase.includes('period==="world"?((Number(b.rating)||0)-(Number(a.rating)||0)'),'All-Time sorting must remain DP-descending');

// Final UI compression/polish guards.
for(const marker of ['.onlineDuelTabs','.onlineRoundActions','.duelFinalDetails','.duelRankYouBar','.duelRankRuleNote']) must(css.includes(marker),`missing compact online CSS: ${marker}`);
must(game.includes('onlineQuickMessageButtonsHtml(true)'),'final quick messages must be collapsible');
must(game.includes('<details class="duelFinalDetails">'),'match details must be collapsible');
must(game.includes("function openOnlineDuelMenu(mode='create')"),'friend create/join tab flow missing');
must(game.includes('onlineDuelGuideRulesHtml'),'complete online guide section missing');

console.log('R81 online UX rules passed: immediate leave-forfeit, DP/coin disclosure, rankings, compact UI, full guide.');
