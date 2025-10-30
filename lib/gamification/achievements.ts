/**
 * Achievement definitions
 * These are seeded into the database
 */

export const ACHIEVEMENTS = [
  // CONTENT - Creating posts and comments
  {
    key: 'first_post',
    name: '🎓 First Steps',
    description: 'Publish your first post',
    icon: '🎓',
    category: 'CONTENT',
    points: 50,
    rarity: 'COMMON',
    criteria: { type: 'post_count', count: 1 },
  },
  {
    key: '10_posts',
    name: '📝 Prolific Writer',
    description: 'Publish 10 posts',
    icon: '📝',
    category: 'CONTENT',
    points: 200,
    rarity: 'UNCOMMON',
    criteria: { type: 'post_count', count: 10 },
  },
  {
    key: '50_posts',
    name: '✍️ Author Extraordinaire',
    description: 'Publish 50 posts',
    icon: '✍️',
    category: 'CONTENT',
    points: 500,
    rarity: 'RARE',
    criteria: { type: 'post_count', count: 50 },
  },
  {
    key: '100_posts',
    name: '📚 Publishing Legend',
    description: 'Publish 100 posts',
    icon: '📚',
    category: 'CONTENT',
    points: 1000,
    rarity: 'EPIC',
    criteria: { type: 'post_count', count: 100 },
  },
  {
    key: 'first_comment',
    name: '💬 Conversationalist',
    description: 'Leave your first comment',
    icon: '💬',
    category: 'CONTENT',
    points: 10,
    rarity: 'COMMON',
    criteria: { type: 'comment_count', count: 1 },
  },
  {
    key: '50_comments',
    name: '🗣️ Community Voice',
    description: 'Leave 50 comments',
    icon: '🗣️',
    category: 'CONTENT',
    points: 150,
    rarity: 'UNCOMMON',
    criteria: { type: 'comment_count', count: 50 },
  },
  {
    key: '100_comments',
    name: '💎 Discussion Master',
    description: 'Leave 100 comments',
    icon: '💎',
    category: 'CONTENT',
    points: 300,
    rarity: 'RARE',
    criteria: { type: 'comment_count', count: 100 },
  },

  // ENGAGEMENT - Likes and interactions
  {
    key: 'first_like',
    name: '❤️ First Love',
    description: 'Receive your first like',
    icon: '❤️',
    category: 'ENGAGEMENT',
    points: 10,
    rarity: 'COMMON',
    criteria: { type: 'like_received', count: 1 },
  },
  {
    key: '10_likes',
    name: '👍 Popular',
    description: 'Receive 10 likes on your content',
    icon: '👍',
    category: 'ENGAGEMENT',
    points: 50,
    rarity: 'COMMON',
    criteria: { type: 'like_received', count: 10 },
  },
  {
    key: '50_likes',
    name: '🌟 Rising Star',
    description: 'Receive 50 likes on your content',
    icon: '🌟',
    category: 'ENGAGEMENT',
    points: 150,
    rarity: 'UNCOMMON',
    criteria: { type: 'like_received', count: 50 },
  },
  {
    key: '100_likes',
    name: '⭐ Community Favorite',
    description: 'Receive 100 likes on your content',
    icon: '⭐',
    category: 'ENGAGEMENT',
    points: 300,
    rarity: 'RARE',
    criteria: { type: 'like_received', count: 100 },
  },
  {
    key: 'viral_post',
    name: '🔥 Viral Sensation',
    description: 'Get 50+ likes on a single post',
    icon: '🔥',
    category: 'ENGAGEMENT',
    points: 500,
    rarity: 'EPIC',
    criteria: { type: 'single_post_likes', count: 50 },
  },
  {
    key: 'trending_post',
    name: '📈 Trending Writer',
    description: 'Get 100+ views on a single post',
    icon: '📈',
    category: 'ENGAGEMENT',
    points: 200,
    rarity: 'UNCOMMON',
    criteria: { type: 'single_post_views', count: 100 },
  },
  {
    key: 'first_bookmark',
    name: '🔖 Bookworm',
    description: 'Save your first post',
    icon: '🔖',
    category: 'ENGAGEMENT',
    points: 10,
    rarity: 'COMMON',
    criteria: { type: 'bookmark_count', count: 1 },
  },
  {
    key: '10_bookmarks',
    name: '📚 Avid Reader',
    description: 'Save 10 posts',
    icon: '📚',
    category: 'ENGAGEMENT',
    points: 50,
    rarity: 'UNCOMMON',
    criteria: { type: 'bookmark_count', count: 10 },
  },

  // MILESTONE - Time-based and special
  {
    key: '7_day_streak',
    name: '🔥 On Fire',
    description: 'Be active for 7 days in a row',
    icon: '🔥',
    category: 'MILESTONE',
    points: 100,
    rarity: 'UNCOMMON',
    criteria: { type: 'streak', count: 7 },
  },
  {
    key: '30_day_streak',
    name: '💪 Dedicated',
    description: 'Be active for 30 days in a row',
    icon: '💪',
    category: 'MILESTONE',
    points: 400,
    rarity: 'RARE',
    criteria: { type: 'streak', count: 30 },
  },
  {
    key: '100_day_streak',
    name: '🏆 Unstoppable',
    description: 'Be active for 100 days in a row',
    icon: '🏆',
    category: 'MILESTONE',
    points: 1000,
    rarity: 'LEGENDARY',
    criteria: { type: 'streak', count: 100 },
  },
  {
    key: 'early_bird',
    name: '🌅 Early Bird',
    description: 'Post at 5-7 AM',
    icon: '🌅',
    category: 'MILESTONE',
    points: 50,
    rarity: 'UNCOMMON',
    criteria: { type: 'time_of_day', hours: [5, 6, 7] },
  },
  {
    key: 'night_owl',
    name: '🦉 Night Owl',
    description: 'Post between 11 PM - 2 AM',
    icon: '🦉',
    category: 'MILESTONE',
    points: 50,
    rarity: 'UNCOMMON',
    criteria: { type: 'time_of_day', hours: [23, 0, 1, 2] },
  },
  {
    key: 'weekend_warrior',
    name: '⚔️ Weekend Warrior',
    description: 'Post 5 times on weekends',
    icon: '⚔️',
    category: 'MILESTONE',
    points: 100,
    rarity: 'UNCOMMON',
    criteria: { type: 'weekend_posts', count: 5 },
  },

  // SPECIAL - Rare and unique
  {
    key: 'first_featured',
    name: '⭐ Featured Writer',
    description: 'Get a post featured by editors',
    icon: '⭐',
    category: 'SPECIAL',
    points: 300,
    rarity: 'EPIC',
    criteria: { type: 'featured_post', count: 1 },
  },
  {
    key: 'beta_tester',
    name: '🧪 Beta Tester',
    description: 'Join during beta period',
    icon: '🧪',
    category: 'SPECIAL',
    points: 200,
    rarity: 'RARE',
    criteria: { type: 'early_adopter', before: '2025-12-31' },
  },
  {
    key: 'year_member',
    name: '🎂 One Year Strong',
    description: 'Be a member for 1 year',
    icon: '🎂',
    category: 'MILESTONE',
    points: 500,
    rarity: 'EPIC',
    criteria: { type: 'member_days', count: 365 },
  },
  {
    key: 'helpful_commenter',
    name: '🤝 Helpful Community Member',
    description: 'Receive 20+ likes on comments',
    icon: '🤝',
    category: 'ENGAGEMENT',
    points: 200,
    rarity: 'RARE',
    criteria: { type: 'comment_likes_received', count: 20 },
  },
  {
    key: 'top_author',
    name: '🥇 Top 10 Author',
    description: 'Be in the top 10 authors of the month',
    icon: '🥇',
    category: 'SPECIAL',
    points: 1000,
    rarity: 'LEGENDARY',
    criteria: { type: 'top_author_rank', rank: 10 },
  },
] as const

/**
 * XP required for each level
 * Formula: level * 100 + (level - 1) * 50
 */
export function getXPForLevel(level: number): number {
  return level * 100 + (level - 1) * 50
}

/**
 * Calculate level from XP
 */
export function getLevelFromXP(xp: number): number {
  let level = 1
  let totalXP = 0

  while (totalXP <= xp) {
    totalXP += getXPForLevel(level)
    if (totalXP <= xp) {
      level++
    }
  }

  return level
}

/**
 * Get XP progress to next level
 */
export function getXPProgress(xp: number): {
  currentLevel: number
  nextLevel: number
  currentLevelXP: number
  nextLevelXP: number
  progress: number // 0-100
} {
  const currentLevel = getLevelFromXP(xp)
  const nextLevel = currentLevel + 1

  let currentLevelXP = 0
  for (let i = 1; i < currentLevel; i++) {
    currentLevelXP += getXPForLevel(i)
  }

  const nextLevelXP = currentLevelXP + getXPForLevel(currentLevel)
  const xpInCurrentLevel = xp - currentLevelXP
  const xpNeededForNextLevel = getXPForLevel(currentLevel)
  const progress = Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100)

  return {
    currentLevel,
    nextLevel,
    currentLevelXP: xpInCurrentLevel,
    nextLevelXP: xpNeededForNextLevel,
    progress,
  }
}

/**
 * Rarity colors for UI
 */
export const RARITY_COLORS = {
  COMMON: 'bg-gray-400',
  UNCOMMON: 'bg-green-500',
  RARE: 'bg-blue-500',
  EPIC: 'bg-purple-500',
  LEGENDARY: 'bg-yellow-500',
} as const

/**
 * Rarity text colors
 */
export const RARITY_TEXT_COLORS = {
  COMMON: 'text-gray-600',
  UNCOMMON: 'text-green-600',
  RARE: 'text-blue-600',
  EPIC: 'text-purple-600',
  LEGENDARY: 'text-yellow-600',
} as const
