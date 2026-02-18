# Database Strategy: Firestore vs. Relational (Postgres)

## Executive Summary
**Keep Firestore for Launch.**
Switching to a Relational DB (SQL) now would delay launch by **2-3 weeks** for minimal immediate gain.

However, recognize that Firestore is **great for storage** but **bad for complex analytics**. Plan to potentially stream data to BigQuery or migrate to Postgres **after** you have product-market fit.

## detailed Analysis

### 1. Data Shape Fit
**Your Data:**
- **Users, Folders:** simple, structured. -> **SQL is Better**.
- **Extractions (Reddit Threads, G2 Reviews):** Deeply nested, inconsistent JSON structures. -> **NoSQL (Firestore) is Better**.
- **Analysis Results:** Documents with varying fields. -> **NoSQL (Firestore) is Better**.

**Verdict:** The core value of your app is **analyzing unstructured data**. Storing this in SQL (even with JSONB) is annoying compared to a native document store. Firestore wins here.
*Score: Firestore 1 - 0 SQL*

### 2. Development Speed (Pre-Launch Priority)
- **Firestore:** flexible. Add a field? Just write it. No migrations.
- **SQL:** Rigid. Add a field? Write a migration script. Update types. Deploy migration.
- **Current Status:** 100% written for Firestore. Rewriting `src/server/firestore.ts` to `Prisma/Drizzle` is a huge effort.

**Verdict:** Changing now kills momentum. Firestore wins.
*Score: Firestore 2 - 0 SQL*

### 3. Cost & Operations
- **Firestore:** **$0/month** until you scale massive. Serverless (no maintenance).
- **SQL (Managed):**
    - Google Cloud SQL: **~$50/month** minimum for production.
    - Render/Neon Free Tier: Great, but potential cold starts or limits.
    - Self-Hosted Typesense: Maintenance burden.

**Verdict:** For a bootstrapped MVP, free serverless DBs win.
*Score: Firestore 3 - 0 SQL*

### 4. The "Relational" Argument (Where SQL Wins)
- **Problem:** "Join user stats with folder count efficiently."
- **Firestore:** Can't do it. You have to denormalize (store `threadCount` on the folder document and update it manually).
- **SQL:** `SELECT count(*) FROM threads JOIN folders...` Trivial.
- **Risk:** If you add "Teams" or "Organizations" later, Firestore data modeling becomes a nightmare.

**Verdict:** SQL wins for complex relationships and analytics.
*Score: Firestore 3 - 1 SQL*

## Recommendation
**Stay the Course with Firestore.**
1.  **Launch:** Don't rewrite the database layer now.
2.  **Mitigate:** Use **Google Cloud Storage** for large blobs (as planned) to keep Firestore costs low.
3.  **Future V2:** If you need complex analytics (e.g., "Show me average sentiment across all folders for Team X"), pipe Firestore data to **BigQuery** (easy integration) instead of migrating the live app to SQL.
