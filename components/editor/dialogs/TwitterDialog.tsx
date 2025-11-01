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

interface TwitterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string) => void
}

export function TwitterDialog({
  open,
  onOpenChange,
  onSubmit,
}: TwitterDialogProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      onSubmit(url)
      onOpenChange(false)
      setUrl('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Inserir Tweet</DialogTitle>
            <DialogDescription>
              Cole o link do tweet que deseja incorporar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="twitter-url">URL do Tweet</Label>
              <Input
                id="twitter-url"
                type="url"
                placeholder="https://twitter.com/user/status/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: https://twitter.com/username/status/1234567890
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
            <Button type="submit">Inserir</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
