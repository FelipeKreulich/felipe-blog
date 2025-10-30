'use client'

import { useEffect, useState } from 'react'
import { Role } from '@/types/permissions'
import { CanAccess } from '@/components/auth/CanAccess'
import { MessageSquare, Flag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ModeratorDashboard() {
  const [pendingComments, setPendingComments] = useState([])
  const [pendingReports, setPendingReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [commentsRes, reportsRes] = await Promise.all([
        fetch('/api/moderator/comments?approved=false&limit=10'),
        fetch('/api/reports?status=PENDING&limit=10'),
      ])

      if (commentsRes.ok) {
        const data = await commentsRes.json()
        setPendingComments(data.comments)
      }

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setPendingReports(data.reports)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CanAccess
      role={[Role.MODERATOR, Role.ADMIN]}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p>Apenas moderadores e administradores podem acessar este dashboard.</p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard do Moderador</h1>

        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Comments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold">Comentários Pendentes</h2>
                <span className="ml-auto bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  {pendingComments.length}
                </span>
              </div>

              {pendingComments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum comentário pendente</p>
              ) : (
                <div className="space-y-3">
                  {pendingComments.slice(0, 5).map((comment: any) => (
                    <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Por {comment.author.name} em {comment.post.title}
                      </div>
                      <div className="text-sm line-clamp-2">{comment.content}</div>
                    </div>
                  ))}
                </div>
              )}

              <button className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Ver Todos
              </button>
            </div>

            {/* Pending Reports */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flag className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold">Reports Pendentes</h2>
                <span className="ml-auto bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  {pendingReports.length}
                </span>
              </div>

              {pendingReports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum report pendente</p>
              ) : (
                <div className="space-y-3">
                  {pendingReports.slice(0, 5).map((report: any) => (
                    <div key={report.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="font-medium text-red-600 dark:text-red-400 mb-1">
                        {report.reason}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Reportado por {report.reporter.name}
                      </div>
                      {report.post && (
                        <div className="text-sm mt-1">Post: {report.post.title}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Ver Todos
              </button>
            </div>
          </div>
        )}
      </div>
    </CanAccess>
  )
}
