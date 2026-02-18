# Infrastructure Cost Analysis & "Survival" Guide

## Executive Summary
**You will likely never touch the $300 credit for infrastructure.**
Your core infrastructure (Backend, DB, Auth) falls entirely within **Always Free** tiers.

**The Real Cost Driver:** **Gemini API (AI Analysis).**
The $300 credit is effectively a budget for **~6 Million analyzed comments**.

## 1. The "Always Free" Stack (Cost: $0.00)

| Service | Free Limit | Your Usage Est. (1000 users) | Cost Impact |
| :--- | :--- | :--- | :--- |
| **Cloud Run** | 2 Million reqs/mo | ~500k reqs/mo | **$0** (Free) |
| **Firestore** | 1GB Storage, 50k reads/day | ~5k reads/day | **$0** (Free) |
| **Firebase Auth** | 50,000 MAU | 1,000 MAU | **$0** (Free) |
| **Firebase Storage** | 5GB Storage | ~1GB (with cleanup) | **$0** (Free) |
| **Redis Cloud** | 30MB | 10MB | **$0** (Free) |
| **Gemini Flash** | Free Tier (Rate limited) | - | **$0** (if small scale) |

## 2. The $300 Credit "Burn Rate"

When you scale beyond the free tiers, here is what eats the credit:

### C. Vertex AI (Gemini 1.5 Flash) Pricing
**This is where your $300 credit goes.**

*   **Input Cost:** $0.075 per 1 million characters (~$0.35 / 1M tokens)
*   **Output Cost:** $0.30 per 1 million characters (~$1.05 / 1M tokens)

**Your Use Case (Per Thread Analysis):**
*   **Input:** ~2000 comments (truncated) ≈ 100k characters = **$0.0075**
*   **Output:** Analysis JSON ≈ 5k characters = **$0.0015**
*   **Total Cost per Analysis:** **~$0.009 (Less than 1 cent)**

**Credit Runway:**
$$ \$300 \div \$0.009 \approx 33,000 \text{ Analyses} $$

*   **Comparison:** 
    *   **Google AI Studio:** Free, but rate-limited (15 req/min). Good for dev/beta.
    *   **Vertex AI:** Paid (covered by credit), high scale (1000+ req/min). **Required for launch.**

### B. Networking (Egress)
*   **Cost:** First 10GB/mo is Free. Then ~$0.08/GB.
*   **Scenario:** Sending 1MB JSON to 1000 users/day = 30GB/mo.
*   **Cost:** (30 - 10) * 0.08 = **$1.60/month**.

## 3. Survival Timeline

**Scenario 1: "Pre-Launch / Beta" (10-50 Users)**
*   **Monthly Cost:** $0.00
*   **Credit Impact:** $0.
*   **Longevity:** **Indefinite (12+ months)**

**Scenario 2: "Mild Success" (500 Users, 50 queries/day)**
*   **AI Cost:** 25,000 queries * $0.0035 = $87.50 / month.
*   **Infra Cost:** $0 (Still within free tiers).
*   **Longevity:** **~3.5 Months** on Credit.

**Scenario 3: "Viral Hit" (5,000 Users)**
*   **AI Cost:** $800+ / month.
*   **Longevity:** Credit burns in **10 days**.
*   **Fix:** At this stage, you should be charging users (Pro Plan covers this easily).

## Recommendation
1.  **Don't worry about Infrastructure costs.** Cloud Run/Firebase are effectively free.
2.  **Monitor AI Usage.** This is your only real bill.
3.  **Monetize Pro.** The $9/mo Pro plan covers the AI cost of ~2,500 analyses. **One Pro user pays for 2,000 free users' API bills.**
