# OpinionDeck: Google Cloud Run Deployment Guide

This guide covers the steps to deploy the OpinionDeck backend to Google Cloud Run using the `Dockerfile`.

## 1. Prerequisites

*   Google Cloud Project with Billing enabled.
*   `gcloud` CLI installed and authenticated.
*   **Artifact Registry** enabled.
*   **Cloud Run** enabled.

## 5. Environment Management
The application is configured to switch between local and production environments using `.env` files.

### Backend (`/`)
Configure `ALLOWED_ORIGINS` to control CORS.
```bash
ALLOWED_ORIGINS=http://localhost:5173,https://app.opiniondeck.com
```

### Web App (`/web`)
Set `VITE_API_URL` in `.env.production` to your Cloud Run URL.

### Chrome Extension (`/chrome-extension`)
Use `.env` for local testing and `.env.production` for store releases.
```bash
VITE_API_URL=http://localhost:3001
VITE_STORAGE_BUCKET=your-project.appspot.com
```

All hardcoded URLs have been removed to ensure the stack can be mirrored locally for debugging.

## 6. Environment Variables

You MUST set the following environment variables in the Cloud Run service configuration:

| Variable | Description |
| :--- | :--- |
| `REDIS_URL` | Redis connection string (e.g. from Redis Cloud). |
| `FIREBASE_SERVICE_ACCOUNT` | The full JSON string of your Firebase Service Account. |
| `FIREBASE_STORAGE_BUCKET` | The name of your storage bucket (e.g. `redditkeeperprod.appspot.com`). |
| `PORT` | `3001` (matched in Dockerfile). |

## 3. Manual Deployment (CLI)

### Build and Push
```bash
# Set your project ID
PROJECT_ID=redditkeeperprod
REGION=us-central1
IMAGE_NAME=opiniondeck-backend

# Build the image locally (Use --platform linux/amd64 for Mac M1/M2/M3)
docker build --platform linux/amd64 -t gcr.io/$PROJECT_ID/$IMAGE_NAME .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME
```

### Deploy to Cloud Run
```bash
gcloud run deploy opiniondeck-backend \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --env-vars-file env.yaml
```

## 4. Automated Deployment (GitHub Actions)

Create or update `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [ main ]
    paths:
      - 'src/**'
      - 'Dockerfile'
      - 'package*.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - id: auth
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Build and Push Container
        run: |-
          gcloud auth configure-docker
          docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/opiniondeck-backend:${{ github.sha }} .
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/opiniondeck-backend:${{ github.sha }}

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: opiniondeck-backend
          image: gcr.io/${{ secrets.GCP_PROJECT_ID }}/opiniondeck-backend:${{ github.sha }}
          region: us-central1
```

## 5. Post-Deployment
*   Update your **Chrome Extension**'s `VITE_API_URL` to point to the new Cloud Run URL.
*   Update your **Web App**'s `.env.production` to point to the new backend.
