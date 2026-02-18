# Infrastructure & Tech Debt Todos

This document tracks planned infrastructure improvements, architectural changes, and technical debt cleanup.

## 🟢 Immediate / High Priority

- [ ] **Cleanup**: Remove dead Reddit fetching code from `src/server.ts` (`fetchWithRetry`, `resolveMoreComments`, `transformPost` etc.).
    - **Context**: We now rely entirely on the Chrome Extension for data extraction. The server should only process/store data, not fetch it.
- [ ] **Cleanup**: Remove mocked `ANALYZE_DATA` / `setTimeout` from `chrome-extension/src/background.ts`.
    - **Context**: Analysis happens on the backend or via a distinct flow, not a mocked delay in the background script.
- [ ] **Infrastructure**: Move `p-queue` (Job Queues) and Rate Limiter state to a persistent backend.
    - **Context**: In-memory state is lost on server restarts.
    - **Selected Plan**: Use **Redis Cloud (Free Tier)** for persistence.
    - **Status**: Evaluation Complete ([Read Report](/Users/prabalsaxena/.gemini/antigravity/brain/6f425277-f210-45d8-a1fe-0f0604ad5561/redis_evaluation.md)). Requirements: Redis 6.2+.
- [ ] **Data Architecture**: Implement Large Payload Strategy (Hybrid Storage).
    - **Context**: Firestore 1MB limit & Node.js 50MB parsing bottleneck.
    - **Plan**: 
        1. **Extension**: Upload large JSONs to Firebase Storage (Client-side).
        2. **Server**: Save only `storageUrl` + Metadata to Firestore.
        3. **Process**: Use Redis Queue to process the blob asynchronously.
    - **Required Action**: Implement Client-side Upload to Firebase Storage.
- [ ] **AI Model**: Migrate to **Vertex AI SDK**.
    - **Context**: Access $300 GCP Credit (Google AI Studio SDK is separate/rate-limited).
    - **Plan**: Switch `@google/generative-ai` -> `@google-cloud/vertexai`.
- [ ] **Hosting**: Migrate Backend to **Google Cloud Run**.
    - **Context**: Utilize $300 credit and permanent free tier (2M reqs/mo) to avoid cold starts.
    - **Plan**: Dockerize application -> Deploy to Cloud Run -> Connect to Redis Cloud.

## 🟡 Medium Priority

- [ ] **Database**: Audit Firestore usage for reads/writes optimization.
- [ ] **Security**: Rotate Service Account keys and ensure stricter IAM roles.

## 🔴 Long Term / Low Priority

- [ ] **Scalability**: Horizontal scaling strategy (requires Redis for shared state).
