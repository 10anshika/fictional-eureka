# 🚀 Fictional Eureka

> **D2C meets Fintech Reconciliation**  
> A production-minded product demonstration

**Built to showcase end-to-end product thinking** — from PRD to polished implementation.
---

## ⚡ At a Glance

| Aspect                  | Details                                      |
|-------------------------|----------------------------------------------|
| **Core Focus**          | D2C + Quick Commerce Fintech Reconciliation  |
| **Key Deliverable**     | AI-Powered Discrepancy Classifier            |
| **Time to Understand**  | < 10 seconds                                 |
| **Demo Ready**          | ✅ Standalone classifier + authenticated app |

---

## 📋 What This Project Demonstrates

This project was deliberately built to map directly to Logibricks Product Intern requirements:

| Logibricks Requirement                  | How It's Demonstrated                                                                 | Evidence |
|-----------------------------------------|---------------------------------------------------------------------------------------|----------|
| **Owning PRDs end-to-end**              | Full Product Requirements Document for AI feature                                    | [PRD →](./docs/PRD_AI_Discrepancy_Classifier_Comprehensive.md) |
| **Working with engineering on APIs**    | Designed a public demo classifier and authenticated persistence endpoint             | `backend/routes/ai.py` + registration in `main.py` |
| **Database-level logic**                | AI classification results persisted with full schema design                          | `ai_classification`, `ai_confidence`, `ai_explanation`, `ai_suggested_action`, `ai_processed_at` |
| **Building AI-powered internal tools**  | Structured LLM prompt + classification workflow with graceful fallbacks              | Domain-specific prompt for Indian D2C/Quick Commerce |
| **Deep e-commerce / quick commerce**    | Native support for Shopify + WooCommerce + Razorpay with realistic data flows        | Multi-platform reconciliation engine |
| **Fintech reconciliation & edge cases** | Handles ghost orders, refund traps, partial returns, fee mismatches, GST/ITC issues  | Reconciliation logic + alerts + exports |

---

## 🛠 Tech Stack

**Backend**
- FastAPI + Uvicorn
- Supabase (PostgreSQL + Row Level Security + Auth)
- Python (Pydantic, httpx)
- Platform integrations: Shopify Admin API, WooCommerce, Razorpay

**Frontend**
- Next.js 14 + TypeScript + React
- Tailwind CSS + Radix UI + shadcn components
- Supabase client
- Recharts (visualizations)

**Other**
- Celery + Redis (background jobs)
- Resend (email alerts)
- Full database schema with audit logs, thresholds, and multi-platform support

---

## ✨ Key Features

- **🤖 AI Discrepancy Classifier**  
  `POST /api/ai/classify` returns a safe, stateless demo classification. Authenticated users can run `POST /api/transactions/{id}/classify` to persist an analysis to their organization’s transaction.

- **🔄 Multi-Platform Reconciliation Engine**  
  Shopify + WooCommerce order matching against Razorpay settlements. Detects ghost orders, variances, refund traps, and partial refunds.

- **📊 Modern Dashboard**  
  Real-time transaction view, filters by platform/status, AI insights visible in the UI.

- **🔔 Intelligent Alerts**  
  Configurable thresholds for ghost orders and variances. Multi-channel support (email, Slack, WhatsApp).

- **📤 Export & Compliance**  
  Tally ERP export + ITC recovery reporting (Razorpay fees + GST).

- **🔐 Enterprise-Oriented Foundations**
  Supabase RLS, encrypted credentials, audit logs, role-based access (Owner/Admin/CA/Viewer).

---

## 🚀 How to Run

### 1. Backend (from the repository root)
```bash
# Python 3.11 is required (the repository pins 3.11.8).
pip install -r backend/requirements.txt

# Required for data-backed routes: Supabase credentials + FERNET_KEY
# Optional but recommended: LLM_API_KEY for real AI classification
# Required when enabling Shopify webhooks: SHOPIFY_WEBHOOK_SECRET
# Razorpay webhook secret is configured per org during Razorpay connect
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend
```bash
# Node.js 20 is recommended (see .nvmrc).
cd frontend
npm install
npm run dev
```

For local development, create `frontend/.env.local` with:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Test the AI Tool (works standalone)
See **[TEST.md](./TEST.md)** for the exact curl command. The `/api/ai/classify` endpoint runs without Supabase or LLM keys.

```bash
curl -X POST http://localhost:8000/api/ai/classify \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD12345",
    "platform": "Shopify",
    "expected_amount": 2500.00,
    "actual_amount": 2480.00,
    "difference": -20.00,
    "notes": "Possible commission rate change during sale"
  }'
```

> The public endpoint never reads or writes application data. Use the authenticated transaction-classification endpoint to persist results.

---

## 📄 Product Requirements Document

**Full PRD for the AI Discrepancy Classifier** (including problem statement, user stories, functional requirements, edge cases, and success metrics):

→ **[docs/PRD_AI_Discrepancy_Classifier_Comprehensive.md](./docs/PRD_AI_Discrepancy_Classifier_Comprehensive.md)**

This document demonstrates clear product thinking, scoping, and communication skills.

---

## 💡 Why This Project?

**Fictional Eureka**:

- End-to-end ownership of a real, high-impact problem (settlement reconciliation)
- Clear product documentation (PRD)
- Hands-on collaboration with engineering (API + DB schema design)
- Practical use of AI as an internal productivity tool
- Deep understanding of D2C, Quick Commerce, and Fintech edge cases

This is not just a side project — it’s a **portfolio piece** built to reflect the exact responsibilities of a Product Intern at a fintech/e-commerce company.

---

**Built with ❤️ by Anshika**

*Ready for discussion. Happy to walk through the PRD, API design decisions, or reconciliation logic.*
