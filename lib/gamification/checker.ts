import { prisma } from '@/lib/prisma'
import { notifyAchievementUnlocked } from '@/lib/notifications'

/**
 * Check and grant achievements for a user based on a triggered action.
 * Runs asynchronously — caller should not await unless they need the result.
 */
export async function checkAchievements(userId: string, trigger: AchievementTrigger) {
  try {
    // Get all achievements the user hasn't unlocked yet
    const unlockedKeys = (
      await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievement: { select: { key: true } } },
      })
    ).map((ua) => ua.achievement.key)

    const candidates = await prisma.achievement.findMany({
      where: { key: { notIn: unlockedKeys } },
    })

    if (candidates.length === 0) return

    for (const achievement of candidates) {
      const criteria = achievement.criteria as Record<string, any>
      if (!criteria?.type) continue

      // Only check achievements relevant to the current trigger
      if (!isRelevant(criteria.type, trigger)) continue

      const met = await checkCriteria(userId, criteria)
      if (met) {
        await grantAchievement(userId, achievement.id, achievement.points)
        await notifyAchievementUnlocked({
          userId,
          achievementName: achievement.name,
          achievementIcon: achievement.icon,
          achievementPoints: achievement.points,
        })
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}

type AchievementTrigger =
  | 'post_published'
  | 'comment_created'
  | 'like_received'
  | 'bookmark_created'
  | 'post_featured'
  | 'login'

function isRelevant(criteriaType: string, trigger: AchievementTrigger): boolean {
  const mapping: Record<string, AchievementTrigger[]> = {
    post_count: ['post_published'],
    comment_count: ['comment_created'],
    like_received: ['like_received'],
    single_post_likes: ['like_received'],
    single_post_views: ['login'], // checked on login as views accumulate passively
    bookmark_count: ['bookmark_created'],
    featured_post: ['post_featured'],
    streak: ['login'],
    time_of_day: ['post_published'],
    weekend_posts: ['post_published'],
    early_adopter: ['login'],
    member_days: ['login'],
    comment_likes_received: ['like_received'],
    top_author_rank: ['login'],
  }
  return mapping[criteriaType]?.includes(trigger) ?? false
}

async function checkCriteria(userId: string, criteria: Record<string, any>): Promise<boolean> {
  const { type, count } = criteria

  switch (type) {
    case 'post_count': {
      const total = await prisma.post.count({
        where: { authorId: userId, published: true },
      })
      return total >= count
    }

    case 'comment_count': {
      const total = await prisma.comment.count({
        where: { authorId: userId },
      })
      return total >= count
    }

    case 'like_received': {
      const total = await prisma.like.count({
        where: {
          post: { authorId: userId },
          commentId: null,
        },
      })
      return total >= count
    }

    case 'single_post_likes': {
      const posts = await prisma.post.findMany({
        where: { authorId: userId, published: true },
        select: { _count: { select: { likes: true } } },
      })
      return posts.some((p) => p._count.likes >= count)
    }

    case 'single_post_views': {
      const posts = await prisma.post.findMany({
        where: { authorId: userId, published: true },
        select: { _count: { select: { views: true } } },
      })
      return posts.some((p) => p._count.views >= count)
    }

    case 'bookmark_count': {
      const total = await prisma.bookmark.count({
        where: { userId },
      })
      return total >= count
    }

    case 'featured_post': {
      const total = await prisma.post.count({
        where: { authorId: userId, feature: true },
      })
      return total >= count
    }

    case 'streak': {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true },
      })
      return (user?.streak ?? 0) >= count
    }

    case 'time_of_day': {
      const hours: number[] = criteria.hours || []
      const now = new Date()
      return hours.includes(now.getHours())
    }

    case 'weekend_posts': {
      const posts = await prisma.post.findMany({
        where: { authorId: userId, published: true },
        select: { publishedAt: true },
      })
      const weekendPosts = posts.filter((p) => {
        if (!p.publishedAt) return false
        const day = new Date(p.publishedAt).getDay()
        return day === 0 || day === 6
      })
      return weekendPosts.length >= count
    }

    case 'early_adopter': {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      })
      if (!user) return false
      const deadline = new Date(criteria.before)
      return user.createdAt <= deadline
    }

    case 'member_days': {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      })
      if (!user) return false
      const days = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      return days >= count
    }

    case 'comment_likes_received': {
      const total = await prisma.like.count({
        where: {
          comment: { authorId: userId },
          commentId: { not: null },
        },
      })
      return total >= count
    }

    case 'top_author_rank': {
      // Check if user is in top N authors by published post count
      const topAuthors = await prisma.post.groupBy({
        by: ['authorId'],
        where: { published: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: criteria.rank || 10,
      })
      return topAuthors.some((a) => a.authorId === userId)
    }

    default:
      return false
  }
}

async function grantAchievement(userId: string, achievementId: string, points: number) {
  await prisma.$transaction([
    prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        progress: 100,
        notified: true,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: points },
      },
    }),
  ])
}
