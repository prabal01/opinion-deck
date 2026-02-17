"use strict";
(() => {
    function extractHNThread() {
        var _a, _b, _c, _d;
        const title = ((_a = document.querySelector(".titleline a")) == null ? void 0 : _a.textContent) || "";
        const author = ((_b = document.querySelector(".hnuser")) == null ? void 0 : _b.textContent) || "";
        const scoreText = ((_c = document.querySelector(".score")) == null ? void 0 : _c.textContent) || "0";
        const score = parseInt(scoreText.split(" ")[0]) || 0;
        const selfText = ((_d = document.querySelector(".toptext")) == null ? void 0 : _d.textContent) || "";
        const comments = [];
        const commentRows = document.querySelectorAll(".comtr");
        commentRows.forEach((row) => {
            var _a2, _b2, _c2;
            const id = row.id;
            const commentAuthor = ((_a2 = row.querySelector(".hnuser")) == null ? void 0 : _a2.textContent) || "";
            const body = ((_b2 = row.querySelector(".commtext")) == null ? void 0 : _b2.textContent) || "";
            const depth = parseInt(((_c2 = row.querySelector(".ind img")) == null ? void 0 : _c2.width) || "0") / 40;
            comments.push({
                id,
                author: commentAuthor,
                body,
                depth,
                createdUtc: Date.now() / 1e3,
                replies: []
            });
        });
        return {
            id: new URLSearchParams(window.location.search).get("id") || "",
            title,
            author,
            selftext: selfText,
            score,
            num_comments: comments.length,
            created_utc: Date.now() / 1e3,
            permalink: window.location.pathname + window.location.search,
            comments
        };
    }
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "EXTRACT_DATA" && window.location.hostname === "news.ycombinator.com") {
            const data = extractHNThread();
            sendResponse({ status: "success", data });
        }
    });
})();
