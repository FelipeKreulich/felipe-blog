'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLanguage } from '@/contexts/LanguageContext'
import { Bell, MessageCircle, Heart, Trophy, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    actionUrl?: string | null
    createdAt: Date | string
    actor?: {
      id: string
      name: string
      username: string
      avatar?: string | null
    } | null
  }
  onMarkAsRead?: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { language } = useLanguage()
  const router = useRouter()

  const locale = language === 'pt' ? ptBR : enUS
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale,
  })

  const getIcon = () => {
    switch (notification.type) {
      case 'COMMENT':
      case 'REPLY':
        return <MessageCircle className="h-4 w-4 text-blue-600" />
      case 'LIKE_POST':
      case 'LIKE_COMMENT':
        return <Heart className="h-4 w-4 text-red-600" />
      case 'ACHIEVEMENT':
        return <Trophy className="h-4 w-4 text-yellow-600" />
      case 'POST_APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'POST_REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
        notification.read
          ? 'bg-transparent hover:bg-muted/50'
          : 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30'
      }`}
      onClick={handleClick}
    >
      {notification.actor ? (
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={notification.actor.avatar || undefined} alt={notification.actor.name} />
          <AvatarFallback>{notification.actor.name[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
          {!notification.read && (
            <span className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>
    </div>
  )
}
