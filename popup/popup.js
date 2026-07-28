const sizeSlider = document.getElementById("size-slider");
const sizeValue = document.getElementById("size-value");
const thumbColor = document.getElementById("thumb-color");
const trackColor = document.getElementById("track-color");
const siteToggle = document.getElementById("site-toggle");
const siteToggleText = document.getElementById("site-toggle-text");
const globalToggle = document.getElementById("global-toggle");
const resetBtn = document.getElementById("reset-btn");
const optionsBtn = document.getElementById("options-btn");
const status = document.getElementById("status");

function send(message) {
  return chrome.runtime.sendMessage(message);
}

function setSwitch(button, checked) {
  button.setAttribute("aria-checked", String(checked));
}

function announce(text) {
  status.textContent = text;
}

async function init() {
  const state = await send({ type: "getPopupState" });
  const { hostname, settings, siteEnabled } = state;

  sizeSlider.value = settings.sizePx;
  sizeValue.textContent = settings.sizePx;
  thumbColor.value = settings.thumbColor;
  trackColor.value = settings.trackColor;
  setSwitch(globalToggle, settings.enabledGlobally);
  setSwitch(siteToggle, siteEnabled);

  if (hostname) {
    siteToggleText.textContent = `Wide scrollbars on ${hostname}`;
  } else {
    siteToggleText.textContent = "Wide scrollbars on this site";
    siteToggle.disabled = true;
    siteToggle.title = "Not available on this page";
  }
}

sizeSlider.addEventListener("input", () => {
  sizeValue.textContent = sizeSlider.value;
});

sizeSlider.addEventListener("change", async () => {
  await send({ type: "updateSettings", patch: { sizePx: Number(sizeSlider.value) } });
  announce(`Scrollbar size set to ${sizeSlider.value}px`);
});

thumbColor.addEventListener("input", async () => {
  await send({ type: "updateSettings", patch: { thumbColor: thumbColor.value } });
});

trackColor.addEventListener("input", async () => {
  await send({ type: "updateSettings", patch: { trackColor: trackColor.value } });
});

siteToggle.addEventListener("click", async () => {
  const response = await send({ type: "toggleSiteForActiveTab" });
  if (response?.result) {
    setSwitch(siteToggle, response.result.enabled);
    announce(response.result.enabled ? "Enabled on this site" : "Disabled on this site");
  }
});

globalToggle.addEventListener("click", async () => {
  const next = globalToggle.getAttribute("aria-checked") !== "true";
  setSwitch(globalToggle, next);
  await send({ type: "updateSettings", patch: { enabledGlobally: next } });
  announce(next ? "Enabled on all sites" : "Disabled on all sites");
});

resetBtn.addEventListener("click", async () => {
  await send({ type: "resetSettings" });
  announce("Settings reset to defaults");
  await init();
});

optionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

init();
