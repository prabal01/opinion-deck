"use strict";
(() => {
  // chrome-extension/src/background.ts
  chrome.runtime.onInstalled.addListener(() => {
    console.log("[OpinionDeck] Extension Installed");
  });
  async function saveToBackend(data) {
    const API_URL = "https://opinion-deck.onrender.com/api/extractions";
    const authRecord = await chrome.storage.local.get("opinion_deck_token");
    const token = authRecord.opinion_deck_token;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...token ? { "Authorization": `Bearer ${token}` } : { "X-Omni-Dev": "true" }
        },
        body: JSON.stringify({ data })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error("Failed to save to backend:", err);
      throw err;
    }
  }
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SAVE_EXTRACTION") {
      saveToBackend(request.data).then((res) => sendResponse({ status: "success", res })).catch((err) => sendResponse({ status: "error", error: err.message }));
      return true;
    }
    if (request.action === "ANALYZE_DATA") {
      setTimeout(() => {
        sendResponse({
          status: "success",
          results: {
            executive_summary: "Managed Analysis: This thread emphasizes a high demand for 'Advanced Analytics' and reports a bug in the 'CSV Export'.",
            quality_score: 92
          }
        });
      }, 2e3);
      return true;
    }
    if (request.action === "FETCH_REDDIT_JSON") {
      const { url } = request;
      if (url.includes("news.ycombinator.com")) {
        const urlObj = new URL(url);
        const hnId = urlObj.searchParams.get("id");
        if (!hnId) {
          sendResponse({ status: "error", error: "Invalid HackerNews URL (missing ID)" });
          return true;
        }
        const algoliaUrl = `https://hn.algolia.com/api/v1/items/${hnId}`;
        console.log("[OpinionDeck] HN Remote Fetch:", algoliaUrl);
        fetch(algoliaUrl).then(async (response) => {
          if (!response.ok) throw new Error(`HN/Algolia error: ${response.status}`);
          const data = await response.json();
          const normalized = {
            title: data.title,
            author: data.author,
            selftext: data.text || "",
            score: data.points || 0,
            num_comments: data.children ? data.children.length : 0,
            id: data.id.toString(),
            comments: data.children || []
          };
          sendResponse({ status: "success", data: [{ data: { children: [{ data: normalized }] } }] });
        }).catch((err) => {
          console.error("[OpinionDeck] HN Remote Fetch Failed:", err);
          sendResponse({ status: "error", error: err.message });
        });
        return true;
      }
      if (url.includes("twitter.com") || url.includes("x.com")) {
        sendResponse({
          status: "error",
          error: "Twitter extraction requires the OpinionDeck extension to be active on that tab. Please open the X/Twitter thread directly and use the extension popup."
        });
        return true;
      }
      const jsonUrl = url.includes(".json") ? url : (url.endsWith("/") ? url.slice(0, -1) : url) + ".json";
      console.log("[OpinionDeck] Remote Fetching:", jsonUrl);
      fetch(jsonUrl).then(async (response) => {
        const contentType = response.headers.get("content-type");
        if (!response.ok) throw new Error(`Reddit error: ${response.status}`);
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response. Reddit might be blocking this request.");
        }
        const data = await response.json();
        sendResponse({ status: "success", data });
      }).catch((err) => {
        console.error("[OpinionDeck] Remote Fetch Failed:", err);
        sendResponse({ status: "error", error: err.message });
      });
      return true;
    }
  });
})();
