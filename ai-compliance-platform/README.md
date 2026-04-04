# AI Compliance Platform

A comprehensive system for operationalizing AI compliance frameworks, serving dual purposes: enabling organizations to conduct thorough self-assessments of their AI compliance posture, and providing regulatory agencies with standardized tools for conducting AI compliance assessments.

## 🎯 Key Features

### Dual-Mode Operation
- **Self-Assessment Mode**: Organizations evaluate their own AI compliance posture
- **Regulatory Assessment Mode**: Regulatory agencies conduct standardized evaluations

### Real-Time AI Guardrails
- Automated content filtering for LLM outputs
- Industry-specific compliance rules (Financial Services, Healthcare, Automotive, Government)
- Real-time violation detection and blocking

### Automated Compliance Checking
- Continuous compliance monitoring
- Risk assessment and scoring
- Automated corrective measures

### Executive Dashboard & LLM Management
- Executive-level visual KPIs and Global Risk Heatmaps
- Real-time LLM AI Model Registry and Capabilities Matching
- Audit logging exclusively for Model Operations

### Comprehensive Audit Trail
- Complete activity logging with timestamps
- User attribution and evidence tracking
- Regulatory-grade documentation

## 🏗️ Architecture

The platform follows a microservices architecture with:
- **FastAPI Backend**: RESTful API orchestrated with Gunicorn/Uvicorn workers
- **React Frontend**: Blazing-fast frontend built with Vite and Recharts, served via slim NGINX via multi-stage builds
- **PostgreSQL Database**: Production-ready robust data storage powered natively by psycopg2
- **Deployment**: Local testing via Docker Compose & production-grade manifests via Kubernetes/GKE

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
### Quick Setup (Google Kubernetes Engine)

1. **Deploy to Google Cloud Build**
   ```bash
   gcloud builds submit --config cloudbuild.yaml .
   ```

2. **Access the Application natively**
   - Frontend React SPA: `http://34.8.110.6/`
   - Backend API Docs: `http://34.8.110.6/docs`

3. **Deploy Enterprise Mock Data**
   - Inject realistic dashboard visualizations with the PostgreSQL seeder:
   ```bash
   kubectl exec -it deployment/backend -n ai-compliance -- python seed_data.py
   ```

### Demo Accounts & Security Profiles

The platform strictly enforces secure B2B registration. Registrations using free email providers (`@gmail.com`, `@yahoo.com`) are natively blocked by the backend. All authorized registrations default to a `pending` state awaiting administrative sign-off before accessing the internal dashboards.

| Role | Username | Password | Access Rights |
|------|----------|----------|-------------|
| **Master Admin** | `admin` | `admin123` | Can approve new corporate registrations via Pending Approvals |
| Regulatory Inspector | `inspector` | `inspector123` | Conduct overarching regulatory assessments across organizations |

## 📋 Usage Guide

### For Organizations (Self-Assessment)

1. **Register** using a valid Corporate Email Domain. Wait for administrator activation.
2. **Login** seamlessly after approval.
3. **Create Assessments** for your AI systems using standardized forms.
4. **Configure Guardrails** for real-time compliance filtering rules.
5. **Monitor Analytics** through the primary dashboard.
6. **Review Audit Trail** for complete historical activity history.

### For Regulatory Agencies

1. **Login** with regulatory inspector credentials
2. **View All Organizations** under your jurisdiction
3. **Conduct Assessments** using standardized frameworks
4. **Monitor Compliance** across multiple organizations
5. **Generate Reports** for regulatory review

## 🛡️ Guardrail System

The platform includes pre-configured guardrails for:

### PII Protection
- Social Security Numbers: `\b\d{3}-\d{2}-\d{4}\b`
- Credit Card Numbers: `\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b`
- Email Addresses: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`

### Regulatory Language
- Investment Advice: `\b(guaranteed returns|risk-free investment)\b`
- Medical Claims: `\b(cure|treat|diagnose)\b.*\b(cancer|diabetes|disease)\b`

### Custom Rules
Create your own regex patterns for industry-specific compliance requirements.

## 🏭 Industry Support

### Financial Services
- Banking regulations (Basel III)
- Insurance compliance (Solvency II)
- Investment services (MiFID II)
- Anti-money laundering (AML)
- Know-your-customer (KYC)

### Healthcare
- HIPAA privacy protection
- FDA medical device regulations
- Clinical trial compliance
- Patient safety requirements

### Government/Public Sector
- Transparency requirements
- Algorithmic accountability
- Fairness in public services
- Citizen privacy protection

### Automotive
- Functional safety standards (ISO 26262)
- Autonomous vehicle regulations
- Transportation safety compliance

## 🔧 Development

### Local Development Setup

1. **Backend Development**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev  # Powered by Vite
   ```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User authentication |
| `/auth/register` | POST | User registration |
| `/organizations` | GET/POST | Organization management |
| `/assessments` | GET/POST/PUT | Assessment management |
| `/guardrails` | GET/POST | Guardrail configuration |
| `/guardrails/filter` | POST | Content filtering |
| `/api/v1/models` | GET/POST/PUT/DELETE | AI Model LLM Management via Registry |
| `/api/v1/models/audit` | GET | Audit trail exclusively for AI Models |
| `/compliance/dashboard` | GET | Dashboard data |
| `/audit-trail` | GET | Audit trail |

### Database Schema

The platform uses the following main tables:
- `users` - User accounts and roles
- `organizations` - Registered organizations
- `assessments` - Compliance assessments
- `guardrail_rules` - Content filtering rules
- `audit_trail` - Activity logging

## 🧪 Testing

### Content Filtering Test

Use the "Test Content" feature in the Guardrails section to test your rules:

```text
Test Input: "Contact John Doe at 123-45-6789 for guaranteed returns on your investment."

Expected Output: "Contact John Doe at [REDACTED] for [FLAGGED: guaranteed returns] on your investment."
```

### Assessment Workflow Test

1. Create a new self-assessment
2. Set industry profile to "Financial Services"
3. Complete the assessment with a compliance score
4. Verify the assessment appears in the dashboard

## 📊 Monitoring and Analytics

### Compliance Dashboard
- Real-time compliance status
- Assessment completion rates
- Guardrail violation trends
- Risk scoring and alerts

### Audit Trail
- Complete activity logging
- User attribution
- Resource tracking
- Regulatory-grade documentation

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Secure password hashing
- API rate limiting (production)
- CORS protection
- Input validation and sanitization

## 🚢 Deployment

### Production Deployment (GKE & Cloud Run)

This platform includes a complete suite of standard Kubernetes configuration manifests found in the `k8s/` directory alongside 100% serverless configurations.

1. **Option A: Kubernetes Deployment (GKE)**
   - See `k8s/` directory for manifests.
   - Run `kubectl apply -f k8s/` natively against your target cluster.

2. **Option B: Serverless Deployment (Google Cloud Run)**
   - Provides an auto-scaling, scale-to-zero serverless environment securely linked to a managed PostgreSQL cluster.
   - Read the explicit step-by-step setup in `CLOUD_RUN_DEPLOYMENT.md` detailing the automated integration loop.

3. **CI/CD Integration**
   - We utilize a native `cloudbuild.yaml` in the root repository seamlessly configured for **Google Cloud Build** connecting directly to your internal **Artifact Registry**. 
   - Additionally, native **GitHub Actions** workflows are templated targeting both GKE and Cloud Run structurally inside `.github/workflows/`.

## 📈 Roadmap

### Phase 1 (Current - MVP)
- ✅ Basic dual-mode assessment
- ✅ Financial services compliance
- ✅ Real-time guardrails
- ✅ Audit trail

### Phase 2 (Next)
- Multi-industry support (Healthcare, Automotive, Government)
- Advanced analytics and benchmarking
- Regulatory change tracking
- Mobile application

### Phase 3 (Future)
- AI/ML model integration
- Predictive compliance analytics
- Enterprise SSO integration
- Advanced reporting and visualization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the audit trail for debugging

## 🏷️ Version

Current Version: 1.0.0 (MVP)

---

**AI Compliance Platform** - Operationalizing AI compliance through automated guardrails and standardized assessments.