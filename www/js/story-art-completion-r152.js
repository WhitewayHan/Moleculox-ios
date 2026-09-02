/* Moleculox v8.7.49 — R152 complete classic-story visual pass.
 * Every authored story page now has a deliberate illustration. Existing art is
 * preserved, 46 new 16:9 pages fill the genuine gaps, and Level 302 reuses the
 * three distinct panels of the supplied source artwork instead of pretending
 * the same full triptych is three different scenes.
 */
(function applyR152StoryArt(root){
  'use strict';

  const universe=root&&root.MX_STORY_UNIVERSE;
  const episodes=universe&&Array.isArray(universe.episodes)?universe.episodes:[];
  const pad=number=>String(Math.max(0,Number(number)||0)).padStart(2,'0');
  const bindings={};

  for(const episode of episodes){
    if(!episode||!episode.id||!Array.isArray(episode.pages))continue;
    episode.pages.forEach((page,pageIndex)=>{
      if(!page||page.img||episode.id==='second-x-signal')return;
      const img='assets/images/story-pages/'+pad(episode.chapter)+'-'+episode.id+'-p'+(pageIndex+1)+'.webp';
      page.img=img;
      bindings[episode.id+':'+(pageIndex+1)]=img;
    });
  }

  const episodeById=id=>episodes.find(episode=>episode&&episode.id===id);
  const setCast=(episodeId,pageNumber,cast)=>{
    const episode=episodeById(episodeId),page=episode&&episode.pages&&episode.pages[pageNumber-1];
    if(page)page.cast=cast.slice();
  };

  /* The Level 302 source is a 2-up grid followed by one wide panel. Page order
   * follows the actual script: pendant pulse, vault map, then Cat/Moxy reaction. */
  const signal=episodeById('second-x-signal');
  if(signal&&Array.isArray(signal.pages)&&signal.pages.length>=3){
    const source='assets/images/story-expansion/story-302-r122.webp';
    const topLeft={x:4,y:4,w:820,h:459,sourceW:1672,sourceH:941,layout:'grid',focus:'xMidYMid'};
    const topRight={x:848,y:4,w:820,h:459,sourceW:1672,sourceH:941,layout:'grid',focus:'xMidYMid'};
    // Bias the wide lower panel toward the left: Dr. E remains visible while
    // the central vault route still reads clearly in the same mobile frame.
    const bottom={x:4,y:480,w:1664,h:457,sourceW:1672,sourceH:941,layout:'grid',focus:'xMidYMid',focusX:.18};
    [topLeft,bottom,topRight].forEach((crop,pageIndex)=>{
      signal.pages[pageIndex].img=source;
      signal.pages[pageIndex].crop=crop;
      bindings['second-x-signal:'+(pageIndex+1)]=source+'#panel-'+(pageIndex+1);
    });
  }

  /* Cast metadata drives speaker placement and accessibility state. These rows
   * previously contradicted their narration and their corrected illustrations. */
  setCast('great-unbonding',2,['drE','null']);
  setCast('cat-saves-station',2,['drE','null','cat']);
  setCast('nobel-finale',3,['drE','null','cat','moxy']);
  setCast('second-x-signal',1,['cat']);
  setCast('second-x-signal',2,['drE','null','cat','moxy']);
  setCast('second-x-signal',3,['cat','moxy']);
  setCast('directional-trace',1,['drE']);
  setCast('directional-trace',2,['null']);
  setCast('resonance-vault-304',1,['null']);
  setCast('resonance-vault-305',1,['drE']);

  root.MX_R152_STORY_ART_BINDINGS=Object.freeze(bindings);
  root.MX_R152_STORY_ART_SUMMARY=Object.freeze({
    build:'8.7.49-r152-story-visual-rebuild',
    authoredPages:72,
    newIllustrations:46,
    reusedDistinctPanels:3,
    pagesWithoutArt:0
  });
})(typeof window!=='undefined'?window:globalThis);
