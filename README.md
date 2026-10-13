# Twitter Rebrand

A Chrome extension (Manifest V3) that restores the classic Twitter look on x.com — bird logo, "Twitter" name, classic blue — purely cosmetic and client-side.

**Status:** planning. No code yet.

- Project brief: [docs/BRIEF.md](docs/BRIEF.md)
- Working notes for Claude Code: [CLAUDE.md](CLAUDE.md)

## Planned layout

```
manifest.json      MV3 manifest, content script on x.com
src/content.js     MutationObserver + logo/text/title swaps
src/styles.css     color and font overrides
popup/             on/off toggle and per-feature settings
assets/            logo + favicon (bring your own, see below)
icons/             toolbar icons
```

## Logo asset

The classic bird is a trademarked logo, so this repo won't ship a copy. Add your own file at `assets/logo.svg` (and `assets/favicon.png`) for personal use.
