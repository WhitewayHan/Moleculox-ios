/* Moleculox v8.7.51 — R154 main-campaign story/image continuity pass.
 *
 * The 1–301 campaign contains 21 authored episodes and 65 story pages. R154
 * keeps every useful R151 canonical painting in its original story beat and
 * replaces only four R152 bridge illustrations whose pixels contradicted the
 * narration or the immediately following page.
 */
(function applyR154MainStoryArt(root){
  'use strict';

  const universe=root&&root.MX_STORY_UNIVERSE;
  const episodes=universe&&Array.isArray(universe.episodes)?universe.episodes:[];
  const episodeById=id=>episodes.find(episode=>episode&&episode.id===id);
  const replacements={
    'element-island:1':'assets/images/story-pages/06-element-island-p1-r154.webp',
    'cats-trail:2':'assets/images/story-pages/09-cats-trail-p2-r154.webp',
    'cat-saves-station:2':'assets/images/story-pages/19-cat-saves-station-p2-r154.webp',
    'final-bond:3':'assets/images/story-pages/20-final-bond-p3-r154.webp'
  };

  const applied=[];
  for(const [key,img] of Object.entries(replacements)){
    const separator=key.lastIndexOf(':');
    const episodeId=key.slice(0,separator);
    const pageNumber=Number(key.slice(separator+1));
    const page=episodeById(episodeId)?.pages?.[pageNumber-1];
    if(!page)continue;
    page.img=img;
    applied.push(key);
  }

  /* The page explicitly says the cat is watching the forbidden red button.
   * Cast metadata must agree with both that line and the corrected frame. */
  const temptation=episodeById('cats-trail')?.pages?.[1];
  if(temptation)temptation.cast=['null','moxy','cat'];

  root.MX_R154_MAIN_STORY_ART=Object.freeze({
    build:'8.7.51-r154-main-story-visual-continuity',
    scope:Object.freeze({firstLevel:1,lastLevel:301,episodes:21,pages:65}),
    legacyCanonicalImagesPreserved:23,
    replacements:Object.freeze({...replacements}),
    applied:Object.freeze(applied.slice()),
    languagePolicy:'language-neutral-art-localized-ui-copy',
    onlineSystemsTouched:false
  });
})(typeof window!=='undefined'?window:globalThis);
