# AccessiScroll Privacy Policy

_Last updated: 1 August 2026_

AccessiScroll is a free accessibility extension that makes page scrollbars
larger and higher-contrast so they are easier to see and grab.

## The short version

**AccessiScroll does not collect, transmit, sell, or share any data. Ever.**

## What the extension stores

AccessiScroll keeps only its own settings:

- Your scrollbar preferences (size, thumb color, track color, on/off state).
  These are saved with Chrome's `storage.sync` so they follow your Chrome
  profile between your own devices, using Google's built-in sync — the
  extension itself sends nothing anywhere.
- The list of sites where you have switched AccessiScroll off. This is saved
  with Chrome's `storage.local` and never leaves your computer.

That is the complete list. There are no analytics, no telemetry, no ads, no
third-party services, and no servers of ours involved — the extension makes no
network requests at all.

## Why the extension asks for broad permissions

- **Access to all websites** (`<all_urls>`) — the whole point of the extension
  is to fix scrollbars automatically on every site you visit, so it must be
  able to apply its styling everywhere. It only injects scrollbar CSS; it does
  not read or record page content.
- **`scripting`** — used to inject the scrollbar stylesheet and set its
  size/color values on the page.
- **`webNavigation`** — used to know when a page or frame has loaded so the
  scrollbar styling can be applied. Navigation events are acted on immediately
  and never recorded.
- **`storage`** — used to remember your preferences, as described above.

## Changes and contact

If this policy ever changes, the updated version will be posted at this same
address with a new date. Questions: contact Chris Venter at
[myaccessibility.ai](https://myaccessibility.ai/) or via the project page at
[github.com/Crypto69/accessiscroll](https://github.com/Crypto69/accessiscroll).
