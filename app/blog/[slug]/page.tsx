import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata, generateArticleStructuredData } from '@/lib/seo/metadata'
import PostPageClient from './PostPageClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      updatedAt: true,
      author: {
        select: { name: true },
      },
      tags: {
        select: { tag: { select: { name: true } } },
      },
    },
  })

  if (!post) {
    return {
      title: 'Post não encontrado',
    }
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt || `${post.title} - Kreulich Blog`,
    image: post.coverImage || undefined,
    url: `${APP_URL}/blog/${slug}`,
    type: 'article',
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    author: post.author.name || undefined,
    tags: post.tags.map((t) => t.tag.name),
  })
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params

  // Fetch minimal post data for JSON-LD (structured data)
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      updatedAt: true,
      author: {
        select: { name: true, username: true },
      },
      tags: {
        select: { tag: { select: { name: true } } },
      },
    },
  })

  const jsonLd = post
    ? generateArticleStructuredData({
        title: post.title,
        description: post.excerpt || '',
        image: post.coverImage || `${APP_URL}/og-default.png`,
        url: `${APP_URL}/blog/${slug}`,
        publishedTime: post.publishedAt?.toISOString() || new Date().toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        author: {
          name: post.author.name || 'Autor',
          url: post.author.username ? `${APP_URL}/profile/${post.author.username}` : undefined,
        },
        tags: post.tags.map((t) => t.tag.name),
      })
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostPageClient />
    </>
  )
}
