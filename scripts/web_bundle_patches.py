"""Verify approved web overrides while preserving the immutable R392 payload.

PATCHES retains the original level-card suffixes for regression/provenance tools.
Complete reviewed file hashes, rather than suffix removal, govern this release.
"""

import hashlib


PATCH_SUFFIX = (
    "\n/* Performance: defer rendering level cards outside the scroll viewport. */\n"
    "#lvGrid > .lvBtn { content-visibility: auto; }\n"
).encode("utf-8")
JS_PATCH_SUFFIX = b"""
/* Performance: reveal nearby level cards with their original button rendering. */
(function deferOffscreenLevelCards() {
  'use strict';
  const grid = document.getElementById('lvGrid');
  if (!grid || !window.CSS || !CSS.supports('content-visibility', 'auto')) return;
  const scrollRoot = document.getElementById('lvScrollArea');
  const observer = scrollRoot && typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
      }, {root: scrollRoot, rootMargin: '200px 0px'})
    : null;
  function reveal(card) {
    card.style.contentVisibility = 'visible';
    if (observer) observer.unobserve(card);
  }
  function observeCards() {
    if (observer) observer.disconnect();
    for (const card of grid.children) {
      if (!card.matches('.lvBtn')) continue;
      if (!observer) reveal(card);
      else if (card.style.contentVisibility !== 'visible') observer.observe(card);
    }
  }
  new MutationObserver(observeCards).observe(grid, {childList: true});
  grid.addEventListener('focusin', event => {
    const card = event.target.closest('.lvBtn');
    if (card && card.parentElement === grid) reveal(card);
  });
  observeCards();
})();
"""
PATCHES = {
    "css/app.css": PATCH_SUFFIX,
    "css/app-r160.css": PATCH_SUFFIX,
    "js/game.js": JS_PATCH_SUFFIX,
    "js/game-r160.js": JS_PATCH_SUFFIX,
}
PATCH_PATHS = tuple(PATCHES)


def load_overrides(root, manifest):
    """Load the complete approved hashes; unknown or omitted targets fail closed."""
    import json
    overrides = json.loads((root / "WEB-OVERRIDES-SHA256.json").read_text())
    if set(overrides) != set(PATCH_PATHS):
        raise ValueError("Override manifest must contain exactly the four reviewed web files")
    for relative_path, digest in overrides.items():
        if relative_path not in manifest or not isinstance(digest, str) or len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
            raise ValueError("Invalid reviewed override: " + relative_path)
    return overrides


def reviewed_overrides(web_root, manifest, overrides):
    """Read and validate every tracked override before any restore can replace www."""
    if set(overrides) != set(PATCH_PATHS) or not set(overrides) <= set(manifest):
        raise ValueError("Override targets do not match the reviewed web files")
    approved = {}
    for relative_path, expected in overrides.items():
        path = web_root / relative_path
        if not path.is_file():
            raise ValueError("Missing reviewed override: " + relative_path)
        data = path.read_bytes()
        if hashlib.sha256(data).hexdigest() != expected:
            raise ValueError("Changed reviewed override: " + relative_path)
        approved[relative_path] = data
    return approved


def overlay_reviewed(web_root, approved):
    for relative_path, data in approved.items():
        (web_root / relative_path).write_bytes(data)


def verify_bundle(web_root, manifest, overrides):
    """Verify every payload file against either its original or reviewed exact hash."""
    reviewed_overrides(web_root, manifest, overrides)
    for relative_path, original_hash in manifest.items():
        path = web_root / relative_path
        if not path.is_file():
            raise ValueError("Missing bundled file: " + relative_path)
        expected = overrides.get(relative_path, original_hash)
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError("Changed bundled file: " + relative_path)
