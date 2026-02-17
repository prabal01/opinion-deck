"use strict";
(() => {
  // chrome-extension/src/content/reddit.ts
  console.log("[OmniResearch] Reddit Extractor Loaded");
  function extractRedditThread() {
    const title = document.querySelector("h1")?.innerText || document.title;
    const url = window.location.href;
    const postId = url.split("/comments/")[1]?.split("/")[0];
    const comments = Array.from(document.querySelectorAll('[data-test-id="comment"]')).map((el) => {
      return {
        author: el.querySelector('[data-testid="comment_author"]')?.innerText,
        body: el.querySelector('[data-testid="comment_body"]')?.innerText,
        score: el.querySelector('[id^="vote-arrows-"]')?.innerText
      };
    });
    return {
      id: `reddit_${postId}`,
      source: "reddit",
      url,
      title,
      content: {
        post: { title, url, id: postId },
        comments
      },
      extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
      isAnalyzed: false
    };
  }
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_DATA") {
      const data = extractRedditThread();
      sendResponse({ data });
    }
  });
})();
