'use client'

import { useEffect, useState } from 'react'
import { Role } from '@prisma/client'
import { CanAccess } from '@/components/auth/CanAccess'
import { FileText, Clock } from 'lucide-react'

export default function EditorDashboard() {
  const [pendingPosts, setPendingPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingPosts()
  }, [])

  async function fetchPendingPosts() {
    try {
      const res = await fetch('/api/editor/posts/pending')
      if (res.ok) {
        const data = await res.json()
        setPendingPosts(data.posts)
      }
    } catch (error) {
      console.error('Erro ao carregar posts pendentes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(postId: string) {
    if (!confirm('Deseja aprovar e publicar este post?')) return

    try {
      const res = await fetch(`/api/editor/posts/${postId}/approve`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('Post aprovado e publicado!')
        fetchPendingPosts()
      } else {
        alert('Erro ao aprovar post')
      }
    } catch (error) {
      console.error('Erro ao aprovar post:', error)
      alert('Erro ao aprovar post')
    }
  }

  async function handleReject(postId: string) {
    if (!confirm('Deseja rejeitar este post? Ele voltará para rascunho.')) return

    try {
      const res = await fetch(`/api/editor/posts/${postId}/reject`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('Post rejeitado')
        fetchPendingPosts()
      } else {
        alert('Erro ao rejeitar post')
      }
    } catch (error) {
      console.error('Erro ao rejeitar post:', error)
      alert('Erro ao rejeitar post')
    }
  }

  return (
    <CanAccess
      role={[Role.EDITOR, Role.MODERATOR, Role.ADMIN]}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p>Apenas editores, moderadores e administradores podem acessar este dashboard.</p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard do Editor</h1>

        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-semibold">Posts Aguardando Revisão</h2>
              <span className="ml-auto bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                {pendingPosts.length}
              </span>
            </div>

            {pendingPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Nenhum post aguardando revisão</p>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post: any) => (
                  <div key={post.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Por {post.author.name} (@{post.author.username})
                        </div>
                        {post.excerpt && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      <FileText className="w-6 h-6 text-gray-400 ml-4" />
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Aprovar e Publicar
                      </button>
                      <button
                        onClick={() => handleReject(post.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => window.open(`/posts/${post.slug}`, '_blank')}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Visualizar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CanAccess>
  )
}
