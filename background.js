let enabled = true; 

chrome.storage.sync.get(["enabled", "blockedUrls"], (data) => {
    if (data.enabled !== undefined) enabled = data.enabled;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!enabled || !changeInfo.url) return;

    chrome.storage.sync.get("blockedUrls", (data) => {
        let blockedUrls = data.blockedUrls || [];
        if (blockedUrls.some(url => changeInfo.url.includes(url))) {
            chrome.tabs.remove(tabId);
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle") {
        enabled = request.enabled;
        chrome.storage.sync.set({ enabled: enabled });
    } else if (request.action === "updateUrls") {
        chrome.storage.sync.set({ blockedUrls: request.urls });
    }
});
