# Requirements — ACME Salary Management

## Goal
Let an HR manager manage salary data for ~10,000 employees across countries via a web app,
and answer questions about how the organization pays people — replacing spreadsheets.

## User
HR Manager (single persona). Comfortable with web apps, not technical.

## In scope
- Employee + salary records: list (paginated), search, filter (department, country),
  sort, view, create, edit, delete.
- Multi-currency storage (each salary in its local currency).
- Pay analytics dashboard: headcount, total payroll, average & median salary,
  breakdown by department and by country.
- Org-wide totals normalized to a base currency (USD) using a FIXED reference-rate table.
- Seed of 10,000 realistic employees.

## Out of scope (deliberate) — and why
- **Authentication / RBAC.** Single trusted HR persona; auth is orthogonal plumbing that
  would consume time without exercising the core problem (salary management + analytics).
  Noted as the first production follow-up.
- **Live FX rates.** Real-time currency conversion needs a paid/rate-limited external feed
  and adds failure modes. A fixed rate table demonstrates the modeling without that risk.
- **Payroll processing / payslips / tax.** This is a management & analytics tool, not a
  payroll engine. Generating payments, tax, and statutory deductions is a separate domain.
- **Salary history / audit trail over time.** Valuable but expands the data model and UI
  significantly; current scope is present-state management. Flagged as a natural extension.
- **Notifications, bulk import/export, approval workflows.** Not needed to prove the core.

## Non-functional
- 10k rows must list smoothly (server-side pagination; no full-table loads in the UI).
- Tests fast and deterministic. Clear, maintainable layering.