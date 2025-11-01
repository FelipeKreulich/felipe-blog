'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Lock, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { RARITY_COLORS, RARITY_TEXT_COLORS } from '@/lib/gamification/achievements'

interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  rarity: string
  criteria: any
  createdAt: Date
}

interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  unlockedAt: Date
}

export default function AchievementsPage() {
  const { data: session } = useSession()
  const { language } = useLanguage()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [session])

  const fetchAchievements = async () => {
    try {
      const url = session?.user?.id
        ? `/api/gamification/achievements?userId=${session.user.id}`
        : '/api/gamification/achievements'

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements)
        setUserAchievements(data.userAchievements || [])
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievementId === achievementId)
  }

  const getRarityColor = (rarity: string) => {
    return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || 'bg-gray-400'
  }

  const getRarityTextColor = (rarity: string) => {
    return RARITY_TEXT_COLORS[rarity as keyof typeof RARITY_TEXT_COLORS] || 'text-gray-600'
  }

  const groupedAchievements = achievements.reduce((acc, ach) => {
    if (!acc[ach.category]) acc[ach.category] = []
    acc[ach.category].push(ach)
    return acc
  }, {} as Record<string, Achievement[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold">
              {language === 'pt' ? 'Conquistas' : 'Achievements'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'pt' ? 'Desbloqueie badges e ganhe XP' : 'Unlock badges and earn XP'}
          </p>
          {session && (
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Progresso</span>
                <span className="text-sm">{userAchievements.length} / {achievements.length}</span>
              </div>
              <Progress value={(userAchievements.length / achievements.length) * 100} />
            </div>
          )}
        </div>

        {/* Achievements by Category */}
        {Object.entries(groupedAchievements).map(([category, achievs]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 capitalize">{category.toLowerCase()}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievs.map((achievement) => {
                const unlocked = isUnlocked(achievement.id)
                return (
                  <Card
                    key={achievement.id}
                    className={`transition-all ${unlocked ? 'border-2 border-yellow-500' : 'opacity-70'}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-4xl">{unlocked ? achievement.icon : '🔒'}</div>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-blue-600">+{achievement.points}</span>
                          <span className="text-xs text-muted-foreground">XP</span>
                        </div>
                        {unlocked && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ✓ Desbloqueada
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  )
}
