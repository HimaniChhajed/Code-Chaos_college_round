import { ForbiddenError } from './errors.js';

/**
 * Permission matrix from SECURITY.md section 2.
 * Each key is a permission action; value is an array of roles that can perform it.
 */
export const PERMISSIONS = {
  // Workspace management
  'workspace.delete':        ['owner'],
  'workspace.members.manage': ['owner', 'admin'],
  'workspace.members.read':  ['owner', 'admin'],

  // CRM
  'crm.read':     ['owner', 'admin', 'marketer', 'sales', 'viewer'],
  'crm.write':    ['owner', 'admin', 'sales'],

  // Website builder
  'website.read':    ['owner', 'admin', 'marketer', 'viewer'],
  'website.write':   ['owner', 'admin', 'marketer'],
  'website.publish': ['owner', 'admin', 'marketer'],

  // Marketing
  'marketing.read':  ['owner', 'admin', 'marketer', 'sales', 'viewer'],
  'marketing.write': ['owner', 'admin', 'marketer'],
  'marketing.send':  ['owner', 'admin', 'marketer'],

  // Billing
  'billing.read':  ['owner', 'admin', 'viewer'],
  'billing.write': ['owner', 'admin'],

  // Webinars
  'webinar.read':  ['owner', 'admin', 'marketer', 'sales', 'viewer'],
  'webinar.write': ['owner', 'admin', 'marketer'],

  // Agent
  'agent.run':     ['owner', 'admin', 'marketer', 'sales'],
  'agent.approve': ['owner', 'admin'],

  // Analytics
  'analytics.read': ['owner', 'admin', 'marketer', 'sales', 'viewer'],

  // Audit log
  'audit.read': ['owner', 'admin'],
};

/**
 * Require that the context (session user) has one of the allowed roles.
 * Throws ForbiddenError if not.
 *
 * @param {{ role: string, workspaceId: string, userId: string }} ctx
 * @param {string[]} allowedRoles
 */
export function requireRole(ctx, allowedRoles) {
  if (!ctx || !ctx.role) {
    throw new ForbiddenError('No role in session');
  }
  if (!allowedRoles.includes(ctx.role)) {
    throw new ForbiddenError(`Role "${ctx.role}" is not allowed. Required: ${allowedRoles.join(', ')}`);
  }
}

/**
 * Check if a role has a specific permission.
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role);
}
