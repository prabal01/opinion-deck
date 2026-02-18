# Large Payload Strategy

## Problem Statement
The Chrome Extension captures full Reddit threads, which can result in JSON payloads exceeding **50MB**.
Sending these directly to the server causes:
1.  **Event Loop Blocking:** `JSON.parse` and subsequent processing blocks the single-threaded Node.js event loop, making the server unresponsive.
2.  **Memory Pressure:** Loading 50MB+ into memory for every request spikes RAM usage.
3.  **Database Limits:** Firestore has a **1MB limit per document**, meaning we cannot save these raw threads directly.

## Current Status
- **Server Limit:** We bumped `express.json({ limit: '50mb' })` (Band-aid fix).
- **Firestore:** `saveExtractedData` saves the raw `data`. If `data` > 1MB, **this will fail**.

## Proposed Strategy

### 1. Hybrid Storage (The "Sidecar" Pattern)
Instead of stuffing the huge JSON into Firestore, we should use object storage (Firebase Storage / S3) for the "blob" and Firestore for metadata.

**Flow:**
1.  **Upload:** Extension uploads the JSON to **Firebase Storage** (client-side) or sends to Server which streams it to Storage.
    - *Recommendation:* Extension uploads directly to Firebase Storage using a signed URL or client SDK (avoids server bandwidth entirely).
2.  **Pointer:** Extension sends the `storageUrl` + Metadata (Title, Subreddit, ID) to the Server.
3.  **Save:** Server saves the Metadata to Firestore, with a `contentUrl` pointing to the blob.

### 2. Asynchronous Processing (Job Queue)
When we need to *analyze* or *display* this data:
1.  **Queue:** Server queues a job (using Redis) with the `contentUrl`.
2.  **Worker:** A background worker downloads the JSON stream, parses it (possibly using a streaming parser), and performs the analysis.
3.  **Result:** Analysis results (which are much smaller) are saved to Firestore.

## Recommendation

**Required: Hybrid Storage + Redis**
- Implement Firebase Storage for the raw JSON blobs.
- server saves `storageUrl` to Firestore.
- Use Redis Queue to process them asynchronously.
