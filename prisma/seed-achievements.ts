import { PrismaClient } from '../lib/generated/prisma'
import { ACHIEVEMENTS } from '../lib/gamification/achievements'

const prisma = new PrismaClient()

async function seedAchievements() {
  console.log('🎮 Seeding achievements...')

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        points: achievement.points,
        rarity: achievement.rarity,
        criteria: achievement.criteria,
      },
      create: {
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        points: achievement.points,
        rarity: achievement.rarity,
        criteria: achievement.criteria,
      },
    })

    console.log(`✅ ${achievement.icon} ${achievement.name}`)
  }

  console.log(`\n🎉 Seeded ${ACHIEVEMENTS.length} achievements!`)
}

seedAchievements()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Error seeding achievements:', e)
    prisma.$disconnect()
    process.exit(1)
  })
