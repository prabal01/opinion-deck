"use strict";
(() => {
  // chrome-extension/src/content/g2.ts
  console.log("[OpinionDeck] G2 Extractor Loaded");
  function extractG2Reviews() {
    const title = document.querySelector("h1")?.innerText || document.title;
    const url = window.location.href;
    const productId = url.split("/products/")[1]?.split("/")[0];
    const reviews = Array.from(document.querySelectorAll(".x-review-item")).map((el) => {
      return {
        author: el.querySelector(".x-review-author")?.innerText,
        body: el.querySelector(".x-review-body")?.innerText,
        stars: el.querySelector(".stars")?.getAttribute("aria-label")
      };
    });
    return {
      id: `g2_${productId}_${Date.now()}`,
      source: "g2",
      url,
      title,
      content: {
        product: title,
        reviews
      },
      extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
      isAnalyzed: false
    };
  }
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_DATA") {
      const data = extractG2Reviews();
      sendResponse({ data });
    }
    if (request.action === "GET_METADATA") {
      const title = document.querySelector("h1")?.innerText || document.title;
      const snippet = document.querySelector(".product-head__description")?.innerText || "";
      sendResponse({ title, snippet });
    }
    return true;
  });
})();
