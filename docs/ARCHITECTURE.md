# Architecture

## 1. System Overview
Nexus is a single Next.js (App Router) application. Server Components render pages, Server Actions handle UI mutations, Route Handlers serve webhooks, public endpoints and the agent stream. Postgres (Supabase) stores all data. Inngest runs background work (campaign sends, approved agent steps). The AI agent calls the same service layer as the UI through allowlisted tools.

## 2. Architecture Pattern
Pattern: Modular monolith.
Reason: one repo and one deploy keep a hackathon build fast, while module boundaries stay readable for judges and allow later extraction.

## 3. Technology Stack
Frontend: Next.js App Router, React, Tailwind CSS v4 (own tokens), Framer Motion (subtle), TanStack Query
3D / Charts: Three.js via @react-three/fiber + drei; hand-written SVG sparklines
Language: plain JavaScript (.js/.jsx), jsconfig.json for "@/" alias, Zod for runtime shapes, JSDoc @typedef only where helpful
Backend: Next.js Server Actions + Route Handlers
Database: PostgreSQL on Supabase, Drizzle ORM, drizzle-kit migrations (no Supabase client SDK)
Authentication: Auth.js v5 with Drizzle adapter
Builder: Craft.js (isolated in /modules/website)
Storage: none in v1 (images by URL only)
Hosting: Vercel + Supabase; Docker Compose for local Postgres, native npx inngest-cli for local Inngest parity
Payments: Stripe (test mode)
Email: Resend (Nodemailer fallback)
Jobs: Inngest
Webinar: Jitsi IFrame API behind WebinarProvider
AI (in-app agent): Claude by default via ai/provider.js, Gemini adapter optional
AI (coding agents): Claude and Gemini inside Antigravity, instructed by AGENTS.md
Analytics: first-party SQL aggregates, no third party
Testing: Vitest, Playwright
Package manager: pnpm

## 4. System Components
### Frontend
- Render pages and 3D scenes, call Server Actions, subscribe to the agent SSE stream.
- Never hold secrets or access the DB.
### Backend
- Server Actions and Route Handlers validate input, authorize, call services.
- Services own business rules, transactions, audit writes and event emission.
### Database
- Source of truth for all tenant data, agent runs and audit log.
### Agent
- planner.js turns instructions into a Zod-validated plan.
- policies.js assigns risk and permission per tool.
- executor.js runs steps with idempotency keys and persists each step.
- tools/ has one file per tool, each wrapping a module service.
### Jobs (Inngest)
- send-campaign, execute-approved-step, scheduled-campaign, webinar-follow-up.

## 5. Architecture Diagram
```
Browser --(Server Action / fetch)--> Route Handler / Action
   |                                      |
   | SSE (agent timeline)                 v
   |                               Service Layer (validate -> authorize -> transaction -> audit -> event)
   |                                      |                     ^
   |                                      v                     |
   |                               Drizzle -> Supabase Postgres |
   |                                                            |
   |    Agent: planner -> policies -> executor -> tools --------+
   |                                      |
   |                               Inngest (jobs) -> Resend / Stripe
Public visitor --> /s/[slug] (sanitized render) --> POST /api/public/leads --> CRM service
```

## 6. Data Flow (example: submit a lead form)
1. Visitor submits form on /s/[slug].
2. Route Handler rate-limits and validates with Zod (.strict()).
3. Honeypot and size checks run.
4. CRM service upserts contact by (workspace_id, lower(email)) in a transaction.
5. Activity row and audit row are written.
6. Event emitted; analytics queries pick it up on next fetch.
7. Response returns a generic success; UI shows confirmation.

## 7. Project Structure
```
app/
  (auth)/  (app)/dashboard|crm|website|marketing|billing|webinars|analytics|agent
  s/[slug]/            public sites
  api/health  api/public/leads  api/agent  api/stripe/webhook  api/inngest  api/t/o  api/t/c
components/  ui/  icons/  scenes/
modules/
  website/ crm/ billing/ marketing/ webinar/ analytics/
  agent/  tools/  planner.js  executor.js  policies.js
lib/  db/(schema.js, index.js, migrations/, seed.js)  auth.js  env.js  queue.js  stripe.js  email.js  logger.js  rbac.js  dal/
ai/   provider.js  prompts/
tests/ unit/ integration/ e2e/
docs/
```

## 8. Dependency Rules
- UI components never import lib/db or Drizzle.
- Only modules/*/service.js may write to the DB, always through lib/dal helpers that require a workspaceId.
- Agent tools call services only, never the DB or other modules' internals.
- workspaceId comes from the session, never from client input or model output.
- Modules talk to each other through exported service functions, not table access.
- /modules/website is the only place that imports Craft.js.

## 9. Key Technical Decisions
Decision: Plain JavaScript with Zod instead of TypeScript.
Context: Owner preference and speed. Alternatives: TypeScript strict. Reason: Zod gives runtime safety at every boundary.

Decision: Drizzle over Prisma.
Alternatives: Prisma. Reason: SQL-first, no codegen binary, readable migrations, works well with Supabase pooler.

Decision: Supabase used only as hosted Postgres.
Alternatives: Supabase client + RLS-first design. Reason: one data-access path (Drizzle + DAL) is easier to audit. RLS is still enabled with no policies as defense in depth (see SECURITY.md).

Decision: Craft.js over GrapesJS.
Reason: React-native, so the editor UI follows our Neo-Brutalist tokens.

Decision: Inngest over BullMQ.
Reason: works on Vercel serverless with no Redis to host.

Decision: Own usage_events table aggregated for billing display; Stripe metering optional.
Reason: simpler, testable, no dependency on Stripe meter APIs in demo.

Decision: SSE for agent timeline instead of WebSockets.
Reason: simple, one-way, works on Vercel Route Handlers.

## 10. Performance Considerations
- Server Components for data-heavy pages; client islands only where interactive.
- Index every workspace_id plus common filters (see DATABASE.md).
- Max 2 WebGL canvases per page, lazy loaded.
- Campaign sends batched in Inngest steps.

## 11. Scalability Considerations
- Stateless app; all state in Postgres.
- Use Supabase transaction pooler (port 6543) with prepared statements off for serverless.
- Module boundaries allow extracting marketing or agent to workers later.

## 12. Failure Scenarios
- Database unavailable: pages show error boundary with Retry; writes fail closed; health endpoint returns 503.
- Claude/Gemini timeout or rate limit: planner retries once, then run is marked failed with a clear message; MOCK_AI=true fallback available.
- Resend failure: recipient row marked failed, retried by Inngest with backoff, never double-sent (idempotency key per campaign+contact).
- Stripe webhook duplicate: stripe_events unique event id makes it a no-op.
- Auth failure: redirect to sign-in; API returns 401/403 with no detail leaks.
- Agent step fails mid-run: run stays resumable from the failed step; completed steps are never re-executed.
- Jitsi unreachable: join page shows fallback message and the meeting link as plain text.
