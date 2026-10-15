// Smoke test: loads the unpacked extension in Chromium, serves the fixture in
// place of https://x.com/home, and checks the swaps, that page click handlers
// still fire, and that toggling off restores everything without a reload.
const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert/strict');
const { chromium } = require('playwright');

const EXT = path.resolve(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture/home.html'), 'utf8');

(async () => {
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'tw-')), {
    channel: 'chromium', // the headless shell can't load extensions
    headless: true,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`]
  });
  await ctx.route('https://x.com/**', (r) => r.fulfill({ contentType: 'text/html', body: FIXTURE }));
  await ctx.route('https://abs.twimg.com/**', (r) => r.fulfill({ status: 204 }));
  const page = await ctx.newPage();
  await page.goto('https://x.com/home');
  await page.waitForSelector('#late-label');
  await page.waitForTimeout(300);

  const text = (sel) => page.locator(sel).textContent();
  const state = () => page.evaluate(() => ({
    cls: document.documentElement.className,
    title: document.title,
    favicon: document.querySelector('link[rel~="icon"]').getAttribute('href'),
    logoBg: getComputedStyle(document.getElementById('logo')).backgroundImage,
    sideBg: getComputedStyle(document.getElementById('side-post')).backgroundColor,
    linkColor: getComputedStyle(document.getElementById('link')).color,
    font: getComputedStyle(document.body).fontFamily
  }));

  // Swaps on
  let s = await state();
  assert.match(s.cls, /tw-logo/); assert.match(s.cls, /tw-colors/); assert.match(s.cls, /tw-font/);
  assert.equal(s.title, 'Home / Twitter');
  assert.match(s.favicon, /^chrome-extension:\/\/.+\/assets\/logo\.svg$/);
  assert.match(s.logoBg, /assets\/logo\.svg/);
  assert.equal(s.sideBg, 'rgb(29, 161, 242)');
  assert.equal(s.linkColor, 'rgb(29, 161, 242)');
  assert.match(s.font, /Helvetica Neue/);
  assert.equal(await text('#side-post-label'), 'Tweet');
  assert.equal(await text('#inline-label'), 'Tweet');
  assert.equal(await text('#rt-label'), 'Retweet');
  assert.equal(await text('#late-label'), 'Retweeted');
  assert.equal(await text('#count'), '1,234 Tweets');
  // User content untouched
  assert.equal(await text('#tweet'), 'Post');
  assert.equal(await text('#display-name'), 'Post');
  assert.equal(await text('#composer'), 'Post');

  // Page click handlers still fire
  for (const id of ['side-post', 'inline-post', 'rt', 'notif-link', 'link']) await page.click('#' + id);
  assert.equal(await page.evaluate(() => window.clicks), 5);

  // Toggle off from the popup page; everything reverts without a reload
  const extId = s.favicon.split('/')[2];
  const popup = await ctx.newPage();
  await popup.goto(`chrome-extension://${extId}/popup/popup.html`);
  await popup.uncheck('input[data-key="enabled"]');
  await page.waitForTimeout(300);
  s = await state();
  assert.doesNotMatch(s.cls, /tw-/);
  assert.equal(s.title, 'Home / X');
  assert.equal(s.favicon, '//abs.twimg.com/favicons/twitter.3.ico');
  assert.equal(s.sideBg, 'rgb(15, 20, 25)');
  assert.equal(await text('#side-post-label'), 'Post');
  assert.equal(await text('#late-label'), 'Reposted');
  assert.equal(await text('#count'), '1,234 posts');

  // And back on
  await popup.check('input[data-key="enabled"]');
  await page.waitForTimeout(300);
  assert.equal(await text('#rt-label'), 'Retweet');
  assert.equal((await state()).title, 'Home / Twitter');

  await ctx.close();
  console.log('smoke test passed');
})().catch((e) => { console.error(e); process.exit(1); });
