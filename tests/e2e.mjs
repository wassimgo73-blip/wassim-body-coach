// End-to-end test: serves the app locally and drives every screen in Chromium (Playwright).
// Usage: node tests/e2e.mjs [screenshotDir]
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv[2];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(root, p === '/' ? 'index.html' : p);
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
const external = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('request', (r) => {
  const u = r.url();
  if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u);
});
page.on('dialog', (d) => d.accept());

const shot = async (name) => shots && page.screenshot({ path: path.join(shots, `${name}.png`), fullPage: true });
const step = (name) => console.log(`✓ ${name}`);

try {
  // 1. Dashboard (Arabic RTL by default)
  await page.goto(`${base}/index.html`);
  await page.waitForSelector('.plan-card');
  assert.equal(await page.getAttribute('html', 'dir'), 'rtl');
  assert.equal(await page.getAttribute('html', 'lang'), 'ar');
  assert.match(await page.textContent('#view'), /مرحباً وسيم/);
  assert.match(await page.textContent('.targets'), /2250/);
  step('dashboard renders in Arabic RTL with 2250 kcal target');

  await page.click('[data-action="water+"]');
  await page.click('[data-action="water+"]');
  await page.click('[data-action="water-"]');
  assert.equal(await page.locator('.glasses span.full').count(), 1);
  step('water tracker +/−');
  await shot('01-home-ar');

  // 2. Workout plan + guided session
  await page.click('#nav a[data-route="workout"]');
  await page.waitForSelector('.schedule');
  assert.equal(await page.locator('.schedule li').count(), 7);
  await page.locator('details.exercise summary').first().click();
  assert.ok(await page.locator('details.exercise[open] ol li').first().isVisible());
  step('workout plan + exercise instructions expand');
  await shot('02-workout-ar');

  await page.goto(`${base}/index.html#/session/A`);
  await page.waitForSelector('.set-btn');
  const setCount = await page.locator('.set-btn').count();
  assert.ok(setCount >= 12);
  await page.locator('.set-btn').first().click();
  assert.ok(await page.locator('#rest-bar').isVisible(), 'rest timer shows');
  await page.click('[data-action="rest-skip"]');
  assert.ok(await page.locator('#rest-bar').isHidden());
  // undo then redo
  await page.locator('.set-btn').first().click();
  assert.equal(await page.locator('.set-btn.done').count(), 0);
  for (let i = 0; i < setCount; i++) await page.locator('.set-btn').nth(i).click();
  assert.equal(await page.locator('.set-btn.done').count(), setCount);
  // hold timer
  await page.locator('[data-hold]').first().click();
  assert.ok(await page.locator('#hold').isVisible());
  await page.click('[data-action="hold-stop"]');
  await shot('03-session-ar');
  await page.click('[data-action="finish"]');
  await page.waitForSelector('.plan-card');
  assert.match(await page.textContent('#view'), /1 من 3/, 'week counter shows 1 of 3');
  assert.match(await page.textContent('#toast'), /أحسنت/);
  step('guided session: sets, rest timer, hold timer, finish & log');

  // 3. Meals
  await page.click('#nav a[data-route="meals"]');
  await page.waitForSelector('.meals');
  await page.locator('[data-meal]').first().click();
  assert.equal(await page.locator('.check.on').count(), 1);
  await page.locator('[data-day]').nth(2).click();
  assert.match(await page.textContent('.card h3'), /السردين/);
  await page.locator('.shopping').evaluate((el) => el.closest('details').open = true);
  step('meal plan: day tabs, meal check-off, shopping list');
  await shot('04-meals-ar');

  // 4. Progress
  await page.click('#nav a[data-route="progress"]');
  await page.waitForSelector('#m-form');
  await page.click('#m-form button[type="submit"]');
  assert.ok((await page.textContent('#m-err')).length > 0, 'validation error shown');
  const addM = async (date, weight, waist) => {
    await page.fill('[name="date"]', date);
    await page.fill('[name="weight"]', weight);
    await page.fill('[name="waist"]', waist);
    await page.click('#m-form button[type="submit"]');
    await page.waitForTimeout(50);
  };
  const d = (offset) => { const x = new Date(); x.setDate(x.getDate() - offset); return x.toISOString().slice(0, 10); };
  await addM(d(21), '85', '94');
  await addM(d(14), '84.6', '93');
  await addM(d(7), '84.1', '92.5');
  await addM(d(0), '83.8', '92');
  assert.equal(await page.locator('.list li').count(), 4);
  assert.ok(await page.locator('#chart-weight svg polyline').count() === 1, 'weight chart');
  assert.ok(await page.locator('#chart-waist svg polyline').count() === 1, 'waist chart');
  assert.ok(await page.locator('#chart-workouts .chart-bar').count() >= 1, 'workout bars');
  const box = await page.locator('#chart-weight svg').boundingBox();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2);
  assert.ok(await page.locator('#chart-weight .chart-tip').isVisible(), 'tooltip');
  await page.click('[data-action="tables"]');
  assert.ok(await page.locator('.table').count() >= 2);
  await shot('05-progress-ar');
  await page.locator('[data-del]').first().click();
  assert.equal(await page.locator('.list li').count(), 3);
  step('progress: validation, 4 entries, 3 charts, tooltip, table view, delete');

  // 5. Photos (stored in IndexedDB only)
  await page.click('#nav a[data-route="photos"]');
  await page.waitForSelector('#p-file', { state: 'attached' });
  const img = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 300, height: 400 } });
  await page.setInputFiles('#p-file', { name: 'a.png', mimeType: 'image/png', buffer: img });
  await page.waitForSelector('.photo');
  await page.selectOption('[name="pose"]', 'side');
  await page.setInputFiles('#p-file', { name: 'b.png', mimeType: 'image/png', buffer: img });
  await page.waitForFunction(() => document.querySelectorAll('.photo').length === 2);
  await page.locator('[data-sel]').nth(0).check();
  await page.locator('[data-sel]').nth(1).check();
  await page.click('[data-action="compare"]');
  assert.equal(await page.locator('.compare img').count(), 2);
  await shot('06-photos-compare');
  await page.click('[data-action="close"]');
  const stored = await page.evaluate(() => new Promise((res) => {
    const r = indexedDB.open('wbc-photos');
    r.onsuccess = () => r.result.transaction('photos').objectStore('photos').count().onsuccess = (e) => res(e.target.result);
  }));
  assert.equal(stored, 2);
  await page.locator('[data-pdel]').first().click();
  await page.waitForFunction(() => document.querySelectorAll('.photo').length === 1);
  step('photos: upload, compress, IndexedDB, compare, delete');

  // 6. Settings + French
  await page.click('#settings-link');
  await page.waitForSelector('#profile-form');
  await page.click('[data-lang="fr"]');
  assert.equal(await page.getAttribute('html', 'dir'), 'ltr');
  assert.match(await page.textContent('#nav'), /Accueil/);
  await page.fill('[name="name"]', 'Wassim <b>');
  await page.click('#profile-form button[type="submit"]');
  await shot('07-settings-fr');
  await page.click('#nav a[data-route="home"]');
  await page.waitForSelector('.plan-card');
  assert.match(await page.textContent('.hero h2'), /Bonjour Wassim <b>/, 'name escaped, not rendered as HTML');
  await shot('08-home-fr');
  await page.click('#nav a[data-route="workout"]');
  await page.waitForSelector('.schedule');
  assert.match(await page.textContent('#view'), /Séance A/);
  await page.click('#nav a[data-route="meals"]');
  await page.waitForSelector('.meals');
  assert.match(await page.textContent('#view'), /Petit-déjeuner/);
  step('French LTR across screens, profile save, HTML escaping');

  // export / import / clear
  await page.click('#settings-link');
  await page.waitForSelector('#exp-photos');
  await page.check('#exp-photos');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="export"]')]);
  const backup = JSON.parse(await fs.readFile(await dl.path(), 'utf8'));
  assert.equal(backup.app, 'wassim-body-coach');
  assert.equal(backup.data.measurements.length, 3);
  assert.equal(backup.photos.length, 1);
  await page.click('[data-action="clear"]');
  await page.waitForTimeout(100);
  assert.equal(await page.getAttribute('html', 'dir'), 'rtl', 'reset returns to Arabic');
  await page.setInputFiles('#imp-file', { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await page.waitForTimeout(300);
  assert.equal(await page.getAttribute('html', 'lang'), 'fr', 'import restores language');
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('wbc:v1')).measurements.length);
  assert.equal(restored, 3);
  step('backup export (with photos), clear all, import restore');

  // 7. PWA: manifest + service worker + offline
  const manifest = await (await page.request.get(`${base}/manifest.webmanifest`)).json();
  assert.ok(manifest.icons.some((i) => i.sizes === '512x512'));
  for (const i of manifest.icons) assert.equal((await page.request.get(`${base}/${i.src}`)).status(), 200, i.src);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.goto(`${base}/index.html#/home`);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForSelector('.plan-card');
  await ctx.setOffline(false);
  step('PWA: manifest icons, service worker, works offline');

  // dark mode screenshot
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${base}/index.html#/progress`);
  await page.waitForSelector('#chart-weight svg');
  await shot('09-progress-dark');

  assert.deepEqual(external, [], `no third-party requests: ${external.join(', ')}`);
  step('no third-party network requests');
  assert.deepEqual(errors, [], `console errors: ${errors.join(' | ')}`);
  step('no console errors');
  console.log('\nAll e2e checks passed.');
} catch (e) {
  console.error('E2E FAILED:', e.message);
  if (errors.length) console.error('Console errors:', errors);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
