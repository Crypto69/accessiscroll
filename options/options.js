const siteList = document.getElementById("site-list");
const emptyMsg = document.getElementById("empty-msg");
const resetBtn = document.getElementById("reset-btn");
const status = document.getElementById("status");

function announce(text) {
  status.textContent = text;
}

async function renderSiteList() {
  const { disabledSites } = await chrome.runtime.sendMessage({ type: "getDisabledSites" });

  siteList.innerHTML = "";
  emptyMsg.hidden = disabledSites.length > 0;

  for (const hostname of disabledSites) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = hostname;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "re-enable-btn";
    btn.textContent = "Re-enable";
    btn.setAttribute("aria-label", `Re-enable AccessiScroll on ${hostname}`);
    btn.addEventListener("click", async () => {
      await chrome.runtime.sendMessage({ type: "removeDisabledSite", hostname });
      announce(`Re-enabled on ${hostname}`);
      await renderSiteList();
    });

    li.append(label, btn);
    siteList.append(li);
  }
}

resetBtn.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "resetSettings" });
  announce("All settings reset to defaults");
  await renderSiteList();
});

renderSiteList();
