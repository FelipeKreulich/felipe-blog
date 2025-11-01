'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ReactionPicker, ReactionType, REACTIONS } from './ReactionPicker'
import { Smile, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ReactionData {
  type: ReactionType
  count: number
  users: Array<{
    id: string
    name: string
    username: string
    avatar: string | null
  }>
}

interface ReactionButtonProps {
  postId?: string
  commentId?: string
  className?: string
}

export function ReactionButton({ postId, commentId, className }: ReactionButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [reactions, setReactions] = useState<ReactionData[]>([])
  const [userReactions, setUserReactions] = useState<ReactionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReacting, setIsReacting] = useState(false)

  useEffect(() => {
    fetchReactions()
  }, [postId, commentId])

  const fetchReactions = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (postId) params.set('postId', postId)
      if (commentId) params.set('commentId', commentId)

      const response = await fetch(`/api/posts/react?${params}`)
      if (!response.ok) throw new Error('Erro ao buscar reações')

      const data = await response.json()
      setReactions(data.reactions || [])
      setUserReactions(data.userReactions || [])
    } catch (error) {
      console.error('Erro ao buscar reações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReaction = async (type: ReactionType) => {
    if (!session) {
      toast.error('Faça login para reagir')
      router.push('/signin')
      return
    }

    try {
      setIsReacting(true)

      const response = await fetch('/api/posts/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          postId,
          commentId,
        }),
      })

      if (!response.ok) throw new Error('Erro ao processar reação')

      const data = await response.json()

      // Atualizar reações localmente
      if (data.action === 'added') {
        setUserReactions([...userReactions, type])
        toast.success(`Reagiu com ${REACTIONS.find(r => r.type === type)?.emoji}`)
      } else {
        setUserReactions(userReactions.filter(r => r !== type))
        toast.success('Reação removida')
      }

      // Recarregar reações do servidor
      await fetchReactions()
    } catch (error) {
      console.error('Erro ao reagir:', error)
      toast.error('Erro ao processar reação')
    } finally {
      setIsReacting(false)
    }
  }

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0)

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Picker de reações */}
      <ReactionPicker
        onSelect={handleReaction}
        selectedReactions={userReactions}
        disabled={isReacting}
        trigger={
          <Button
            variant="outline"
            size="sm"
            disabled={isReacting}
            className="gap-2"
          >
            <Smile className="h-4 w-4" />
            <span className="hidden sm:inline">Reagir</span>
          </Button>
        }
      />

      {/* Exibir reações existentes */}
      {reactions.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {reactions.map((reaction) => {
            const reactionInfo = REACTIONS.find(r => r.type === reaction.type)
            const hasReacted = userReactions.includes(reaction.type)

            return (
              <TooltipProvider key={reaction.type}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleReaction(reaction.type)}
                      disabled={isReacting}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-sm',
                        'transition-all hover:scale-105',
                        'border border-border',
                        hasReacted
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-accent'
                      )}
                    >
                      <span className="text-base">{reactionInfo?.emoji}</span>
                      <span className="text-xs font-medium">{reaction.count}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-semibold mb-1">
                        {reactionInfo?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reaction.users.slice(0, 5).map((u, i) => (
                          <span key={u.id}>
                            {i > 0 && ', '}
                            {u.name}
                          </span>
                        ))}
                        {reaction.count > 5 && ` e mais ${reaction.count - 5}`}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}

          {/* Total de reações */}
          {totalReactions > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              {totalReactions} {totalReactions === 1 ? 'reação' : 'reações'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
