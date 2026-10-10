import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Auth.js tables (required by @auth/drizzle-adapter)
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date', withTimezone: true }),
  image: text('image'),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

// ---------------------------------------------------------------------------
// Workspaces & Memberships
// ---------------------------------------------------------------------------

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('memberships_workspace_user_idx').on(table.workspaceId, table.userId),
    check('memberships_role_check', sql`${table.role} IN ('owner', 'admin', 'marketer', 'sales', 'viewer')`),
  ]
);

// ---------------------------------------------------------------------------
// CRM: Contacts, Tags, Activities
// ---------------------------------------------------------------------------

export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    name: text('name'),
    stage: text('stage').notNull().default('new'),
    source: text('source'),
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('contacts_workspace_email_idx').on(table.workspaceId, sql`lower(${table.email})`),
    index('contacts_workspace_stage_idx').on(table.workspaceId, table.stage),
    index('contacts_workspace_created_idx').on(table.workspaceId, table.createdAt),
    check('contacts_stage_check', sql`${table.stage} IN ('new', 'contacted', 'registered', 'customer', 'lost')`),
  ]
);

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
  },
  (table) => [
    uniqueIndex('tags_workspace_name_idx').on(table.workspaceId, table.name),
  ]
);

export const contactTags = pgTable(
  'contact_tags',
  {
    contactId: uuid('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.contactId, table.tagId] }),
  ]
);

export const activities = pgTable(
  'activities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    contactId: uuid('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    data: jsonb('data'),
    actorType: text('actor_type').notNull(),
    actorId: uuid('actor_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('activities_workspace_created_idx').on(table.workspaceId, table.createdAt),
    index('activities_contact_created_idx').on(table.contactId, table.createdAt),
    check('activities_actor_type_check', sql`${table.actorType} IN ('user', 'agent', 'system')`),
  ]
);

// ---------------------------------------------------------------------------
// Website Builder
// ---------------------------------------------------------------------------

export const sites = pgTable(
  'sites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    status: text('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('sites_status_check', sql`${table.status} IN ('draft', 'published')`),
  ]
);

export const sitePages = pgTable('site_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id')
    .notNull()
    .references(() => sites.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  path: text('path').notNull(),
  craftJson: jsonb('craft_json'),
  publishedJson: jsonb('published_json'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const formSubmissions = pgTable('form_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  siteId: uuid('site_id')
    .notNull()
    .references(() => sites.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').references(() => contacts.id),
  payload: jsonb('payload'),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('usd'),
  interval: text('interval').notNull(),
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('plans_interval_check', sql`${table.interval} IN ('month', 'year', 'one_time')`),
]);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id')
    .notNull()
    .references(() => plans.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status').notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const usageEvents = pgTable(
  'usage_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    metric: text('metric').notNull(),
    quantity: integer('quantity').notNull().default(1),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
    idempotencyKey: text('idempotency_key').unique(),
  },
  (table) => [
    index('usage_events_workspace_occurred_idx').on(table.workspaceId, table.occurredAt),
    check('usage_events_metric_check', sql`${table.metric} IN ('emails_sent', 'agent_steps')`),
  ]
);

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  stripeInvoiceId: text('stripe_invoice_id').unique(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('usd'),
  status: text('status').notNull(),
  hostedUrl: text('hosted_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const stripeEvents = pgTable('stripe_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Marketing
// ---------------------------------------------------------------------------

export const campaigns = pgTable(
  'campaigns',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    subject: text('subject'),
    bodyHtml: text('body_html'),
    audienceFilter: jsonb('audience_filter'),
    status: text('status').notNull().default('draft'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('campaigns_status_check', sql`${table.status} IN ('draft', 'scheduled', 'sending', 'sent', 'failed')`),
  ]
);

export const campaignRecipients = pgTable(
  'campaign_recipients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    contactId: uuid('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('queued'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    providerMessageId: text('provider_message_id'),
    error: text('error'),
  },
  (table) => [
    uniqueIndex('campaign_recipients_campaign_contact_idx').on(table.campaignId, table.contactId),
    index('campaign_recipients_campaign_status_idx').on(table.campaignId, table.status),
    check('campaign_recipients_status_check', sql`${table.status} IN ('queued', 'sent', 'failed', 'skipped')`),
  ]
);

export const emailEvents = pgTable('email_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignRecipientId: uuid('campaign_recipient_id')
    .notNull()
    .references(() => campaignRecipients.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  url: text('url'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('email_events_type_check', sql`${table.type} IN ('open', 'click')`),
]);

// ---------------------------------------------------------------------------
// Webinars
// ---------------------------------------------------------------------------

export const webinars = pgTable('webinars', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  durationMin: integer('duration_min'),
  planId: uuid('plan_id').references(() => plans.id),
  roomName: text('room_name'),
  siteId: uuid('site_id').references(() => sites.id),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const webinarRegistrations = pgTable(
  'webinar_registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    webinarId: uuid('webinar_id')
      .notNull()
      .references(() => webinars.id, { onDelete: 'cascade' }),
    contactId: uuid('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('registered'),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('webinar_registrations_webinar_contact_idx').on(table.webinarId, table.contactId),
    check('webinar_registrations_status_check', sql`${table.status} IN ('registered', 'attended', 'no_show')`),
  ]
);

// ---------------------------------------------------------------------------
// AI Agent
// ---------------------------------------------------------------------------

export const agentRuns = pgTable('agent_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  instruction: text('instruction').notNull(),
  status: text('status').notNull().default('planning'),
  summary: text('summary'),
  mock: boolean('mock').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('agent_runs_status_check', sql`${table.status} IN ('planning', 'awaiting_approval', 'running', 'succeeded', 'failed', 'cancelled')`),
]);

export const agentSteps = pgTable(
  'agent_steps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    runId: uuid('run_id')
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    tool: text('tool').notNull(),
    args: jsonb('args'),
    risk: text('risk').notNull(),
    status: text('status').notNull().default('pending'),
    result: jsonb('result'),
    error: text('error'),
    idempotencyKey: text('idempotency_key').unique(),
    approverId: uuid('approver_id').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    durationMs: integer('duration_ms'),
  },
  (table) => [
    index('agent_steps_run_position_idx').on(table.runId, table.position),
    check('agent_steps_risk_check', sql`${table.risk} IN ('low', 'medium', 'high')`),
    check('agent_steps_status_check', sql`${table.status} IN ('pending', 'awaiting_approval', 'approved', 'rejected', 'running', 'succeeded', 'failed', 'skipped')`),
  ]
);

// ---------------------------------------------------------------------------
// Audit Log (append-only)
// ---------------------------------------------------------------------------

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    actorType: text('actor_type').notNull(),
    actorId: uuid('actor_id'),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('audit_log_workspace_created_idx').on(table.workspaceId, table.createdAt),
    check('audit_log_actor_type_check', sql`${table.actorType} IN ('user', 'agent', 'system')`),
  ]
);
