import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { Role } from '@prisma/client'
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/permissions'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      role: true,
      isBanned: true,
      bannedUntil: true,
    },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Não autenticado')
  }

  if (user.isBanned) {
    if (user.bannedUntil && user.bannedUntil > new Date()) {
      throw new Error(`Você está suspenso até ${user.bannedUntil.toLocaleDateString()}`)
    } else if (user.isBanned && !user.bannedUntil) {
      throw new Error('Você foi banido permanentemente')
    }
  }

  return user
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth()

  if (!hasPermission(user.role, permission)) {
    throw new Error('Você não tem permissão para realizar esta ação')
  }

  return user
}

export async function requireAnyPermission(permissions: Permission[]) {
  const user = await requireAuth()

  if (!hasAnyPermission(user.role, permissions)) {
    throw new Error('Você não tem permissão para realizar esta ação')
  }

  return user
}

export async function requireAllPermissions(permissions: Permission[]) {
  const user = await requireAuth()

  if (!hasAllPermissions(user.role, permissions)) {
    throw new Error('Você não tem permissão para realizar esta ação')
  }

  return user
}

export async function requireRole(role: Role | Role[]) {
  const user = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]

  if (!roles.includes(user.role)) {
    throw new Error('Você não tem permissão para acessar este recurso')
  }

  return user
}

// Check if user can edit a specific post
export async function canEditPost(postId: string) {
  const user = await requireAuth()

  // Admins, Moderators, and Editors can edit any post
  if ([Role.ADMIN, Role.MODERATOR, Role.EDITOR].includes(user.role)) {
    return true
  }

  // Writers can only edit their own posts
  if (user.role === Role.WRITER) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, published: true },
    })

    if (!post) {
      throw new Error('Post não encontrado')
    }

    // Can only edit own posts that are not published yet
    return post.authorId === user.id && !post.published
  }

  return false
}

// Check if user can delete a specific post
export async function canDeletePost(postId: string) {
  const user = await requireAuth()

  // Admins and Moderators can delete any post
  if ([Role.ADMIN, Role.MODERATOR].includes(user.role)) {
    return true
  }

  // Writers can only delete their own draft posts
  if (user.role === Role.WRITER) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, published: true },
    })

    if (!post) {
      throw new Error('Post não encontrado')
    }

    return post.authorId === user.id && !post.published
  }

  return false
}

// Check if user can edit a specific comment
export async function canEditComment(commentId: string) {
  const user = await requireAuth()

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  })

  if (!comment) {
    throw new Error('Comentário não encontrado')
  }

  // Can edit own comment or if moderator/admin
  return comment.authorId === user.id || [Role.ADMIN, Role.MODERATOR].includes(user.role)
}

// Check if user can delete a specific comment
export async function canDeleteComment(commentId: string) {
  const user = await requireAuth()

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  })

  if (!comment) {
    throw new Error('Comentário não encontrado')
  }

  // Can delete own comment or if moderator/admin
  return comment.authorId === user.id || [Role.ADMIN, Role.MODERATOR].includes(user.role)
}
