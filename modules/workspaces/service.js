import { z } from 'zod/v4';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/index.js';
import { workspaces, memberships, users } from '@/lib/db/schema.js';
import { requireRole } from '@/lib/rbac.js';
import { writeAudit } from '@/lib/audit.js';
import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/errors.js';

const SLUG_REGEX = /^[a-z0-9-]{3,40}$/;

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(SLUG_REGEX, 'Slug must be 3-40 lowercase alphanumeric characters or hyphens'),
});

const changeRoleSchema = z.object({
  targetUserId: z.string().uuid(),
  newRole: z.enum(['owner', 'admin', 'marketer', 'sales', 'viewer']),
});

/**
 * Create a workspace and add the creator as Owner, in one transaction.
 */
export async function createWorkspace(userId, input) {
  const parsed = createWorkspaceSchema.parse(input);

  const result = await db.transaction(async (tx) => {
    const [ws] = await tx.insert(workspaces).values({
      name: parsed.name,
      slug: parsed.slug,
    }).returning();

    await tx.insert(memberships).values({
      workspaceId: ws.id,
      userId,
      role: 'owner',
    });

    await writeAudit(tx, {
      workspaceId: ws.id,
      userId,
      actorType: 'user',
    }, 'workspace.created', {
      entityType: 'workspace',
      entityId: ws.id,
    }, { name: parsed.name, slug: parsed.slug });

    return ws;
  });

  return result;
}

/**
 * List members of a workspace (with user info).
 */
export async function listMembers(ctx) {
  requireRole(ctx, ['owner', 'admin']);

  const rows = await db
    .select({
      membershipId: memberships.id,
      userId: memberships.userId,
      role: memberships.role,
      createdAt: memberships.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.workspaceId, ctx.workspaceId));

  return rows;
}

/**
 * Change a member's role. validate -> authorize -> transaction -> audit.
 */
export async function changeMemberRole(ctx, input) {
  requireRole(ctx, ['owner', 'admin']);

  const parsed = changeRoleSchema.parse(input);

  // Admin cannot change anyone to owner or change the owner
  if (ctx.role === 'admin' && parsed.newRole === 'owner') {
    throw new ForbiddenError('Admin cannot promote to owner');
  }

  const result = await db.transaction(async (tx) => {
    // Get target membership
    const [target] = await tx
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.workspaceId, ctx.workspaceId),
          eq(memberships.userId, parsed.targetUserId)
        )
      )
      .limit(1);

    if (!target) {
      throw new NotFoundError('Member not found');
    }

    // Admin cannot change the owner's role
    if (ctx.role === 'admin' && target.role === 'owner') {
      throw new ForbiddenError('Admin cannot change the owner role');
    }

    const oldRole = target.role;

    await tx
      .update(memberships)
      .set({ role: parsed.newRole })
      .where(eq(memberships.id, target.id));

    await writeAudit(tx, ctx, 'member.role_changed', {
      entityType: 'membership',
      entityId: target.id,
    }, { targetUserId: parsed.targetUserId, oldRole, newRole: parsed.newRole });

    return { ...target, role: parsed.newRole };
  });

  return result;
}
