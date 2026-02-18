# Infrastructure & Tech Debt Todos

This document tracks planned infrastructure improvements, architectural changes, and technical debt cleanup.

## 🟢 Immediate / High Priority

- [x] **Cleanup**: Remove dead Reddit fetching code from `src/server.ts`.
    - **Status**: Completed.
- [x] **Cleanup**: Remove mocked `ANALYZE_DATA` from `chrome-extension`.
    - **Status**: Completed.
- [x] **Infrastructure**: Move `p-queue` (Job Queues) and Rate Limiter state to Redis.
    - **Context**: In-memory state is lost on server restarts. Persistence achieved via Redis Cloud.
    - **Status**: Completed.
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
