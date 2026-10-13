# Twitter Rebrand Chrome Extension — Brief

_Source: project brief by Robin Neefs, 2026-10-13._

## Overview

X (formerly Twitter) rebranded its logo and name in 2023, but many users prefer the old look. This Chrome extension restores the classic Twitter branding while browsing x.com: the bird logo, the "Twitter" name in page titles and UI text, and the original blue color scheme, all purely cosmetic and client-side.

## Features

- Swap the X logo for the classic Twitter bird across the site (header, favicon, tab title)
- Replace "X" with "Twitter" in visible UI text and page titles
- Restore the original Twitter blue color palette in place of X's black-and-white theme
- Optional: revert font choices closer to the old Twitter look
- Toggle on/off via the extension icon, with settings saved per-browser

## Technical approach

A Manifest V3 Chrome extension using a content script injected on x.com. The content script runs a MutationObserver to catch dynamically loaded elements (X is a single-page app, so content updates without full page reloads) and swaps the logo SVG, replaces text nodes containing "X" branding with "Twitter", and injects a CSS stylesheet overriding the color variables.

Key files: `manifest.json` (permissions, content script matching x.com), `content.js` (DOM manipulation and observer logic), `styles.css` (color overrides), and icon assets for the Twitter bird logo. No background script or external API calls needed since everything happens client-side in the page.

> **Important:** all changes must be purely cosmetic. The extension should only touch visual elements (logos, text labels, colors, fonts) and never interfere with X's underlying functionality — posting, scrolling, notifications, links, and any JavaScript behavior must keep working exactly as before. Test thoroughly after each change to confirm nothing is broken.

## Next steps

- [ ] Find or recreate the classic Twitter bird logo asset (SVG/PNG)
- [ ] Scaffold the extension: manifest.json + basic content script
- [ ] Identify the DOM selectors X currently uses for logo, title text, and theme colors
- [ ] Build and test the MutationObserver-based swap logic
- [ ] Package and load unpacked in Chrome for local testing
