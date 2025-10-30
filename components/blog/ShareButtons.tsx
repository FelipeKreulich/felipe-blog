'use client'

import { Button } from '@/components/ui/button'
import {
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Link2,
  Check,
  Instagram,
  Mail,
  Send,
} from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const { language } = useLanguage()
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`,
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

  const handleInstagramStory = async () => {
    // Copy link to clipboard first
    try {
      await navigator.clipboard.writeText(url)
      // Show instructions
      alert(
        language === 'pt'
          ? 'Link copiado! Para compartilhar no Instagram Stories:\n\n1. Abra o Instagram\n2. Crie um novo Story\n3. Cole o link usando o sticker de Link'
          : 'Link copied! To share on Instagram Stories:\n\n1. Open Instagram\n2. Create a new Story\n3. Paste the link using the Link sticker'
      )
    } catch (err) {
      console.error('Failed to copy:', err)
    }
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

        {/* Telegram */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('telegram')}
          title="Share on Telegram"
          className="hover:bg-[#0088cc] hover:text-white transition-colors"
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Instagram Stories */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleInstagramStory}
          title="Share on Instagram Stories"
          className="hover:bg-gradient-to-r hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white transition-all"
        >
          <Instagram className="h-4 w-4" />
        </Button>

        {/* Reddit */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('reddit')}
          title="Share on Reddit"
          className="hover:bg-[#FF4500] hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
        </Button>

        {/* Email */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare('email')}
          title="Share via Email"
          className="hover:bg-gray-600 hover:text-white transition-colors"
        >
          <Mail className="h-4 w-4" />
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
