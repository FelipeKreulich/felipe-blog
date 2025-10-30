'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  postId?: string
  commentId?: string
  initialLikes?: number
  className?: string
}

export function LikeButton({ postId, commentId, initialLikes = 0, className = '' }: LikeButtonProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      checkIfLiked()
    }
  }, [session, postId, commentId])

  async function checkIfLiked() {
    try {
      const params = new URLSearchParams()
      if (postId) params.append('postId', postId)
      if (commentId) params.append('commentId', commentId)

      const res = await fetch(`/api/likes?${params.toString()}`)
      const data = await res.json()
      setLiked(data.liked)
    } catch (error) {
      console.error('Erro ao verificar curtida:', error)
    }
  }

  async function handleLike() {
    if (!session) {
      alert('Você precisa estar logado para curtir')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, commentId }),
      })

      const data = await res.json()

      if (res.ok) {
        setLiked(data.liked)
        setLikes(prev => data.liked ? prev + 1 : prev - 1)
      }
    } catch (error) {
      console.error('Erro ao processar curtida:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading || !session}
      className={`flex items-center gap-2 transition-colors ${
        liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
      } ${!session ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <Heart
        className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
      />
      <span className="text-sm">{likes}</span>
    </button>
  )
}
