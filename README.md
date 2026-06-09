# Shop-Floor Allocation AI Assistant

This repository is a lightweight shop-floor resource allocation prototype with a focus on an AI-driven assistant for scheduling work orders, assigning operators, and managing machine load.

## What this repo includes

- `prototype/ui/` — a futuristic static HTML/CSS/JS allocation board prototype
- `tests/e2e.spec.ts` — Playwright end-to-end tests for core allocation workflows
- `playwright.config.ts` — local test runner and static server configuration

## AI assistant focus

The user-facing AI agent is designed to help with shop-floor allocation by:

- prioritizing work orders against machine capacity
- recommending operator assignments based on skills
- validating schedule changes before applying them
- tracking allocation decisions and audit activity

## Getting started

1. Install dependencies:

```bash
cd /Users/dhirajsingh/Shopfloor_9th
npm install
```

2. Install Playwright browsers:

```bash
npm run install:browsers
```

## Local prototype run

```bash
npm run start:ui
```

Then open `http://127.0.0.1:8000` in your browser.

## Run end-to-end tests

```bash
npm test
```

## How to use this project

- Open the UI and review the allocation lanes.
- Use the search and priority filters to focus on work orders.
- Drag work orders between machine lanes to simulate reassignment.
- Double-click a work order to update operator assignment and priority.
- The audit log shows allocation decisions and changes.

## Notes

- This prototype is static and uses in-memory sample data.
- The AI assistant concept is centered on improving shop-floor decisions, not on storing production data.
- Use this as a baseline for an intelligent allocation workflow and QA automation validation.
