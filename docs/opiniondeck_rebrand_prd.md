# PRD: OpinionDeck Rebrand & Platform Overhaul

## Overview
This document outlines the strategic pivot from "OmniResearch" to **OpinionDeck**. The goal is to create a more cohesive brand identity, improve user retention through structured credit usage, and optimize for a 90% profit margin while adding premium enterprise features.

---

## 🏗️ Core Rebranding
**Project Name**: OpinionDeck  
**Tagline**: *Strategic Market Intelligence on Autopilot.*

### Areas for Rebranding:
1.  **Marketing Site**: Update all copy (Landing, Features, Pricing).
2.  **Dashboard**: Rename "OmniResearch Hub" to "OpinionDeck Dashboard".
3.  **Extension**: Rebrand the Chrome/Browser Extension to "OpinionDeck Collector".
4.  **Logo Logic**:
    *   **Authenticated**: Logo click -> `/dashboard`.
    *   **Unauthenticated**: Logo click -> `/` (Landing Page).

---

### The 90%+ Margin Model (Lean Approach)
To achieve a **90% margin**, we need a pricing that is **10x our COGS**.
- **AI Cost Core**: Gemini 1.5 Flash ($0.075/1M input tokens).
- **Cost per Analysis**: ~$0.002 (based on 20k token input/2k output).
- **Pro User Max Cost**: 50 credits * $0.002 = $0.10/mo.
- **Target Revenue Per Pro User**: **$9 / month**.
- **Result**: Even if the user uses all 50 reports, our cost is **$0.10**, resulting in a **98.8% margin**. This allows for massive scaling with negligible infra overhead.

---

## 🏗 Tier Structure (One Credit = One AI Analysis)

#### **1. Free Tier (The "Trial")**
- **Goal**: Immediate value demonstration.
- **Saved Threads**: 30 max.
- **Folders**: 1 max.
- **Credits**: 5 one-time "Opinion Credits" (To try the AI analysis).
- **Features**: Basic research visibility.

#### **2. OpinionDeck Pro ($9/mo or $89/yr)**
- **Goal**: Serious Solopreneurs & Market Researchers.
- **Opinion Credits**: 50 / month (Resets monthly).
- **Saved Threads**: 5,000 max (keeps DB costs predictable).
- **Folders**: Unlimited.
- **Lead Extraction**: Full access.
- **Export**: JSON/Markdown full access.

---

---

## 🛠️ Technical Capacity & Scaling

### 1. The 1 Million Token Threshold
OpinionDeck uses **Gemini 1.5 Flash** for its primary analysis, which features a **1,000,000 token context window**.

**What this means for users:**
- **"Heavy" Folders (100 words/comment)**: Can analyze **~7,500 comments** in one go.
- **"Average" Folders (30 words/comment)**: Can analyze **~25,000 comments** in one go.
- **Max File Size**: Roughly **10-15 MB** of raw text.

### 2. Strategy for "Mega-Folders" (>1M Tokens)
If a folder exceeds the 1M token limit, we will use **Intelligent Sampling** (as our official approach):
- **Mechanism**: The system will analyze the top-N most relevant or high-engagement comments (up to 7,500 total) to ensure the analysis remains coherent and fast.
- **Minification**: We will still perform minification (removing boilerplate/bot spam) before sampling to maximize the data we *can* include.

---

## 🛠️ New Functional Requirements

### 1. Unified Credit System
- **Atomic Unit**: 1 Credit = 1 AI Analysis attempt.
- **UI**: Display "Credits Remaining" in the top header and sidebar.
- **Logic**: Deduct 1 credit per AI Analysis. Block analysis if credits <= 0.

### 2. Dashboard Sidebar
A permanent sidebar (collapsible on mobile) for faster navigation:
- 🏠 **Dashboard Home**
- 📂 **Research Folders**
- 📊 **Saved Reports** (New dedicated view for all AI reports)
- 💾 **All Threads** (Global view of all fetched data)
- ⚙️ **Settings** (Account, Billing, API Keys)

### 3. Dashboard Homepage Cleanup
- **Remove**: Generic feature marketing data and passive analysis hooks.
- **Add**: **Impact Metrics Row**:
    - **Total Intelligence Scanned**: Total count of threads/comments processed across all folders.
    - **Leads Identified**: Total count of outreach candidates found to date.
    - **Research Hours Saved**: (Total Words Analyzed / 200) * 1.5 - A formula to show the 'ROI'.
    - **Opinion Score Coverage**: Overall average sentiment across all research assets.
- **Add**: "Recent Reports" quick-access cards.

---

## 🛠️ Backend Modernization & Cleanup

### 1. Legacy Removal
To ensure the platform remains maintainable, we will audit and remove:
- **Old Scraper Routes**: Any endpoints retained from the early "reddit-downloader" days that aren't used by the Current Extension or Dashboard.
- **Unused AI Models**: Clean up the `server/ai.ts` to only support the Flash/Pro workflow.
- **Redundant Middleware**: Remove unused rate-limiting or auth check patterns that were superseded.

### 2. User Statistics (The "Wow" Factor)
We will introduce a `stats` collection in Firestore per user:
- `threads_total`: Total threads fetched.
- `comments_total`: Total comments analyzed.
- `reports_generated`: Lifetime count of AI reports.
- `potential_leads_total`: Lifetime count of leads extracted.

---

## 🚀 Implementation Priority
1.  **PRD Approval** (Current)
2.  **Sidebar & Layout Overhaul**: Establishing the new OpinionDeck "shell".
3.  **Rebranding Sprint**: Search & Replace text across all repos.
4.  **Credit System**: Implementing backend tracking and frontend display.
5.  **Pricing Limits**: Restricting folders/threads based on subscription.
