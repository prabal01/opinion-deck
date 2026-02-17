"use strict";
(() => {
  // chrome-extension/src/content/dashboard.ts
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === "OPINION_DECK_AUTH_TOKEN") {
      const token = event.data.token;
      if (token) {
        chrome.storage.local.set({ "opinion_deck_token": token }, () => {
          console.log("[OpinionDeck] Extension Auth Sync: Success");
        });
      }
    }
    if (event.data && event.data.type === "OPINION_DECK_FETCH_REQUEST") {
      const { url, id } = event.data;
      chrome.runtime.sendMessage({ action: "FETCH_REDDIT_JSON", url }, (response) => {
        window.postMessage({
          type: "OPINION_DECK_FETCH_RESPONSE",
          id,
          success: response?.status === "success",
          data: response?.data,
          error: response?.error
        }, window.location.origin);
      });
    }
  });
  window.postMessage({ type: "OPINION_DECK_EXTENSION_READY" }, window.location.origin);
})();
