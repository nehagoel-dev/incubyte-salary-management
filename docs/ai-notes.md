# AI Usage Notes

Tool: Claude Code (CLI), model(s): <fill in>. Workflow: TDD, plan-mode per feature,
human commits at red/green/refactor boundaries.

## Key prompts & decisions

### Scaffold backend (Express + TS + Vitest)
- **Prompt:** "Scaffold a Node 22 + TypeScript + Express backend... ESM, tsx for dev, tsc for build, Vitest + Supertest with coverage, src/app.ts + src/server.ts, no routes yet. Show file tree + package.json before writing."
- **Decisions:** ESM via `"type": "module"` + tsconfig `NodeNext`; Express 4 (mature types); `app.ts` exports a `createApp()` factory plus a shared `app` for test isolation; `server.ts` excluded from coverage.
- **Course-corrections:** (1) Targeted **Node 20** instead of 22 — installed runtime is v20.11.0 and CLAUDE.md says "Node 20+". (2) Added one 404 smoke test for the empty app per the user's choice. (3) Excluded `*.test.ts` from the tsc build so `dist/` stays clean.