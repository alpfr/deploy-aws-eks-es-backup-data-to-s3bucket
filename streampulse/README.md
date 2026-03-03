# StreamPulse Analytics

A dynamic, zero-configuration streaming analytics dashboard with a PostgreSQL backend, generic CSV parsing, AWS IAM Role-Based Access Control (RBAC) via OIDC, and AI-powered insights via Claude.

## Quick Start (Mac)

```bash
# Double-click start.command, or:
chmod +x start.command
./start.command
```

Opens at **http://localhost:8000**

## Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Seed database (first run)
node seed.js                          # Built-in 2026 data only
node seed.js path/to/your-data.csv    # Import from CSV file

# 3. Build frontend
npx vite build

# 4. Start server
node server.js
```

## Zero-Config & Data Privacy

StreamPulse is built for maximum data privacy and low configuration overhead:
- **Scalable Storage:** All analytics data is stored natively in PostgreSQL. No local file attachments are required.
- **Total Data Ownership:** Your church's data never leaves your internal network unless you explicitly provide an `ANTHROPIC_API_KEY` to enable the Claude AI Insights feature.
- **Role-Based Access:** StreamPulse natively reads Application Load Balancer `x-amzn-oidc-data` headers to map IAM/Cognito roles securely to Viewer, Editor, or Admin profiles without custom login passwords.

## AI Insights (Powered by Claude)


StreamPulse can analyze your streaming data with AI and generate natural-language summaries, trend highlights, platform analysis, alerts, and actionable recommendations.

### Setup

1. Get an API key from [console.anthropic.com](https://console.anthropic.com) → **API Keys** → **Create Key**
2. Start the server with the key:

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
node server.js
```

The server banner will show `✨ AI Insights: ON` when configured.

### How It Works

- **Auto-generate after upload** — Every CSV upload automatically triggers an AI analysis in the background
- **Manual generate** — Admins can click the **Generate** button in the AI Insights panel anytime
- **View insights** — Click the **✨ AI Insights** button in the header, or the purple banner on the Overview tab

### What You Get

| Section | Description |
|---------|-------------|
| **Executive Summary** | 2-3 sentence overview of streaming health |
| **Key Highlights** | 4-6 specific insights with trend icons |
| **Platform Analysis** | Which platforms are growing or declining |
| **Alerts** | Warnings and observations with severity levels |
| **Recommendation** | One specific, actionable suggestion for the media team |

### Cost

Each AI Insights generation costs roughly **$0.01–$0.02** (uses Claude Sonnet, ~1,500 tokens per call). Very affordable — even generating daily would cost under $1/month.

### Docker with AI

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key docker compose up -d
```

## CSV Upload

1. Make sure you are authenticated with an IAM Role of `editor` or `admin`.
2. Click the **Upload CSV** button in the header
3. Drag & drop your CSV file or click to browse
4. Choose mode:
   - **Merge/Append** — adds new weeks, updates existing ones
   - **Replace All** — clears database, imports fresh
5. Click Upload

The parser automatically scans the top rows of your CSV to discover services, streams, and platforms dynamically. No hardcoded column formats are required.

## CSV Export

Click **Export CSV** to download all current data as a flat CSV file.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | All weekly data + special events |
| GET | `/api/data/:service` | Data for one service |
| GET | `/api/special-events` | Special events only |
| GET | `/api/stats` | Summary statistics |
| GET | `/api/uploads` | Upload history |
| GET | `/api/export` | Download data as CSV |
| GET | `/api/insights` | Latest AI insight |
| GET | `/api/insights/status` | AI configuration status |
| GET | `/api/insights/history` | Past insight summaries |
| POST | `/api/upload` | Upload CSV (requires editor/admin) |
| POST | `/api/data` | Manual entry (requires editor/admin) |
| POST | `/api/insights/generate` | Generate new AI insight (requires editor/admin) |
| DELETE | `/api/data/:service` | Delete service data (requires admin) |

## AWS EKS Production Deployment

StreamPulse Analytics is packaged as a multi-architecture Docker container (`linux/amd64`, `linux/arm64`) and can be seamlessly deployed to AWS Elastic Kubernetes Service (EKS).

```bash
# Apply the Kubernetes manifests
kubectl apply -f k8s.yaml
```

The production EKS deployment features:
- **PostgreSQL Database:** Handled externally via AWS RDS to ensure scalable and durable analytics data storage.
- **AWS Cognito Auth:** Fully integrated with AWS Application Load Balancer (ALB) Ingress to enforce AWS Cognito user authentication before allowing access to the dashboard.
- **Secrets Management:** Secures the `ANTHROPIC_API_KEY` and `DATABASE_URL` via native Kubernetes Secrets.

## Local Docker Deployment

```bash
# Build and run locally
docker compose up -d

# With AI enabled
ANTHROPIC_API_KEY=sk-ant-api03-your-key docker compose up -d
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |
| `MOCK_AUTH_ROLE` | *(none)* | For local testing of IAM bypass (`admin`, `editor`, `viewer`) |
| `DATABASE_URL` | *(none)* | PostgreSQL Connection String |
| `ANTHROPIC_API_KEY` | *(none)* | Claude API key for AI Insights (optional) |

## Project Structure

```
├── server.js          # Express API server + AI insights engine
├── db.js              # PostgreSQL database connection pool
├── csv-parser.js      # JHB CSV format parser
├── seed.js            # Database seeder
├── src/
│   ├── Dashboard.jsx  # React dashboard + AI insights panel
│   └── main.jsx       # Entry point
├── public/            # Built frontend
├── start.command      # Mac launcher
├── Dockerfile         # Container build
└── docker-compose.yml # Docker deployment
```

## Database

PostgreSQL relational tables map to your unique streaming environment.

### Tables

- **config** — Dynamic UI configuration, service definitions, colors, and parsed platform lists
- **weekly_data** — Weekly viewer counts per service (stores platforms automatically as JSON)
- **special_events** — Discovered event metadata
- **special_event_data** — Daily viewer counts for events (stores platforms automatically as JSON)
- **upload_history** — CSV upload audit log
- **ai_insights** — AI-generated analysis history

## Supported Platforms

StreamPulse Analytics is completely dynamic. It will read whatever platform columns you put in your CSV (e.g., YouTube, Twitch, TikTok, Boxcast, PT Online Viewers) and automatically build the database schema and UI to track them.

## Compliance

For information regarding the roadmap and requirements for achieving SOC 2 Compliance (Type II) with StreamPulse Analytics, please refer to the [SOC 2 Compliance Guide](SOC2_COMPLIANCE.md).
