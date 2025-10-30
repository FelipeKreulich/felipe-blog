import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Lista todos os achievements e progresso do usuário (se logado)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    const achievements = await prisma.achievement.findMany({
      orderBy: [
        { rarity: 'desc' },
        { points: 'desc' }
      ]
    })

    // Se userId fornecido, pegar progresso do usuário
    let userAchievements = []
    if (userId) {
      userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true }
      })
    }

    return NextResponse.json({
      achievements,
      userAchievements,
      totalUnlocked: userAchievements.length
    })
  } catch (error) {
    console.error('Erro ao buscar achievements:', error)
    return NextResponse.json({ error: 'Erro ao buscar achievements' }, { status: 500 })
  }
}
