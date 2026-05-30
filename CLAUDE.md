# Salary Management — Engineering Guide (for Claude Code)

## What this is
Web app for an HR manager to manage and analyze salary data for ~10,000 employees
across multiple countries. Replaces spreadsheets. Two parts: Express/TS API + React UI.

## Stack
- Backend: Node 20+, TypeScript, Express, Prisma, PostgreSQL (Supabase), Zod
- Backend tests: Vitest + Supertest
- Frontend: Vite + React + TS + Mantine (mantine-datatable, @mantine/charts)
- Frontend tests: Vitest + React Testing Library + jsdom

## Architecture (backend)
Strict layering — never skip a layer:
routes -> controllers (HTTP only) -> services (business logic) -> repositories (Prisma only).
Validation with Zod at the controller boundary. No business logic in controllers.
Money is stored as integer minor units (`*_cents`) plus an ISO currency code. Never floats.

## TDD rules (MANDATORY)
1. Write ONE small failing test first. Show it failing (red).
2. Write the MINIMUM code to make it pass (green).
3. Refactor only with tests green.
4. Never write implementation code before a failing test exists for it.
5. Tests must be fast, deterministic, isolated (no real network, no shared state).

## Commit rules
- Conventional Commits. Small, atomic commits.
- Use `test:` for the red step, `feat:`/`fix:` for green, `refactor:` for refactors.
- One logical change per commit. Do not batch a whole feature into one commit.

## Conventions
- ESM, async/await, no `any` unless justified with a comment.
- Errors: throw typed errors in services; map to HTTP status in a central error handler.
- Pagination: offset-based (`page`, `pageSize`) returning `{ data, total, page, pageSize }`.