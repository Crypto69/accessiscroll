# AccessiScroll

Widens and recolors scrollbars on every site, so they're easy to see and grab
regardless of what pointing device you use.

## Install (unpacked, for personal use)

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select this `accessiscroll` folder.
4. Pin the extension (puzzle-piece icon in the toolbar → pin AccessiScroll) so
   it's always one click away.

## Using it

- Click the toolbar icon to open the popup: a size slider (12–32px), thumb/track
  color pickers, a per-site on/off switch, and a global on/off switch.
- Changes apply instantly to the page you're currently viewing, and are
  remembered for every site you visit afterward.
- If AccessiScroll ever clashes with a specific site's own UI, turn it off for
  that site from the popup — it'll stay off there until you turn it back on
  (from the popup, or **Manage disabled sites** in the options page).
- Keyboard shortcut `Alt+Shift+S` toggles AccessiScroll on/off for the current
  site without needing to click anything. You can rebind it at
  `chrome://extensions/shortcuts`.

## How it works (short version)

Scrollbar CSS is injected as a *user-origin* stylesheet
(`chrome.scripting.insertCSS` with `origin: "USER"`), which is the one
mechanism guaranteed to win cascade fights against sites that hide/thin their
scrollbar with `!important`. It forces `scrollbar-width: auto` (to defeat
`thin`/`none`) and sets the legacy `::-webkit-scrollbar` pseudo-elements to
your chosen pixel width and colors, since the standard CSS scrollbar
properties don't support arbitrary widths.

## Known limitations

- Sites that fake scrolling entirely with JS/canvas (no real native scrollbar)
  can't be styled this way — there's nothing for CSS to target.
- On slow-loading pages you may briefly see the page's original scrollbar
  before AccessiScroll applies, since injection happens right after
  navigation rather than before first paint.
