import { auditLog } from './db/schema.js';

// Keys that must never appear in audit metadata
const SECRET_KEYS = new Set([
  'password', 'secret', 'token', 'api_key', 'apiKey',
  'access_token', 'refresh_token', 'id_token',
  'stripe_secret', 'webhook_secret', 'signing_key',
]);

/**
 * Recursively redact known secret keys from an object.
 */
function redactSecrets(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSecrets);

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SECRET_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      result[key] = redactSecrets(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Write an audit log entry within a transaction.
 *
 * @param {object} tx - Drizzle transaction
 * @param {{ workspaceId: string, userId: string, actorType: string }} ctx
 * @param {string} action - e.g. 'member.role_changed'
 * @param {{ entityType: string, entityId?: string }} entity
 * @param {object} [metadata] - extra context (secrets will be redacted)
 */
export async function writeAudit(tx, ctx, action, entity, metadata) {
  const safeMetadata = metadata ? redactSecrets(metadata) : null;

  await tx.insert(auditLog).values({
    workspaceId: ctx.workspaceId,
    actorType: ctx.actorType || 'user',
    actorId: ctx.userId,
    action,
    entityType: entity.entityType,
    entityId: entity.entityId || null,
    metadata: safeMetadata,
  });
}
