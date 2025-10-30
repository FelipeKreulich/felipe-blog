// Local Role enum that mirrors Prisma's Role enum
// This is needed to avoid build-time issues with Prisma client
export enum Role {
  USER = 'USER',
  WRITER = 'WRITER',
  EDITOR = 'EDITOR',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum Permission {
  // Post Permissions
  VIEW_POSTS = 'VIEW_POSTS',
  CREATE_POST = 'CREATE_POST',
  EDIT_OWN_POST = 'EDIT_OWN_POST',
  EDIT_ANY_POST = 'EDIT_ANY_POST',
  DELETE_OWN_POST = 'DELETE_OWN_POST',
  DELETE_ANY_POST = 'DELETE_ANY_POST',
  PUBLISH_POST = 'PUBLISH_POST',
  APPROVE_POST = 'APPROVE_POST',
  FEATURE_POST = 'FEATURE_POST',

  // Comment Permissions
  VIEW_COMMENTS = 'VIEW_COMMENTS',
  CREATE_COMMENT = 'CREATE_COMMENT',
  EDIT_OWN_COMMENT = 'EDIT_OWN_COMMENT',
  DELETE_OWN_COMMENT = 'DELETE_OWN_COMMENT',
  MODERATE_COMMENTS = 'MODERATE_COMMENTS',
  DELETE_ANY_COMMENT = 'DELETE_ANY_COMMENT',

  // Like Permissions
  LIKE_CONTENT = 'LIKE_CONTENT',

  // Report Permissions
  CREATE_REPORT = 'CREATE_REPORT',
  VIEW_REPORTS = 'VIEW_REPORTS',
  RESOLVE_REPORTS = 'RESOLVE_REPORTS',

  // User Management
  VIEW_USERS = 'VIEW_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  BAN_USER = 'BAN_USER',
  SUSPEND_USER = 'SUSPEND_USER',

  // Category & Tag Management
  MANAGE_CATEGORIES = 'MANAGE_CATEGORIES',
  MANAGE_TAGS = 'MANAGE_TAGS',

  // Analytics
  VIEW_OWN_STATS = 'VIEW_OWN_STATS',
  VIEW_ALL_STATS = 'VIEW_ALL_STATS',

  // System
  VIEW_LOGS = 'VIEW_LOGS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}

// Define base permissions for each role level
const USER_PERMISSIONS = [
  Permission.VIEW_POSTS,
  Permission.VIEW_COMMENTS,
  Permission.CREATE_COMMENT,
  Permission.EDIT_OWN_COMMENT,
  Permission.DELETE_OWN_COMMENT,
  Permission.LIKE_CONTENT,
  Permission.CREATE_REPORT,
]

const WRITER_PERMISSIONS = [
  ...USER_PERMISSIONS,
  Permission.CREATE_POST,
  Permission.EDIT_OWN_POST,
  Permission.DELETE_OWN_POST,
  Permission.VIEW_OWN_STATS,
]

const EDITOR_PERMISSIONS = [
  ...WRITER_PERMISSIONS,
  Permission.EDIT_ANY_POST,
  Permission.APPROVE_POST,
  Permission.PUBLISH_POST,
  Permission.FEATURE_POST,
  Permission.MODERATE_COMMENTS,
  Permission.MANAGE_CATEGORIES,
  Permission.MANAGE_TAGS,
]

const MODERATOR_PERMISSIONS = [
  ...EDITOR_PERMISSIONS,
  Permission.DELETE_ANY_POST,
  Permission.DELETE_ANY_COMMENT,
  Permission.VIEW_REPORTS,
  Permission.RESOLVE_REPORTS,
  Permission.SUSPEND_USER,
  Permission.VIEW_LOGS,
]

const ADMIN_PERMISSIONS = Object.values(Permission)

// Define permissions for each role
export const RolePermissions: Record<Role, Permission[]> = {
  USER: USER_PERMISSIONS,
  WRITER: WRITER_PERMISSIONS,
  EDITOR: EDITOR_PERMISSIONS,
  MODERATOR: MODERATOR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
}

// Helper to get all permissions for a role including inherited ones
export function getPermissionsForRole(role: Role): Permission[] {
  return RolePermissions[role] || []
}

// Check if a role has a specific permission
export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return getPermissionsForRole(role).includes(permission)
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: Role | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false
  const rolePermissions = getPermissionsForRole(role)
  return permissions.some(p => rolePermissions.includes(p))
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: Role | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false
  const rolePermissions = getPermissionsForRole(role)
  return permissions.every(p => rolePermissions.includes(p))
}
