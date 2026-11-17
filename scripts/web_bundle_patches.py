"""Apply the reviewed level-card delta after verifying the immutable R392 payload."""

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


def original_bytes(relative_path, data):
    """Require the exact delta, then expose bytes covered by the original manifest."""
    suffix = PATCHES.get(relative_path)
    if suffix is not None:
        if not data.endswith(suffix):
            raise ValueError("Missing or changed web bundle patch: " + relative_path)
        return data[:-len(suffix)]
    return data


def verify_bundle(web_root, manifest):
    for relative_path, expected in manifest.items():
        path = web_root / relative_path
        if not path.is_file():
            raise ValueError("Missing bundled file: " + relative_path)
        data = original_bytes(relative_path, path.read_bytes())
        if hashlib.sha256(data).hexdigest() != expected:
            raise ValueError("Changed bundled file: " + relative_path)
    for relative_path in PATCH_PATHS:
        if relative_path not in manifest:
            raise ValueError("Patch target missing from manifest: " + relative_path)


def apply_patches(web_root, manifest):
    """Accept only original or exactly patched files; validate all before writing."""
    pending = []
    for relative_path in PATCH_PATHS:
        path = web_root / relative_path
        expected = manifest.get(relative_path)
        if expected is None or not path.is_file():
            raise ValueError("Missing web bundle patch target: " + relative_path)
        data = path.read_bytes()
        if hashlib.sha256(data).hexdigest() == expected:
            pending.append((path, data + PATCHES[relative_path]))
        elif hashlib.sha256(original_bytes(relative_path, data)).hexdigest() != expected:
            raise ValueError("Changed web bundle patch target: " + relative_path)
    for path, data in pending:
        path.write_bytes(data)
