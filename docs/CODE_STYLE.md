# Code Style & Conventions

## 1. General Principles
- Prefer readable code over clever code.
- Keep functions focused; reuse existing components and utilities.
- Avoid unnecessary abstractions; prefer consistency over novelty.
- Plain JavaScript only. No TypeScript, no tsconfig. Zod defines runtime shapes; JSDoc @typedef only where an editor hint genuinely helps.

## 2. Naming
Components: PascalCase files and exports (LeadTable.jsx)
Functions: camelCase, verbs (createContact)
Variables: camelCase
Constants: UPPER_SNAKE_CASE
Files: kebab-case for non-components (campaign-service.js)
Database fields: snake_case; mapped to camelCase in Drizzle schema property names
API routes: kebab-case, plural nouns (/api/public/leads)
Zod schemas: <thing>Schema (createContactSchema)

## 3. Folder Structure
Follow ARCHITECTURE.md section 7. Each module owns: schema.js (Drizzle tables), validators.js (Zod), service.js (business logic), actions.js (Server Actions), components/. Shared UI in /components/ui. Tests mirror source paths under /tests.

## 4. Imports
- Use the "@/" alias for anything outside the current module folder.
- Order: node/external, then "@/" aliases, then relative.
- Never import lib/db from a component or page; go through a module service.
- Only /modules/website may import Craft.js; only /components/scenes may import three.

## 5. Components
- Server Components by default; add "use client" only when state, effects or browser APIs are needed, and keep client islands small.
- One responsibility per component.
- Build UI only from /components/ui primitives and design tokens; no ad-hoc colors, radii or shadows.
- Every data view has loading, empty and error states.

## 6. Functions
- Do one logical thing; clear names; early returns over deep nesting.
- Service function shape: validate (Zod) -> authorize (requireRole) -> transaction -> audit -> emit event.
- Services take (ctx, input) where ctx = { workspaceId, userId, role, actorType }.

## 7. Error Handling
Use: typed error classes in lib/errors.js (ValidationError, ForbiddenError, NotFoundError, ConflictError); Server Actions return { ok, data } or { ok: false, error }; error boundaries per route segment.
Do not: swallow errors, return raw DB errors to the client, throw strings, use empty catch blocks.

## 8. Comments
Comments explain why something exists, tradeoffs and non-obvious behavior. Do not repeat the code. No commented-out code, no TODO left in demo paths.

## 9. Logging
Use: lib/logger.js (structured JSON).
Rules:
- No console.log in committed code.
- Never log secrets, tokens or full payloads.
- Include requestId, workspaceId, actor in log context.

## 10. Formatting
Formatter: Prettier
Linter: ESLint (next/core-web-vitals)
Type Checking: none (JavaScript project); Zod validates at runtime

## 11. Git
Conventional Commits (feat:, fix:, chore:, docs:, test:). Small, frequent commits. One concern per commit.

## 12. Do
- Reuse existing patterns and utilities.
- Keep changes focused on the task.
- Follow ARCHITECTURE.md dependency rules.
- Remove dead code you create.

## 13. Don't
- Create duplicate utilities.
- Add dependencies without approval (see AGENTS.md).
- Use shadcn, Radix kits, Prisma, lucide-react or TypeScript.
- Use purple, gradients or hero sections in UI.
- Change unrelated files.
