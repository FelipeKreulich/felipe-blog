'use client'

import { useEffect, useState } from 'react'
import { Role } from '@prisma/client'
import { CanAccess } from '@/components/auth/CanAccess'
import { Users, FileText, MessageSquare, Flag, UserX } from 'lucide-react'

interface Stats {
  overview: {
    totalUsers: number
    totalPosts: number
    totalComments: number
    totalReports: number
    pendingReports: number
    bannedUsers: number
    recentUsers: number
    recentPosts: number
  }
  usersByRole: Record<string, number>
  topAuthors: Array<{
    id: string
    name: string
    username: string
    avatar: string | null
    _count: { posts: number }
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/dashboard-stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CanAccess
      role={Role.ADMIN}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p>Apenas administradores podem acessar este dashboard.</p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard do Administrador</h1>

        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : stats ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Users className="w-6 h-6" />}
                title="Total de Usuários"
                value={stats.overview.totalUsers}
                subtitle={`+${stats.overview.recentUsers} nos últimos 7 dias`}
              />
              <StatCard
                icon={<FileText className="w-6 h-6" />}
                title="Total de Posts"
                value={stats.overview.totalPosts}
                subtitle={`+${stats.overview.recentPosts} nos últimos 7 dias`}
              />
              <StatCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="Comentários"
                value={stats.overview.totalComments}
              />
              <StatCard
                icon={<Flag className="w-6 h-6" />}
                title="Reports Pendentes"
                value={stats.overview.pendingReports}
                subtitle={`${stats.overview.totalReports} total`}
                alert={stats.overview.pendingReports > 0}
              />
            </div>

            {/* Users by Role */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Usuários por Role</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Authors */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Top Autores</h2>
              <div className="space-y-3">
                {stats.topAuthors.map((author, index) => (
                  <div key={author.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                    <div className="flex-1">
                      <div className="font-medium">{author.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">@{author.username}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{author._count.posts}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">posts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banned Users Alert */}
            {stats.overview.bannedUsers > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-8">
                <div className="flex items-center gap-3">
                  <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <div>
                    <div className="font-semibold text-red-900 dark:text-red-200">
                      {stats.overview.bannedUsers} usuário(s) banido(s)
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      Verifique a lista de usuários para mais detalhes
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">Erro ao carregar dados</div>
        )}
      </div>
    </CanAccess>
  )
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  alert = false,
}: {
  icon: React.ReactNode
  title: string
  value: number
  subtitle?: string
  alert?: boolean
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${alert ? 'border-2 border-red-500' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={alert ? 'text-red-500' : 'text-blue-500'}>{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}
