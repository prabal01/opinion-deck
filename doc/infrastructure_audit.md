## 1. Executive Summary
The infrastructure is functional for an MVP but carries significant "dead code" and technical debt that complicates maintenance. The core "slowness" observed is likely due to **cold starts** (Free Tier) or **inefficient large payload processing**, rather than the now-deprecated Reddit fetching logic.

**Solidity Rating:** 🟡 **Moderate** (Stable, but needs cleanup)

## 2. Addresses User Concerns

### A. "Why is server fetching from Reddit?"
**Finding:** It shouldn't be. The server contains **dead code** (`fetchWithRetry`, `resolveMoreComments`) from the legacy implementation.
- **Status:** The active routes (`/api/extractions`, `/api/folders/:id/analyze`) correctly use the data payload sent by the extension.
- **Action:** Delete the legacy fetching functions to avoid confusion.

### B. "Extension Analysis is Mocked?"
**Finding:** The `ANALYZE_DATA` handler in `background.ts` (with the 2s delay) is **unreachable dead code**.
- **Status:** The actual interactions (`performSave` in `popup/index.ts`) route data to `/api/extractions` or redirect to the dashboard. The mock handler is never called by the UI.
- **Action:** Remove the dead handler to clean up the codebase.

### C. Performance Bottlenecks (Real)
Since the server doesn't fetch from Reddit, the slowness comes from:
1.  **Cold Starts (Render Free Tier):** 30s+ delay if the server spins down.
2.  **Large Payload Parsing:** The server receives massive JSON blobs (50MB+) from the extension. Parsing these block the Node.js event loop, causing momentary unresponsiveness.

## 3. Architecture & Solidity Gaps

### A. In-Memory State (Fragile)
Critical systems are stored in server memory (RAM):
1.  **Rate Limiter:** `src/server/middleware/rateLimiter.ts` uses a `Map`.
2.  **Job Queues:** `src/server.ts` uses `p-queue` (in-memory).
- **Risk:** If the server restarts (deploy, crash, or auto-scaling), **all queued AI jobs and rate limit counters are lost**.
- **Fix:** Use Redis (free tier available on Redis.io) for job queues.

## 4. Recommendations & Next Steps

We have created `doc/infra-todos.md` to track these improvements.

### Immediate Cleanup
1.  **Delete Dead Code:** Remove `src/server.ts` fetching logic and `background.ts` mock handlers.
2.  **Upgrade Hosting:** If on Render Free Tier, upgrade to Starter ($7/mo) to eliminate cold starts.

### Strategic
1.  **Persist State:** Implement Redis for Job Queues.
2.  **Optimize Payloads:** Investigate streaming or worker threads for parsing large Reddit JSONs.

