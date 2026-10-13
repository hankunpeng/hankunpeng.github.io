import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../assets/js/site-appearance.js', import.meta.url), 'utf8');

function page({ configured = 'paper', saved = {}, blocked = false, quota = false } = {}) {
  const attributes = new Map([['data-site-theme', configured], ['data-bs-theme', 'dark']]);
  const storage = new Map(Object.entries(saved));
  const windowEvents = new Map();
  const documentEvents = new Map();
  const stylesheets = new Map();
  let writes = 0;
  const window = {
    localStorage: {
      getItem(key) { if (blocked) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (blocked || quota) throw new Error('Storage unavailable'); writes++; storage.set(key, value); }
    },
    addEventListener(name, listener) { windowEvents.set(name, listener); }
  };
  const document = {
    currentScript: { src: 'https://example.test/blog/assets/js/site-appearance.js' },
    documentElement: { getAttribute: name => attributes.get(name) ?? null, setAttribute: (name, value) => attributes.set(name, value) },
    readyState: 'loading',
    addEventListener(name, listener) { documentEvents.set(name, listener); },
    dispatchEvent(event) { documentEvents.get(event.type)?.(event); },
    head: { appendChild(element) { stylesheets.set(element.id, element); } },
    createElement(tagName) { return { tagName: tagName.toUpperCase() }; },
    getElementById(id) { return stylesheets.get(id) ?? null; }, querySelector() { return null; }, querySelectorAll() { return []; }
  };
  runInNewContext(script, { window, document, URL, CustomEvent: class { constructor(type) { this.type = type; } } });
  documentEvents.get('DOMContentLoaded')();
  return { appearance: window.SiteAppearance, attributes, storage, stylesheets, windowEvents, writes: () => writes };
}

test('first paint uses Paper by default without writing preferences', () => {
  const p = page();
  assert.equal(p.attributes.get('data-site-theme'), 'paper');
  assert.equal(p.attributes.get('data-font'), 'garamond');
  assert.equal(p.writes(), 0);
});

test('configured Cursor default and saved appearance are honored', () => {
  assert.equal(page({ configured: 'cursor' }).attributes.get('data-font'), 'sans');
  assert.equal(page({ saved: { 'preferred-site-theme': 'cursor' } }).attributes.get('data-site-theme'), 'cursor');
});

test('appearance changes preserve color mode and each theme font', () => {
  const p = page({ saved: { 'preferred-font': 'lora', 'preferred-cursor-font': 'serif' } });
  p.appearance.setTheme('cursor');
  assert.equal(p.attributes.get('data-font'), 'serif');
  assert.equal(p.attributes.get('data-bs-theme'), 'dark');
  p.appearance.setTheme('paper');
  assert.equal(p.attributes.get('data-font'), 'lora');
  assert.equal(p.storage.get('preferred-site-theme'), 'paper');
});

test('saved fonts survive navigation via a new page', () => {
  const p = page();
  p.appearance.setTheme('cursor');
  p.appearance.setFont('serif');
  const next = page({ saved: Object.fromEntries(p.storage) });
  assert.equal(next.attributes.get('data-site-theme'), 'cursor');
  assert.equal(next.attributes.get('data-font'), 'serif');
});

test('Cursor offers three distinct choices and restores each saved font', () => {
  const p = page({ configured: 'cursor' });
  assert.deepEqual(Array.from(p.appearance.themes.cursor.fonts), ['sans', 'kai', 'serif']);
  assert.deepEqual(Array.from(p.appearance.themes.paper.fonts), ['garamond', 'lora', 'crimson']);
  for (const font of ['sans', 'kai', 'serif']) {
    p.appearance.setFont(font);
    const next = page({ configured: 'cursor', saved: Object.fromEntries(p.storage) });
    assert.equal(next.attributes.get('data-font'), font);
  }
});

test('the WenKai stylesheet loads only for Cursor Kai and only once per page', () => {
  const p = page();
  assert.equal(p.stylesheets.size, 0);
  p.appearance.setTheme('cursor');
  assert.equal(p.stylesheets.size, 0);
  p.appearance.setFont('kai');
  assert.equal(p.stylesheets.size, 1);
  assert.equal(p.stylesheets.get('cursor-kai-font').href, 'https://example.test/blog/assets/fonts/lxgw-wenkai-screen/font.css');
  p.appearance.setTheme('paper');
  p.appearance.setTheme('cursor');
  assert.equal(p.attributes.get('data-font'), 'kai');
  assert.equal(p.stylesheets.size, 1);
});

test('local WenKai Unicode subsets and license are complete', () => {
  const fontRoot = new URL('../assets/fonts/lxgw-wenkai-screen/', import.meta.url);
  const css = readFileSync(new URL('font.css', fontRoot), 'utf8');
  const paths = new Set(Array.from(css.matchAll(/url\(["']?([^\)"']+)/g), match => match[1]));
  assert.ok(paths.size > 0);
  for (const path of paths) {
    assert.equal(readFileSync(new URL(path, fontRoot)).subarray(0, 4).toString(), 'wOF2');
  }
  assert.match(readFileSync(new URL('OFL.txt', fontRoot), 'utf8'), /SIL OPEN FONT LICENSE/);
});

test('invalid preferences and object prototype names fall back safely', () => {
  for (const value of ['unknown', '__proto__', 'constructor', '<script>']) {
    const p = page({ saved: { 'preferred-site-theme': value, 'preferred-font': 'unknown' } });
    assert.equal(p.attributes.get('data-site-theme'), 'paper');
    assert.equal(p.attributes.get('data-font'), 'garamond');
  }
});

test('unavailable storage still allows appearance and font changes', () => {
  for (const options of [{ blocked: true }, { quota: true, saved: { 'preferred-cursor-font': 'sans' } }]) {
    const p = page(options);
    p.appearance.setTheme('cursor');
    p.appearance.setFont('serif');
    p.appearance.setTheme('paper');
    p.appearance.setTheme('cursor');
    assert.equal(p.attributes.get('data-font'), 'serif');
  }
});

test('storage changes from another tab and clearing preferences synchronize', () => {
  const p = page();
  p.appearance.setTheme('paper');
  p.storage.set('preferred-site-theme', 'cursor');
  p.windowEvents.get('storage')({ key: 'preferred-site-theme' });
  assert.equal(p.attributes.get('data-site-theme'), 'cursor');
  p.appearance.setFont('serif');
  p.storage.clear();
  p.windowEvents.get('storage')({ key: null });
  assert.equal(p.attributes.get('data-site-theme'), 'paper');
  assert.equal(p.attributes.get('data-font'), 'garamond');
});
