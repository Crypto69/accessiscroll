<p align="center">
  <img src="icons/logo.png" alt="AccessiScroll logo" width="360">
</p>

# AccessiScroll

Widens and recolors scrollbars on every site, so they're easy to see and grab
regardless of what pointing device you use.

**[Install AccessiScroll from the Chrome Web Store](https://chromewebstore.google.com/detail/accessiscroll/keailjpjmnipfpkkbldeknakkggjofji)**

## Why I built this

I rely on a gyroscopic mouse to use my computer. On more and more of the modern
web, that's a problem: scrollbars are styled to be razor-thin, only appear on
hover, or are hidden completely. Websites today seem to be designed on the
assumption that everyone scrolls with a mouse wheel or a trackpad flick — and
if you can't, you're left trying to land a pointer on a 4-pixel sliver of a
scrollbar (if there's one at all).

For people with motor disabilities, that tiny target isn't a minor annoyance —
it can make a site effectively unusable. Fitts's law is unforgiving: the
smaller the target, the harder and slower it is to hit, and tremor or limited
fine motor control multiplies that cost.

I couldn't find an extension that reliably fixed this on every site — many
sites deliberately override scrollbar styling with `!important` rules that
defeat ordinary CSS injection — so I built one. AccessiScroll gives you back a
big, visible, grabbable scrollbar on any site you choose, in whatever size and
colors work for your eyes and your hands.

This project is part of my broader work on accessibility at
[myaccessibility.ai](https://myaccessibility.ai/). You can also find me on
[LinkedIn](https://www.linkedin.com/in/chris-venter/),
[Instagram](https://www.instagram.com/myaccessibility) and
[YouTube](https://www.youtube.com/@myacessibility).

## Install

The easiest way is from the Chrome Web Store:

**https://chromewebstore.google.com/detail/accessiscroll/keailjpjmnipfpkkbldeknakkggjofji**

Click **Add to Chrome**, then pin the extension (puzzle-piece icon in the
toolbar → pin AccessiScroll) so it's always one click away.

### Install unpacked (for development)

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
scrollbar with `!important`. It styles the `::-webkit-scrollbar`
pseudo-elements with your chosen pixel width and colors. The standard CSS
`scrollbar-width`/`scrollbar-color` properties are deliberately *not* used:
`scrollbar-width` can't express pixel sizes (only `auto`/`thin`/`none`), and in
Chrome 121+ setting either standard property causes the browser to ignore all
`::-webkit-scrollbar-*` rules — which would silently break the width control.

## Known limitations

- Sites that fake scrolling entirely with JS/canvas (no real native scrollbar)
  can't be styled this way — there's nothing for CSS to target.
- On slow-loading pages you may briefly see the page's original scrollbar
  before AccessiScroll applies, since injection happens right after
  navigation rather than before first paint.
