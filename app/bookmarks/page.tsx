'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bookmark, Loader2, Trash2, Edit, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'

export default function BookmarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()

  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<any>(null)
  const [editingBookmark, setEditingBookmark] = useState<any>(null)
  const [editNote, setEditNote] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/signin')
      return
    }

    fetchBookmarks()
  }, [session, status])

  const fetchBookmarks = async (page = 1) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/bookmarks?page=${page}&limit=12`)
      if (res.ok) {
        const data = await res.json()
        setBookmarks(data.bookmarks)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar bookmarks:', error)
      toast.error(language === 'pt' ? 'Erro ao carregar bookmarks' : 'Error loading bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    if (!confirm(language === 'pt' ? 'Remover este bookmark?' : 'Remove this bookmark?')) return

    try {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success(language === 'pt' ? 'Bookmark removido' : 'Bookmark removed')
        fetchBookmarks(pagination?.page || 1)
      } else {
        const data = await res.json()
        toast.error(data.error || (language === 'pt' ? 'Erro ao remover' : 'Error removing'))
      }
    } catch (error) {
      console.error('Erro ao deletar bookmark:', error)
      toast.error(language === 'pt' ? 'Erro ao remover bookmark' : 'Error removing bookmark')
    }
  }

  const handleEditNote = async () => {
    if (!editingBookmark) return

    try {
      const res = await fetch(`/api/bookmarks/${editingBookmark.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: editNote.trim() || null })
      })

      if (res.ok) {
        toast.success(language === 'pt' ? 'Nota atualizada' : 'Note updated')
        setEditingBookmark(null)
        setEditNote('')
        fetchBookmarks(pagination?.page || 1)
      } else {
        const data = await res.json()
        toast.error(data.error || (language === 'pt' ? 'Erro ao atualizar' : 'Error updating'))
      }
    } catch (error) {
      console.error('Erro ao atualizar nota:', error)
      toast.error(language === 'pt' ? 'Erro ao atualizar nota' : 'Error updating note')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (status === 'loading' || (loading && bookmarks.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            <Bookmark className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">
              {language === 'pt' ? 'Meus Bookmarks' : 'My Bookmarks'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'pt'
              ? 'Posts que você salvou para ler depois'
              : 'Posts you saved to read later'}
          </p>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                {language === 'pt' ? 'Nenhum bookmark ainda' : 'No bookmarks yet'}
              </h2>
              <p className="text-muted-foreground text-center mb-4">
                {language === 'pt'
                  ? 'Salve posts interessantes para ler mais tarde'
                  : 'Save interesting posts to read later'}
              </p>
              <Button onClick={() => router.push('/blog')}>
                {language === 'pt' ? 'Explorar Posts' : 'Explore Posts'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {bookmarks.map(({ id, note, createdAt, post }) => (
                <Card key={id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/blog/${post.slug}`}>
                    {/* Cover Image */}
                    {post.coverImage && (
                      <div className="relative w-full h-48">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </Link>

                  <CardContent className="pt-4">
                    <Link href={`/blog/${post.slug}`}>
                      {/* Categories */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.categories.slice(0, 2).map(({ category }: any) => (
                            <Badge
                              key={category.id}
                              style={{ backgroundColor: category.color || '#6b7280' }}
                              className="text-xs"
                            >
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>

                      {/* Author */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author.avatar || undefined} />
                          <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">{post.author.name}</span>
                      </div>
                    </Link>

                    {/* Personal Note */}
                    {note && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 mb-3">
                        <p className="text-sm italic line-clamp-2">"{note}"</p>
                      </div>
                    )}

                    {/* Saved Date */}
                    <p className="text-xs text-muted-foreground mb-3">
                      {language === 'pt' ? 'Salvo em' : 'Saved on'}{' '}
                      {format(new Date(createdAt), 'dd MMM yyyy', {
                        locale: language === 'pt' ? ptBR : undefined
                      })}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBookmark({ id, note })
                          setEditNote(note || '')
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {language === 'pt' ? 'Nota' : 'Note'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBookmark(id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => fetchBookmarks(pagination.page - 1)}
                >
                  {language === 'pt' ? 'Anterior' : 'Previous'}
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {language === 'pt' ? 'Página' : 'Page'} {pagination.page}{' '}
                    {language === 'pt' ? 'de' : 'of'} {pagination.totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchBookmarks(pagination.page + 1)}
                >
                  {language === 'pt' ? 'Próxima' : 'Next'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Edit Note Dialog */}
      <Dialog
        open={!!editingBookmark}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBookmark(null)
            setEditNote('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'pt' ? 'Editar Nota' : 'Edit Note'}
            </DialogTitle>
            <DialogDescription>
              {language === 'pt'
                ? 'Atualize sua nota pessoal sobre este post'
                : 'Update your personal note about this post'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder={
                language === 'pt'
                  ? 'Adicione uma nota...'
                  : 'Add a note...'
              }
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingBookmark(null)
                setEditNote('')
              }}
            >
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button onClick={handleEditNote}>
              {language === 'pt' ? 'Salvar' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
