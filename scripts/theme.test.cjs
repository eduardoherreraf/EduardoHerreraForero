const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/js/theme.js'), 'utf8');

function page({ stored, storageBlocked = false } = {}) {
  let preference = stored;
  let parsed = false;
  const attributes = new Map();
  const events = { document: {}, window: {} };
  const icon = { className: 'bi bi-sun-fill' };
  const buttonAttributes = new Map();
  const button = {
    setAttribute: (name, value) => buttonAttributes.set(name, value),
    querySelector: () => icon,
  };
  const document = {
    documentElement: {
      getAttribute: (name) => attributes.get(name),
      setAttribute: (name, value) => attributes.set(name, value),
    },
    querySelectorAll: () => (parsed ? [button] : []),
    addEventListener: (name, listener) => { events.document[name] = listener; },
  };
  const storage = {
    getItem: () => {
      if (storageBlocked) throw new Error('Storage blocked');
      return preference;
    },
    setItem: (key, value) => {
      assert.equal(key, 'theme');
      if (storageBlocked) throw new Error('Storage blocked');
      preference = value;
    },
  };
  vm.runInNewContext(source, {
    document,
    localStorage: storage,
    window: { addEventListener: (name, listener) => { events.window[name] = listener; } },
  });
  return {
    get theme() { return attributes.get('data-bs-theme'); },
    get stored() { return preference; },
    get icon() { return icon.className; },
    get label() { return buttonAttributes.get('aria-label'); },
    ready() { parsed = true; events.document.DOMContentLoaded(); },
    click() { events.document.click({ target: { closest: () => button } }); },
    unrelatedClick() { events.document.click({ target: { closest: () => null } }); },
    storageEvent(value, key = 'theme') {
      preference = value;
      events.window.storage({ key, newValue: value });
    },
    restore(value) { preference = value; events.window.pageshow(); },
  };
}

test('first visit starts dark before DOM ready, with a sun action', () => {
  const browser = page();
  assert.equal(browser.theme, 'dark');
  browser.ready();
  assert.equal(browser.icon, 'bi bi-sun-fill');
  assert.equal(browser.label, 'Cambiar a tema claro');
});

test('restores saved light and dark themes on navigation', () => {
  for (const stored of ['light', 'dark']) {
    const browser = page({ stored });
    assert.equal(browser.theme, stored);
    browser.ready();
    assert.equal(browser.icon, stored === 'light' ? 'bi bi-moon-fill' : 'bi bi-sun-fill');
  }
});

test('clicking the menu icon toggles and persists the theme for a new page', () => {
  const browser = page();
  browser.ready();
  browser.click();
  assert.equal(browser.theme, 'light');
  assert.equal(browser.stored, 'light');
  assert.equal(browser.icon, 'bi bi-moon-fill');
  assert.equal(browser.label, 'Cambiar a tema oscuro');
  assert.equal(page({ stored: browser.stored }).theme, 'light');
  browser.click();
  assert.equal(browser.theme, 'dark');
  assert.equal(browser.stored, 'dark');
  assert.equal(browser.icon, 'bi bi-sun-fill');
  assert.equal(page({ stored: browser.stored }).theme, 'dark');
});

test('blocked storage and invalid preferences fall back to dark without breaking clicks', () => {
  assert.equal(page({ stored: 'invalid' }).theme, 'dark');
  const browser = page({ storageBlocked: true });
  browser.ready();
  browser.click();
  assert.equal(browser.theme, 'light');
  browser.click();
  assert.equal(browser.theme, 'dark');
});

test('synchronizes tab changes and browser back/forward restoration', () => {
  const browser = page();
  browser.ready();
  browser.storageEvent('light');
  assert.equal(browser.theme, 'light');
  assert.equal(browser.icon, 'bi bi-moon-fill');
  browser.storageEvent(null);
  assert.equal(browser.theme, 'dark');
  browser.restore('light');
  assert.equal(browser.theme, 'light');
  browser.unrelatedClick();
  browser.storageEvent('dark', 'unrelated-key');
  assert.equal(browser.theme, 'light');
});

test('every contact menu has one theme option immediately after contact and loads the initializer early', () => {
  const directory = path.join(__dirname, '../src');
  let pages = 0;
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(directory, file), 'utf8');
    if (!/href="index\.html#contact"/.test(html)) continue;
    assert.equal((html.match(/data-theme-toggle/g) || []).length, 1, file);
    assert.match(html, /href="index\.html#contact"[^>]*>\s*CONTACTO\s*<\/a\s*>\s*<\/li>\s*<li class="nav-item">\s*<button[^>]*data-theme-toggle/, file);
    assert.match(html, /<head>[\s\S]*<script src="\.\/js\/theme\.js"><\/script>[\s\S]*<\/head>/, file);
    assert.doesNotMatch(html, /<body[^>]*data-bs-theme=/, file);
    pages++;
  }
  assert.ok(pages > 100, `Checked ${pages} menu pages`);
});
