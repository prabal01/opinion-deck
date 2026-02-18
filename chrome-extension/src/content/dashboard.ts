console.log("[OpinionDeck] Content Script Loaded on Dashboard");

// Listen for messages from the Web App (App.tsx)
window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    // Handle Auth Token
    if (event.data.type === "OPINION_DECK_AUTH_TOKEN") {
        console.log("[OpinionDeck] Bridge received auth token from Web App");

        chrome.runtime.sendMessage({
            action: "OPINION_DECK_AUTH_TOKEN",
            ...event.data
        }, (response) => {
            console.log("[OpinionDeck] Background response:", response);
        });
    }

    // Handle Fetch Requests (useRedditThread.ts)
    if (event.data.type === "OPINION_DECK_FETCH_REQUEST") {
        console.log("[OpinionDeck] Bridge received fetch request:", event.data.url);

        chrome.runtime.sendMessage({
            action: "FETCH_REDDIT_JSON",
            url: event.data.url
        }, (response) => {
            console.log("[OpinionDeck] Background fetch response:", response);

            // Send result back to Web App
            window.postMessage({
                type: "OPINION_DECK_FETCH_RESPONSE",
                id: event.data.id, // Correlate request
                success: response && response.status === 'success',
                data: response ? response.data : null,
                error: response ? response.error : "Unknown error"
            }, window.location.origin);
        });
    }
});
