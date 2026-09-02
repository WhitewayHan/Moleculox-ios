/* Moleculox R137 · Early Campaign Quality Pass (Levels 1–301)
 * Keeps Levels 1–20 onboarding untouched.
 * Breaks the remaining post-onboarding adjacent mechanic/route repetitions only with mechanics
 * already introduced earlier in the campaign. No Firebase/online behavior is touched.
 */
(function(){
  'use strict';
  const L=window.MX_CAMPAIGN_LEVELS;
  if(!Array.isArray(L)||L.length<301)return;
  function level(n){return L[n-1];}
  function setFragile(n,idx){const q=level(n);if(!q)return;q.fragile=[idx];q.r137Quality='active-fragile-diversity';}

  // Active fragile constraints: every chosen atom is moved only 1–2 times on the certified route.
  setFragile(154,1); // separates 153–154
  setFragile(250,1); // separates 249–250

  // L270: route-active One-Way tile crossed by the certified solution.
  // Direction 2 (down) is required at (4,2); this is not a decorative marker.
  Object.assign(level(270),{ow:[[4,2,2]],r137Quality:'route-active-oneway-diversity'});

  // L277: a legal opening detour gives Hydrazine its own solve rhythm; atom 0 then has exactly
  // two hard stops and becomes a genuine Fragile constraint. Hint follows the new certified move.
  {const q=level(277);q.fs=[[0,0],...q.fs];q.mn=q.fs.length;q.p=Math.max(q.p||0,q.fs.length);q.h=[5,4,0];q.fragile=[0];q.r137Quality='distinct-route+active-fragile';}

  // Break 278–279 without disturbing the already-distinct 277–278 pair.
  setFragile(279,1);

  // L284 rather than L285, because L286 already uses Fragile; this avoids creating a new repeat.
  setFragile(284,0);

  // R139 root fix: L296 must NOT receive the old R137 portal overlay.
  // Its second endpoint (3,1) overlapped the starting carbon atom, so only one portal was visible.
  // The level already has route-active One-Way + Fragile mechanics and remains distinct without it.
  level(296).r137Quality='r139-verified-no-portal';

  window.MX_R137_EARLY_QUALITY={
    build:'R139-root-fixed',onboardingPreserved:[1,20],modified:[154,250,270,277,279,284],portalOverlayRemoved:[296]
  };
})();
