# Database

## 1. Database Engine
Database: PostgreSQL
Hosting: Supabase (hosted Postgres only; no Supabase client SDK)
ORM: Drizzle ORM with drizzle-kit migrations
Connections: runtime uses the transaction pooler URL (port 6543, prepared statements disabled); migrations use the direct URL.

## 2. Naming Conventions
Tables: snake_case, plural (contacts)
Columns: snake_case
Primary Keys: id, uuid default gen_random_uuid()
Foreign Keys: <singular>_id (workspace_id, contact_id)
Timestamps: created_at, updated_at as timestamptz default now(); deleted_at where soft delete applies
Enums: text columns with CHECK constraints (easier migrations than pg enums)
Money: integer minor units (cents) plus currency code

## 3. Tables
Auth (Auth.js adapter): users, accounts, sessions, verification_tokens
### workspaces
Purpose: tenant. Columns: id, name, slug (unique), created_at, updated_at
### memberships
Purpose: user role in a workspace. Columns: id, workspace_id, user_id, role (owner|admin|marketer|sales|viewer), created_at. Unique (workspace_id, user_id)
### contacts
Purpose: leads, customers, registrants. Columns: id, workspace_id, email, name, stage (new|contacted|registered|customer|lost), source, unsubscribed_at, created_at, updated_at, deleted_at. Unique (workspace_id, lower(email))
### tags / contact_tags
tags: id, workspace_id, name (unique per workspace). contact_tags: contact_id, tag_id (composite PK)
### activities
Purpose: CRM timeline. Columns: id, workspace_id, contact_id, type, data (jsonb), actor_type (user|agent|system), actor_id, created_at
### sites
Columns: id, workspace_id, name, slug (globally unique), status (draft|published), published_at, created_at, updated_at
### site_pages
Columns: id, site_id, workspace_id, path, craft_json (jsonb), published_json (jsonb), updated_at
### form_submissions
Columns: id, workspace_id, site_id, contact_id, payload (jsonb), ip_hash, created_at
### plans
Columns: id, workspace_id, name, amount_cents, currency, interval (month|year|one_time), stripe_product_id, stripe_price_id, active, created_at
### subscriptions
Columns: id, workspace_id, plan_id, contact_id (nullable), stripe_subscription_id, status, current_period_end, created_at, updated_at
### usage_events
Columns: id, workspace_id, metric (emails_sent|agent_steps|...), quantity, occurred_at, idempotency_key (unique)
### invoices
Columns: id, workspace_id, stripe_invoice_id (unique), amount_cents, currency, status, hosted_url, created_at
### stripe_events
Columns: id (Stripe event id, PK), type, processed_at
### campaigns
Columns: id, workspace_id, name, subject, body_html, audience_filter (jsonb: tag ids), status (draft|scheduled|sending|sent|failed), scheduled_at, created_by, created_at, updated_at
### campaign_recipients
Columns: id, campaign_id, contact_id, status (queued|sent|failed|skipped), sent_at, provider_message_id, error. Unique (campaign_id, contact_id)
### email_events
Columns: id, campaign_recipient_id, type (open|click), url, occurred_at
### webinars
Columns: id, workspace_id, title, description, starts_at, duration_min, plan_id (nullable), room_name, site_id (nullable), status, created_at, updated_at
### webinar_registrations
Columns: id, webinar_id, contact_id, workspace_id, status (registered|attended|no_show), joined_at, created_at. Unique (webinar_id, contact_id)
### agent_runs
Columns: id, workspace_id, created_by, instruction, status (planning|awaiting_approval|running|succeeded|failed|cancelled), summary, mock boolean, created_at, updated_at
### agent_steps
Columns: id, run_id, workspace_id, position, tool, args (jsonb), risk (low|medium|high), status (pending|awaiting_approval|approved|rejected|running|succeeded|failed|skipped), result (jsonb), error, idempotency_key (unique), approver_id, approved_at, started_at, duration_ms
### audit_log
Columns: id, workspace_id, actor_type, actor_id, action, entity_type, entity_id, metadata (jsonb, no secrets), created_at. Append-only.

## 4. Relationships
workspaces -> memberships, contacts, sites, plans, campaigns, webinars, agent_runs, audit_log (one to many)
users -> memberships (many to many with workspaces)
contacts <-> tags via contact_tags
contacts -> activities, webinar_registrations, campaign_recipients
sites -> site_pages, form_submissions
campaigns -> campaign_recipients -> email_events
agent_runs -> agent_steps

## 5. Constraints
Required: workspace_id on every tenant table; contacts.email; sites.slug.
Unique: (workspace_id, lower(email)) on contacts; sites.slug; stripe_events.id; agent_steps.idempotency_key; usage_events.idempotency_key; (campaign_id, contact_id).
Foreign Keys: all *_id columns with ON DELETE CASCADE from workspace; audit_log keeps rows (no cascade to users).

## 6. Indexes
(workspace_id, stage) on contacts: pipeline views and conversion.
(workspace_id, created_at desc) on contacts, activities, audit_log: timelines.
(contact_id, created_at desc) on activities.
(campaign_id, status) on campaign_recipients: send progress.
(run_id, position) on agent_steps: timeline order.
(workspace_id, occurred_at) on usage_events: metering.

## 7. Data Validation
- Zod schema per table in lib/db/validators.js; services validate before insert.
- Emails lowercased and trimmed before storage.
- Slugs match ^[a-z0-9-]{3,40}$.
- jsonb columns validated against Zod schemas on write.

## 8. Soft Delete
Does the system use soft deletion? Yes for contacts only (deleted_at), so activity history and campaign stats stay intact. All other deletes are hard deletes and require HIGH-risk approval if triggered by the agent.

## 9. Auditing
Created by / updated by: tracked via audit_log and activities, not per-row columns.
Deleted by: audit_log entry.
Activity history: activities (CRM) and audit_log (everything sensitive).
Rule: audit_log is append-only; app role has INSERT and SELECT only.

## 10. Sensitive Data
Sensitive fields: contacts.email and name (personal data), form_submissions.ip_hash (hashed, never raw IP), Stripe ids.
Protection: no card data ever stored (Stripe hosts it); secrets only in env; logs never include emails or tokens in bulk; RLS enabled on all tables with no policies so the Supabase anon/auth APIs cannot read anything.

## 11. Migration Rules
Schema changes must:
1. Be documented here
2. Have a drizzle-kit migration committed under lib/db/migrations
3. Be tested locally against Docker Postgres
4. Avoid breaking existing production data (add columns nullable first, backfill, then constrain)
Destructive migrations (drop column/table) require owner approval.

## 12. Seed Data
db:seed creates one demo workspace "Nexus Demo", five users (one per role), 40 contacts across stages with 6 tags (including "webinar-interest"), 3 plans, 1 published site with a lead form, 1 past webinar with attendance, 2 past campaigns with opens and clicks, and 1 completed agent run. Seed data is labelled and idempotent.
