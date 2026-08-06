# Chrome Web Store submission — everything to paste into the dashboard

All the text the [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
asks for, plus the account checklist. Fields appear in the order the dashboard
presents them.

---

## Account checklist (one-time)

1. Publish `privacy-policy.md` on myaccessibility.ai (e.g.
   `https://myaccessibility.ai/accessiscroll-privacy`) and note the URL.
2. Register at the Developer Dashboard — one-time **US$5** fee.
3. Enable **2-Step Verification** on the Google account (required to publish).
4. Verify the contact email when prompted.
5. In Account → EU Digital Services Act, declare **Non-Trader**
   (free, non-commercial extension — no address/phone verification needed).

Then: **Add new item** → upload `dist/accessiscroll-1.0.0.zip` (built by
`scripts/package.sh`).

---

## Store listing tab

**Title:** AccessiScroll *(from manifest)*

**Summary:** Widens and recolors scrollbars on every site so they're easy to
see and grab, no matter what input device you use. *(from manifest)*

**Category:** Accessibility
**Language:** English

**Detailed description:**

```
Modern websites hide their scrollbars: razor-thin, only visible on hover, or
gone entirely. If you scroll with a mouse wheel or trackpad flick you may never
notice. If you can't — because you use a gyroscopic mouse, a head pointer, a
trackball, or you have tremor or limited fine motor control — a 4-pixel
scrollbar can make a site effectively unusable. The smaller the target, the
harder it is to hit.

AccessiScroll gives you back a big, visible, grabbable scrollbar on every
site, in whatever size and colors work for your eyes and your hands.

WHAT IT DOES
• Widens scrollbars to any size from 12 to 32 pixels, on every site you visit.
• Lets you pick high-contrast thumb and track colors that suit your vision.
• Wins against sites that deliberately hide or thin their scrollbars — it
  injects styling at the browser's user-stylesheet level, which overrides even
  the "!important" rules many sites use.
• Applies instantly to the page you're on, and remembers your settings
  everywhere else.

STAYS OUT OF YOUR WAY
• Per-site off switch: if AccessiScroll ever clashes with a site's own
  interface, turn it off for just that site from the popup — it stays off
  there until you say otherwise.
• Global on/off switch and a keyboard shortcut (Alt+Shift+S, rebindable) to
  toggle the current site without clicking anything.
• Options page to review and manage the sites you've disabled.

PRIVATE BY DESIGN
AccessiScroll collects nothing. No analytics, no tracking, no network
requests. Your preferences are stored by Chrome itself and never leave your
browser. Privacy policy: https://myaccessibility.ai/accessiscroll-privacy

KNOWN LIMITATIONS
Sites that fake scrolling entirely with JavaScript or canvas (no real native
scrollbar) can't be styled — there's nothing for CSS to target. On slow pages
you may briefly see the original scrollbar before AccessiScroll applies.

Built by Chris Venter as part of ongoing accessibility work at
https://myaccessibility.ai — because scrolling shouldn't require perfect aim.
```

**Graphic assets:**
- Store icon: taken from the package (`icons/icon128.png`, 96×96 artwork with
  16 px transparent padding — already store-spec).
- Screenshots (1280×800, upload in this order):
  `store-assets/screenshot-1-before-after.png` (before/after comparison),
  `screenshot-2-popup.png` (popup over a live page),
  `screenshot-3-options.png` (options page),
  `screenshot-4-page.png` (widened scrollbar in context).
- Small promo tile (440×280): `store-assets/promo-small-440x280.png`.
- Marquee promo tile (1400×560, no alpha): `store-assets/promo-marquee-1400x560.png`
  — optional; used only if the store features the extension, but uploading it
  makes featuring possible.

**Additional fields:** Homepage URL `https://github.com/Crypto69/accessiscroll`;
support URL — GitHub issues page.

---

## Privacy practices tab

**Single purpose description:**

```
AccessiScroll makes page scrollbars larger and higher-contrast so they are
easier to see and grab, for users with motor or vision impairments. It injects
scrollbar styling into pages; it has no other function.
```

**Permission justifications:**

- `host permissions (<all_urls>)`:

  ```
  The extension's sole purpose is to make scrollbars accessible on every site
  the user visits, automatically. Broken/hidden scrollbars are the default on
  much of the web, so per-site opt-in (e.g. activeTab) would defeat the
  accessibility purpose: users with motor impairments would have to hit a tiny
  toolbar target on every page precisely because they cannot hit small
  targets. The extension only injects scrollbar CSS; it does not read or
  collect page content.
  ```

- `scripting`:

  ```
  Used solely to inject a static scrollbar stylesheet
  (chrome.scripting.insertCSS with origin "USER") and to set four CSS custom
  properties (scrollbar size and colors) on the page's root element via
  chrome.scripting.executeScript. No page content is read or modified beyond
  scrollbar styling.
  ```

- `webNavigation`:

  ```
  Used to detect when a page or iframe finishes navigating so scrollbar CSS
  can be re-applied to each new document. User-origin CSS (the only mechanism
  that overrides sites' "!important" scrollbar-hiding rules) cannot be
  declared in a static content script — it must be injected programmatically
  per navigation and per frame, which requires navigation events. Events are
  acted on immediately; no browsing history is recorded or transmitted.
  ```

- `storage`:

  ```
  Stores the user's scrollbar preferences (size, colors, on/off) in
  chrome.storage.sync and the user's list of disabled sites in
  chrome.storage.local. Nothing is transmitted to the developer or any third
  party.
  ```

**Remote code:** No, I am not using remote code.

**Data usage:** check **no** data types collected. Certify all three
statements (no sale to third parties; no use/transfer unrelated to the single
purpose; no use/transfer for creditworthiness/lending).

**Privacy policy URL:** `https://myaccessibility.ai/accessiscroll-privacy`
*(update if published at a different path)*

---

## Distribution tab

- Visibility: **Public**
- Distribution: all regions
- Free, no in-app purchases

---

## After submitting

New account + `<all_urls>` + `scripting` means the in-depth review queue:
typically a few days, occasionally up to ~3 weeks (contact support after 3).
Once approved you have 30 days to publish. Don't edit the item while a review
is pending — it restarts the review.
