"use strict";
(() => {
  // chrome-extension/src/content/twitter.ts
  console.log("[OmniResearch] Twitter/X Extractor Loaded");
  async function extractTwitterThread() {
    const url = window.location.href;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
      if (articles.length === 0) throw new Error("No tweets found. Make sure you are on a status page.");
      const mainTweetEl = articles[0];
      const mainId = url.split("/").pop() || Date.now().toString();
      const extractTweetData = (article) => {
        const textEl = article.querySelector('[data-testid="tweetText"]');
        const authorEl = article.querySelector('[data-testid="User-Name"]');
        const timeEl = article.querySelector("time");
        const authorText = authorEl?.textContent || "";
        const authorMatch = authorText.match(/@(\w+)/);
        const author = authorMatch ? authorMatch[1] : authorText.split("\xB7")[0].trim() || "unknown";
        return {
          id: article.getAttribute("aria-labelledby") || Math.random().toString(36),
          author,
          body: textEl?.textContent || "",
          createdUtc: timeEl ? new Date(timeEl.getAttribute("datetime") || Date.now()).getTime() / 1e3 : Date.now() / 1e3,
          score: 0
          // Twitter score (likes) is harder to parse consistently, leave for now or basic scrape
        };
      };
      const mainPost = extractTweetData(mainTweetEl);
      const replies = articles.slice(1).map((article) => ({
        ...extractTweetData(article),
        depth: 1,
        // Basic flattening for now
        parentId: mainPost.id
      }));
      return {
        id: `twitter_${mainId}`,
        source: "twitter",
        url,
        title: mainPost.body.substring(0, 100) + (mainPost.body.length > 100 ? "..." : ""),
        content: {
          post: {
            id: mainId,
            title: mainPost.body.substring(0, 70),
            // Use snippet as title
            author: mainPost.author,
            createdUtc: mainPost.createdUtc,
            selftext: mainPost.body,
            subreddit: "twitter-thread",
            // Mapping to our schema
            isSelf: true,
            url
          },
          flattenedComments: replies,
          raw_json_dump: JSON.stringify({ url, tweetCount: articles.length })
        },
        extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isAnalyzed: false
      };
    } catch (err) {
      console.error("[OmniResearch] Twitter Extraction Failed", err);
      return {
        id: `twitter_fallback_${Date.now()}`,
        source: "twitter",
        url,
        title: document.title,
        content: { post: { title: document.title }, comments: [] },
        extractedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_DATA") {
      extractTwitterThread().then((data) => sendResponse({ data }));
      return true;
    }
    if (request.action === "GET_METADATA") {
      const textEl = document.querySelector('[data-testid="tweetText"]');
      const title = textEl?.innerText.substring(0, 50) + "..." || document.title;
      sendResponse({ title, snippet: textEl?.innerText || "" });
    }
    return true;
  });
})();
