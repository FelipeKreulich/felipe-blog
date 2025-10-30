import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${APP_URL}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Posts publicados
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
  })

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${APP_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Categorias
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${APP_URL}/blog?category=${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Perfis de autores
  const authors = await prisma.user.findMany({
    where: {
      role: {
        in: ['WRITER', 'EDITOR', 'MODERATOR', 'ADMIN'],
      },
    },
    select: {
      username: true,
      updatedAt: true,
    },
  })

  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${APP_URL}/profile/${author.username}`,
    lastModified: author.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...postPages, ...categoryPages, ...authorPages]
}
