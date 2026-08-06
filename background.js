// AccessiScroll — background service worker
// Injects a user-origin stylesheet (wins CSS cascade fights against page
// `!important` rules) that widens/recolors scrollbars, then pokes the actual
// pixel/color values in via CSS custom properties set on <html>.

const DEFAULT_SETTINGS = {
  sizePx: 20,
  thumbColor: "#5b5b5b",
  trackColor: "#e8e8e8",
  radiusPx: 8,
  enabledGlobally: true,
};

// NOTE: deliberately no `scrollbar-color`/`scrollbar-width` rules here. In
// Chrome 121+, setting either standard property to a non-auto value makes the
// browser ignore every `::-webkit-scrollbar-*` rule for that subtree — the
// colors would still apply but the pixel width below would silently stop
// working (scrollbar-width only accepts auto/thin/none, not lengths).
// All rules are gated on <html data-accessiscroll>: chrome.scripting.removeCSS
// silently fails to remove USER-origin stylesheets, so "off" is implemented by
// removing the attribute (rules stop matching) rather than removing the CSS.
const STATIC_CSS = `
html[data-accessiscroll]::-webkit-scrollbar,
html[data-accessiscroll] *::-webkit-scrollbar {
  width: var(--accessiscroll-size, 20px) !important;
  height: var(--accessiscroll-size, 20px) !important;
}
html[data-accessiscroll]::-webkit-scrollbar-thumb,
html[data-accessiscroll] *::-webkit-scrollbar-thumb {
  background-color: var(--accessiscroll-thumb, #5b5b5b) !important;
  border-radius: var(--accessiscroll-radius, 8px) !important;
}
html[data-accessiscroll]::-webkit-scrollbar-track,
html[data-accessiscroll] *::-webkit-scrollbar-track {
  background-color: var(--accessiscroll-track, #e8e8e8) !important;
}
html[data-accessiscroll]::-webkit-scrollbar-corner,
html[data-accessiscroll] *::-webkit-scrollbar-corner {
  background-color: var(--accessiscroll-track, #e8e8e8) !important;
}
`;

const INJECTION = { css: STATIC_CSS, origin: "USER" };

// Tracks each tab's top-level hostname so sub-frame injections (iframes) use
// the *page's* site setting rather than the iframe's own origin.
const frameSiteByTab = new Map();

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function getSettings() {
  const { settings } = await chrome.storage.sync.get("settings");
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

async function getDisabledSites() {
  const { disabledSites } = await chrome.storage.local.get("disabledSites");
  return new Set(disabledSites || []);
}

async function isSiteEnabled(hostname) {
  const settings = await getSettings();
  if (!settings.enabledGlobally) return false;
  if (!hostname) return false;
  const disabled = await getDisabledSites();
  return !disabled.has(hostname);
}

// Runs inside the page. Kept as a standalone function so it can be passed to
// chrome.scripting.executeScript — must not close over outer-scope variables.
function applyVarsInPage(values) {
  const root = document.documentElement;
  const apply = () => {
    root.setAttribute("data-accessiscroll", "");
    root.style.setProperty("--accessiscroll-size", `${values.sizePx}px`);
    root.style.setProperty("--accessiscroll-thumb", values.thumbColor);
    root.style.setProperty("--accessiscroll-track", values.trackColor);
    root.style.setProperty("--accessiscroll-radius", `${values.radiusPx}px`);
  };
  apply();
  // Some sites (e.g. Shopify storefronts) rewrite <html>'s attributes during
  // hydration, wiping the variables and the gate attribute — watch and
  // restore them.
  window.__accessiscrollObserver?.disconnect();
  const observer = new MutationObserver(() => {
    if (
      !root.style.getPropertyValue("--accessiscroll-size") ||
      !root.hasAttribute("data-accessiscroll")
    ) {
      apply();
    }
  });
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["style", "data-accessiscroll"],
  });
  window.__accessiscrollObserver = observer;
}

function clearVarsInPage() {
  window.__accessiscrollObserver?.disconnect();
  delete window.__accessiscrollObserver;
  window.__accessiscrollInjected = false;
  const root = document.documentElement;
  root.removeAttribute("data-accessiscroll");
  root.style.removeProperty("--accessiscroll-size");
  root.style.removeProperty("--accessiscroll-thumb");
  root.style.removeProperty("--accessiscroll-track");
  root.style.removeProperty("--accessiscroll-radius");
}

async function injectIntoFrame(tabId, frameId, settings) {
  try {
    // One CSS injection per document: this runs on several navigation events
    // per frame (see handleNavigation) and injected stylesheets stack, so
    // each unguarded insertCSS would need its own removeCSS to undo. The
    // flag lives in the extension's isolated world, which is reset whenever
    // the document is replaced — exactly when re-injection is needed. The
    // check-and-set is a single script call, so concurrent events can't both
    // see "not injected".
    const [{ result: alreadyInjected } = {}] = await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      func: () => {
        const was = window.__accessiscrollInjected === true;
        window.__accessiscrollInjected = true;
        return was;
      },
    });
    if (!alreadyInjected) {
      await chrome.scripting.insertCSS({
        target: { tabId, frameIds: [frameId] },
        ...INJECTION,
      });
    }
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      func: applyVarsInPage,
      args: [settings],
    });
  } catch (err) {
    // Frame may be a chrome:// page, PDF viewer, or already gone — ignore.
  }
}

async function removeFromFrame(tabId, frameId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      func: clearVarsInPage,
    });
    await chrome.scripting.removeCSS({
      target: { tabId, frameIds: [frameId] },
      ...INJECTION,
    });
  } catch (err) {
    // Ignore — frame may not have had CSS injected (e.g. restricted page).
  }
}

// Fires once per frame per navigation (main frame and every iframe).
async function handleNavigation(details) {
  const { tabId, frameId, url } = details;
  if (frameId === 0) {
    frameSiteByTab.set(tabId, hostnameFromUrl(url));
  }
  const siteHostname = frameSiteByTab.get(tabId) ?? hostnameFromUrl(url);

  const enabled = await isSiteEnabled(siteHostname);
  if (!enabled) return;

  const settings = await getSettings();
  await injectIntoFrame(tabId, frameId, settings);
}

// Inject at onCommitted so styling lands as early as possible, then again at
// onDOMContentLoaded/onCompleted: some sites (e.g. Shopify storefronts)
// replace the committed document while loading, which silently discards the
// first injection. Re-injecting is idempotent.
chrome.webNavigation.onCommitted.addListener(handleNavigation);
chrome.webNavigation.onDOMContentLoaded.addListener(handleNavigation);
chrome.webNavigation.onCompleted.addListener(handleNavigation);

chrome.tabs.onRemoved.addListener((tabId) => {
  frameSiteByTab.delete(tabId);
});

async function getAllFrameIds(tabId) {
  const frames = await chrome.webNavigation.getAllFrames({ tabId });
  return (frames || []).map((f) => f.frameId);
}

// Applies (or, if the effective enabled state is now false, removes) styling
// on the active tab. Used whenever settings change so the currently open tab
// reflects the new state immediately, not just future navigations.
async function applyToActiveTab(settings) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  const hostname = frameSiteByTab.get(tab.id) ?? hostnameFromUrl(tab.url);
  const frameIds = await getAllFrameIds(tab.id);
  if (await isSiteEnabled(hostname)) {
    await Promise.all(frameIds.map((frameId) => injectIntoFrame(tab.id, frameId, settings)));
  } else {
    await Promise.all(frameIds.map((frameId) => removeFromFrame(tab.id, frameId)));
  }
}

async function toggleActiveTabSite(forceEnabled) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;
  const hostname = frameSiteByTab.get(tab.id) ?? hostnameFromUrl(tab.url);
  if (!hostname) return null;

  const disabled = await getDisabledSites();
  const shouldEnable = forceEnabled ?? disabled.has(hostname);

  if (shouldEnable) {
    disabled.delete(hostname);
  } else {
    disabled.add(hostname);
  }
  await chrome.storage.local.set({ disabledSites: [...disabled] });

  const frameIds = await getAllFrameIds(tab.id);
  if (shouldEnable) {
    const settings = await getSettings();
    await Promise.all(frameIds.map((frameId) => injectIntoFrame(tab.id, frameId, settings)));
  } else {
    await Promise.all(frameIds.map((frameId) => removeFromFrame(tab.id, frameId)));
  }
  return { hostname, enabled: shouldEnable };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    switch (message?.type) {
      case "getPopupState": {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const hostname = tab?.id ? frameSiteByTab.get(tab.id) ?? hostnameFromUrl(tab.url) : null;
        const settings = await getSettings();
        const disabled = await getDisabledSites();
        sendResponse({
          hostname,
          settings,
          siteEnabled: hostname ? !disabled.has(hostname) : false,
        });
        break;
      }
      case "updateSettings": {
        const current = await getSettings();
        const next = { ...current, ...message.patch };
        await chrome.storage.sync.set({ settings: next });
        await applyToActiveTab(next);
        sendResponse({ ok: true, settings: next });
        break;
      }
      case "toggleSiteForActiveTab": {
        const result = await toggleActiveTabSite(message.forceEnabled);
        sendResponse({ ok: true, result });
        break;
      }
      case "getDisabledSites": {
        const disabled = await getDisabledSites();
        sendResponse({ disabledSites: [...disabled].sort() });
        break;
      }
      case "removeDisabledSite": {
        const disabled = await getDisabledSites();
        disabled.delete(message.hostname);
        await chrome.storage.local.set({ disabledSites: [...disabled] });
        sendResponse({ ok: true });
        break;
      }
      case "resetSettings": {
        await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
        await chrome.storage.local.set({ disabledSites: [] });
        await applyToActiveTab(DEFAULT_SETTINGS);
        sendResponse({ ok: true, settings: DEFAULT_SETTINGS });
        break;
      }
      default:
        sendResponse({ ok: false, error: "unknown message type" });
    }
  })();
  return true; // keep the message channel open for the async response
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-site") {
    await toggleActiveTabSite();
  }
});
