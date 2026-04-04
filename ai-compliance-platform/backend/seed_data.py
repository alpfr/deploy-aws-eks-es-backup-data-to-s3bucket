"""
AI Compliance Platform - Sample Data Seeding Script
Creates realistic demo data for testing and demonstration
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import json
import hashlib
from datetime import datetime, timedelta
import random
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/ai_compliance")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def seed_database():
    """Seed the database with comprehensive sample data"""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    conn.autocommit = False
    cursor = conn.cursor()
    
    try:
        # Clear existing data (except users and organizations created during startup)
        print("🧹 Clearing existing sample data...")
        
        # Sample organizations
        sample_orgs = [
            ("TechCorp Financial", "financial_services", "US"),
            ("HealthTech Solutions", "healthcare", "EU"),
            ("AutoDrive Systems", "automotive", "US"),
            ("GovTech Services", "government", "UK"),
            ("RetailAI Corp", "retail", "CA"),
        ]
        
        print("🏢 Creating sample organizations...")
        for name, industry, jurisdiction in sample_orgs:
            # Check if organization already exists
            cursor.execute("SELECT id FROM organizations WHERE name = %s", (name,))
            existing = cursor.fetchone()
            if not existing:
                cursor.execute(
                    "INSERT INTO organizations (name, industry, jurisdiction) VALUES (%s, %s, %s)",
                    (name, industry, jurisdiction)
                )
        conn.commit()
        
        # Get organization IDs
        cursor.execute("SELECT id, name, industry FROM organizations")
        orgs = cursor.fetchall()
        org_dict = {org['name']: (org['id'], org['industry']) for org in orgs}
        
        # Sample users for each organization
        sample_users = [
            ("alice.smith", "alice123", "organization_admin", "TechCorp Financial"),
            ("bob.johnson", "bob123", "organization_admin", "HealthTech Solutions"),
            ("carol.davis", "carol123", "organization_admin", "AutoDrive Systems"),
            ("david.wilson", "david123", "organization_admin", "GovTech Services"),
            ("eve.brown", "eve123", "organization_admin", "RetailAI Corp"),
            ("frank.miller", "frank123", "regulatory_inspector", None),
            ("grace.taylor", "grace123", "regulatory_inspector", None),
        ]
        
        print("👥 Creating sample users...")
        for username, password, role, org_name in sample_users:
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            existing = cursor.fetchone()
            if not existing:
                org_id = org_dict.get(org_name, (None, None))[0] if org_name else None
                try:
                    cursor.execute(
                        "INSERT INTO users (username, email, password_hash, role, status, organization_id) VALUES (%s, %s, %s, %s, %s, %s)",
                        (username, f"{username}@example.com", hash_password(password), role, "active", org_id)
                    )
                except Exception:
                    conn.rollback()
                    cursor.execute(
                        "INSERT INTO users (username, password_hash, role, organization_id) VALUES (%s, %s, %s, %s)",
                        (username, hash_password(password), role, org_id)
                    )
        conn.commit()
        
        # Sample guardrail rules
        sample_guardrails = [
            # Financial Services Rules
            ("PII Protection - SSN", "pii_protection", r"\b\d{3}-\d{2}-\d{4}\b", "block", "financial_services"),
            ("PII Protection - Credit Card", "pii_protection", r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b", "block", "financial_services"),
            ("Investment Advice Warning", "regulatory_language", r"\b(guaranteed returns|risk-free investment|sure profit)\b", "flag", "financial_services"),
            ("Financial Promises", "regulatory_language", r"\b(guaranteed|promise|ensure)\b.*\b(profit|return|income)\b", "flag", "financial_services"),
            
            # Healthcare Rules
            ("HIPAA - Patient ID", "pii_protection", r"\b(patient|medical)\s+(id|number)[\s:]+\d+\b", "block", "healthcare"),
            ("Medical Claims", "regulatory_language", r"\b(cure|treat|diagnose)\b.*\b(cancer|diabetes|disease)\b", "flag", "healthcare"),
            ("FDA Compliance", "regulatory_language", r"\b(FDA approved|clinically proven)\b", "flag", "healthcare"),
            
            # Automotive Rules
            ("Safety Critical", "safety_constraint", r"\b(autonomous|self-driving)\b.*\b(safe|safety|accident)\b", "escalate", "automotive"),
            ("Performance Claims", "regulatory_language", r"\b(crash-proof|accident-free|100% safe)\b", "block", "automotive"),
            
            # Government Rules
            ("Bias Detection", "bias_check", r"\b(race|gender|age)\b.*\b(better|worse|superior|inferior)\b", "escalate", "government"),
            ("Transparency", "regulatory_language", r"\b(classified|confidential|secret)\b", "flag", "government"),
        ]
        
        print("🛡️ Creating sample guardrail rules...")
        for name, rule_type, pattern, action, industry in sample_guardrails:
            # Check if rule already exists
            cursor.execute("SELECT id FROM guardrail_rules WHERE name = %s", (name,))
            existing = cursor.fetchone()
            if not existing:
                cursor.execute(
                    "INSERT INTO guardrail_rules (name, rule_type, pattern, action, is_active, industry_profile) VALUES (%s, %s, %s, %s, %s, %s)",
                    (name, rule_type, pattern, action, True, industry)
                )
        conn.commit()
        
        # Sample assessments
        print("📋 Creating sample assessments...")
        assessment_statuses = ["in_progress", "completed", "under_review"]
        assessment_types = ["self", "regulatory"]
        
        for org_name, (org_id, industry) in org_dict.items():
            if org_name == "Sample Financial Corp":  # Skip the default org
                continue
                
            # Create 2-4 assessments per organization
            num_assessments = random.randint(2, 4)
            
            for i in range(num_assessments):
                assessment_type = random.choice(assessment_types)
                status = random.choice(assessment_statuses)
                
                # Generate realistic compliance scores
                if status == "completed":
                    if industry == "financial_services":
                        compliance_score = random.uniform(75, 95)
                    elif industry == "healthcare":
                        compliance_score = random.uniform(80, 98)
                    elif industry == "government":
                        compliance_score = random.uniform(85, 99)
                    else:
                        compliance_score = random.uniform(70, 90)
                else:
                    compliance_score = None
                
                # Generate sample findings
                findings = []
                if status == "completed":
                    if compliance_score < 80:
                        findings = [
                            "PII detection rules need strengthening",
                            "Regulatory language compliance requires attention",
                            "Additional staff training recommended"
                        ]
                    elif compliance_score < 90:
                        findings = [
                            "Minor gaps in documentation",
                            "Consider additional guardrail rules"
                        ]
                    else:
                        findings = [
                            "Excellent compliance posture",
                            "All requirements met"
                        ]
                
                # Random creation date within last 90 days
                created_at = datetime.now() - timedelta(days=random.randint(1, 90))
                completed_at = created_at + timedelta(days=random.randint(1, 30)) if status == "completed" else None
                
                cursor.execute("""
                    INSERT INTO assessments (
                        organization_id, assessment_type, industry_profile, jurisdiction, 
                        status, compliance_score, findings, created_at, completed_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    org_id, assessment_type, industry, "US", status, compliance_score,
                    json.dumps(findings), created_at.isoformat(), 
                    completed_at.isoformat() if completed_at else None
                ))
        conn.commit()
        
        # Sample audit trail entries
        print("📝 Creating sample audit trail...")
        cursor.execute("SELECT id, username FROM users")
        users = cursor.fetchall()
        
        # Generate audit trail entries for the last 30 days
        for _ in range(50):
            user = random.choice(users)
            user_id, username = user['id'], user['username']
            
            actions = ["CREATE", "UPDATE", "FILTER", "LOGIN"]
            resource_types = ["assessment", "guardrail_rule", "organization", "llm_content"]
            
            action = random.choice(actions)
            resource_type = random.choice(resource_types)
            
            # Generate realistic details based on action
            if action == "CREATE":
                details = {"action": "created", "resource": resource_type}
            elif action == "UPDATE":
                details = {"action": "updated", "changes": ["status", "score"]}
            elif action == "FILTER":
                details = {
                    "violations": random.randint(0, 3),
                    "is_compliant": random.choice([True, False]),
                    "applied_rules": random.randint(1, 5)
                }
            else:  # LOGIN
                details = {"action": "login", "success": True}
            
            timestamp = datetime.now() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            cursor.execute("""
                INSERT INTO audit_trail (user_id, action, resource_type, resource_id, details, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user_id, action, resource_type, random.randint(1, 10),
                json.dumps(details), timestamp.isoformat()
            ))
        
        conn.commit()

        # Create AI Models
        sample_models = [
            ("gpt-4-turbo", "GPT-4 Turbo", "OpenAI", "2024-04-09", "Most capable OpenAI model", ["text", "vision", "code"], ["financial_services", "healthcare", "automotive", "government", "retail"], True, True),
            ("gpt-3.5-turbo", "GPT-3.5 Turbo", "OpenAI", "0125", "Fast and efficient OpenAI model", ["text", "code"], ["retail", "automotive"], True, False),
            ("claude-3-opus", "Claude 3 Opus", "Anthropic", "20240229", "Most powerful Anthropic model", ["text", "vision", "code", "analysis"], ["financial_services", "healthcare", "government"], True, True),
            ("claude-3-sonnet", "Claude 3 Sonnet", "Anthropic", "20240229", "Balanced Anthropic model", ["text", "vision", "code"], ["financial_services", "retail", "automotive"], True, False),
            ("gemini-1.5-pro", "Gemini 1.5 Pro", "Google", "latest", "Advanced Google model", ["text", "vision", "audio", "code"], ["financial_services", "healthcare", "automotive"], True, True),
            ("llama-3-70b", "Llama 3 70B", "Meta", "latest", "Open weights model", ["text", "code"], ["retail", "automotive"], True, False),
        ]
        
        print("🤖 Creating sample AI models...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_models (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                provider TEXT NOT NULL,
                version TEXT,
                description TEXT,
                capabilities TEXT,
                supported_industries TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                is_recommended BOOLEAN DEFAULT FALSE,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        for m_id, name, provider, version, desc, caps, inds, is_active, is_rec in sample_models:
            cursor.execute("SELECT id FROM ai_models WHERE id = %s", (m_id,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO ai_models (id, name, provider, version, description, capabilities, supported_industries, is_active, is_recommended)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (m_id, name, provider, version, desc, json.dumps(caps), json.dumps(inds), is_active, is_rec))
        conn.commit()

        print("✅ Sample data created successfully!")
        
        # Print summary
        cursor.execute("SELECT COUNT(*) as c FROM organizations")
        org_count = cursor.fetchone()['c']
        cursor.execute("SELECT COUNT(*) as c FROM users")
        user_count = cursor.fetchone()['c']
        cursor.execute("SELECT COUNT(*) as c FROM assessments")
        assessment_count = cursor.fetchone()['c']
        cursor.execute("SELECT COUNT(*) as c FROM guardrail_rules")
        guardrail_count = cursor.fetchone()['c']
        cursor.execute("SELECT COUNT(*) as c FROM audit_trail")
        audit_count = cursor.fetchone()['c']
        
        print(f"""
📊 Database Summary:
   Organizations: {org_count}
   Users: {user_count}
   Assessments: {assessment_count}
   Guardrail Rules: {guardrail_count}
   Audit Trail Entries: {audit_count}

👤 Sample User Accounts:
   alice.smith / alice123 (TechCorp Financial - Admin)
   bob.johnson / bob123 (HealthTech Solutions - Admin)
   carol.davis / carol123 (AutoDrive Systems - Admin)
   david.wilson / david123 (GovTech Services - Admin)
   eve.brown / eve123 (RetailAI Corp - Admin)
   frank.miller / frank123 (Regulatory Inspector)
   grace.taylor / grace123 (Regulatory Inspector)
        """)
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🌱 Seeding AI Compliance Platform database...")
    seed_database()