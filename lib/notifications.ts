import { prisma } from './prisma'
import { NotificationType } from '@/lib/generated/prisma'

interface CreateNotificationParams {
  userId: string // Quem vai receber a notificação
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  actorId?: string // Quem causou a notificação
  postId?: string
  commentId?: string
  metadata?: Record<string, any>
}

/**
 * Cria uma nova notificação para um usuário
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    // Não criar notificação se o actor for o mesmo usuário que vai receber
    if (params.actorId && params.actorId === params.userId) {
      return null
    }

    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        actorId: params.actorId,
        postId: params.postId,
        commentId: params.commentId,
        metadata: params.metadata || null,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          }
        }
      }
    })

    return notification
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return null
  }
}

/**
 * Cria notificação quando alguém comenta em um post
 */
export async function notifyNewComment({
  postId,
  postTitle,
  postSlug,
  postAuthorId,
  commenterUserId,
  commenterName,
}: {
  postId: string
  postTitle: string
  postSlug: string
  postAuthorId: string
  commenterUserId: string
  commenterName: string
}) {
  return createNotification({
    userId: postAuthorId,
    type: 'COMMENT',
    title: 'Novo comentário',
    message: `${commenterName} comentou no seu post "${postTitle}"`,
    actionUrl: `/blog/${postSlug}`,
    actorId: commenterUserId,
    postId,
  })
}

/**
 * Cria notificação quando alguém responde um comentário
 */
export async function notifyCommentReply({
  commentId,
  postTitle,
  postSlug,
  commentAuthorId,
  replierUserId,
  replierName,
}: {
  commentId: string
  postTitle: string
  postSlug: string
  commentAuthorId: string
  replierUserId: string
  replierName: string
}) {
  return createNotification({
    userId: commentAuthorId,
    type: 'REPLY',
    title: 'Nova resposta',
    message: `${replierName} respondeu ao seu comentário em "${postTitle}"`,
    actionUrl: `/blog/${postSlug}`,
    actorId: replierUserId,
    commentId,
  })
}

/**
 * Cria notificação quando alguém curte um post
 */
export async function notifyPostLike({
  postId,
  postTitle,
  postSlug,
  postAuthorId,
  likerUserId,
  likerName,
}: {
  postId: string
  postTitle: string
  postSlug: string
  postAuthorId: string
  likerUserId: string
  likerName: string
}) {
  return createNotification({
    userId: postAuthorId,
    type: 'LIKE_POST',
    title: 'Novo like',
    message: `${likerName} curtiu seu post "${postTitle}"`,
    actionUrl: `/blog/${postSlug}`,
    actorId: likerUserId,
    postId,
  })
}

/**
 * Cria notificação quando alguém curte um comentário
 */
export async function notifyCommentLike({
  commentId,
  postTitle,
  postSlug,
  commentAuthorId,
  likerUserId,
  likerName,
}: {
  commentId: string
  postTitle: string
  postSlug: string
  commentAuthorId: string
  likerUserId: string
  likerName: string
}) {
  return createNotification({
    userId: commentAuthorId,
    type: 'LIKE_COMMENT',
    title: 'Novo like',
    message: `${likerName} curtiu seu comentário em "${postTitle}"`,
    actionUrl: `/blog/${postSlug}`,
    actorId: likerUserId,
    commentId,
  })
}

/**
 * Cria notificação quando um usuário desbloqueia uma conquista
 */
export async function notifyAchievementUnlocked({
  userId,
  achievementName,
  achievementIcon,
  achievementPoints,
}: {
  userId: string
  achievementName: string
  achievementIcon: string
  achievementPoints: number
}) {
  return createNotification({
    userId,
    type: 'ACHIEVEMENT',
    title: 'Conquista desbloqueada!',
    message: `Você desbloqueou "${achievementName}" ${achievementIcon} (+${achievementPoints} XP)`,
    actionUrl: '/achievements',
    metadata: {
      achievementName,
      achievementIcon,
      points: achievementPoints,
    }
  })
}

/**
 * Cria notificação quando um post é aprovado
 */
export async function notifyPostApproved({
  postId,
  postTitle,
  postSlug,
  postAuthorId,
  editorName,
}: {
  postId: string
  postTitle: string
  postSlug: string
  postAuthorId: string
  editorName: string
}) {
  return createNotification({
    userId: postAuthorId,
    type: 'POST_APPROVED',
    title: 'Post aprovado!',
    message: `Seu post "${postTitle}" foi aprovado por ${editorName} e está publicado`,
    actionUrl: `/blog/${postSlug}`,
    postId,
  })
}

/**
 * Cria notificação quando um post é rejeitado
 */
export async function notifyPostRejected({
  postId,
  postTitle,
  postAuthorId,
  editorName,
  reason,
}: {
  postId: string
  postTitle: string
  postAuthorId: string
  editorName: string
  reason?: string
}) {
  return createNotification({
    userId: postAuthorId,
    type: 'POST_REJECTED',
    title: 'Post rejeitado',
    message: `Seu post "${postTitle}" foi rejeitado por ${editorName}${reason ? `: ${reason}` : ''}`,
    actionUrl: `/my-posts`,
    postId,
    metadata: {
      reason,
    }
  })
}
