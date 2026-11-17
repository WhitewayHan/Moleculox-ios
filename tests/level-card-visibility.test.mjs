import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Execute the exact bytes appended to the shipped game, with browser APIs doubled.
const helper = readFileSync(new URL('../scripts/web_bundle_patches.py', import.meta.url), 'utf8');
const source = helper.match(/^JS_PATCH_SUFFIX = b"""([\s\S]*?)"""/m)[1];

function boot({intersection = true, supported = true, gridPresent = true} = {}) {
  const listeners = {}, intersections = [], mutations = [];
  const grid = {children: [], addEventListener: (type, callback) => {listeners[type] = callback;}};
  const root = {};
  const card = () => {
    const element = {style: {}, parentElement: grid, matches: selector => selector === '.lvBtn'};
    element.closest = () => element;
    return element;
  };
  grid.children = [card(), card()];
  const context = {
    document: {getElementById: id => id === 'lvGrid' ? (gridPresent ? grid : null) : root},
    CSS: {supports: () => supported},
    IntersectionObserver: intersection ? class {
      constructor(callback, options) {
        Object.assign(this, {callback, options, observed: new Set()});
        intersections.push(this);
      }
      observe(element) {this.observed.add(element);}
      unobserve(element) {this.observed.delete(element);}
      disconnect() {this.observed.clear();}
    } : undefined,
    MutationObserver: class {
      constructor(callback) {this.callback = callback; mutations.push(this);}
      observe(element, options) {Object.assign(this, {element, options});}
    },
  };
  context.window = {CSS: context.CSS};
  vm.runInNewContext(source, context);
  return {grid, root, card, listeners, observer: intersections[0], mutation: mutations[0]};
}

test('observes direct cards with a margin around the scrolling viewport', () => {
  const {grid, root, observer, mutation} = boot();
  assert.equal(observer.options.root, root);
  assert.equal(observer.options.rootMargin, '200px 0px');
  assert.deepEqual([...observer.observed], grid.children);
  assert.equal(mutation.element, grid);
  assert.equal(mutation.options.childList, true);
  assert.equal(mutation.options.subtree, undefined);
});

test('nearby cards regain original rendering and remain revealed', () => {
  const {grid, observer, mutation} = boot();
  const [near, far] = grid.children;
  observer.callback([{target: near, isIntersecting: true}, {target: far, isIntersecting: false}]);
  assert.equal(near.style.contentVisibility, 'visible');
  assert.equal(far.style.contentVisibility, undefined);
  assert.equal(observer.observed.has(near), false);
  mutation.callback();
  assert.equal(observer.observed.has(near), false);
  assert.equal(observer.observed.has(far), true);
});

test('a rebuilt level list releases old observer targets and observes new cards', () => {
  const {grid, card, observer, mutation} = boot();
  const old = [...grid.children];
  grid.children = [card(), card(), {matches: () => false}];
  mutation.callback();
  assert.equal(observer.observed.size, 2);
  for (const element of old) assert.equal(observer.observed.has(element), false);
  for (const element of grid.children.slice(0, 2)) assert.equal(observer.observed.has(element), true);
});

test('keyboard focus reveals its card synchronously', () => {
  const {grid, listeners, observer} = boot();
  const target = grid.children[1];
  listeners.focusin({target: {closest: () => target}});
  assert.equal(target.style.contentVisibility, 'visible');
  assert.equal(observer.observed.has(target), false);
});

test('without IntersectionObserver every current and rebuilt card stays visible', () => {
  const {grid, card, observer, mutation} = boot({intersection: false});
  assert.equal(observer, undefined);
  for (const element of grid.children) assert.equal(element.style.contentVisibility, 'visible');
  grid.children = [card()];
  mutation.callback();
  assert.equal(grid.children[0].style.contentVisibility, 'visible');
});

test('unsupported CSS or missing grid does not install observers', () => {
  for (const options of [{supported: false}, {gridPresent: false}]) {
    const {observer, mutation} = boot(options);
    assert.equal(observer, undefined);
    assert.equal(mutation, undefined);
  }
});
