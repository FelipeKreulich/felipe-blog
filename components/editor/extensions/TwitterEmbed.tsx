import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useEffect, useRef } from 'react'

// Componente React para renderizar o embed do Twitter
const TwitterEmbedComponent = ({ node }: any) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tweetUrl = node.attrs.url

  useEffect(() => {
    // Carregar script do Twitter se não estiver carregado
    if (!(window as any).twttr) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      document.body.appendChild(script)
    }

    // Renderizar tweet quando o script estiver carregado
    const renderTweet = () => {
      if ((window as any).twttr && containerRef.current) {
        containerRef.current.innerHTML = ''
        ;(window as any).twttr.widgets.createTweet(
          getTweetId(tweetUrl),
          containerRef.current,
          {
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            align: 'center',
          }
        )
      }
    }

    if ((window as any).twttr) {
      renderTweet()
    } else {
      window.addEventListener('load', renderTweet)
      return () => window.removeEventListener('load', renderTweet)
    }
  }, [tweetUrl])

  const getTweetId = (url: string): string => {
    const match = url.match(/status\/(\d+)/)
    return match ? match[1] : ''
  }

  return (
    <NodeViewWrapper className="twitter-embed-wrapper my-4">
      <div ref={containerRef} className="flex justify-center" />
    </NodeViewWrapper>
  )
}

// Extensão do Tiptap para Twitter
export const TwitterEmbed = Node.create({
  name: 'twitterEmbed',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-twitter-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-twitter-embed': '' }),
      ['a', { href: HTMLAttributes.url, target: '_blank' }, HTMLAttributes.url],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TwitterEmbedComponent)
  },

  addCommands() {
    return {
      setTwitterEmbed:
        (options: { url: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
