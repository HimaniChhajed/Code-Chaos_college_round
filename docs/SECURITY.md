# Security Guidelines

## 1. Authentication
Authentication Provider: Auth.js v5 with Drizzle adapter
Methods:
- Email magic link (Resend)
- Google OAuth
- Email/password is NOT used in v1 (avoids password storage)
Sessions: database sessions, httpOnly, secure, sameSite=lax cookies.

## 2. Authorization
Roles: Owner, Admin, Marketer, Sales, Viewer
Permissions:
### Owner
- Everything, including billing, member management, deleting the workspace.
### Admin
- Everything except deleting the workspace and changing the owner.
### Marketer
- Websites, campaigns, webinars, content; read CRM; cannot touch billing or members.
### Sales
- CRM read/write, read campaigns and webinars; cannot publish sites or send campaigns.
### Viewer
- Read-only on dashboards and lists.
Rules:
- Authorization is enforced server-side in services through one helper, requireRole(session, workspaceId, allowedRoles).
- workspaceId comes from the session membership, never from request bodies.
- The agent runs with the permissions of the user who started the run; a tool that the user cannot perform manually is refused.
- Approving a HIGH step requires Owner or Admin.

## 3. Secrets
- Never hard-code credentials; never commit .env.local; ship .env.example.
- Never expose private secrets to the client; only NEXT_PUBLIC_* values reach the browser.
- Never send secrets, tokens or full env to the AI model.
- Rotate any leaked key immediately.

## 4. Environment Variables
Public: NEXT_PUBLIC_APP_URL
Private: DATABASE_URL (pooler), DIRECT_URL, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, RESEND_API_KEY, EMAIL_FROM, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, ANTHROPIC_API_KEY, GEMINI_API_KEY (optional), INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY, MOCK_AI, TRACKING_SIGNING_SECRET
All validated at boot by lib/env.js with Zod; the app refuses to start on missing or malformed values.

## 5. API Security
Input validation: Zod .strict() on every Server Action, Route Handler and agent tool call; unknown keys rejected.
Rate limiting: public lead endpoint, auth endpoints, tracking endpoints and /api/agent per IP and per user (in-memory limiter for dev, Postgres-backed counter for deploy).
CORS: same-origin only; public lead endpoint allows no cross-origin credentials.
Authentication: session required on every non-public route.
Authorization: role and ownership check in the service layer, not in the UI.
CSRF: Server Actions use Next.js built-in origin checks; Route Handlers that mutate with cookies verify Origin.
Headers: set CSP, X-Content-Type-Options, Referrer-Policy, Frame-Options (sites render in own origin path) in next.config.js.
Open redirect: click tracking uses signed tokens (HMAC with TRACKING_SIGNING_SECRET); unsigned or tampered links are rejected.

## 6. Data Protection
Sensitive data: contact emails and names, Stripe ids, ip_hash.
Encryption: TLS in transit; Supabase encrypts at rest; no card data stored.
Retention: form_submissions payloads kept 12 months in the demo policy; email_events kept with the campaign.
Deletion: contact deletion is soft delete; a hard-delete routine exists for privacy requests and requires Admin plus an audit entry.
Row-Level Security: enabled on every table with no policies, so Supabase's public API cannot read data; the app connects with a server role through Drizzle only.

## 7. Logging
Never log:
- Passwords, API keys, tokens, signing secrets
- Full request bodies for lead forms
- Raw IPs or full email lists
Log:
- Authentication events
- Role changes and approvals
- Agent steps (tool, status, duration, not secrets)
- Errors with request id
- Webhook outcomes
Logger: lib/logger.js (structured JSON, redacts known secret keys).

## 8. File Uploads
Allowed file types: none in v1.
Maximum size: n/a
Validation: images in the builder are referenced by https URL only; URL scheme and host validated, no data: or javascript: URLs.
Storage: none.

## 9. Published Site and Email Safety
- Builder JSON is rendered by a read-only renderer from an allowlist of block types and props; raw HTML is never injected.
- Any user-supplied HTML (campaign body) is sanitized with an allowlist sanitizer before send and before preview.
- Lead form has honeypot field, size limit, and rate limit.
- Published sites never expose workspace ids or internal ids beyond slug.

## 10. AI Agent Safety
- Allowlisted tools only; each tool has a Zod schema and a risk level in policies.js.
- HIGH risk tools (publish_site, send_campaign, create_charge/refund, delete_*) never execute without a recorded approval by Owner or Admin.
- All lead, contact and site content passed to the model is wrapped as untrusted data; instructions inside it are ignored.
- Per-run caps: max 12 steps, max 1 re-plan, max email recipients per run (default 500), token budget per run.
- Model output is never executed as code or SQL.
- Invalid tool args: return the Zod error to the model once, then fail the step.
- Mock mode (MOCK_AI=true) uses fixed plans and never calls external AI.

## 11. Security Checklist
- [ ] Authentication implemented
- [ ] Authorization implemented for all five roles
- [ ] Server-side validation everywhere (.strict())
- [ ] Secrets protected, env validated at boot
- [ ] Sensitive data protected, RLS enabled
- [ ] Rate limiting on public, auth and agent endpoints
- [ ] Builder and email HTML sanitized
- [ ] Stripe signature verified, duplicates ignored
- [ ] Tracking links signed
- [ ] Approval gate blocks HIGH steps
- [ ] Errors do not expose sensitive details
- [ ] Dependencies reviewed (pnpm audit, pinned versions)
