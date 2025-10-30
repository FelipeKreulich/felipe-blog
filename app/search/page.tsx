'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Loader2, Calendar, User, Tag, Filter, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language } = useLanguage()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<any>(null)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    author: searchParams.get('author') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  const currentPage = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query, currentPage)
    }
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags)
      }
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
    }
  }

  const performSearch = async (query: string, page = 1) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '12',
      })

      if (filters.category) params.append('category', filters.category)
      if (filters.tag) params.append('tag', filters.tag)
      if (filters.author) params.append('author', filters.author)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const res = await fetch(`/api/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.posts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const params = new URLSearchParams({ q: searchQuery })
    if (filters.category) params.append('category', filters.category)
    if (filters.tag) params.append('tag', filters.tag)
    if (filters.author) params.append('author', filters.author)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)

    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      tag: '',
      author: '',
      dateFrom: '',
      dateTo: '',
    })
    router.push(`/search?q=${searchQuery}`)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {language === 'pt' ? 'Buscar' : 'Search'}
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'pt' ? 'Buscar posts, autores, tags...' : 'Search posts, authors, tags...'}
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" size="lg">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5 mr-2" />
              {language === 'pt' ? 'Filtros' : 'Filters'}
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-2">
                  {Object.values(filters).filter(v => v !== '').length}
                </Badge>
              )}
            </Button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as categorias</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tag Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tag</label>
                    <Select
                      value={filters.tag}
                      onValueChange={(value) => setFilters({ ...filters, tag: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as tags</SelectItem>
                        {tags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.slug}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data inicial</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data final</label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSearch}>
                    Aplicar Filtros
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Info */}
          {pagination && (
            <div className="text-sm text-muted-foreground">
              {pagination.total} {pagination.total === 1 ? 'resultado' : 'resultados'} encontrados
              {searchQuery && ` para "${searchQuery}"`}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {results.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/blog/${post.slug}`}>
                    {/* Cover Image */}
                    {post.coverImage && (
                      <div className="relative w-full h-48">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <CardContent className="pt-4">
                      {/* Categories */}
                      {post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.categories.slice(0, 2).map(({ category }: any) => (
                            <Badge
                              key={category.id}
                              style={{ backgroundColor: category.color || '#6b7280' }}
                              className="text-xs"
                            >
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Title with highlights */}
                      <h3
                        className="font-semibold text-lg mb-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.titleHighlight }}
                      />

                      {/* Excerpt with highlights */}
                      {post.excerptHighlight && (
                        <p
                          className="text-sm text-muted-foreground line-clamp-2 mb-3"
                          dangerouslySetInnerHTML={{ __html: post.excerptHighlight }}
                        />
                      )}

                      {/* Author */}
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author.avatar || undefined} />
                          <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">{post.author.name}</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('page', (pagination.page - 1).toString())
                    router.push(`/search?${params.toString()}`)
                  }}
                >
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('page', (pagination.page + 1).toString())
                    router.push(`/search?${params.toString()}`)
                  }}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {language === 'pt' ? 'Nenhum resultado encontrado' : 'No results found'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'pt'
                ? 'Tente usar palavras-chave diferentes ou remover os filtros'
                : 'Try using different keywords or remove filters'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !searchQuery && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {language === 'pt' ? 'Buscar no blog' : 'Search the blog'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'pt'
                ? 'Digite algo na barra de busca acima para começar'
                : 'Type something in the search bar above to get started'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
