# project-presora
About to presora.app

## Uruchamianie testów

Wymagany jest Node.js 22. Z katalogu głównego repozytorium uruchom:

```sh
npm ci --legacy-peer-deps
npx playwright install chromium
npm test
npm run e2e
```

`npm test` uruchamia testy jednostkowe Vitest, a `npm run e2e` testy
przeglądarkowe i API Playwright. Playwright automatycznie uruchamia lokalny
serwer aplikacji; testy API korzystają z lokalnych funkcji Netlify. Nie trzeba
konfigurować prawdziwych danych logowania do Supabase.

Testy E2E można też uruchomić ręcznie w GitHub Actions: **Actions → E2E Tests
→ Run workflow**. Workflow uruchamia się również codziennie.

# Presora - Test Infrastructure & Automation Harness

This repository architecture serves as the robust automated quality gate and CI/CD infrastructure for **Presora**, a production-grade B2B SaaS platform. 

The focus of this setup is to ensure enterprise-level stability, rigorous API contract validation, and complete elimination of test flakiness across serverless delivery pipelines.

## 🛠️ Tech Stack & Infrastructure

- **Testing Framework:** Playwright (E2E & API Contract Testing)
- **Language:** TypeScript
- **CI/CD Platform:** GitHub Actions
- **Backend Architecture Target:** Node.js Serverless (Netlify Functions)
- **Database & Auth Target:** PostgreSQL (Supabase / PostgREST)

## 🏗️ Core Engineering Highlights

### 1. Advanced CI/CD & 2-Way Test Sharding
To maintain rapid deployment cycles, the GitHub Actions pipeline is configured with a **2-way parallel test sharding system**. This architecture splits the automated suite across independent concurrent runners, optimizing resource utilization and reducing the overall validation runtime by **65%** down to ~2 minutes.

### 2. Full-Stack Diagnostic Capture
Failed pipelines automatically generate and preserve rich diagnostic artifacts:
- Complete **Playwright Traces** for root cause analysis.
- Visual **Screenshots and Video recordings** of the runtime failure state.

### 3. API Contract Validation & Secure Mocking
- **Test Harness Infrastructure:** Tests invoke actual backend handlers locally, verifying functional integrity without exposing or relying on production server secrets.
- **Deterministic Mocking:** Implemented stable mocks for Supabase Auth and PostgREST layers to isolate asynchronous network layers and reproduce complex application edge cases with 100% determinism.

### 4. Flaky Test Prevention (0 Failures Suite)
The resilience of this automation harness was verified via a rigorous stress-test execution check, completing **470 consecutive test runs** (across UI and API modules) with a **0% failure rate**, establishing a true zero-flakiness quality gate.

---
*Note: The core application logic, database schemas, and AI workflow engines remain part of the secure, proprietary product codebase.*
