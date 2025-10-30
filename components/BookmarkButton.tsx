'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'

interface BookmarkButtonProps {
  postId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  className?: string
}

export function BookmarkButton({
  postId,
  variant = 'outline',
  size = 'default',
  showText = true,
  className = ''
}: BookmarkButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { language } = useLanguage()

  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showNoteDialog, setShowNoteDialog] = useState(false)

  // Check if post is bookmarked
  useEffect(() => {
    if (session) {
      checkBookmark()
    } else {
      setChecking(false)
    }
  }, [session, postId])

  const checkBookmark = async () => {
    try {
      setChecking(true)
      const res = await fetch(`/api/bookmarks/check?postId=${postId}`)
      if (res.ok) {
        const data = await res.json()
        setBookmarked(data.bookmarked)
        if (data.bookmark) {
          setBookmarkId(data.bookmark.id)
          setNote(data.bookmark.note || '')
        }
      }
    } catch (error) {
      console.error('Erro ao verificar bookmark:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleToggleBookmark = async () => {
    if (!session) {
      toast.error(language === 'pt' ? 'Faça login para salvar posts' : 'Login to save posts')
      router.push('/signin')
      return
    }

    if (bookmarked) {
      // Remove bookmark
      await handleRemoveBookmark()
    } else {
      // Show dialog to add note (optional)
      setShowNoteDialog(true)
    }
  }

  const handleAddBookmark = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          note: note.trim() || null,
        })
      })

      if (res.ok) {
        const data = await res.json()
        setBookmarked(true)
        setBookmarkId(data.bookmark.id)
        toast.success(language === 'pt' ? 'Post salvo!' : 'Post saved!')
        setShowNoteDialog(false)
        setNote('')
      } else {
        const data = await res.json()
        toast.error(data.error || (language === 'pt' ? 'Erro ao salvar' : 'Error saving'))
      }
    } catch (error) {
      console.error('Erro ao adicionar bookmark:', error)
      toast.error(language === 'pt' ? 'Erro ao salvar post' : 'Error saving post')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async () => {
    if (!bookmarkId) return

    try {
      setLoading(true)
      const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setBookmarked(false)
        setBookmarkId(null)
        setNote('')
        toast.success(language === 'pt' ? 'Bookmark removido' : 'Bookmark removed')
      } else {
        const data = await res.json()
        toast.error(data.error || (language === 'pt' ? 'Erro ao remover' : 'Error removing'))
      }
    } catch (error) {
      console.error('Erro ao remover bookmark:', error)
      toast.error(language === 'pt' ? 'Erro ao remover bookmark' : 'Error removing bookmark')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={className}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <>
      <Button
        variant={bookmarked ? 'default' : variant}
        size={size}
        onClick={handleToggleBookmark}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : bookmarked ? (
          <>
            <BookmarkCheck className="h-4 w-4" />
            {showText && size !== 'icon' && (
              <span className="ml-2">
                {language === 'pt' ? 'Salvo' : 'Saved'}
              </span>
            )}
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" />
            {showText && size !== 'icon' && (
              <span className="ml-2">
                {language === 'pt' ? 'Salvar' : 'Save'}
              </span>
            )}
          </>
        )}
      </Button>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'pt' ? 'Salvar Post' : 'Save Post'}
            </DialogTitle>
            <DialogDescription>
              {language === 'pt'
                ? 'Adicione uma nota pessoal sobre este post (opcional)'
                : 'Add a personal note about this post (optional)'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                language === 'pt'
                  ? 'Por exemplo: "Ler depois", "Para o projeto X", etc.'
                  : 'For example: "Read later", "For project X", etc.'
              }
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNoteDialog(false)
                setNote('')
              }}
              disabled={loading}
            >
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button onClick={handleAddBookmark} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'pt' ? 'Salvando...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  {language === 'pt' ? 'Salvar' : 'Save'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
