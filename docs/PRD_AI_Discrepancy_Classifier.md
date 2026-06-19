# Product Requirements Document (PRD) – AI-Powered Discrepancy Classifier

**Feature Name:** AI-Powered Discrepancy Classifier & Smart Reconciliation Workflow  
**Project:** D2C meets fintech reconciliation  
**Product Intern**  
**Date:** 13 June 2026  
**Version:** 1.0  
**Status:** Draft for Engineering Review

1. Executive Summary
In the fast-growing D2C and Quick Commerce space, accurate and timely settlement reconciliation is critical for financial health. Current rule-based systems struggle with nuanced discrepancies caused by platform fee changes, partial refunds, timing mismatches, and GST variations.
This PRD proposes building an AI-Powered Discrepancy Classifier as an internal tool. It will intelligently classify issues, provide human-readable explanations, suggest actions, and support lightweight automation workflows — significantly reducing manual effort while improving accuracy and auditability.
Business Goal: Accelerate reconciliation cycles, minimize revenue leakage, and deliver a best-in-class experience for finance teams.

2. Problem Statement
Finance and operations teams in D2C/Quick Commerce brands face the following challenges:

High volume of daily transactions across multiple platforms (Shopify, WooCommerce, Razorpay, etc.)
Frequent discrepancies due to fee structures, returns, cancellations, and timing issues
Manual investigation is time-consuming and error-prone
Delayed identification of revenue leakage
Difficulty scaling reconciliation as GMV grows

Impact: Increased operational cost, slower month-end close, and potential loss of recoverable revenue.

3. Opportunity
Introduce an AI-assisted layer on top of the existing reconciliation engine that:

Automatically classifies discrepancies with confidence scores
Generates clear, actionable explanations
Recommends next steps (claim, adjust, escalate, etc.)
Triggers simple automation workflows (alerts, ticket creation, reporting)

This aligns perfectly with modern fintech product strategy — combining deterministic rules with intelligent AI assistance.

4. User Personas & Stories
Primary Persona: Finance Manager / Accountant (D2C brand)
Secondary Persona: Operations Lead / Reconciliation Analyst
Key User Stories:

As a Finance Manager, I want the system to automatically classify a variance and explain the likely cause (e.g., “Festival season commission rate change on Shopify”) with confidence score so I can take action faster.
As a Reconciliation Analyst, I want prioritized alerts for high-value or low-confidence discrepancies.
As an Engineer, I want a simple, well-documented API and database schema so this feature can be integrated into the core reconciliation pipeline without major refactoring.


5. Functional Requirements
Core Feature – AI Classifier

Input: Discrepancy record (order_id, platform, expected_amount, actual_amount, difference, notes, transaction metadata)
Output: Structured JSON containing:
classification (e.g., Fee Mismatch, Partial Return, Timing Issue, GST Error, Other)
confidence (0–100)
explanation (1–2 clear sentences)
suggested_action (e.g., “File claim with platform”, “Manual review required”)

Persist AI results in the database for audit trail and dashboard visibility

AI Prompt Strategy (Internal Tool)

Use a well-engineered, domain-specific system prompt optimized for Indian e-commerce reconciliation
Include relevant context (platform rules, common patterns, GST implications)

Integration Points

Callable from the main reconciliation engine (reconciliation.py)
Results stored alongside transaction records


6. Non-Functional Requirements

Response time: < 5 seconds for classification
Reliability: Graceful fallback for low-confidence or API failures
Auditability: All AI decisions logged with timestamp and input data
Cost Efficiency: Optimized prompts and model selection
Security: No sensitive PII sent to LLM; follow existing encryption standards


7. Edge Cases & Data Flows

Partial refunds and refund traps
Same-day Quick Commerce returns (e.g., Blinkit, Zepto)
Festival / promotional fee changes
Missing settlement data or delayed payouts
Low-confidence classifications (route to manual queue)
Multi-platform transactions

Data Flow:
Raw transaction → Reconciliation Engine → Discrepancy Detection → AI Classifier → Store Result + Trigger Workflow → Dashboard / Alert

8. Success Metrics
Primary:

% of discrepancies auto-classified with confidence > 75%
Reduction in average manual review time
User satisfaction with AI explanations (via feedback)

Secondary:

Number of recovered revenue cases linked to AI suggestions
Audit readiness (complete trail of decisions)


9. Out of Scope (Phase 1)

Custom fine-tuned LLM
Advanced multi-agent orchestration
Full end-to-end claim filing automation
Production monitoring & A/B testing framework


10. Dependencies & Risks

LLM API availability and cost
Quality of input data from platforms
Integration effort with existing reconciliation core

Risk Mitigation: Start with a simple, prompt-based approach and iterate based on real test data.

Approval Requested From: Engineering Lead & Founder
Next Steps:

Engineering estimation
Implementation of API endpoint + DB schema
Testing with sample D2C settlement data
