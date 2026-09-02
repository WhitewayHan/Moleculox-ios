/* Moleculox v8.7.50 — R153 story continuity and visual-language guard.
 *
 * Story illustrations are deliberately language-neutral. All language-bearing
 * copy, including the comic-book effect printed over an illustration, is
 * resolved at runtime. R151/R152 kept page.bang as a Turkish-only string, so
 * English and the other locales could still display words such as UYARI or
 * MİYAV even though the narration and captions were translated.
 *
 * This layer also makes the canonical character entrances explicit:
 *   - Cat: Level 16, page 3 (the pendant/sensor introduction)
 *   - Moxy: Level 51, page 4 (the reactor birth reveal)
 * It never replaces an existing R151 illustration; all 23 legacy story-user
 * scenes remain authoritative wherever the original project assigned them.
 */
(function applyR153StoryContinuity(root){
  'use strict';

  const universe=root&&root.MX_STORY_UNIVERSE;
  const episodes=universe&&Array.isArray(universe.episodes)?universe.episodes:[];
  const languages=['tr','en','de','es','pt','ja','fr','zh','it'];
  const localized=(tr,en,de,es,pt,ja,fr,zh,it)=>({tr,en,de,es,pt,ja,fr,zh,it});
  const universal=value=>languages.reduce((row,language)=>{row[language]=value;return row;},{});

  /* Page-specific translations win over the shared token dictionary. TAK is
   * a door knock in Chapter 1 but a mechanical click in Chapter 7. */
  const pageFx={
    'missing-formula:3':localized('TAK!','KNOCK!','KLOPF!','¡TOC, TOC!','TOC, TOC!','コンコン！','TOC TOC !','咚咚！','TOC TOC!'),
    'magnetic-shore:2':localized('TAK!','CLICK!','KLICK!','¡CLIC!','CLIQUE!','カチッ！','CLIC !','咔哒！','CLIC!')
  };

  const tokenFx={
    '301.':universal('301.'),
    'ALARM!':localized('ALARM!','ALARM!','ALARM!','¡ALARMA!','ALARME!','警報！','ALARME !','警报！','ALLARME!'),
    'AÇIL!':localized('AÇIL!','OPEN!','ÖFFNE DICH!','¡ÁBRETE!','ABRA!','開け！','OUVRE-TOI !','开启！','APRITI!'),
    'BLUP!':universal('BLUP!'),
    'BULDUM.':localized('BULDUM.','FOUND IT.','GEFUNDEN.','LO ENCONTRÉ.','ACHEI.','見つけた。','TROUVÉ.','找到了。','TROVATO.'),
    'BWOOP!':universal('BWOOP!'),
    'BİRLİKTE!':localized('BİRLİKTE!','TOGETHER!','ZUSAMMEN!','¡JUNTOS!','JUNTOS!','一緒に！','ENSEMBLE !','一起！','INSIEME!'),
    'DİKKAT.':localized('DİKKAT.','CAREFUL.','VORSICHT.','CUIDADO.','CUIDADO.','注意。','ATTENTION.','小心。','ATTENZIONE.'),
    'FENER!':localized('FENER!','BEACON!','LEUCHTSIGNAL!','¡BALIZA!','FAROL!','ビーコン！','BALISE !','信标！','FARO!'),
    'FIRLAT!':localized('FIRLAT!','LAUNCH!','START!','¡LANZAMIENTO!','LANÇAR!','発進！','LANCEMENT !','发射！','LANCIO!'),
    'FŞŞŞ!':localized('FŞŞŞ!','FSSSH!','FSSSCH!','¡FSSSH!','FSSSH!','シューッ！','FSSSH !','嘶——！','FSSSH!'),
    'GÜMMM!':localized('GÜMMM!','BOOM!','BUMM!','¡BUM!','BUM!','ドーン！','BOUM !','轰！','BUM!'),
    'HESAPLA.':localized('HESAPLA.','CALCULATE.','BERECHNEN.','CALCULA.','CALCULE.','計算。','CALCULE.','计算。','CALCOLA.'),
    'HMM.':universal('HMM.'),
    'HOCl':universal('HOCl'),
    'HSSS!':universal('HSSS!'),
    'KABOOM!':universal('KABOOM!'),
    'KAYIT!':localized('KAYIT!','RECORDING!','AUFZEICHNUNG!','¡GRABANDO!','GRAVANDO!','記録中！','ENREGISTREMENT !','记录中！','REGISTRAZIONE!'),
    'KOP!':localized('KOP!','SNAP!','KNACK!','¡CRAC!','CRAC!','ブツン！','CRAC !','啪！','CRAC!'),
    'KRİNG!':localized('KRİNG!','CHIME!','KLING!','¡TILÍN!','TILIM!','キィン！','DING !','叮！','DIN!'),
    'KİLİT!':localized('KİLİT!','LOCKED!','VERRIEGELT!','¡BLOQUEADO!','BLOQUEADO!','ロック！','VERROUILLÉ !','已锁定！','BLOCCATO!'),
    'LÜTFEN.':localized('LÜTFEN.','PLEASE.','BITTE.','POR FAVOR.','POR FAVOR.','頼む。','S’IL TE PLAÎT.','拜托。','TI PREGO.'),
    'MIRR!':localized('MIRR!','MRRP!','MRRP!','¡MRRP!','MRRP!','ニャル！','MRRP !','喵呜！','MRRP!'),
    'MIRR?':localized('MIRR?','MRRP?','MRRP?','¿MRRP?','MRRP?','ニャル？','MRRP ?','喵呜？','MRRP?'),
    'MRRAV!':localized('MRRAV!','MRROW!','MRRAU!','¡MRRAU!','MRRAU!','ニャオ！','MRRAOU !','喵嗷！','MRRAO!'),
    'MRRRP?':localized('MRRRP?','MRRRP?','MRRRP?','¿MRRRP?','MRRRP?','ニャル？','MRRRP ?','喵呜？','MRRRP?'),
    'MİYAV!':localized('MİYAV!','MEOW!','MIAU!','¡MIAU!','MIAU!','ニャー！','MIAOU !','喵！','MIAO!'),
    'NOBEL!':universal('NOBEL!'),
    'NaBr':universal('NaBr'),
    'OH…':universal('OH…'),
    'OLAMAZ.':localized('OLAMAZ.','OH NO.','OH NEIN.','OH, NO.','AH, NÃO.','まさか。','OH NON.','糟了。','OH NO.'),
    'ONAY.':localized('ONAY.','APPROVED.','GENEHMIGT.','APROBADO.','APROVADO.','承認。','APPROUVÉ.','批准。','APPROVATO.'),
    'PARLA!':localized('PARLA!','GLOW!','LEUCHTE!','¡BRILLA!','BRILHE!','輝け！','BRILLE !','发光！','BRILLA!'),
    'PAT!':localized('PAT!','THUMP!','RUMMS!','¡PUM!','TUM!','ドン！','POUM !','砰！','TUM!'),
    'PLOP!':universal('PLOP!'),
    'PURRR':localized('PURRR','PURRR','SCHNURR','PRRR','PRRR','ゴロゴロ','RONRON','呼噜','PRRR'),
    'PİNG · PİNG':universal('PING · PING'),
    'ROTA HAZIR.':localized('ROTA HAZIR.','ROUTE READY.','ROUTE BEREIT.','RUTA LISTA.','ROTA PRONTA.','ルート準備完了。','TRAJET PRÊT.','路线就绪。','ROTTA PRONTA.'),
    'TEMAS.':localized('TEMAS.','CONTACT.','KONTAKT.','CONTACTO.','CONTATO.','接触。','CONTACT.','接触。','CONTATTO.'),
    'TINK!':universal('TINK!'),
    'TRACE':localized('İZ','TRACE','SPUR','RASTRO','RASTRO','軌跡','TRACE','轨迹','TRACCIA'),
    'UYARI!':localized('UYARI!','WARNING!','WARNUNG!','¡ALERTA!','ALERTA!','警告！','ALERTE !','警告！','ATTENZIONE!'),
    'VUM!':universal('VUM!'),
    'VUM-VUM!':universal('VUM-VUM!'),
    'VUM…':universal('VUM…'),
    'VUUUM!':universal('VUUUM!'),
    'VUUUŞ!':localized('VUUUŞ!','WHOOSH!','WUSCH!','¡FUUUSH!','VUUUSH!','ビューン！','VOUUCH !','呼——！','VUUUSH!'),
    'VZZZT!':universal('VZZZT!'),
    'VZZZZT!':universal('VZZZZT!'),
    'VİUUU!':localized('VİUUU!','WHOOOSH!','WUUUSCH!','¡FIIIU!','FIIIU!','ヒューン！','FIIIIOU !','咻——！','FIIIU!'),
    'XeO₃':universal('XeO₃'),
    'ÇAT!':localized('ÇAT!','CRACK!','KNACK!','¡CRAC!','CRAC!','パキッ！','CRAC !','咔嚓！','CRAC!'),
    'ÇATIR!':localized('ÇATIR!','CRACK!','KRACH!','¡CRAC!','CRAC!','バキッ！','CRAC !','咔嚓！','CRAC!'),
    'ÇINNN!':localized('ÇINNN!','CLANG!','KLIRR!','¡CLANG!','CLANG!','キィン！','CLANG !','铛！','CLANG!'),
    'ÇIT!':localized('ÇIT!','SNAP!','KLICK!','¡CLIC!','CLIQUE!','カチッ！','CLIC !','咔哒！','CLIC!'),
    '…':universal('…'),
    '↑ X':universal('↑ X'),
    '→ HOBr':universal('→ HOBr')
  };

  let localizedFxCount=0;
  const legacyImages=new Set();
  const timeline=[];
  for(const episode of episodes){
    if(!episode||!episode.id||!Array.isArray(episode.pages))continue;
    episode.pages.forEach((page,pageIndex)=>{
      if(!page)return;
      const key=episode.id+':'+(pageIndex+1);
      const sourceFx=typeof page.bang==='string'?page.bang:'';
      const nextFx=pageFx[key]||tokenFx[sourceFx];
      if(nextFx){page.bang=Object.freeze(nextFx);localizedFxCount++;}

      if(typeof page.img==='string'&&page.img.startsWith('assets/images/story-user/'))legacyImages.add(page.img);

      /* A malformed future content patch must not add a character before its
       * authored entrance. The image audit verifies the same boundary for the
       * actual pixels; this guard protects speaker/cast overlays at runtime. */
      const startLevel=Number(episode.startLevel)||0;
      if(Array.isArray(page.cast)){
        if(startLevel<16)page.cast=page.cast.filter(character=>character!=='cat');
        if(startLevel<51)page.cast=page.cast.filter(character=>character!=='moxy');
      }
      timeline.push({episodeId:episode.id,page:pageIndex+1,startLevel,cast:Array.isArray(page.cast)?page.cast.slice():[],img:page.img||''});
    });
  }

  root.MX_R153_STORY_CONTINUITY=Object.freeze({
    build:'8.7.50-r153-story-continuity-locales',
    base:'Moleculox-R151-FINAL-CANDIDATE.zip',
    imagePolicy:'language-neutral-art-localized-ui-copy',
    localizedFxCount,
    legacyStoryImagesReused:legacyImages.size,
    catFirstAppearance:Object.freeze({level:16,episodeId:'x-signal',page:3,role:'pendant sensor introduction'}),
    moxyFirstAppearance:Object.freeze({level:51,episodeId:'moxy-awakens',page:4,role:'reactor birth reveal'}),
    timeline:Object.freeze(timeline.map(row=>Object.freeze(row)))
  });
})(typeof window!=='undefined'?window:globalThis);
