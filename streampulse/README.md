# StreamPulse Analytics

A dynamic, zero-configuration streaming analytics dashboard with a PostgreSQL backend, generic CSV parsing, AWS IAM Role-Based Access Control (RBAC) via OIDC, and AI-powered insights via Claude.

**Production URL:** [https://jhbstreampulse.opssightai.com](https://jhbstreampulse.opssightai.com)

## Services Tracked

| Service | Color | Years | Platforms |
|---------|-------|-------|-----------|
| Line Crossers | Purple (#A855F7) | 2023 | YouTube, Facebook, X (Twitter), Instagram |
| Insights with Pastor T. | Amber (#F59E0B) | 2025–2026 | YouTube, Facebook, X (Twitter), Instagram, Telegram, TikTok |
| JHB Services | Indigo (#6366F1) | 2023–2026 | YouTube, Facebook, X (Twitter), Instagram, Telegram, Emerge, Boxcast, TikTok |
| JHB Charlotte | Pink (#EC4899) | 2023–2026 | YouTube, Facebook, X (Twitter), Instagram, Telegram, TikTok |
| JHB Bible Study – Word Power | Green (#10B981) | 2025–2026 | YouTube, Facebook, X (Twitter), Instagram, Telegram, Zoom, Boxcast |

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

# 2. Start PostgreSQL
docker compose up -d postgres

# 3. Seed database (first run)
PORT=8000 node seed.js                          # Built-in 2026 data only
PORT=8000 node seed.js path/to/your-data.csv    # Import from CSV file

# 4. Build frontend
npx vite build

# 5. Start server
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

StreamPulse is deployed to **AWS EKS** (`jhb-streampulse-cluster`, `us-east-1`) and accessible at [https://jhbstreampulse.opssightai.com](https://jhbstreampulse.opssightai.com).

### Infrastructure

| Component | Detail |
|-----------|--------|
| **EKS Cluster** | `jhb-streampulse-cluster` (5 nodes, v1.31) |
| **Namespace** | `jhb-streampulse` |
| **ECR Repository** | `713220200108.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse` |
| **ALB Ingress** | Internet-facing, `alb` IngressClass |
| **Domain** | `jhbstreampulse.opssightai.com` (Route 53 CNAME → ALB) |
| **TLS Certificate** | ACM cert for `jhbstreampulse.opssightai.com` (valid until 2027-03-16) |
| **Cognito Auth** | Pool `jhb-streampulse-users` (`us-east-1_fZ6Vfj5k1`) |
| **Secrets** | `streampulse-secrets` (DATABASE_URL, ANTHROPIC_API_KEY) |
| **PostgreSQL** | In-cluster pod (`postgres:15`, user `streamuser`, db `streamdb`) |

### Build & Deploy

```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 713220200108.dkr.ecr.us-east-1.amazonaws.com

# 2. Build for amd64 (IMPORTANT: EKS nodes are x86_64, not arm64)
docker build --platform linux/amd64 -t 713220200108.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:latest .

# 3. Push to ECR
docker push 713220200108.dkr.ecr.us-east-1.amazonaws.com/jhb-streampulse:latest

# 4. Apply manifests & restart
kubectl apply -f k8s.yaml
kubectl rollout restart deployment/jhb-streampulse -n jhb-streampulse

# 5. Verify rollout
kubectl rollout status deployment/jhb-streampulse -n jhb-streampulse --timeout=90s
```

### ALB Ingress Configuration

The ALB Ingress (`jhb-streampulse-alb`) provides:
- **HTTPS** with ACM certificate and HTTP→HTTPS redirect (port 80 → 443)
- **Cognito authentication** — unauthenticated requests redirect to Cognito hosted UI
- **Health checks** on `/api/stats` (30s interval, 5s timeout)
- **IP target type** — routes directly to pod IPs

Key annotations in the Ingress resource:
```yaml
alb.ingress.kubernetes.io/scheme: internet-facing
alb.ingress.kubernetes.io/target-type: ip
alb.ingress.kubernetes.io/auth-type: cognito
alb.ingress.kubernetes.io/ssl-redirect: "443"
alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:713220200108:certificate/9ebb58d2-...
alb.ingress.kubernetes.io/healthcheck-path: /api/stats
```

### Kubernetes Secrets

```bash
# Create or update secrets
kubectl create secret generic streampulse-secrets -n jhb-streampulse \
  --from-literal=DATABASE_URL=postgres://streamuser:streampass@postgres:5432/streamdb \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-api03-your-key-here \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Local Docker Deployment

```bash
# Build and run locally
docker compose up -d

# With AI enabled
ANTHROPIC_API_KEY=sk-ant-api03-your-key docker compose up -d
```

### Local Development (Vite + Express)

```bash
# Terminal 1: Start PostgreSQL
docker compose up -d postgres

# Terminal 2: Start Express API server
PORT=8003 node server.js

# Terminal 3: Start Vite dev server (proxies /api to Express)
npx vite --port 5175

# Open http://localhost:5175
```

The Vite dev server proxies `/api` requests to `http://localhost:8003` (configurable in `vite.config.js`).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |
| `MOCK_AUTH_ROLE` | *(none)* | For local testing of IAM bypass (`admin`, `editor`, `viewer`) |
| `DATABASE_URL` | *(none)* | PostgreSQL Connection String |
| `ANTHROPIC_API_KEY` | *(none)* | Claude API key for AI Insights (optional) |

## CSV Parser

The CSV parser (`csv-parser.js`) uses a **3-phase service detection algorithm**:

1. **Phase 1 — Header scan:** Scans the first few rows for service name patterns (e.g., "JHB January 2023", "Line Crossers February 2025")
2. **Phase 2 — Column mapping:** Maps column positions to services based on header blocks separated by empty columns
3. **Phase 3 — Data extraction:** Reads platform rows (YouTube, Facebook, X/Twitter, Instagram, Telegram, TikTok, etc.) and weekly totals

Supported CSV formats:
- Multi-service side-by-side layout (JHB, JHB Charlotte, Bible Study in parallel columns)
- Monthly blocks with weekly dates as column headers
- Special events section (14 Days of Glory, Peniel, GLC, Watch Night, etc.)
- Branded platform colors are applied automatically per the `PLATFORM_STYLE` and `SERVICE_PALETTE` maps

## Project Structure

```
├── server.js              # Express API server + AI insights engine
├── db.js                  # PostgreSQL database layer (6 tables)
├── csv-parser.js          # 3-phase CSV parser with branded colors
├── seed.js                # Database seeder (built-in or CSV import)
├── vite.config.js         # Vite config (proxy, build output)
├── src/
│   ├── Dashboard.jsx      # Main React dashboard component
│   ├── main.jsx           # React entry point
│   ├── components/
│   │   ├── Modals/
│   │   │   ├── AboutModal.jsx
│   │   │   ├── EntryModal.jsx
│   │   │   ├── InsightsPanel.jsx
│   │   │   └── UploadModal.jsx
│   │   └── UI/
│   │       ├── NotifPanel.jsx
│   │       └── StatCard.jsx
│   └── utils/
│       ├── config.js
│       └── helpers.js
├── scripts/
│   └── migrate_sqlite_to_pg.js  # SQLite → PostgreSQL migration
├── public/                # Built frontend (Vite output)
├── k8s.yaml               # Kubernetes deployment + PostgreSQL
├── k8s_svc.yaml           # NodePort service
├── Dockerfile             # Multi-stage build (amd64 for EKS)
├── docker-compose.yml     # Local Docker deployment
└── start.command          # Mac launcher
```

## Database

PostgreSQL 15 with 6 tables, auto-created on startup via `initDB()` in `db.js`.

### Schema

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `config` | Dynamic UI configuration (services, colors, platforms) | `key` (PK), `value` (JSON text) |
| `weekly_data` | Weekly viewer counts per service | `service`, `date` (UNIQUE), `month`, `platforms` (JSONB), `total` |
| `special_events` | Event metadata | `name`, `dates_label` (UNIQUE together) |
| `special_event_data` | Per-session event viewer counts | `event_id` (FK → special_events), `date`, `platforms` (JSONB), `total` |
| `upload_history` | CSV upload audit log | `filename`, `uploaded_at`, `mode`, `rows_added/updated/total` |
| `ai_insights` | AI-generated analysis history | `trigger_type`, `summary`, `highlights` (JSONB), `alerts` (JSONB), token counts |

### Indexes

- `idx_weekly_service` on `weekly_data(service)`
- `idx_weekly_date` on `weekly_data(date)`
- Cascade delete on `special_event_data` → `special_events`

### Seeding Data via CSV

```bash
# Import a CSV file (upserts — merges new data, updates existing)
PORT=8000 node seed.js /path/to/your-data.csv

# NOTE: Each CSV seed overwrites the services config. After importing
# multiple years, restore the full 5-service config via the dashboard
# or direct SQL update.
```

## Supported Platforms

StreamPulse Analytics is completely dynamic. It will read whatever platform columns you put in your CSV (e.g., YouTube, Twitch, TikTok, Boxcast, PT Online Viewers) and automatically build the database schema and UI to track them.

## Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **Overview** | Summary stats, weekly trend chart, AI insights banner |
| **Trends** | Multi-service line charts with date range filtering |
| **Weekly Comparison** | Side-by-side week-over-week comparison |
| **All Services** | Service summary cards with weekly data counts |
| **Data Table** | Raw data table with search and filtering |

## Compliance

For information regarding the roadmap and requirements for achieving SOC 2 Compliance (Type II) with StreamPulse Analytics, please refer to the [SOC 2 Compliance Guide](SOC2_COMPLIANCE.md).
