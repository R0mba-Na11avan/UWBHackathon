//ooga booga binga
document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("toggleSwitch");
    const urlList = document.getElementById("urlList");
    const urlInput = document.getElementById("urlInput");
    const addUrlBtn = document.getElementById("addUrl");
    const confirmClose = document.getElementById("confirmClose");
    const forceCloseBtn = document.getElementById("forceCloseBtn");
    

    function updatePopupIcon(isEnabled) {
        const icon = document.getElementById("icon");
        if (!icon) return;

        if (isEnabled) {
            icon.setAttribute("src", "icon_mischiveous.png");
        } else {
            icon.setAttribute("src", "icon_sleep.png");
        }
    }


    // Load saved settings
    chrome.storage.sync.get(["enabled", "blockedUrls"], (data) => {
        toggleSwitch.checked = data.enabled ?? false;
        updateUrlList(data.blockedUrls || []);
        updatePopupIcon(toggleSwitch.checked);
    });

    toggleSwitch.addEventListener("change", () => {
        if (!toggleSwitch.checked) {
            // If user tries to turn it off, block them and show "no"
            toggleSwitch.checked = true; // Immediately revert back to ON
            confirmClose.style.display = "block"; // Show the hidden area
        } else {
            // User turns it ON normally
            chrome.runtime.sendMessage({ action: "toggle", enabled: true });
            chrome.storage.sync.set({ enabled: true });
            updatePopupIcon(true);
        }
    });

    // When user clicks "okay close fr"
    forceCloseBtn.addEventListener("click", () => {
        confirmClose.style.display = "none"; // Hide the "no" message
        toggleSwitch.checked = false; // Actually turn off
        chrome.runtime.sendMessage({ action: "toggle", enabled: false });
        chrome.storage.sync.set({ enabled: false });
        updatePopupIcon(false);
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