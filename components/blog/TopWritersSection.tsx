'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  FileText,
  Crown,
  Loader2,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

interface WriterStats {
  posts: number
  likes: number
  comments: number
  views: number
}

interface Writer {
  id: string
  name: string
  username: string
  avatar: string | null
  role: string
  isOnline: boolean
  stats: WriterStats
  score: number
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500',
  MODERATOR: 'bg-orange-500',
  EDITOR: 'bg-purple-500',
  WRITER: 'bg-blue-500',
}

const getRoleLabel = (role: string, language: string) => {
  const labels: Record<string, Record<string, string>> = {
    pt: {
      ADMIN: 'Admin',
      MODERATOR: 'Moderador',
      EDITOR: 'Editor',
      WRITER: 'Escritor',
    },
    en: {
      ADMIN: 'Admin',
      MODERATOR: 'Moderator',
      EDITOR: 'Editor',
      WRITER: 'Writer',
    },
  }
  return labels[language]?.[role] || role
}

export default function TopWritersSection() {
  const { t, language } = useLanguage()
  const [writers, setWriters] = useState<Writer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTopWriters()
  }, [])

  const fetchTopWriters = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/writers/top?limit=10')

      if (!response.ok) {
        throw new Error('Erro ao buscar escritores')
      }

      const data = await response.json()
      setWriters(data.writers)
    } catch (error) {
      console.error('Erro ao buscar escritores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return null
    }
  }

  const getMedalBg = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-400 to-yellow-600'
      case 2:
        return 'from-gray-300 to-gray-500'
      case 3:
        return 'from-amber-400 to-amber-600'
      default:
        return 'from-blue-400 to-blue-600'
    }
  }

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (writers.length === 0) {
    return null
  }

  const topThree = writers.slice(0, 3)
  const others = writers.slice(3)

  return (
    <motion.section
      className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-foreground">
              {t('blog.topWriters')}
            </h2>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('blog.topWritersDescription')}
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          variants={staggerContainer}
        >
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div
              className="md:order-1 md:mt-8"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <WriterCard writer={topThree[1]} position={2} language={language} t={t} />
            </motion.div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <motion.div className="md:order-2" variants={fadeInUp} whileHover={{ y: -10 }}>
              <WriterCard writer={topThree[0]} position={1} isWinner language={language} t={t} />
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div
              className="md:order-3 md:mt-8"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <WriterCard writer={topThree[2]} position={3} language={language} t={t} />
            </motion.div>
          )}
        </motion.div>

        {/* Others */}
        {others.length > 0 && (
          <motion.div variants={fadeInUp}>
            <h3 className="text-xl font-semibold mb-4 text-center">
              {t('blog.completeRanking')}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((writer, index) => (
                <motion.div
                  key={writer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <WriterCard writer={writer} position={index + 4} compact language={language} t={t} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}

function WriterCard({
  writer,
  position,
  isWinner = false,
  compact = false,
  language,
  t,
}: {
  writer: Writer
  position: number
  isWinner?: boolean
  compact?: boolean
  language: string
  t: (key: string) => string
}) {
  const getMedalBg = (pos: number) => {
    switch (pos) {
      case 1:
        return 'from-yellow-400 to-yellow-600'
      case 2:
        return 'from-gray-300 to-gray-500'
      case 3:
        return 'from-amber-400 to-amber-600'
      default:
        return 'from-blue-400 to-blue-600'
    }
  }

  const getMedalIcon = (pos: number) => {
    switch (pos) {
      case 1:
        return <Crown className="w-5 h-5 text-white" />
      case 2:
        return <Medal className="w-5 h-5 text-white" />
      case 3:
        return <Award className="w-5 h-5 text-white" />
      default:
        return null
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card
      className={`overflow-hidden relative group cursor-pointer ${
        isWinner ? 'border-2 border-yellow-500 shadow-xl' : ''
      }`}
    >
      {/* Position Badge */}
      <div
        className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br ${getMedalBg(
          position
        )} flex items-center justify-center z-10 shadow-lg`}
      >
        {position <= 3 ? (
          getMedalIcon(position)
        ) : (
          <span className="text-white font-bold">#{position}</span>
        )}
      </div>

      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <Link href={`/profile/${writer.username}`}>
          <div className="flex flex-col items-center text-center">
            {/* Avatar with Online Status */}
            <div className="relative mb-4">
              <Avatar className={compact ? 'w-16 h-16' : 'w-24 h-24'}>
                <AvatarImage src={writer.avatar || undefined} alt={writer.name} />
                <AvatarFallback>{getInitials(writer.name)}</AvatarFallback>
              </Avatar>
              {/* Online Indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 ${
                  writer.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
                title={writer.isOnline ? t('blog.online') : t('blog.offline')}
              />
            </div>

            {/* Name and Role */}
            <h3
              className={`font-bold text-foreground group-hover:text-blue-600 transition-colors ${
                compact ? 'text-base' : 'text-xl'
              }`}
            >
              {writer.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              @{writer.username}
            </p>

            <Badge
              className={`${roleColors[writer.role] || 'bg-blue-500'} text-white mb-3`}
            >
              {getRoleLabel(writer.role, language)}
            </Badge>

            {/* Stats */}
            {!compact && (
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <FileText className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold">{writer.stats.posts}</p>
                  <p className="text-xs text-muted-foreground">{t('blog.posts')}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Heart className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold">{writer.stats.likes}</p>
                  <p className="text-xs text-muted-foreground">{t('blog.likes')}</p>
                </div>
              </div>
            )}

            {compact && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{writer.stats.posts}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{writer.stats.likes}</span>
                </div>
              </div>
            )}

            {/* Score */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-green-600 dark:text-green-400">
                {writer.score.toLocaleString()} {t('blog.points')}
              </span>
            </div>
          </div>
        </Link>
      </CardContent>

      {/* Winner Glow Effect */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent pointer-events-none" />
      )}
    </Card>
  )
}
