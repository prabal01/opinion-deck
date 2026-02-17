"use strict";
(() => {
  // chrome-extension/src/content/dashboard.ts
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === "OMNI_RESEARCH_AUTH_TOKEN") {
      const token = event.data.token;
      if (token) {
        chrome.storage.local.set({ "omni_auth_token": token }, () => {
          console.log("[OmniResearch] Extension Auth Sync: Success");
        });
      }
    }
    if (event.data && event.data.type === "OMNI_FETCH_REQUEST") {
      const { url, id } = event.data;
      chrome.runtime.sendMessage({ action: "FETCH_REDDIT_JSON", url }, (response) => {
        window.postMessage({
          type: "OMNI_FETCH_RESPONSE",
          id,
          success: response?.status === "success",
          data: response?.data,
          error: response?.error
        }, window.location.origin);
      });
    }
  });
  window.postMessage({ type: "OMNI_EXTENSION_READY" }, window.location.origin);
})();
