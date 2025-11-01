'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ReactionType = 'LIKE' | 'FIRE' | 'CLAP' | 'THINKING' | 'CELEBRATE' | 'INSIGHTFUL'

export interface ReactionOption {
  type: ReactionType
  emoji: string
  label: string
}

export const REACTIONS: ReactionOption[] = [
  { type: 'LIKE', emoji: '❤️', label: 'Gostei' },
  { type: 'FIRE', emoji: '🔥', label: 'Incrível' },
  { type: 'CLAP', emoji: '👏', label: 'Parabéns' },
  { type: 'THINKING', emoji: '🤔', label: 'Interessante' },
  { type: 'CELEBRATE', emoji: '🎉', label: 'Celebrar' },
  { type: 'INSIGHTFUL', emoji: '💡', label: 'Perspicaz' },
]

interface ReactionPickerProps {
  onSelect: (type: ReactionType) => void
  selectedReactions?: ReactionType[]
  trigger?: React.ReactNode
  disabled?: boolean
}

export function ReactionPicker({
  onSelect,
  selectedReactions = [],
  trigger,
  disabled = false,
}: ReactionPickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (type: ReactionType) => {
    onSelect(type)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-2"
          >
            <span>😊</span>
            <span>Reagir</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-3 gap-1">
          {REACTIONS.map((reaction) => {
            const isSelected = selectedReactions.includes(reaction.type)
            return (
              <button
                key={reaction.type}
                onClick={() => handleSelect(reaction.type)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg transition-all hover:bg-accent',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected && 'bg-primary/10 ring-2 ring-primary'
                )}
                title={reaction.label}
              >
                <span className="text-2xl">{reaction.emoji}</span>
                <span className="text-xs font-medium">{reaction.label}</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
