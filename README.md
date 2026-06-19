# D2C meets fintech reconciliation

## Overview
**D2C meets fintech reconciliation** is a hands-on demonstration project built to showcase strong Product ownership for the **Product Intern** role at Logibricks Technologies (LogiRecon).

This project bridges **D2C & Quick Commerce** operations with **Fintech Reconciliation**. It automates settlement matching across platforms (Shopify, WooCommerce, Razorpay, etc.), handles complex data flows, detects discrepancies, and includes an **AI-powered internal tool** for smart classification and workflows.

**This project directly addresses the job requirements:**
- Owning PRDs and feature specs end-to-end
- Working with engineering on APIs and database-level logic
- Building AI-powered internal tools (prompts, workflows, automations)
- Deep-diving into e-commerce / quick commerce ecosystems
- Understanding fintech reconciliation, data flows, and edge cases firsthand
- Articulating product thinking clearly

## Problem Space (Product Thinking)
In D2C and quick commerce, settlement reconciliation is messy due to fee mismatches, partial returns, timing issues, GST variations, and platform-specific rules. This project demonstrates how to solve these real problems with a combination of robust logic and AI assistance.

## Features Implemented (For Logibricks Interview)

- **PRD Ownership**: Full Product Requirements Document for AI Discrepancy Classifier (see docs/PRD_AI_Discrepancy_Classifier.md)
- **API Logic**: New endpoint `/api/ai/classify` for AI-powered classification
- **Database Level Logic**: AI results (classification, confidence, explanation, suggested action) stored in database
- **AI Internal Tool**: Structured LLM prompts + automation workflow for discrepancy handling
- **E-commerce & Quick Commerce Focus**: Handles reconciliation data flows, partial returns, fee mismatches, GST issues, and same-day return edge cases

This project demonstrates end-to-end product thinking from PRD to implementation.

See [TEST.md](./TEST.md) for instructions on testing the AI Discrepancy Classifier.
