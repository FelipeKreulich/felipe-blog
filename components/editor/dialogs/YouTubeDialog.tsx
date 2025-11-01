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

interface YouTubeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string, width?: number, height?: number) => void
}

export function YouTubeDialog({
  open,
  onOpenChange,
  onSubmit,
}: YouTubeDialogProps) {
  const [url, setUrl] = useState('')
  const [width, setWidth] = useState(640)
  const [height, setHeight] = useState(480)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      onSubmit(url, width, height)
      onOpenChange(false)
      setUrl('')
      setWidth(640)
      setHeight(480)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Inserir Vídeo do YouTube</DialogTitle>
            <DialogDescription>
              Cole o link do vídeo do YouTube
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">URL do YouTube</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: youtube.com/watch?v=ID ou youtu.be/ID
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Largura</Label>
                <Input
                  id="width"
                  type="number"
                  min="320"
                  max="1920"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura</Label>
                <Input
                  id="height"
                  type="number"
                  min="180"
                  max="1080"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>
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
      </DialogContent>
    </Dialog>
  )
}
