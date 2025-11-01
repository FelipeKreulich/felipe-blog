import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Componente React para renderizar galeria de imagens
const ImageGalleryComponent = ({ node, deleteNode }: any) => {
  const images = node.attrs.images || []
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images.length) {
    return null
  }

  return (
    <NodeViewWrapper className="image-gallery-wrapper my-6">
      <div className="relative">
        {/* Grid de imagens */}
        <div className={`grid gap-2 ${
          images.length === 1 ? 'grid-cols-1' :
          images.length === 2 ? 'grid-cols-2' :
          images.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 md:grid-cols-3'
        }`}>
          {images.map((src: string, index: number) => (
            <div
              key={index}
              className="relative aspect-video cursor-pointer overflow-hidden rounded-lg border hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(src)}
            >
              <img
                src={src}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Botão de deletar galeria */}
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2"
          onClick={deleteNode}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Modal de visualização */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Imagem ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}

// Extensão do Tiptap para galeria de imagens
export const ImageGallery = Node.create({
  name: 'imageGallery',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      images: {
        default: [],
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-image-gallery]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const images = HTMLAttributes.images || []
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-image-gallery': '', class: 'image-gallery my-6' }),
      [
        'div',
        { class: `grid gap-2 ${
          images.length === 1 ? 'grid-cols-1' :
          images.length === 2 ? 'grid-cols-2' :
          images.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 md:grid-cols-3'
        }` },
        ...images.map((src: string) => [
          'img',
          {
            src,
            class: 'w-full h-auto rounded-lg border',
            alt: 'Gallery image',
          },
        ]),
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGalleryComponent)
  },

  addCommands() {
    return {
      setImageGallery:
        (options: { images: string[] }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
