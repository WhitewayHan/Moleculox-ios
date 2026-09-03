const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const game=fs.readFileSync(path.join(root,'www/js/game.js'),'utf8');
const index=fs.readFileSync(path.join(root,'www/index.html'),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg);};
const six=['tr:','en:','de:','es:','pt:','ja:'];

must(game.includes('function detectedDeviceLanguage()'), 'Missing device-language detection');
must(game.includes("LANG=readDeviceLanguagePreference()||detectedDeviceLanguage();"), 'Pre-profile language bootstrap missing');
must(game.includes("return normalized==='en'?detectedDeviceLanguage():normalized;"), 'Fresh/legacy English fallback still ignores device language');
must(game.includes('function refreshStaticLocalizedChrome()'), 'Static UI localization refresh missing');
must(game.includes('refreshStaticLocalizedChrome();'), 'Static UI localization refresh is not called');
must(!game.includes("<small>Bölüm '+lvl+"), 'Profile picker still has hard-coded Turkish level label');
for(const needle of ['Mekanik öğrenildi!','EĞİTİM DENEYİ','GERÇEK BÖLÜME GEÇ ▶','GÜVENLİ ANI BEKLE']){
  must(game.includes(needle), `Critical Turkish training copy missing: ${needle}`);
}
for(const id of ['gold_scope','holo_table','quantum_desk','robot','collider','arctic','mars']){
  const start=game.indexOf(`{id:'${id}'`);must(start>=0,`Missing lab item ${id}`);
  const end=game.indexOf('}',game.indexOf('desc:{',start));const row=game.slice(start,end+1);
  for(const key of six)must(row.includes(key),`Lab item ${id} description missing ${key.slice(0,2)}`);
}
for(const id of ['hammer','precision']){
  const start=game.indexOf(`{id:'${id}'`,game.indexOf('const BOOSTER_ITEMS=['));must(start>=0,`Missing booster ${id}`);
  const end=game.indexOf('}',game.indexOf('desc:{',start));const row=game.slice(start,end+1);
  for(const key of six)must(row.includes(key),`Booster ${id} description missing ${key.slice(0,2)}`);
}
must(game.includes('const BARRIER_USE_PRICE=300;'), 'Paid Barrier price missing');
must(game.includes('Nano Bariyer için 300 MoleCoin gerekiyor.'), 'Paid Barrier Turkish copy missing');
must(game.includes('Nano Barrier costs 300 MoleCoin.'), 'Paid Barrier English copy missing');
for(const id of ['polar','collider','mars']){
  const start=game.indexOf(`{id:'${id}'`,game.indexOf('const LAB_MISSIONS=['));must(start>=0,`Missing lab mission ${id}`);
  const end=game.indexOf('progress:',start);const row=game.slice(start,end);
  for(const key of six)must(row.includes(key),`Lab mission ${id} copy missing ${key.slice(0,2)}`);
}
for(const sel of ['btnTrainingDock','btnGuide','btnLabMenu','hofTopDuel','btnHammer','btnPrecision','btnBarrier','rotate']){
  must(index.includes(`id="${sel}"`),`Critical UI target missing: ${sel}`);
}

for(const forbidden of [
  "aria-label=\"favorite\"",
  "setAttribute('aria-label','Dr. E tongue reaction')",
  "aria-label=\"Room code\"",
  "aria-label=\"Skip story\"",
  "Master sound on or off",
  "Music sound on or off",
  "Effects sound on or off",
  "ch.textContent='⚡ COMBO x1'",
  "+reactorPenalty+' sn'",
  "+(res.penalty||0)+' sn'"
]) must(!game.includes(forbidden),`Hard-coded UI localization regression remains: ${forbidden}`);

// Training/modal regressions caught by the R45 root audit.
must(game.includes('function mechanicTitleLabel(info)'), 'Mechanic title de-duplication helper missing');
must(!game.includes("info.icon+' '+t(info.titleKey)"), 'Mechanic title can duplicate its icon');
must(!game.includes('Darbe/Impact sayacı'), 'Turkish Reactor training still mixes English Impact text');
must(game.includes("title:'ZİNCİR REAKSİYONU'"), 'Turkish Chain Reaction title is incomplete');
must(game.includes("combo:'En Büyük Kombo'"), 'Turkish combo label regressed');
must(game.includes('en büyük komboyu oluştur'), 'Turkish Chain Reaction rules still contain English combo');

for(const helper of ['playerFallbackLabel','comboLabel','secondsShortLabel','favoriteAriaLabel']){
  must(game.includes(`function ${helper}(`),`Missing localized helper: ${helper}`);
}
for(const id of ['collectionTabs','labBack','labHome','labTabs','labRoom','hofSubTabs','duelRankTabs']){
  must(game.includes(`setStaticUiAttr('#${id}'`),`Static accessibility localization missing: ${id}`);
}


// Root-audit locale-completeness sentinels: these used to inherit English in ES/PT/JA/DE.
for (const needle of [
  "⭐ SPIELER DER WOCHE",
  '¡Nueva mecánica!',
  'Nova mecânica à frente!',
  '新しいメカニック！',
  'Política de privacidad',
  'Política de Privacidade',
  'プライバシーポリシー'
]) must(game.includes(needle), 'Missing completed locale sentinel: '+needle);

must(!game.includes('Parlayan doğru hamleyi yap; seri otomatik ilerler ve Combo x2 / x3 oluşturur.'), 'Turkish Moleculopedia still contains English Combo');
must(!game.includes('Parlayan hamleyi yap; sonraki hamleler otomatik ilerler ve Combo x2 / x3 yükselir.'), 'Turkish training copy still contains English Combo');
must(!game.includes('Yüklü hamlelerle Combo x2 / x3 başlat'), 'Turkish bonus description still contains English Combo');
console.log('UI localization regression checks passed.');
