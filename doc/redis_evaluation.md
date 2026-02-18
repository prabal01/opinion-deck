# Redis Evaluation for Job Queues (BullMQ)

## Executive Summary
For a **free** starting point that supports Job Queues (persistence required), **Redis Cloud (Free Tier)** is the best option.
**Render's Free Redis** is **not recommended** for queues because it is ephemeral (data loss on restart) and spins down.

## Comparison Table

| Feature | **Redis Cloud (Free)** | **Render (Free)** | **Railway (Trial/Hobby)** |
| :--- | :--- | :--- | :--- |
| **Price** | Free (Forever) | Free (Forever) | $5 credit (Trial) then ~$5/mo |
| **Memory** | 30 MB | 25 MB | 512 MB+ |
| **Connections** | 30 Concurrent | 50 Concurrent | Uses RAM limit |
| **Persistence** | ✅ **Supported** (AOF/Snapshots) | ❌ **Ephemeral** (Data lost on restart) | ✅ **Supported** |
| **Uptime** | Always On | 💤 **Sleeps** after 15m inactivity | Always On |
| **Suitability** | **Best for MVP** | Dev / Cache Only | Best for Scaling |

## Detailed Analysis

### 1. Redis Cloud (Recommended for MVP)
- **Pros:** True persistence means your queued jobs are safe even if the backend server restarts. "Always on" ensures jobs can be processed immediately.
- **Cons:** 30 connection limit is tight. You must ensure your backend doesn't open too many implementation connections (use a shared connection pool).
- **BullMQ:** Compatible.

### 2. Render Redis (Free)
- **Pros:** Simplest integration if already hosting on Render.
- **Cons:** The instance "sleeps" and is **ephemeral**. If the instance restarts or spins down, **all queued jobs are lost**. This defeats the purpose of a reliable job queue.
- **BullMQ:** Not recommended.

### 3. Railway
- **Pros:** Production-grade from day 1. High limits.
- **Cons:** Not free forever (after $5 trial credit).

## Proposed Architecture (Zero Cost)
1.  **Backend:** Render (Free/Starter)
2.  **Redis:** Redis Cloud (Free 30MB)
    - Configuration: Set `max-connections` logic in code to respect the 30 limit.
