'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, TrendingUp, User as UserIcon, Hash, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const { language } = useLanguage()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimeout = useRef<NodeJS.Timeout>()

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions(null)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSuggestions(query)
      } else {
        setSuggestions(null)
        setShowSuggestions(false)
      }
    }, 300)

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [query, fetchSuggestions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setShowSuggestions(false)
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions(null)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const hasSuggestions = suggestions && (
    suggestions.posts?.length > 0 ||
    suggestions.authors?.length > 0 ||
    suggestions.tags?.length > 0
  )

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-xl", className)}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            if (query.trim().length >= 2 && suggestions) {
              setShowSuggestions(true)
            }
          }}
          placeholder={language === 'pt' ? 'Buscar...' : 'Search...'}
          className="pl-10 pr-20"
        />

        {/* Loading / Clear / Search Button */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

          {query && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button type="submit" size="sm" className="h-7">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Posts */}
          {suggestions.posts && suggestions.posts.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {language === 'pt' ? 'Posts' : 'Posts'}
              </div>
              {suggestions.posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  onClick={() => {
                    setShowSuggestions(false)
                    setQuery('')
                  }}
                  className="flex items-start gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt=""
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {post.author.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Authors */}
          {suggestions.authors && suggestions.authors.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <UserIcon className="h-3 w-3" />
                {language === 'pt' ? 'Autores' : 'Authors'}
              </div>
              {suggestions.authors.map((author: any) => (
                <Link
                  key={author.id}
                  href={`/profile/${author.username}`}
                  onClick={() => {
                    setShowSuggestions(false)
                    setQuery('')
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={author.avatar || undefined} />
                    <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{author.name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{author.username} • {author._count.posts} posts
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Tags */}
          {suggestions.tags && suggestions.tags.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <Hash className="h-3 w-3" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2 px-3 py-2">
                {suggestions.tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/search?tag=${tag.slug}`}
                    onClick={() => {
                      setShowSuggestions(false)
                      setQuery('')
                    }}
                  >
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      #{tag.name}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({tag._count.posts})
                      </span>
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* View All Results */}
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`)
                setShowSuggestions(false)
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              {language === 'pt' ? 'Ver todos os resultados' : 'View all results'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
