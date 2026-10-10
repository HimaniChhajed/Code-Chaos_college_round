# Product Requirements Document

## 1. Product Overview
Product Name: Nexus
One-Line Description: One workspace for website, CRM, marketing, billing and webinars, run by an AI agent that executes multi-step business workflows with human approval for sensitive steps.
Product Type: SaaS (multi-tenant, workspace-based)
Primary Platform: Web (responsive down to mobile)
Event: Bit n Build Hackathon 2026, College Round (Round 1)

## 2. Problem
What problem are we solving? Small businesses run on disconnected tools (site builder, CRM, email, billing, webinar app). Data is fragmented and every campaign needs manual copy-paste across tools.
Why does this matter? Manual work is slow and error-prone, and AI tools only help with single tasks, not whole workflows.
How are users solving this today? Zapier-style glue, spreadsheets, and 5+ separate subscriptions.

## 3. Goal
Primary Goal: One natural-language instruction triggers coordinated actions across all modules, with consistent data, permissions and approval gates.
Secondary Goals:
- Show a live, auditable execution timeline of the agent.
- Reflect results (leads, MRR, campaign stats) in one analytics dashboard in near real time.
- Be secure by default: RBAC, approvals, audit log, idempotent execution.

## 4. Target Users
### User Type 1: Founder / Owner
Description: Runs a small business or creator brand, wears every hat.
Needs: launch campaigns fast, see one source of truth, stay in control of spend and emails.
Pain Points: too many tools, no time, fear of AI sending something wrong.
### User Type 2: Marketer / Sales member
Description: Teammate with limited permissions.
Needs: manage campaigns (Marketer) or leads and pipeline (Sales) without touching billing.
Pain Points: waiting on the owner, unclear who changed what.

## 5. User Stories
- As an owner, I want to type one instruction so that a webinar, landing page, email campaign and ticket plan are set up together.
- As an owner, I want to approve high-risk steps so that nothing is emailed or charged without my consent.
- As a visitor, I want to submit a form on a published site so that I am registered as a lead.
- As a sales member, I want to move leads through pipeline stages so that I can track conversion.
- As a marketer, I want to schedule a campaign and see opens and clicks so that I can measure it.
- As an owner, I want to see MRR and workflow outcomes on one dashboard.
- As an admin, I want an audit log so that I can see who or what did every sensitive action.

## 6. Core Features
### Feature 1 - Visual Website Builder
Purpose: No-code drag-and-drop pages published at /s/[slug].
User Flow: create site -> edit page in builder -> add lead form block -> publish -> visit public URL.
Inputs: blocks, text, images (URL only), form field config.
Outputs: page JSON stored in Postgres; sanitized public render.
Acceptance Criteria:
- Drag-and-drop editing with at least Heading, Text, Button, Image, Section, Lead Form blocks.
- Published page loads without auth and is responsive.
- Form submit creates a lead in the CRM with source = site slug.
- Published HTML is sanitized (no script injection).
Edge Cases: duplicate slug, empty page publish, form spam, form submitted twice.

### Feature 2 - Intelligent CRM
Purpose: Leads, customers, registrations, pipeline, tags, activity timeline.
Acceptance Criteria:
- Contacts have stage, tags, source, and an activity timeline.
- Pipeline stages: New, Contacted, Registered, Customer, Lost.
- Contact created from form, webinar registration or manual entry, deduplicated by (workspace, email).
- Conversion rate computed from stage changes.
Edge Cases: duplicate email with different case, unsubscribed contact, tag rename.

### Feature 3 - SaaS Billing
Purpose: Plans, recurring subscriptions, usage metering, invoices (Stripe TEST mode).
Acceptance Criteria:
- Plans created in Nexus and mirrored to Stripe Products/Prices.
- Subscription via Stripe Checkout, status kept in sync by webhook.
- Usage events recorded per workspace (emails sent, agent steps) and shown on a meter.
- Webhook signature verified; duplicate events ignored.
Edge Cases: webhook arrives before redirect, payment failure, replayed event.

### Feature 4 - Marketing Automation
Purpose: Content plan, campaigns, scheduled email send, engagement tracking.
Acceptance Criteria:
- Create campaign with subject, body, audience (tag filter), scheduled time.
- Send through Resend via Inngest job; one send per recipient (idempotent).
- Opens (pixel) and clicks (signed redirect) recorded.
- Unsubscribed contacts are never emailed.
Edge Cases: empty audience, provider rate limit, bounced address.

### Feature 5 - Webinar Management
Purpose: Create events, registrations, attendance, follow-ups.
Acceptance Criteria:
- Create webinar with title, start time, optional paid plan.
- Registration creates or updates a CRM contact.
- Join page embeds Jitsi through a WebinarProvider interface; join click records attendance.
- Follow-up campaign can target attendees or no-shows.
Edge Cases: registration after start, timezone display, duplicate registration.

### Feature 6 - AI Business Agent
Purpose: Natural language -> plan -> tool calls across modules.
Acceptance Criteria:
- Instruction produces a structured plan (steps, tool, args, risk).
- LOW steps auto-run, MEDIUM run with visible plan, HIGH steps wait for explicit approval.
- Live execution timeline streams to the UI.
- Every step stores tool, args, status, result, error, duration, approver.
- Mock mode (env flag) produces deterministic plans for offline demo.
Edge Cases: invalid tool args, model timeout, rejected approval, run resumed after failure.

### Feature 7 - Workflow Security
Purpose: RBAC, approvals, audit log.
Acceptance Criteria: five roles enforced server-side; audit row for every sensitive action and agent step.

### Feature 8 - Integrated Analytics
Purpose: One dashboard for leads, conversion, MRR, campaign performance, workflow outcomes.
Acceptance Criteria: 3D bar chart and funnel scene fed by real queries; SVG fallback if WebGL unavailable.

## 7. Non-Goals
- Custom domains for published sites.
- Real money (Stripe stays in test mode).
- Native mobile apps.
- Multi-language UI.
- Email deliverability tooling beyond Resend defaults.
- Complex automation builders (visual workflow editor); the agent is the automation layer.

## 8. MVP Scope
Must Have: auth + workspaces + RBAC, CRM, website builder with lead form, agent with approval gate and audit trail, marketing send, analytics dashboard.
Nice to Have: billing usage meter depth, webinar attendance tracking.
Future: custom domains, SMS channel, more AI providers, A/B tests.

## 9. Success Metrics
Primary Metrics:
- Flagship workflow runs end to end on seeded data without manual DB edits.
- Approval gate demonstrably blocks HIGH steps until approved.
Secondary Metrics:
- Setup from clone to running under 5 minutes.
- Playwright E2E passes in CI-like local run.

## 10. Constraints
Technical: Next.js App Router, plain JavaScript (no TypeScript), no shadcn, no Prisma, no lucide, PostgreSQL on Supabase with Drizzle.
Business: Stripe test mode only; free tiers of Supabase, Resend, Inngest, Vercel.
Design: 3D Neo-Brutalism with Three.js data scenes; no hero sections, no purple, no gradients.
Timeline: Round 1 deadline of the hackathon; scope cuts per section 8.

## 11. Assumptions
- A Resend sandbox/verified sender is available for the demo.
- Jitsi public instance is reachable on demo day.
- Demo laptop has a WebGL-capable browser.

## 12. Open Questions
- Exact Round 1 deadline and judging format (live demo vs recorded)? 
- Is a deployed URL mandatory or is local demo acceptable?
- Which Claude/Gemini model names will be used for the in-app agent? (decide after checking current API docs)

## 13. Definition of Done
- [ ] Requirements for MVP Must Have implemented
- [ ] Flagship workflow works end to end
- [ ] Tests pass (Vitest + one Playwright E2E)
- [ ] Lint and build succeed
- [ ] Security requirements in SECURITY.md satisfied
- [ ] Documentation updated

## 14. Flagship Demo Workflow
"Launch a webinar on <topic> next Friday, build a landing page, email all leads tagged <X>, and set up a paid ticket plan."
Agent plan: create_webinar (MEDIUM) -> create_site_draft (MEDIUM) -> create_plan (MEDIUM) -> draft_campaign (LOW) -> publish_site (HIGH) -> send_campaign (HIGH) -> analytics refresh.
