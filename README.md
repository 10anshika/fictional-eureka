# 🚀 Fictional Eureka(automated CA assistant for D2C finance teams)

> **D2C meets Fintech Reconciliation**  
> A production-minded product demonstration
Fictional Eureka is a B2B SaaS fintech tool — specifically a payment reconciliation platform for Indian D2C (direct-to-consumer) brands.

**Built to showcase end-to-end product thinking** — from PRD to polished implementation.

---
The real-world problem it solves:
Indian D2C brands sell on Shopify or WooCommerce and collect payments via Razorpay. But the money that Razorpay actually settles to their bank account never exactly matches what Shopify shows as collected — because of:

Razorpay's fees + GST
Refunds that show as processed on Shopify but haven't actually reversed on Razorpay yet (refund traps)
Payments that appear in Shopify but have no corresponding Razorpay record (ghost orders)
Amount mismatches due to commission changes during sale events

Finance teams at these brands spend hours every month manually matching these records in Excel. Fictional Eureka automates that entire process.

## ⚡ At a Glance

| Aspect                 | Details                                       |
|------------------------|-----------------------------------------------|
| **Core Focus**         | D2C + Quick Commerce Fintech Reconciliation   |
| **Key Deliverable**    | AI-Powered Discrepancy Classifier             |
| **Time to Understand** | < 10 seconds                                  |
| **Demo Ready**         | ✅ Standalone classifier + authenticated app  |

---

## 📋 What This Project Demonstrates

This project was deliberately built to map directly to Logibricks Product Intern requirements:

| Logibricks Requirement                   | How It's Demonstrated                                                                | Evidence |
|------------------------------------------|--------------------------------------------------------------------------------------|----------|
| **Owning PRDs end-to-end**               | Full Product Requirements Document for AI feature                                    | [PRD →](./docs/PRD_AI_Discrepancy_Classifier_Comprehensive.md) |
| **Working with engineering on APIs**     | Designed a public demo classifier and authenticated persistence endpoint             | `backend/routes/ai.py` |
| **Database-level logic**                 | AI classification results persisted with full schema design                          | `ai_classification`, `ai_confidence`, `ai_explanation`, `ai_suggested_action` |
| **Building AI-powered internal tools**   | Structured LLM prompt + classification workflow with graceful fallbacks              | Domain-specific prompt for Indian D2C/Quick Commerce |
| **Deep e-commerce / quick commerce**     | Native support for Shopify + WooCommerce + Razorpay with realistic data flows        | Multi-platform reconciliation engine |
| **Fintech reconciliation & edge cases**  | Handles ghost orders, refund traps, partial returns, fee mismatches, GST/ITC issues  | Reconciliation logic + alerts + exports |

---

## 🛠 Tech Stack

**Backend**
- FastAPI + Uvicorn
- Supabase (PostgreSQL + Row Level Security + Auth)
- Python (Pydantic v2, httpx, cryptography)
- Platform integrations: Shopify Admin API, WooCommerce REST API, Razorpay

**Frontend**
- Next.js 14 + TypeScript + React
- Tailwind CSS + shadcn/ui components
- Supabase client auth
- Recharts (visualizations)

**Infrastructure**
- Celery + Redis (background sync jobs)
- Resend (email alerts)
- Fernet encryption for all stored credentials
- Full database schema with audit logs, RLS policies, dead-letter queue

---

## ✨ Key Features

- **🤖 AI Discrepancy Classifier**  
  `POST /api/ai/classify` returns a stateless demo classification. Authenticated users can run `POST /api/transactions/{id}/classify` to persist analysis to their org's transaction record.

- **🔄 Multi-Platform Reconciliation Engine**  
  Shopify + WooCommerce order matching against Razorpay settlements. Detects ghost orders, variances, refund traps, and partial refunds. All amounts stored as BIGINT paise — no floats.

- **📊 Modern Dashboard**  
  Real-time transaction view with filters by platform (Shopify/WooCommerce) and status (Ghost/Traps/Variance). AI insights visible inline.

- **🔔 Intelligent Alerts**  
  Configurable per-org thresholds. Multi-channel: email (Resend), Slack webhook, WhatsApp (Interakt/Twilio).

- **📤 Export & Compliance**  
  Tally ERP XML export + ITC recovery reporting (Razorpay fees + GST).

- **🔐 Enterprise Foundations**  
  Supabase RLS, Fernet-encrypted credentials, audit logs, RBAC (Owner/Admin/CA/Viewer), dead-letter queue, auto plan upgrade at ₹10L GMV.

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.11+ (3.13 works)
- Node.js 20+ (install via `winget install OpenJS.NodeJS.LTS` on Windows)
- A [Supabase](https://supabase.com) project (free tier is fine)

---

### Step 1: Supabase Setup

1. Create a new Supabase project (region: South Asia Mumbai or Singapore)
2. Go to **SQL Editor** → run `database/schema.sql`
3. Run `database/migration_woocommerce.sql`
4. Go to **Settings → API Keys → Legacy** and copy:
   - Project URL
   - `anon public` key
   - `service_role secret` key

---

### Step 2: Generate a Fernet Key

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

### Step 3: Environment Files

Create `.env` in the **project root** (not inside `/backend`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

FERNET_KEY=your-generated-fernet-key
CRON_SECRET=any-random-string

RESEND_API_KEY=
RESEND_FROM_EMAIL=alerts@example.com
SENTRY_DSN=

APP_ENV=development
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=INFO
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### Step 4: Backend

```bash
# From project root
pip install postgrest supabase --upgrade
pip install limits slowapi
pip install -r backend/requirements.txt --only-binary=:all:

uvicorn backend.main:app --reload --port 8000
```

Health check: `http://localhost:8000/health` → `{"status":"ok","version":"2.0.0"}`

> **Windows note:** If pydantic-core fails to build, run `pip install "pydantic>=2.7.1" "pydantic-core" --only-binary=:all:` first.

---

### Step 5: Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

### Step 6: Test the AI Classifier (works standalone, no keys needed)

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

See **[TEST.md](./TEST.md)** for more test cases.

---

## 📄 Product Requirements Document

Full PRD for the AI Discrepancy Classifier (problem statement, user stories, functional requirements, edge cases, success metrics):

→ **[docs/PRD_AI_Discrepancy_Classifier_Comprehensive.md](./docs/PRD_AI_Discrepancy_Classifier_Comprehensive.md)**

---
## The AI layer on top:
When a discrepancy is found, instead of just flagging it, the system sends it to an LLM that classifies why it happened (commission change? GST rounding? genuine fraud?) and suggests what action to take.

## What makes it fintech specifically:

Works with real payment gateway APIs (Razorpay)
Handles ITC (Input Tax Credit) recovery for GST on payment fees
Exports to Tally ERP (what Indian accountants actually use)
All money stored as integer paise — standard fintech practice to avoid floating point errors

## 💡 Why This Project?

**Fictional Eureka** demonstrates:

- End-to-end ownership of a real, high-impact problem (settlement reconciliation)
- Clear product documentation (PRD)
- Hands-on API + DB schema design
- Practical AI integration as an internal productivity tool
- Deep understanding of D2C, Quick Commerce, and Indian fintech edge cases (GST, Razorpay fees, platform commissions)

This is not just a side project — it's a **portfolio piece** built to reflect the exact responsibilities of a Product Intern at a fintech/e-commerce company.

---

**Built with ❤️ by Anshika**
find it crazy?!? Hit the star button broskii
*Ready for discussion. Happy to walk through the PRD, API design decisions, or reconciliation logic.*
