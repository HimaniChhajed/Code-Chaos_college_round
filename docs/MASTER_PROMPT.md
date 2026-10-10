# Master Prompt (paste into Antigravity as the first message, Planning mode)

You are building NEXUS for the Bit n Build Hackathon 2026 (College Round 1). This repo already contains the full documentation system. Treat it as the source of truth.

STEP 1. Read, in this order: /AGENTS.md, docs/PRD.md, docs/ARCHITECTURE.md, docs/DESIGN_SYSTEM.md, docs/DATABASE.md, docs/SECURITY.md, docs/CODE_STYLE.md, docs/TESTING.md, docs/UX_FLOWS.md, docs/API.md.

STEP 2. Reply with: (a) a 10-line summary of what you understood, (b) any conflicts or gaps you found between the docs, (c) the open questions from docs/PRD.md section 12 that block Phase 0. Do not write code yet.

STEP 3. After I answer, execute Phase 0 only (see AGENTS.md section 10): scaffold Next.js (App Router, JavaScript, Tailwind, no src dir, pnpm), jsconfig.json alias, lib/env.js (Zod, fail-fast), .env.example, docker-compose.yml (arm64 Postgres + Inngest dev server), Tailwind v4 @theme tokens from DESIGN_SYSTEM.md, hand-written /components/ui primitives, hand-drawn /components/icons, and the authenticated app shell with sidebar. No hero page; "/" redirects to /dashboard or /sign-in.

Rules for every phase:
- Show a 5-line plan and the files you will touch before coding.
- Respect AGENTS.md hard constraints: JavaScript only, no shadcn/Prisma/lucide, no purple, no gradients, no hero, Supabase as hosted Postgres with Drizzle.
- After finishing, run lint and build, start the dev server, verify with the browser agent, and report evidence with screenshots.
- Update the affected docs in the same change.
- Then STOP and wait for my "go".

Start with STEP 1 now.
