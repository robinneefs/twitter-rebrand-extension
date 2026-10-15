# CLAUDE.md

Project memory for Claude Code. The full brief is in `docs/BRIEF.md` — read it before starting work.

## What this is

A Manifest V3 Chrome extension that restores classic Twitter branding on x.com: logo, "Twitter" name in titles and UI labels, classic blue (`#1DA1F2`), optional classic font, and a popup toggle with settings in `chrome.storage.local`.

## Hard rules

- **Cosmetic only.** Touch logos, text labels, colors and fonts — nothing else. Posting, scrolling, notifications, links and all page JavaScript must keep working exactly as before.
- Don't add, remove or move DOM nodes that x.com's React app owns. Prefer: classes on `<html>` + CSS, data attributes, and editing `nodeValue` of existing text nodes.
- Never rewrite user content: tweet text, names, bios, the composer, inputs. Only rewrite an allowlist of UI labels, by exact match.
- Every change must be reversible when the user toggles a feature off, without a reload.
- No background script, no network requests, no remote code. Permissions: `storage` only, plus the x.com content-script match.
- The bird logo at `assets/logo.svg` was supplied by the repo owner, who chose to commit it (2026-10-15).

## Approach

- One content script at `document_start` with a `MutationObserver` on `<html>`; batch work into one pass per animation frame (x.com is an SPA and mutates constantly).
- Keep selectors narrow and grouped at the top of `content.js` so they're easy to update when x.com changes its markup.

## Testing

- After each change, verify nothing is broken: load unpacked in Chrome (`chrome://extensions` → Developer mode → Load unpacked) and check posting, scrolling, links and notifications on x.com.
- Plan an automated smoke test (Playwright, extension loaded, a local fixture served in place of x.com) that checks both the swaps and that page click handlers still fire.

## Status

First version built (manifest, `src/`, `popup/`, smoke test in `test/`). Live x.com selectors still need checking in Chrome.
