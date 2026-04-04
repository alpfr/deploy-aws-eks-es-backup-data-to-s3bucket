# AI Compliance Platform - Demo Guide

This guide will walk you through demonstrating the key features of the AI Compliance Platform prototype.

## 🚀 Quick Setup (Google Kubernetes Engine)

1. **Deploy to Google Cloud**
   ```bash
   gcloud builds submit --config cloudbuild.yaml .
   ```

2. **Access the application**
   - Frontend: `http://34.8.110.6/`
   - Backend API Docs: `http://34.8.110.6/docs`

3. **Populate Enterprise Demonstration Data**
   For a realistic showcase, you can inject hundreds of mock records directly into the live GKE PostgreSQL container:
   ```bash
   kubectl exec -it deployment/backend -n ai-compliance -- python seed_data.py
   ```

## 👥 Demo Accounts

| Role | Username | Password | Organization |
|------|----------|----------|--------------|
| **Organization Admin** | `admin` | `admin123` | Sample Financial Corp |
| **Regulatory Inspector** | `inspector` | `inspector123` | N/A |
| **Additional Orgs** | `alice.smith` | `alice123` | TechCorp Financial |
| **Additional Orgs** | `bob.johnson` | `bob123` | HealthTech Solutions |

## 🎯 Demo Scenarios

### Scenario 1: Secure B2B Corporate Registration & Approval

**Demonstrate the enterprise security access flow:**

1. **Attempt Unauthorized Registration**
   - Navigate to the **Register** tab.
   - Try registering with a free email (e.g., `user@gmail.com`).
   - *Observe the system actively blocking non-corporate domain emails.*

2. **Valid Registration**
   - Register a user with a valid corporate email (e.g., `alice@techcorp.com`) and select the `Regulatory Inspector` role.
   - The user account is created but natively locked in a **Pending** state.
   - An automated mock email is dispatched to the platform administrators.
   - *Observe that the new user is actively blocked from logging in until approved.*

3. **Administrator Approval**
   - Login as the Master Admin (`admin` / `admin123`).
   - Navigate to the **Pending Approvals** tab dynamically populated on the sidebar.
   - Review the incoming B2B access request.
   - Click **Authorize Access**.
   - The user is fully approved, and an activation email is triggered.

### Scenario 2: Organization Self-Assessment

**Login as Organization Admin (`admin` / `admin123`)**

1. **Dashboard Overview**
   - View dual-axis visual Compliance Trends powered by Recharts
   - Check compliance metrics and averages
   - Check recent violations
   - Review assessment status

2. **Create New Assessment**
   - Navigate to Assessments
   - Click "New Assessment"
   - Select "Self Assessment"
   - Choose "Financial Services" industry
   - Set status to "In Progress"

3. **Configure Guardrails**
   - Navigate to Guardrails
   - View existing PII protection rules
   - Test content filtering with sample text:
     ```
     Contact John at 123-45-6789 for guaranteed returns on your investment.
     ```
   - Observe how SSN is blocked and "guaranteed returns" is flagged

4. **Complete Assessment**
   - Return to Assessments
   - Edit the assessment
   - Set status to "Completed"
   - Add compliance score (e.g., 85%)
   - Save changes

### Scenario 2: Regulatory Inspection

**Login as Regulatory Inspector (`inspector` / `inspector123`)**

1. **Multi-Organization Dashboard**
   - View all organizations under jurisdiction
   - Check compliance rates across organizations
   - Review recent assessment activity

2. **Organization Management**
   - Navigate to Organizations
   - View all registered organizations
   - Create a new organization:
     - Name: "Demo Healthcare Corp"
     - Industry: "Healthcare"
     - Jurisdiction: "US"

3. **Regulatory Assessment**
   - Navigate to Assessments
   - Create new assessment for any organization
   - Select "Regulatory Assessment"
   - Set appropriate industry profile
   - Complete with compliance score

4. **Audit Trail Review**
   - Navigate to Audit Trail
   - Review all compliance activities
   - Filter by action type (CREATE, UPDATE, FILTER)
   - Examine detailed activity logs

### Scenario 3: Guardrail Testing

**Use either account**

1. **Test PII Protection**
   - Navigate to Guardrails
   - Click "Test Content"
   - Enter text with PII:
     ```
     Customer John Smith (SSN: 123-45-6789) applied for credit card 4532-1234-5678-9012.
     ```
   - Observe blocking of sensitive information

2. **Test Regulatory Language**
   - Test financial compliance:
     ```
     Our AI investment advisor guarantees 20% returns with zero risk to your portfolio.
     ```
   - See how regulatory language is flagged

3. **Create Custom Rule**
   - Click "New Guardrail"
   - Name: "Email Protection"
   - Type: "PII Protection"
   - Pattern: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`
   - Action: "Block"
   - Test with email addresses

### Scenario 4: Cross-Industry Compliance

**Demonstrate industry-specific features**

1. **Financial Services**
   - Show banking regulation compliance
   - Demonstrate PCI DSS patterns
   - Test investment advice filtering

2. **Healthcare**
   - Login as `bob.johnson` / `bob123`
   - Show HIPAA compliance rules
   - Test medical claim filtering
   - Demonstrate patient data protection

3. **Government**
   - Show transparency requirements
   - Test bias detection rules
   - Demonstrate fairness assessments

## 🎪 Demo Script

### Opening (2 minutes)
"Today I'll demonstrate the AI Compliance Platform - a comprehensive solution that operationalizes AI compliance through automated guardrails and standardized assessments. The platform serves both organizations conducting self-assessments and regulatory agencies performing oversight."

### Core Features Demo (10 minutes)

**Dual-Mode Assessment (3 minutes)**
- Show organization self-assessment workflow
- Switch to regulatory inspector view
- Demonstrate standardized assessment tools

**Real-Time Guardrails (4 minutes)**
- Test content filtering with live examples
- Show PII protection in action
- Demonstrate regulatory language detection

**Compliance Automation (3 minutes)**
- Show automated risk scoring
- Demonstrate continuous monitoring
- Review audit trail capabilities

### Industry Applications (5 minutes)
- Financial services compliance (Basel III, PCI DSS)
- Healthcare regulations (HIPAA, FDA)
- Government transparency requirements
- Cross-industry benchmarking

### Closing (3 minutes)
"The platform transforms regulatory awareness into auditable, scalable routines while building credibility and trust through transparent, standardized assessment processes."

## 🔧 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   docker-compose logs
   ./stop.sh && ./start.sh
   ```

2. **Database issues**
   ```bash
   docker-compose down -v
   ./setup.sh
   ```

3. **Frontend not loading**
   - Check if port 3000 is available
   - Verify backend is running on port 8000

### Reset Demo Data

```bash
cd backend
python seed_data.py
```

## 📊 Key Metrics to Highlight

- **Compliance Score**: 85%+ average across organizations
- **Guardrail Effectiveness**: 99%+ violation detection rate
- **Assessment Time**: 50% reduction vs manual processes
- **Audit Trail**: 100% activity coverage with timestamps

## 🎯 Value Propositions

### For Organizations
- **Proactive Compliance**: Identify issues before regulatory review
- **Cost Reduction**: Automated monitoring reduces manual effort
- **Risk Mitigation**: Real-time guardrails prevent violations
- **Audit Readiness**: Complete documentation and evidence

### For Regulators
- **Standardized Assessment**: Consistent evaluation across organizations
- **Efficiency Gains**: Automated tools reduce inspection time
- **Evidence Quality**: Complete audit trails with timestamps
- **Cross-Organization Insights**: Benchmarking and trend analysis

## 📈 Next Steps

After the demo, discuss:
- Implementation timeline (8-week MVP)
- Industry-specific customization
- Integration with existing systems
- Regulatory agency partnerships
- Pricing and licensing models

---

### Scenario 4: Platform Administration & Settings

**1. Interactive Configuration Panel**
   - Click the **Settings** tab in the sidebar.
   - Toggle the "Strict Mode Auto-Blocking" switch for the Security Edge Engine.
   - Adjust the "Real-time email alerts" settings.
   - Click **Save Configuration** and observe the live Snackbar toast validation.

**2. Corporate Platform Information**
   - Click the **About** tab to review the platform build and regulatory version details.

---

**Ready to transform AI compliance from reactive to proactive!** 🚀