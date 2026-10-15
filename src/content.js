// Twitter Rebrand content script. Cosmetic only: it toggles classes on <html>,
// edits nodeValue of allowlisted UI-label text nodes, the document title and
// the favicon href. It never adds, removes or moves nodes the page owns.
(() => {
  'use strict';

  // ---- Selectors and word lists (update here when x.com changes markup) ----
  // Text inside these is user content or input and is never rewritten.
  const SKIP = [
    '[data-testid="tweetText"]', '[data-testid="User-Name"]', '[data-testid="UserName"]',
    '[data-testid="UserDescription"]', '[contenteditable]', '[role="textbox"]',
    'input', 'textarea', 'script', 'style', 'div[lang]', 'span[lang]'
  ].join(',');
  const FAVICON = 'link[rel~="icon"]';

  // Exact-match UI labels.
  const LABELS = new Map([
    ['X', 'Twitter'],
    ['Post', 'Tweet'], ['Posts', 'Tweets'], ['Post all', 'Tweet all'],
    ['Repost', 'Retweet'], ['Reposts', 'Retweets'], ['Reposted', 'Retweeted'],
    ['Undo repost', 'Undo Retweet'], ['You reposted', 'You Retweeted'],
    ['Quote', 'Quote Tweet'], ['Quotes', 'Quote Tweets']
  ]);
  // Whole-string patterns for labels with counts, e.g. "12.3K posts".
  const PATTERNS = [
    [/^([\d.,]+[KMB]?) posts?$/, (_, n) => `${n} ${n === '1' ? 'Tweet' : 'Tweets'}`],
    [/^Show ([\d.,]+[KMB]?) posts?$/, (_, n) => `Show ${n} ${n === '1' ? 'Tweet' : 'Tweets'}`]
  ];

  const DEFAULTS = { enabled: true, logo: true, text: true, colors: true, font: true };
  const root = document.documentElement;
  let settings = { ...DEFAULTS };

  // ---- Text labels ----
  const swapped = new Map(); // text node -> { from, to }

  function translate(value) {
    if (LABELS.has(value)) return LABELS.get(value);
    for (const [re, fn] of PATTERNS) if (re.test(value)) return value.replace(re, fn);
    return null;
  }

  function swapTextNode(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest(SKIP)) return;
    const to = translate(node.nodeValue);
    if (to === null) return;
    swapped.set(node, { from: node.nodeValue, to });
    node.nodeValue = to;
  }

  function swapTextIn(start) {
    if (start.nodeType === Node.TEXT_NODE) return swapTextNode(start);
    if (start.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) swapTextNode(n);
  }

  function restoreText() {
    for (const [node, { from, to }] of swapped) {
      if (node.nodeValue === to) node.nodeValue = from; // page may have changed it since
    }
    swapped.clear();
  }

  function pruneSwapped() {
    for (const node of swapped.keys()) if (!node.isConnected) swapped.delete(node);
  }

  // ---- Title ----
  let titleFrom = null, titleTo = null;
  function swapTitle() {
    const t = document.title;
    if (t === titleTo) return;
    const to = t.replace(/ on X: /, ' on Twitter: ').replace(/ \/ X$/, ' / Twitter').replace(/^X$/, 'Twitter');
    if (to === t) return;
    titleFrom = t; titleTo = to;
    document.title = to;
  }
  function restoreTitle() {
    if (titleTo !== null && document.title === titleTo) document.title = titleFrom;
    titleFrom = titleTo = null;
  }

  // ---- Favicon ----
  function swapFavicon() {
    for (const link of document.querySelectorAll(FAVICON)) {
      if (link.dataset.twOrigHref !== undefined) continue;
      link.dataset.twOrigHref = link.getAttribute('href') || '';
      link.href = chrome.runtime.getURL('assets/logo.svg');
    }
  }
  function restoreFavicon() {
    for (const link of document.querySelectorAll(FAVICON)) {
      if (link.dataset.twOrigHref === undefined) continue;
      link.setAttribute('href', link.dataset.twOrigHref);
      delete link.dataset.twOrigHref;
    }
  }

  // ---- Apply / batch ----
  const on = (key) => settings.enabled && settings[key];

  function applyAll() {
    root.classList.toggle('tw-logo', on('logo'));
    root.classList.toggle('tw-colors', on('colors'));
    root.classList.toggle('tw-font', on('font'));
    if (on('logo')) swapFavicon(); else restoreFavicon();
    if (on('text')) { swapTitle(); if (document.body) swapTextIn(document.body); }
    else { restoreTitle(); restoreText(); }
  }

  let pending = new Set(), scheduled = false, headDirty = false;
  function flush() {
    scheduled = false;
    const nodes = pending; pending = new Set();
    if (on('text')) {
      swapTitle();
      for (const n of nodes) if (n.isConnected) swapTextIn(n);
      pruneSwapped();
    }
    if (headDirty && on('logo')) swapFavicon();
    headDirty = false;
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') pending.add(m.target);
      else for (const n of m.addedNodes) pending.add(n);
      if (m.target === document.head || m.target.parentNode === document.head) headDirty = true;
    }
    if (!scheduled) { scheduled = true; requestAnimationFrame(flush); }
  });
  observer.observe(root, { childList: true, subtree: true, characterData: true });

  chrome.storage.local.get(DEFAULTS, (stored) => {
    settings = { ...DEFAULTS, ...stored };
    applyAll();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyAll, { once: true });
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const [k, { newValue }] of Object.entries(changes)) if (k in DEFAULTS) settings[k] = newValue ?? DEFAULTS[k];
    applyAll();
  });
})();
