'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Send, Loader2, CheckCircle2, AlertCircle, Mail, Users } from 'lucide-react'

interface Post {
  id: string
  title: string
  excerpt: string | null
  published: boolean
  publishedAt: Date | null
}

interface NewsletterTabProps {
  adminHash: string
}

export function NewsletterTab({ adminHash }: NewsletterTabProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [stats, setStats] = useState<{ total: number } | null>(null)

  useEffect(() => {
    fetchRecentPosts()
    fetchSubscriberStats()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchRecentPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/posts?hash=${adminHash}&pageSize=20`)
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubscriberStats = async () => {
    try {
      const response = await fetch(`/api/admin/newsletter/stats?hash=${adminHash}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const handleTogglePost = (postId: string) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    )
  }

  const handleSendNewsletter = async () => {
    if (selectedPosts.length === 0) {
      alert('Selecione pelo menos um post')
      return
    }

    if (!confirm(`Enviar newsletter para ${stats?.total || 0} inscritos?`)) {
      return
    }

    try {
      setIsSending(true)
      const response = await fetch(`/api/admin/newsletter/send?hash=${adminHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postIds: selectedPosts,
          customMessage: customMessage.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar newsletter')
      }

      alert(`Newsletter enviada! ${data.stats.successCount} emails enviados.`)
      setSelectedPosts([])
      setCustomMessage('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar newsletter'
      alert(message)
    } finally {
      setIsSending(false)
    }
  }

  const publishedPosts = posts.filter((p) => p.published)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Inscritos</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Posts Selecionados</p>
                <p className="text-2xl font-bold">{selectedPosts.length}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Posts Disponíveis</p>
                <p className="text-2xl font-bold">{publishedPosts.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagem Personalizada</CardTitle>
          <CardDescription>
            Adicione uma mensagem introdutória (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Olá! Confira os melhores posts desta semana..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Post Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Posts</CardTitle>
          <CardDescription>
            Escolha até 10 posts para incluir na newsletter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : publishedPosts.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum post publicado encontrado
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {publishedPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedPosts.includes(post.id)}
                    onCheckedChange={() => handleTogglePost(post.id)}
                    disabled={
                      selectedPosts.length >= 10 && !selectedPosts.includes(post.id)
                    }
                  />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-tight">{post.title}</p>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSendNewsletter}
          disabled={selectedPosts.length === 0 || isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Enviar Newsletter ({stats?.total || 0} inscritos)
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
