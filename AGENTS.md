<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Coding Agent Instructions (Nexus)

Applies to every coding agent working in this repo: Claude and Gemini inside Antigravity. CLAUDE.md and GEMINI.md point here. This file lives at the repo root so tools discover it; the detailed docs live in /docs.

## 1. Project Context
Project: Nexus, an AI-powered business operating platform (website builder, CRM, marketing, billing, webinars, AI agent with approvals).
Purpose: Bit n Build Hackathon 2026, College Round 1. A flawless live demo of the flagship workflow beats breadth.
Primary Users: small-business owners and their marketing/sales teammates.
Owner machine: MacBook M4 (arm64), zsh.

## 2. Source of Truth
Before significant changes, read the relevant files in /docs:
- docs/PRD.md
- docs/DESIGN_SYSTEM.md
- docs/ARCHITECTURE.md
- docs/DATABASE.md
- docs/SECURITY.md
- docs/CODE_STYLE.md
- docs/TESTING.md
- docs/UX_FLOWS.md
- docs/API.md
Do not contradict these documents without first identifying the conflict and asking.

## 3. Hard Constraints (ask before deviating)
- Next.js App Router, full stack, single repo, pnpm.
- Plain JavaScript only (.js/.jsx). No TypeScript, no tsconfig. Zod for runtime validation.
- NO shadcn/ui, NO Prisma, NO lucide-react.
- PostgreSQL on Supabase with Drizzle ORM and migrations. Supabase is hosted Postgres only (no Supabase client SDK).
- UI: 3D Neo-Brutalism with Tailwind tokens, hand-written components, Three.js (R3F) for data scenes only.
- NO random hero sections. NO purple/violet/indigo. NO gradients.
- Never add a dependency that is not in ARCHITECTURE.md without asking and justifying.

## 4. General Rules
- Understand existing code before modifying it; reuse components and utilities.
- Follow the design system, architecture, database conventions, security rules and code style.
- Do not invent business requirements. Never fake data in core flows (labelled seed data is fine).
- Never expose or log secrets. Never commit .env.local.
- Avoid unrelated changes and unnecessary rewrites.
- Never invent APIs or package versions; check docs or ask.

## 5. Planning
Before a non-trivial task:
1. Inspect relevant docs and code.
2. List affected files and dependencies.
3. Identify database/API changes and required tests.
4. Write a plan of 5 lines or fewer and wait for "go" at phase boundaries.

## 6. Implementation
- Order: schema -> service -> action/API -> UI -> test.
- Every mutation: validate (Zod) -> authorize (requireRole) -> transaction -> audit log -> event.
- Agent tools call services only, never the database.
- Keep changes focused; preserve existing behavior.

## 7. Validation
After implementation:
1. Run pnpm test
2. Run pnpm lint
3. Run pnpm build
4. Start the dev server and verify the UI flow with the browser agent; report evidence, not assumptions.
5. Review changed files for unintended edits.
Never claim a check passed unless it was run. There is no typecheck step (plain JavaScript).

## 8. Documentation
Update the matching /docs file in the same change when you alter product behavior, architecture, schema, API contracts, security rules or conventions.

## 9. Conflict Handling
If requirements conflict, do not guess: state the conflict, give two options with tradeoffs, and ask.

## 10. Phases (stop after each and wait for "go")
0 Scaffold, tokens, UI primitives, icons, app shell
1 Drizzle schema, migrations, Auth.js, workspaces, RBAC, DAL, seed
2 CRM, public lead endpoint, dashboard with 3D scenes
3 Website builder, publish, public renderer
4 AI agent: tools, planner, approvals, audit, SSE timeline
5 Marketing: campaigns, Resend, Inngest, tracking
6 Billing: Stripe test mode, plans, webhook, usage meter
7 Webinars: Jitsi behind WebinarProvider
8 Tests, Playwright E2E, README, deploy, demo script
If time is short cut Phase 7 first, then Phase 6 depth. Never cut Phases 1 to 4.

## 11. Terminal Rules (macOS arm64, zsh)
Use zsh and BSD-compatible commands (sed -i '', open, pbcopy, lsof -i :3000). Homebrew for tooling, Node 20+ LTS, Docker images arm64-compatible for Postgres. Inngest dev server runs natively via `npx inngest-cli@latest dev` (not in Docker).

## 12. Completion Criteria
A task is complete only when requirements are met, tests/lint/build pass, no unintended files changed, security rules are respected, and docs are updated.
