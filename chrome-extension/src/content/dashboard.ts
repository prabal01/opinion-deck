/// <reference types="chrome"/>

/**
 * OpinionDeck Dashboard Auth Bridge
 * This script runs on the web dashboard (localhost / app.opiniondeck.com)
 * and bridges the Firebase ID Token to the extension's local storage.
 */

window.addEventListener("message", (event) => {
    // Only trust messages from our own origin
    if (event.origin !== window.location.origin) return;

    if (event.data && event.data.type === "OPINION_DECK_AUTH_TOKEN") {
        const token = event.data.token;
        if (token) {
            chrome.storage.local.set({ 'opinion_deck_token': token }, () => {
                console.log("[OpinionDeck] Extension Auth Sync: Success");
            });
        }
    }

    // New: Handle Dashboard Fetch Requests
    if (event.data && event.data.type === "OPINION_DECK_FETCH_REQUEST") {
        const { url, id } = event.data;
        chrome.runtime.sendMessage({ action: 'FETCH_REDDIT_JSON', url }, (response) => {
            window.postMessage({
                type: "OPINION_DECK_FETCH_RESPONSE",
                id,
                success: response?.status === 'success',
                data: response?.data,
                error: response?.error
            }, window.location.origin);
        });
    }
});

// Notify the web app that the extension is ready
window.postMessage({ type: "OPINION_DECK_EXTENSION_READY" }, window.location.origin);
