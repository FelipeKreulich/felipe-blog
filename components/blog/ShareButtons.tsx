'use client'

import { Button } from '@/components/ui/button'
import {
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Link2,
  Check,
} from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const { language } = useLanguage()
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || '')

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted-foreground">
        {language === 'pt' ? 'Compartilhar' : 'Share'}
      </p>
      <div className="flex flex-wrap gap-2">
        {/* Twitter/X */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('twitter')}
          title="Share on Twitter/X"
          className="hover:bg-black hover:text-white transition-colors"
        >
          <Twitter className="h-4 w-4" />
        </Button>

        {/* LinkedIn */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('linkedin')}
          title="Share on LinkedIn"
          className="hover:bg-[#0A66C2] hover:text-white transition-colors"
        >
          <Linkedin className="h-4 w-4" />
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('facebook')}
          title="Share on Facebook"
          className="hover:bg-[#1877F2] hover:text-white transition-colors"
        >
          <Facebook className="h-4 w-4" />
        </Button>

        {/* WhatsApp */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('whatsapp')}
          title="Share on WhatsApp"
          className="hover:bg-[#25D366] hover:text-white transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>

        {/* Copy Link */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          title={language === 'pt' ? 'Copiar link' : 'Copy link'}
          className={copied ? 'bg-green-500 text-white' : ''}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
