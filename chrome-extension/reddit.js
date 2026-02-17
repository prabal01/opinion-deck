"use strict";
(() => {
  // chrome-extension/src/content/reddit.ts
  console.log("[OmniResearch] Reddit Extractor Loaded");
  async function extractRedditThread() {
    const url = window.location.href;
    const jsonUrl = url.split("?")[0].replace(/\/$/, "") + ".json";
    try {
      const response = await fetch(jsonUrl);
      if (!response.ok) throw new Error("Failed to fetch JSON from Reddit");
      const data = await response.json();
      const postData = data[0]?.data?.children[0]?.data;
      const commentListing = data[1]?.data?.children;
      const flattenComments = (children, parentId = null) => {
        let result = [];
        if (!children) return result;
        for (const child of children) {
          if (child.kind === "t1") {
            result.push({
              author: child.data.author,
              body: child.data.body,
              score: child.data.score,
              id: child.data.id,
              parentId,
              depth: child.data.depth,
              createdUtc: child.data.created_utc,
              isSubmitter: child.data.is_submitter,
              distinguished: child.data.distinguished,
              stickied: child.data.stickied
            });
            if (child.data.replies?.data?.children) {
              result = result.concat(flattenComments(child.data.replies.data.children, child.data.id));
            }
          }
        }
        return result;
      };
      const comments = flattenComments(commentListing);
      return {
        id: `reddit_${postData?.id || Date.now()}`,
        source: "reddit",
        url,
        title: postData?.title || document.title,
        content: {
          post: {
            id: postData?.id,
            title: postData?.title,
            author: postData?.author,
            ups: postData?.ups,
            num_comments: postData?.num_comments,
            subreddit: postData?.subreddit,
            upvoteRatio: postData?.upvote_ratio,
            createdUtc: postData?.created_utc,
            permalink: postData?.permalink,
            selftext: postData?.selftext,
            isSelf: postData?.is_self,
            url: postData?.url
          },
          flattenedComments: comments,
          // Explicitly named for dashboard recognition
          raw_json_dump: JSON.stringify(data)
          // 100% fidelity backup
        },
        extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isAnalyzed: false
      };
    } catch (err) {
      console.error("[OmniResearch] JSON Extraction Failed, falling back to basic scrape", err);
      return {
        id: `reddit_fallback_${Date.now()}`,
        source: "reddit",
        url,
        title: document.title,
        content: { post: { title: document.title }, comments: [] },
        extractedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_DATA") {
      extractRedditThread().then((data) => sendResponse({ data }));
      return true;
    }
    if (request.action === "GET_METADATA") {
      const titleEl = document.querySelector("h1");
      const title = titleEl?.innerText || document.title;
      const snippetEl = document.querySelector('div[id$="-post-rtjson-content"] p');
      const snippet = snippetEl?.innerText || "";
      sendResponse({ title, snippet });
    }
    return true;
  });
})();
