import { useSession } from 'next-auth/react'
import { Role } from '@prisma/client'
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/permissions'

export function usePermissions() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role as Role | undefined

  return {
    role: userRole,
    isAuthenticated: !!session,

    // Check single permission
    hasPermission: (permission: Permission) => {
      return hasPermission(userRole, permission)
    },

    // Check if has any of the permissions
    hasAnyPermission: (permissions: Permission[]) => {
      return hasAnyPermission(userRole, permissions)
    },

    // Check if has all permissions
    hasAllPermissions: (permissions: Permission[]) => {
      return hasAllPermissions(userRole, permissions)
    },

    // Check if has specific role
    hasRole: (role: Role | Role[]) => {
      if (!userRole) return false
      const roles = Array.isArray(role) ? role : [role]
      return roles.includes(userRole)
    },

    // Quick role checks
    isAdmin: userRole === Role.ADMIN,
    isModerator: userRole === Role.MODERATOR || userRole === Role.ADMIN,
    isEditor: ['EDITOR', 'MODERATOR', 'ADMIN'].includes(userRole || ''),
    isWriter: ['WRITER', 'EDITOR', 'MODERATOR', 'ADMIN'].includes(userRole || ''),
    isUser: !!userRole,
  }
}
