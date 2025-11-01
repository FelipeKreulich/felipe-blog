'use client'

import { useEffect, useRef } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface SafeHtmlProps {
  html: string
  className?: string
  as?: keyof JSX.IntrinsicElements
}

/**
 * Componente seguro para renderizar HTML sanitizado
 * Usa DOMPurify no cliente para prevenir XSS
 */
export function SafeHtml({ html, className = '', as: Component = 'div' }: SafeHtmlProps) {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!elementRef.current || !html) return

    // Configuração de sanitização (mesma do servidor)
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'hr',
        'a', 'img', 'iframe',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'class', 'style',
        'src', 'alt', 'width', 'height',
        'data-youtube-video', 'data-twitter-embed', 'data-image-gallery',
        'allowfullscreen', 'frameborder', 'allow',
        'colspan', 'rowspan',
      ],
      ALLOW_DATA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      FORBID_TAGS: ['style', 'script', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    })

    // Validação adicional de iframes
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = cleanHtml

    const iframes = tempDiv.querySelectorAll('iframe')
    iframes.forEach((iframe) => {
      const src = iframe.getAttribute('src')
      if (src) {
        try {
          const url = new URL(src)
          const allowedDomains = ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'vimeo.com']
          const isAllowed = allowedDomains.some(
            (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
          )

          if (!isAllowed) {
            iframe.remove()
          }
        } catch {
          iframe.remove()
        }
      }
    })

    elementRef.current.innerHTML = tempDiv.innerHTML

    // Carregar script do Twitter se houver embeds
    if (cleanHtml.includes('data-twitter-embed')) {
      if (!(window as any).twttr) {
        const script = document.createElement('script')
        script.src = 'https://platform.twitter.com/widgets.js'
        script.async = true
        document.body.appendChild(script)
      } else if ((window as any).twttr?.widgets) {
        ;(window as any).twttr.widgets.load()
      }
    }
  }, [html])

  return <Component ref={elementRef as any} className={className} />
}
