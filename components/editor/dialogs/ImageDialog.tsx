'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string) => void
  onGallerySubmit?: (urls: string[]) => void
}

export function ImageDialog({
  open,
  onOpenChange,
  onSubmit,
  onGallerySubmit,
}: ImageDialogProps) {
  const [url, setUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState('')

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      onSubmit(url)
      onOpenChange(false)
      setUrl('')
    }
  }

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (galleryUrls && onGallerySubmit) {
      const urls = galleryUrls
        .split('\n')
        .map((u) => u.trim())
        .filter((u) => u)
      if (urls.length > 0) {
        onGallerySubmit(urls)
        onOpenChange(false)
        setGalleryUrls('')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Imagem</DialogTitle>
          <DialogDescription>
            Adicione uma imagem ou galeria de imagens
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Imagem única</TabsTrigger>
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <form onSubmit={handleSingleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="image-url">URL da Imagem</Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Inserir</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="gallery">
            <form onSubmit={handleGallerySubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="gallery-urls">URLs das Imagens</Label>
                  <textarea
                    id="gallery-urls"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Cole uma URL por linha&#10;https://exemplo.com/img1.jpg&#10;https://exemplo.com/img2.jpg&#10;https://exemplo.com/img3.jpg"
                    value={galleryUrls}
                    onChange={(e) => setGalleryUrls(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole uma URL por linha (máximo recomendado: 6 imagens)
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={!onGallerySubmit}>
                  Criar Galeria
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
