'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'

interface FollowButtonProps {
  userId: string
  initialIsFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  variant = 'default',
  size = 'default',
  showIcon = true,
}: FollowButtonProps) {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Verificar status de follow ao montar
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!session?.user || userId === session.user.id) {
        setChecking(false)
        return
      }

      try {
        const res = await fetch(`/api/follow/check?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setIsFollowing(data.isFollowing)
        }
      } catch (error) {
        console.error('Erro ao verificar follow:', error)
      } finally {
        setChecking(false)
      }
    }

    checkFollowStatus()
  }, [userId, session])

  const handleToggleFollow = async () => {
    if (!session?.user) {
      toast.error('Você precisa estar logado para seguir usuários')
      return
    }

    setLoading(true)

    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch('/api/follow', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (res.ok) {
        const newFollowingState = !isFollowing
        setIsFollowing(newFollowingState)
        onFollowChange?.(newFollowingState)

        toast.success(
          newFollowingState
            ? data.message || 'Você está seguindo este usuário'
            : 'Você deixou de seguir este usuário'
        )
      } else {
        toast.error(data.error || 'Erro ao atualizar follow')
      }
    } catch (error) {
      console.error('Erro ao toggle follow:', error)
      toast.error('Erro ao atualizar follow')
    } finally {
      setLoading(false)
    }
  }

  // Não mostrar botão se for o próprio usuário
  if (!session?.user || userId === session.user.id) {
    return null
  }

  if (checking) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={loading}
      className={isFollowing ? 'border-muted-foreground' : ''}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon && (
            <>
              {isFollowing ? (
                <UserMinus className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
            </>
          )}
          {isFollowing ? t('follow.following') : t('follow.follow')}
        </>
      )}
    </Button>
  )
}
