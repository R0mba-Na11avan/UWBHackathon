document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("toggleSwitch");
    const urlList = document.getElementById("urlList");
    const urlInput = document.getElementById("urlInput");
    const addUrlBtn = document.getElementById("addUrl");

    // Load saved settings
    chrome.storage.sync.get(["enabled", "blockedUrls"], (data) => {
        toggleSwitch.checked = data.enabled ?? true;
        updateUrlList(data.blockedUrls || []);
    });

    // Toggle the extension on/off
    toggleSwitch.addEventListener("change", () => {
        chrome.runtime.sendMessage({ action: "toggle", enabled: toggleSwitch.checked });
        chrome.storage.sync.set({ enabled: toggleSwitch.checked });
    });

    // Add URL to block list
    addUrlBtn.addEventListener("click", () => {
        let url = urlInput.value.trim();
        if (!url) return;

        chrome.storage.sync.get("blockedUrls", (data) => {
            let urls = data.blockedUrls || [];
            if (!urls.includes(url)) {
                urls.push(url);
                chrome.storage.sync.set({ blockedUrls: urls }, () => {
                    updateUrlList(urls);
                });
                urlInput.value = "";
            }
        });
    });

    function updateUrlList(urls) {
        urlList.innerHTML = ""; // Clear the list

        urls.forEach(url => {
            let li = document.createElement("li");
            li.textContent = url;

            let removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.classList.add("remove-btn");

            removeBtn.addEventListener("click", () => {
                let newUrls = urls.filter(u => u !== url);
                chrome.storage.sync.set({ blockedUrls: newUrls }, () => {
                    updateUrlList(newUrls);
                });
            });

            li.appendChild(removeBtn);
            urlList.appendChild(li);
        });
    }
});
