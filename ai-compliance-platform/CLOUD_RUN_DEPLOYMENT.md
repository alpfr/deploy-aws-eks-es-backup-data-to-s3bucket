# Google Cloud Run & GitHub Automation Guide

Transitioning from GKE (Kubernetes) to **Google Cloud Run** allows you to operate incredibly securely utilizing 100% serverless infrastructure—where servers scale automatically down to zero when nobody uses the platform and auto-scale instantly when traffic spikes. 

This guide details exactly how to deploy your FastAPI Backend + React/Vite Frontend using Cloud Run via native **GitHub Actions automation**.

## 🚀 1. Architectural Setup

Because Cloud Run instances are stateless (they reset perfectly when spun down), replacing your internal database with an external managed database connection is strictly required:

1. **Activate Cloud SQL (PostgreSQL)**
   - Enter your GCP console and provision a new `Cloud SQL PostgreSQL 15` instance.
   - Extract your database connection string, structured as: `postgresql://user:password@publicIP:5432/ai_compliance`

2. **Configure GitHub Repository Secrets**
   In your active repository, navigate to `Settings > Secrets and variables > Actions > New repository secret`. You need exactly THREE secrets:
   - `GCP_CREDENTIALS`: Paste your Google Service Account JSON key (the account must have `Artifact Registry Writer`, `Cloud Run Admin`, and `Service Account User` roles assigned).
   - `DATABASE_URL`: Setup exactly as your `postgresql://...` URI.
   - `SECRET_KEY`: An unpredictable string sequence (ex: `A_SecReT_Prod_HaShing_kEy_81232`). This powers your JWT tokens.

## ⚙️ 2. Modify Vite for Dynamic API URLs
Currently, your local development uses a generic proxy map to bypass CORS (`/auth` -> `http://backend`). In Cloud Run, your Frontend and Backend exist on separate dynamic URLs provided securely by Google.

To allow the Frontend container to talk to the live Backend, our GitHub pipeline parses the Backend's generated URL and explicitly injects it dynamically as `VITE_API_URL` when compiling Vite during Step 6 of the Action workflow!

Ensure your dynamic environment variable is captured successfully inside your `frontend/src/contexts/ApiContext.js` like so:
```javascript
// Example modification inside ApiContext.js or where Axios connects:
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({
  baseURL: BASE_URL,
});
```
*(If you haven't explicitly wired this inside your `ApiContext`, do it seamlessly before pushing!)*

## 📦 3. Enable Artifact Registry
Ensure that you've activated **Artifact Registry APIs** in Google Cloud locally:
1. Search specifically for "Artifact Registry" 
2. Provision a new Docker repository explicitly named `ai-compliance-repo` in region `us-central1` (matching your `.yml` settings).

## 🔀 4. Triggering the Automated Action
Inside the newly provided `.github/workflows/deploy-cloudrun.yml` file:
1. Double-check the generic variables at the top under `env:` (Replace `your-google-cloud-project-id` with your GCP Project slug securely!).
2. Commit specifically to your `main` branch.

## 🗂️ How the Pipeline Orchestrates Deployments:
Once you `git push origin main`, GitHub spins an Ubuntu runner and perfectly executes this flow autonomously:
1. Checks out your entire file system natively.
2. Authenticates to Google safely utilizing your `GCP_CREDENTIALS`.
3. Builds the sleek `backend` container autonomously.
4. Uploads standard definitions matching your exact SHA hash.
5. Deploys it natively into your serverless `ai-compliance-backend` resource cluster, securely piping in your `DATABASE_URL`!
6. Extracts that newly spawned backend URL natively and passes it as a `--build-arg` cleanly to compile the React `frontend` Vite map flawlessly.
7. Deploys the beautiful Dashboard locally aligned under a separate URL space mapping natively across the internet.
8. Displays both unique URLs (example: `https://ai-compliance-frontend-xyz123.a.run.app`) straight inside your GitHub Actions Console for fast access!

No ingress mapping, node scaling logic, managing `kubectl`, or internal networking headaches strictly required. It auto-magically works cleanly through GitHub!
