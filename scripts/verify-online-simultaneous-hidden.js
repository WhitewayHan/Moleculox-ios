"use strict";
const fs=require('fs');
const assert=require('assert');
const game=fs.readFileSync('www/js/game.js','utf8');
const fb=fs.readFileSync('www/js/firebase.js','utf8');

assert(game.includes('R81 invariant: online duel is NEVER turn-based'),'missing R81 simultaneous invariant');
assert(!game.includes('turn:Number(room.turn)||0'),'online state still trusts legacy room.turn');
assert(game.includes("if(onlineDuelMode&&onlineDuelSession)turn=Number(onlineDuelSession.playerIndex)===1?1:0;"),'online start does not force local player slot');
assert(!game.includes('turn!==onlineDuelSession.playerIndex'),'legacy online turn rejection still present');
assert(game.includes('R81 simultaneous-hidden: BOTH clients enter this branch for the same round.'),'playing branch simultaneous invariant missing');
assert(game.includes("if(results[idx]){clearOnlineRoundCountdown();showOnlineHiddenWaiting(room);return;}"),'local result lock/wait behavior missing');
assert(game.includes("Aynı bölüm. Aynı anda oyuna girersiniz. Rakip ekranı gizlidir."),'simultaneous-hidden player copy missing');
assert(game.includes("if(firstMatch&&room.matchType==='quick')return onlineTimestampMs(room.createdAt);"),'Quick Match shared start anchor missing');
assert(game.includes('return onlineTimestampMs(room.updatedAt);'),'Friend Room join/update shared start anchor missing');
assert(fb.includes('matchType: "friend"'),'Play a Friend room type missing');
assert(fb.includes('matchType: "quick"'),'Quick Match room type missing');
assert(/matchType: "friend"[\s\S]*?status: "waiting"/.test(fb),'Friend Room no longer starts as a waiting invite');
assert(/async function joinDuelRoom[\s\S]*?status: "playing"[\s\S]*?hostPresenceAt: serverTimestamp\(\)[\s\S]*?guestPresenceAt: serverTimestamp\(\)/.test(fb),'Play a Friend join does not release both players into the same playing room');
assert(!game.includes('function onlineLiveBoardHtml()'),'legacy spectator board renderer still present');
assert(!game.includes('function renderOnlineLiveBoard('),'legacy spectator render path still present');
assert(!game.includes('function drawOnlineSpectatorFrame('),'legacy spectator animation path still present');
assert(game.includes("async function publishOnlineMoveEvent(){return {ok:false,reason:'duel/live-hidden'};}"),'client move publishing not hard-disabled');

assert(fb.includes('Both players solve the same round independently.'),'firebase simultaneous-result contract missing');
assert(fb.includes('opponent board/moves are deliberately never written to Firestore.'),'firebase hidden-board contract missing');
assert(fb.includes('opponent board/progress is deliberately never written to Firestore.'),'firebase hidden-progress contract missing');
assert(/round\.results\[playerIndex\] = result;/.test(fb),'result is not written to caller player slot');
assert(/const bothFinished = !!\(round\.results\[0\] && round\.results\[1\]\);/.test(fb),'round does not wait for both independent results');
assert(/turn: 0, \/\/ legacy compatibility only; online rounds are simultaneous/.test(fb),'quick room legacy-turn comment missing');

console.log('PASS online simultaneous-hidden invariant: both clients play same round independently; no opponent board/move/progress live path.');
