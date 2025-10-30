'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion } from 'framer-motion'
import { calculateReadingTime } from '@/lib/utils/readingTime'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  coverImage?: string | null
  publishedAt: Date | null
  categories: Array<{
    category: {
      id: string
      name: string
      slug: string
      color?: string | null
    }
  }>
  _count?: {
    likes: number
    comments: number
  }
}

interface RelatedPostsProps {
  posts: RelatedPost[]
  title?: string
}

export function RelatedPosts({ posts, title }: RelatedPostsProps) {
  const { language } = useLanguage()

  if (posts.length === 0) return null

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-6">
        {title || (language === 'pt' ? 'Posts Relacionados' : 'Related Posts')}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => {
          const firstCategory = post.categories[0]?.category
          const categoryColor = firstCategory?.color || '#3b82f6'
          const readingTime = calculateReadingTime(post.content)

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-all cursor-pointer group">
                  {/* Cover Image ou Gradient */}
                  <div
                    className="relative h-40"
                    style={{
                      background: post.coverImage
                        ? `url(${post.coverImage}) center/cover`
                        : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {firstCategory && (
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-gray-900"
                        >
                          {firstCategory.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>{readingTime.text}</span>
                        {post._count && (
                          <>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post._count.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post._count.comments}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
