# Testing

## 1. Testing Goals
Critical functionality:
- Workspace isolation and RBAC (no cross-tenant access)
- Agent approval gate: HIGH steps never run without approval
- Idempotency: replayed Stripe events and re-run agent steps do not duplicate effects
- Lead capture from published site into CRM
- Campaign send sends once per recipient and skips unsubscribed contacts

## 2. Test Types
### Unit Testing
Zod schemas, policies.js risk and permission mapping, planner output validation, rbac helper, slug and sanitizer utilities, idempotency key builders.
### Integration Testing
Services against a real Postgres (Docker Compose): contact upsert dedupe, tenant scoping in DAL, campaign recipient generation, Stripe webhook handler with fixture payloads, agent executor with mock tools.
### End-to-End Testing
One Playwright test for the flagship workflow (below). Smoke checks for sign in and public site render.

## 3. Testing Tools
Unit: Vitest
Integration: Vitest + Docker Postgres (test database, migrated fresh)
E2E: Playwright (Chromium)
AI in tests: MOCK_AI=true, never a live model call.
Email in tests: Resend stubbed; capture payloads.

## 4. Test File Structure
```
tests/
  unit/
  integration/
  e2e/
```

## 5. Critical User Flows
Flow: Flagship workflow
Steps:
1. Sign in as seeded Owner (test auth helper).
2. Open Agent, enter: "Launch a webinar on AI for small business next Friday, build a landing page, email all leads tagged webinar-interest, and set up a paid ticket plan."
3. Plan appears with steps and risk badges; LOW and MEDIUM steps run automatically.
4. HIGH steps (publish_site, send_campaign) show NEEDS APPROVAL; click Approve.
5. Timeline completes; summary links to webinar, site, campaign and plan.
6. Visit /s/[slug]; submit the lead form.
7. Open CRM: new lead is present with the site as source.
8. Open Dashboard: lead count and campaign stats updated.
Expected result: all steps succeed, audit log has one entry per step plus approvals, no duplicate emails.

Flow: Approval rejection
Steps: run the instruction, reject send_campaign.
Expected result: step is rejected, no emails sent, run ends as partially complete with clear summary.

Flow: Permission denial
Steps: sign in as Viewer, attempt to start an agent run that publishes.
Expected result: 403, nothing written, audit entry for the denial.

## 6. Coverage
Target: practical, not numeric. Aim for full coverage of services and policies, and every critical flow above.
Prioritize:
- RBAC and tenant scoping
- Agent executor and approval logic
- Webhook idempotency
- Data mutations
- Lead capture and campaign send

## 7. Commands
Test: pnpm test
Integration: pnpm test:integration
E2E: pnpm test:e2e
Lint: pnpm lint
Build: pnpm build
Type Check: not applicable (plain JavaScript)

## 8. Definition of Done
- [ ] Unit and integration tests pass
- [ ] Playwright flagship flow passes
- [ ] Build passes
- [ ] Lint passes
- [ ] Critical flow verified in the browser (browser agent screenshots)
- [ ] No blocking errors in console or logs
