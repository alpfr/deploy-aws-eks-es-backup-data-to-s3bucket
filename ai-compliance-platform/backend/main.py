"""
AI Compliance Platform - Main FastAPI Application
Thin entry point that assembles routers, middleware, and lifecycle hooks.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config import ALLOWED_ORIGINS, ENABLE_SEED_DATA
from auth import hash_password
from db import init_database, get_db
from routes.auth_routes import router as auth_router
from routes.admin_routes import router as admin_router
from routes.organization_routes import router as org_router
from routes.assessment_routes import router as assessment_router
from routes.guardrail_routes import router as guardrail_router
from routes.dashboard_routes import router as dashboard_router
from routes.model_routes import router as model_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_database()

        if not ENABLE_SEED_DATA:
            logger.info("Seed data disabled. Set ENABLE_SEED_DATA=true to populate demo data.")
        else:
            with get_db() as conn:
                existing_org = conn.execute("SELECT id FROM organizations LIMIT 1").fetchone()
                if not existing_org:
                    cursor = conn.execute(
                        "INSERT INTO organizations (name, industry, jurisdiction) VALUES (%s, %s, %s) RETURNING id",
                        ("Sample Financial Corp", "financial_services", "US"),
                    )
                    org_id = cursor.fetchone()["id"]

                    conn.execute(
                        "INSERT INTO users (username, email, password_hash, role, status, organization_id) "
                        "VALUES (%s, %s, %s, %s, %s, %s)",
                        (
                            "admin",
                            "admin@alpfr.com",
                            hash_password(os.getenv("SEED_ADMIN_PASSWORD", "changeme-on-first-login")),
                            "organization_admin",
                            "active",
                            org_id,
                        ),
                    )

                    conn.execute(
                        "INSERT INTO users (username, email, password_hash, role, status) VALUES (%s, %s, %s, %s, %s)",
                        (
                            "inspector",
                            "inspector@alpfr.com",
                            hash_password(os.getenv("SEED_INSPECTOR_PASSWORD", "changeme-on-first-login")),
                            "regulatory_inspector",
                            "active",
                        ),
                    )

                    sample_rules = [
                        ("PII Protection - SSN", "pii_protection", r"\b\d{3}-\d{2}-\d{4}\b", "block"),
                        ("PII Protection - Credit Card", "pii_protection", r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b", "block"),
                        ("Regulatory Language - Investment Advice", "regulatory_language", r"\b(guaranteed returns|risk-free investment)\b", "flag"),
                    ]
                    for name, rule_type, pattern, action in sample_rules:
                        conn.execute(
                            "INSERT INTO guardrail_rules (name, rule_type, pattern, action, industry_profile) "
                            "VALUES (%s, %s, %s, %s, %s)",
                            (name, rule_type, pattern, action, "financial_services"),
                        )

                    conn.commit()
                    logger.info("Seed data created successfully.")
    except Exception as e:
        logger.warning(f"Initialization failed (PostgreSQL may still be starting): {e}")

    yield


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AI Compliance Platform API",
    description="Backend API for AI compliance assessment and guardrail management",
    version="2.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(org_router)
app.include_router(assessment_router)
app.include_router(guardrail_router)
app.include_router(dashboard_router)
app.include_router(model_router)


@app.get("/")
async def root():
    return {"message": "AI Compliance Platform API is running", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
