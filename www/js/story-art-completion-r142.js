/* Moleculox v8.7.39 — R142 classic-campaign story art completion.
 * Adds dedicated local artwork to the nine classic episodes that previously
 * fell back to generic world art. Story text, progression and localization
 * remain untouched.
 */
(function applyR142StoryArt(root){
  'use strict';

  const universe=root&&root.MX_STORY_UNIVERSE;
  const episodes=universe&&Array.isArray(universe.episodes)?universe.episodes:[];
  const bindings={
    'x-signal':{page:2,img:'assets/images/story-user/02-x-signal-resonance.webp'},
    'cold-protocol':{page:2,img:'assets/images/story-user/03-cold-protocol.webp'},
    'element-island':{page:1,img:'assets/images/story-user/06-element-island-arrival.webp'},
    'magnetic-shore':{page:1,img:'assets/images/story-user/07-magnetic-shore.webp'},
    'fragile-grove':{page:1,img:'assets/images/story-user/08-fragile-grove.webp'},
    'island-core':{page:2,img:'assets/images/story-user/10-island-core.webp'},
    'crystal-threshold':{page:0,img:'assets/images/story-user/11-crystal-threshold.webp'},
    'broken-archive':{page:1,img:'assets/images/story-user/12-broken-archive.webp'},
    'committee-trial':{page:1,img:'assets/images/story-user/18-committee-trial.webp'}
  };

  for(const [episodeId,binding] of Object.entries(bindings)){
    const episode=episodes.find(item=>item&&item.id===episodeId);
    if(!episode||!Array.isArray(episode.pages)||!episode.pages[binding.page]) continue;
    episode.pages[binding.page].img=binding.img;
  }

  root.MX_R142_STORY_ART_BINDINGS=Object.freeze(bindings);
})(typeof window!=='undefined'?window:globalThis);
