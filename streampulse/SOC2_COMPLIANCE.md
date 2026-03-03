# Road to SOC 2 Compliance

Achieving SOC 2 compliance (specifically Type II) is a significant undertaking that verifies the security, availability, processing integrity, confidentiality, and privacy of the application’s operational environment over time.

While StreamPulse Analytics is currently a lightweight Node.js + PostgreSQL application running on AWS EKS, there are specific architectural and operational changes required to achieve full SOC 2 compliance.

## 1. Database & Storage Architecture (RDS Migration)

While we have successfully migrated from a local SQLite file to a robust PostgreSQL database running within the EKS cluster, there are still challenges for SOC 2 compliance. 
* **Requirement:** Migrate the in-cluster PostgreSQL deployment to a fully managed database like **Amazon RDS (PostgreSQL)**. 
* **Why:** SOC 2 requires strict **separation of duties**, **point-in-time recovery (PITR)**, **automated backups**, **encryption at rest using KMS**, and **detailed database audit logging** (who accessed what data and when). AWS RDS provides this out-of-the-box. Achieving verifiable audit trails on a self-managed database inside a Kubernetes pod is not sufficient for compliance.

## 1. Network & Infrastructure Security (Confidentiality)

* **Web Application Firewall (WAF):** Your EKS Application Load Balancer is currently strictly `internet-facing`. AWS WAF must be attached to the ALB to automatically block common vulnerabilities (OWASP Top 10, SQL injection, cross-site scripting) and mitigate DDoS attacks.
* **Encrypted Internal Traffic (mTLS):** While your ALB terminates HTTPS securely over the public internet, the internal cluster network traffic (the connection between your Node.js pod and your PostgreSQL pod) is currently unencrypted. SOC 2 requires end-to-end encryption. You should either implement a Service Mesh (like Istio/Linkerd) for mTLS or configure the PostgreSQL container to enforce SSL connections natively.

## 2. High Availability & Disaster Recovery (Availability)

*   **Database Persistence (Intermediate Step):** Right now, your PostgreSQL database is running as a bare deployment inside the Kubernetes cluster. If the physical AWS EC2 node holding that pod dies, your database is destroyed. *Before* you even migrate to a managed AWS RDS database, you must implement a Kubernetes **Persistent Volume Claim (PVC)** backed by an encrypted AWS Elastic Block Store (EBS) volume so the data survives pod restarts.
*   **Deployment Replicas:** The StreamPulse backend `deployment.yaml` should be locked to enforce a minimum of `2` or `3` replicas with Pod Anti-Affinity rules (so AWS guarantees the pods run on physically different server racks/Availability Zones). 

## 3. Advanced Secrets Management (Security)

*   **Kubernetes Etcd Encryption:** Right now, your `ANTHROPIC_API_KEY` and `DATABASE_URL` are stored as Kubernetes Secrets. By default, Kubernetes stores these as base64-encoded strings (plaintext) inside its underlying `etcd` database. You must configure your EKS cluster with an **AWS KMS provider** to encrypt the `etcd` volume at rest.
*   **External Secrets Management:** For ISO 27001 compliance, it would be much stronger to utilize the **AWS Secrets Manager / EKS integration**. Instead of storing secrets natively in Kubernetes, the pod securely mounts the secrets from AWS at runtime using IAM Service Roles. 

## 4. Comprehensive Observability (Processing Integrity)

*   **Application Logging:** Every sensitive action (login success/failure, data deletion, data export) must be logged securely. The StreamPulse Node.js application currently outputs raw console text logs. To pass a SOC 2 audit, application logs should be strictly formatted as **JSON**. This allows a Security Information and Event Management (SIEM) tool like Splunk or Datadog to natively ingest the logs.
*   **EKS Control Plane Logging:** You must explicitly enable "Audit" and "Authenticator" logging on your AWS EKS cluster settings. This streams raw telemetry to AWS CloudWatch, proving to auditors exactly who executed `kubectl` commands against your cluster.

## 5. Shift-Left Security & CI/CD (Change Management)

*   **ECR Image Scanning:** In AWS Elastic Container Registry (ECR), you must toggle **"Scan on Push"**. This utilizes AWS Inspector to automatically scan your `jhb-streampulse:latest` Docker image against global CVE (vulnerability) databases every time you build it.
*   **Automated Pipeline Blocks:** Your repository must enforce Branch Protection Rules requiring peer review (Pull Requests) and implement a CI/CD pipeline (GitHub Actions). The pipeline should run automated tests and container scans that block merging if a "High" or "Critical" vulnerability is detected. 

## 6. Organizational Policies & Procedures

A large portion of SOC 2 compliance is non-technical. The organization must document and enforce policies such as:
* **Information Security Policy**
* **Incident Response Plan**
* **Disaster Recovery (DR) & Business Continuity Plan (BCP)**
* **Employee Onboarding/Offboarding Checklists** (including background checks)
* **Vendor Risk Management** (vetting Anthropic/Claude's SOC 2 reports, AWS compliance, etc.)

---

### Recommended First Target
If SOC 2 compliance becomes a prioritized requirement, the highest technical priority is **migrating the in-cluster PostgreSQL database to a fully managed Amazon RDS equivalent**. This singular architectural change addresses the most rigorous compliance requirements regarding data durability, encryption, and auditability.
