'use client'

import { ReactNode } from 'react'
import { Role } from '@prisma/client'
import { Permission } from '@/types/permissions'
import { usePermissions } from '@/hooks/usePermissions'

interface CanAccessProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean // If true, requires ALL permissions. If false, requires ANY
  role?: Role | Role[]
  fallback?: ReactNode
}

export function CanAccess({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = null,
}: CanAccessProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions()

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)

    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  // Check role
  if (role && !hasRole(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
