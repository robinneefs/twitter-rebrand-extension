# Twitter Rebrand

A Chrome extension (Manifest V3) that restores the classic Twitter look on x.com — bird logo, "Twitter" name, classic blue — purely cosmetic and client-side.

**Status:** first working version. Load it unpacked and test on x.com.

- Project brief: [docs/BRIEF.md](docs/BRIEF.md)
- Working notes for Claude Code: [CLAUDE.md](CLAUDE.md)

## Layout

```
manifest.json      MV3 manifest, content script on x.com
src/content.js     MutationObserver + logo/text/title swaps
src/styles.css     color and font overrides
popup/             on/off toggle and per-feature settings
assets/            logo (bring your own, see below)
test/              Playwright smoke test against a local fixture
```

## Logo asset

The classic bird is a trademarked logo, so this repo won't ship a copy. Add your own file at `assets/logo.svg` for personal use (it is git-ignored). It is used for both the header logo and the tab favicon.

## Install

1. Put your logo at `assets/logo.svg`.
2. Open `chrome://extensions`, turn on Developer mode, click **Load unpacked** and pick this folder.
3. Use the toolbar popup to turn the whole thing, or each feature, on and off. Changes apply instantly.

## Test

`npm install && npm test` loads the extension in Chromium, serves `test/fixture/home.html` in place of x.com, and checks the swaps, that page click handlers still fire, and that turning it off reverts everything.
