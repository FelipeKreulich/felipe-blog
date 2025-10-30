'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Flag } from 'lucide-react'

interface ReportButtonProps {
  postId?: string
  commentId?: string
  className?: string
}

export function ReportButton({ postId, commentId, className = '' }: ReportButtonProps) {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!reason.trim()) {
      alert('Por favor, selecione um motivo')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          commentId,
          reason,
          details: details.trim() || null,
        }),
      })

      if (res.ok) {
        alert('Report enviado com sucesso! Nossa equipe irá analisar.')
        setShowModal(false)
        setReason('')
        setDetails('')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao enviar report')
      }
    } catch (error) {
      console.error('Erro ao enviar report:', error)
      alert('Erro ao enviar report')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors ${className}`}
      >
        <Flag className="w-4 h-4" />
        <span className="text-sm">Reportar</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reportar Conteúdo</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Motivo *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">Selecione um motivo</option>
                  <option value="Spam">Spam</option>
                  <option value="Conteúdo ofensivo">Conteúdo ofensivo</option>
                  <option value="Assédio">Assédio</option>
                  <option value="Desinformação">Desinformação</option>
                  <option value="Conteúdo inadequado">Conteúdo inadequado</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Detalhes (opcional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Forneça mais informações sobre o problema..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
