'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CanAccess } from '@/components/auth/CanAccess'
import { Permission } from '@/types/permissions'
import { TipTapEditor } from '@/components/editor/TipTapEditor'

export default function CreatePostPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    submitForReview: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Post criado com sucesso!')
        router.push(`/blog/${data.post.slug}`)
      } else {
        alert(data.error || 'Erro ao criar post')
      }
    } catch (error) {
      console.error('Erro ao criar post:', error)
      alert('Erro ao criar post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CanAccess
      permission={Permission.CREATE_POST}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p>Você não tem permissão para criar posts.</p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Criar Novo Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Conteúdo *
            </label>
            <TipTapEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Digite o conteúdo do post..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Resumo (opcional)
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Breve descrição do post..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Imagem de Capa (URL)
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="submitForReview"
              checked={formData.submitForReview}
              onChange={(e) => setFormData({ ...formData, submitForReview: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="submitForReview" className="text-sm">
              Enviar para revisão após criar
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Post'}
            </button>
          </div>
        </form>
      </div>
    </CanAccess>
  )
}
