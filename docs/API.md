# API Documentation

## Conventions
Base URL: NEXT_PUBLIC_APP_URL
Authentication: Auth.js session cookie; public endpoints are explicitly marked.
Versioning: none in v1 (internal API); breaking changes require updating this file.
Error format: { "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "..." } } }
Codes: VALIDATION_ERROR 400, UNAUTHENTICATED 401, FORBIDDEN 403, NOT_FOUND 404, CONFLICT 409, RATE_LIMITED 429, INTERNAL 500.
Pagination: cursor-based (?cursor=&limit=, default 25, max 100).
Rate limits: public lead 10/min/IP; agent 10 runs/hour/user; tracking 120/min/IP.
Note: most UI mutations are Server Actions and are documented in each module's actions.js, not here. This file covers HTTP endpoints.

## Endpoint - GET /api/health
Purpose: liveness and DB check.
Required permission: public
Success response: 200 { "status": "ok", "db": "up" }
Error responses: 503 { "status": "degraded", "db": "down" }
Side effects: none
Tests: success, DB down.

## Endpoint - POST /api/public/leads
Purpose: capture a lead from a published site form.
Required permission: public (rate limited)
Request body: { "siteSlug": "string", "email": "string", "name": "string?", "fields": "object?", "website": "string (honeypot, must be empty)" }
Success response: 201 { "ok": true }
Error responses: 400 VALIDATION_ERROR, 404 site not published, 429 RATE_LIMITED
Side effects: upsert contact, activity, form_submission, audit.
Idempotency: same email on same site updates the existing contact; submission still recorded.
Validation: Zod .strict(), email format, body max 10 KB.
Tests: success, invalid email, honeypot filled, unknown slug, rate limit.

## Endpoint - POST /api/agent/runs
Purpose: start an agent run from an instruction.
Required permission: Owner, Admin, Marketer, Sales (Viewer forbidden)
Request body: { "instruction": "string (max 1000 chars)" }
Success response: 201 { "runId": "uuid", "status": "planning" }
Error responses: 400, 401, 403, 429
Side effects: agent_runs row, planning job, audit.
Idempotency: client may send Idempotency-Key header; same key returns the same run.
Tests: success, empty instruction, viewer forbidden, mock mode.

## Endpoint - GET /api/agent/runs/[runId]/stream
Purpose: SSE stream of run and step events (plan, step_started, step_succeeded, awaiting_approval, step_failed, run_finished).
Required permission: member of the run's workspace
Success response: 200 text/event-stream
Error responses: 401, 403, 404
Side effects: none
Tests: events arrive in order, cross-tenant access denied.

## Endpoint - POST /api/agent/steps/[stepId]/decision
Purpose: approve or reject a HIGH step.
Required permission: Owner or Admin
Request body: { "decision": "approve" | "reject", "reason": "string?" }
Success response: 200 { "stepId": "uuid", "status": "approved" | "rejected" }
Error responses: 400, 403, 404, 409 (step not awaiting approval)
Side effects: step update, audit, Inngest event to execute on approve.
Idempotency: repeating the same decision returns 200 with current state; conflicting decision returns 409.
Tests: approve, reject, double approve, wrong role, wrong tenant.

## Endpoint - POST /api/stripe/webhook
Purpose: receive Stripe events.
Required permission: Stripe signature
Request body: raw Stripe event
Success response: 200 { "received": true }
Error responses: 400 invalid signature
Side effects: insert into stripe_events, update subscriptions and invoices.
Idempotency: duplicate event id is acknowledged and ignored.
Validation: verify signature with raw body before parsing.
Tests: valid, invalid signature, duplicate, unknown type.

## Endpoint - POST /api/inngest
Purpose: Inngest function serving endpoint.
Required permission: Inngest signing key
Functions: send-campaign, execute-approved-step, scheduled-campaign, webinar-follow-up.

## Endpoint - GET /api/t/o/[token].gif
Purpose: open tracking pixel.
Required permission: public, signed token
Success response: 200 image/gif (1x1)
Side effects: email_events open (deduped per recipient per hour).
Validation: token HMAC verified; invalid tokens still return the pixel without writing.

## Endpoint - GET /api/t/c/[token]
Purpose: click tracking redirect.
Required permission: public, signed token containing recipient id and target URL
Success response: 302 to the signed target URL (http/https only)
Error responses: 400 on bad signature (never redirects)
Side effects: email_events click.

## Endpoint - GET /s/[slug]
Purpose: render a published site.
Required permission: public
Success response: 200 HTML from published_json via allowlist renderer
Error responses: 404 draft or missing

## Agent Tool Contracts (internal)
| Tool | Risk | Min role | Wraps |
|---|---|---|---|
| list_contacts | LOW | Viewer | crm.service |
| draft_campaign | LOW | Marketer | marketing.service |
| create_webinar | MEDIUM | Marketer | webinar.service |
| create_site_draft | MEDIUM | Marketer | website.service |
| create_plan | MEDIUM | Admin | billing.service |
| tag_contacts | MEDIUM | Sales | crm.service |
| publish_site | HIGH | Marketer + approval | website.service |
| send_campaign | HIGH | Marketer + approval | marketing.service |
| delete_* / refund | HIGH | Admin + approval | respective service |
Each tool has a Zod args schema; idempotency key = sha256(runId + position + tool + args).
