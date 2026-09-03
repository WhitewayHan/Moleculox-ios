const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const game=fs.readFileSync(path.join(root,'www/js/game.js'),'utf8');
const css=fs.readFileSync(path.join(root,'www/css/app.css'),'utf8');
const loc=fs.readFileSync(path.join(root,'www/js/v2-locales-generated.js'),'utf8');
const itLoc=fs.readFileSync(path.join(root,'www/js/it-locale-generated.js'),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg);};
const langs=['en','tr','de','es','pt','ja','fr','zh','it'];
for(const lang of langs) must(game.includes(`${lang}:{`)||game.includes(`${lang}: {`),`base I18N language missing: ${lang}`);
for(const fn of ['performanceMetaLabel','performanceBestLabel','performanceAssistedLabel','fitPerformanceGradeText']) must(game.includes(`function ${fn}(`),`completion helper missing: ${fn}`);
for(const needle of [
  "'PAR '+perf.par+' · SEN '+perf.moves", "'PAR '+perf.par+' · DU '+perf.moves", "'PAR '+perf.par+' · TÚ '+perf.moves", "'PAR '+perf.par+' · VOCÊ '+perf.moves",
  "'PAR '+perf.par+' · あなた '+perf.moves", "'PAR '+perf.par+' · VOUS '+perf.moves", "'标准 '+perf.par+' · 你 '+perf.moves",
  "'NOUVEAU RECORD !'", "'新纪录！'", "'RÉUSSITE ASSISTÉE · NON CLASSÉE'", "'辅助通关 · 不计排名'"
]) must(game.includes(needle),`completion localization contract missing: ${needle}`);
for(const needle of [
  'R77.2 · LANGUAGE + COMPLETION PHONE MATRIX HOTFIX 3',
  '#performanceGrade{', 'max-width:calc(100vw - 36px)!important',
  'html[lang="tr"] #performanceGrade', 'html[lang="fr"] #performanceGrade', 'html[lang="ja"] #performanceGrade', 'html[lang="zh"] #performanceGrade',
  '@media(max-width:360px)', '@media(max-height:640px)', '@media(max-height:570px)',
  '#modalBox.winResultModal{', 'overflow-y:auto!important', 'overflow-wrap:anywhere!important'
]) must(css.includes(needle),`language/phone CSS contract missing: ${needle}`);
for(const needle of [
  '"COMPLETED · REPLAY AVAILABLE":"TERMINÉ · REJOUABLE"', '"COMPLETED · REPLAY AVAILABLE":"已完成 · 可重玩"',
  '"NEW BEST!":"NOUVEAU RECORD !"', '"NEW BEST!":"新纪录！"',
  '"NEXT LEVEL ▶︎":"NIVEAU SUIVANT ▶︎"', '"NEXT LEVEL ▶︎":"下一关 ▶︎"',
  'PAR {{MX0}} · VOUS {{MX1}}', '标准 {{MX0}} · 你 {{MX1}}',
  '.sort((a,b)=>b[0].length-a[0].length)'
]) must(loc.includes(needle),`FR/ZH runtime locale contract missing: ${needle}`);
for(const bad of ['LE MEILLEUR NOUVEAU!','完成了 · 复制可用','最好的已经声称','Le meilleur déjà réclamé','下一个级别 ▶︎']) must(!loc.includes(bad),`stale bad locale text remains: ${bad}`);
for(const needle of ['\"COMPLETED · REPLAY AVAILABLE\":\"COMPLETATO · PUOI RIGIOCARE\"','\"NEW BEST!\":\"NUOVO RECORD!\"','\"NEXT LEVEL ▶︎\":\"LIVELLO SUCCESSIVO ▶︎\"']) must(itLoc.includes(needle),`IT runtime locale contract missing: ${needle}`);
console.log('Language completion phone-matrix checks passed for 9 languages.');
