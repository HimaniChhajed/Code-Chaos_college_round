import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

/**
 * Every DAL query requires a workspaceId.
 * This ensures tenant isolation at the data access layer.
 */
function assertWorkspaceId(workspaceId) {
  if (!workspaceId) {
    throw new Error('workspaceId is required for all DAL queries');
  }
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function getContacts(workspaceId, { limit = 25 } = {}) {
  assertWorkspaceId(workspaceId);
  return db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.workspaceId, workspaceId))
    .limit(limit);
}

export async function getContactByEmail(workspaceId, email) {
  assertWorkspaceId(workspaceId);
  const rows = await db
    .select()
    .from(schema.contacts)
    .where(
      and(
        eq(schema.contacts.workspaceId, workspaceId),
        eq(schema.contacts.email, email.toLowerCase().trim())
      )
    )
    .limit(1);
  return rows[0] || null;
}

// ---------------------------------------------------------------------------
// Memberships
// ---------------------------------------------------------------------------

export async function getMemberships(workspaceId) {
  assertWorkspaceId(workspaceId);
  return db
    .select()
    .from(schema.memberships)
    .where(eq(schema.memberships.workspaceId, workspaceId));
}

export async function getMembershipByUserId(workspaceId, userId) {
  assertWorkspaceId(workspaceId);
  const rows = await db
    .select()
    .from(schema.memberships)
    .where(
      and(
        eq(schema.memberships.workspaceId, workspaceId),
        eq(schema.memberships.userId, userId)
      )
    )
    .limit(1);
  return rows[0] || null;
}

export async function getUserMemberships(userId) {
  // Not workspace-scoped: returns all workspaces a user belongs to
  return db
    .select()
    .from(schema.memberships)
    .where(eq(schema.memberships.userId, userId));
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

export async function getAuditLog(workspaceId, { limit = 50 } = {}) {
  assertWorkspaceId(workspaceId);
  return db
    .select()
    .from(schema.auditLog)
    .where(eq(schema.auditLog.workspaceId, workspaceId))
    .orderBy(schema.auditLog.createdAt)
    .limit(limit);
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export async function getTags(workspaceId) {
  assertWorkspaceId(workspaceId);
  return db
    .select()
    .from(schema.tags)
    .where(eq(schema.tags.workspaceId, workspaceId));
}
