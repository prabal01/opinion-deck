# OpinionDeck API Sequence Diagram

This document illustrates the interactions between the Client (Web App + Extension), the Backend API, and external services (Firebase, Stripe, Gemini, Redis).

## 1. Authentication & User Profile

```mermaid
sequenceDiagram
    participant User as Client (Web/Ext)
    participant API as Backend API
    participant Auth as Firebase Auth
    participant DB as Firestore
    participant Stripe as Stripe API

    User->>User: firebase.auth().currentUser.getIdToken()
    User->>API: GET /api/user/plan (Headers: Authorization: Bearer TOKEN)
    
    API->>Auth: Verify Token (decode)
    alt Invalid Token
        Auth-->>API: Error
        API-->>User: 401 Unauthorized
    else Valid Token
        Auth-->>API: Decoded UID
        API->>DB: GET users/{uid}/stats
        DB-->>API: Returns { plan: 'free' | 'pro', ... }
        API-->>User: 200 OK { plan: 'pro', config: {...} }
    end
```

## 2. Core Data Flow: Extractions (Extension)

```mermaid
sequenceDiagram
    participant Ext as Chrome Extension
    participant API as Backend API
    participant DB as Firestore
    participant Storage as Firebase Storage

    Ext->>Ext: Scrape Page (DOM)
    
    alt Payload > 1MB (Planned)
        Ext->>Storage: Upload JSON blob
        Storage-->>Ext: Returns storageURL
        Ext->>API: POST /api/extractions { id, title, storageUrl, ... }
    else Payload < 1MB (Current)
        Ext->>API: POST /api/extractions { id, title, data: {...} }
    end

    API->>DB: SET users/{uid}/extractions/{id}
    API-->>Ext: 200 OK { success: true }
```

## 3. Organizing: Folders & Threads

```mermaid
sequenceDiagram
    participant Client as Web Dashboard
    participant API as Backend API
    participant DB as Firestore

    %% Use Case: Create Folder
    Client->>API: POST /api/folders { name: "Marketing Research" }
    API->>DB: ADD to folders collection
    DB-->>API: Document Reference
    API-->>Client: 200 OK { id: "folder_123", name: "Marketing Research" }

    %% Use Case: Save Thread to Folder
    Client->>API: POST /api/folders/{folderId}/threads { threadData }
    API->>DB: SET saved_threads/{folderId}_{threadId}
    API->>DB: Increment folder.threadCount
    API-->>Client: 200 OK
```

## 4. Intelligence: AI Analysis

```mermaid
sequenceDiagram
    participant Client as Web Dashboard
    participant API as Backend API
    participant Redis as Redis Queue
    participant Gemini as Gemini AI
    participant DB as Firestore

    Client->>API: POST /api/folders/{id}/analyze
    
    API->>DB: GET all saved_threads in folder
    DB-->>API: List of threads

    API->>Redis: Add Job (analyze_folder) [Optional/Future]
    
    note right of API: Currently synchronous (for MVP)
    
    loop For each thread context
        API->>Gemini: Prompt: "Analyze these threads for insights..."
        Gemini-->>API: Returns JSON { themes, pain_points, leads... }
    end

    API->>DB: ADD folder_analyses collection
    API->>DB: Increment user.stats (credits used)
    
    API-->>Client: 200 OK { themes: [...], pain_points: [...] }
```

## 5. Payments: Upgrade Flow

```mermaid
sequenceDiagram
    participant User as User
    participant API as Backend API
    participant Stripe as Stripe API

    User->>API: POST /api/create-checkout-session { interval: 'year' }
    API->>Stripe: Create Session (cancel_url, success_url)
    Stripe-->>API: Session object (url)
    API-->>User: { url: "https://checkout.stripe.com/..." }
    
    User->>Stripe: Complete Payment
    Stripe->>API: Webhook (checkout.session.completed)
    API->>DB: UPDATE user.plan = 'pro'
```
