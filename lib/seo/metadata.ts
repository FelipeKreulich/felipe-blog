import { Metadata } from 'next'

export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
}

const APP_NAME = 'Kreulich Blog'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const DEFAULT_IMAGE = `${APP_URL}/og-default.png`

export function generateMetadata(data: SEOData): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = DEFAULT_IMAGE,
    url = APP_URL,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    tags = [],
  } = data

  const fullTitle = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, ...tags].join(', '),

    authors: author ? [{ name: author }] : undefined,

    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'pt_BR',
      alternateLocale: 'en_US',
      type,
      publishedTime,
      modifiedTime,
      tags,
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@kreulich', // Substitua pelo seu Twitter
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: url,
    },
  }
}

/**
 * Gera structured data (JSON-LD) para artigos
 */
export function generateArticleStructuredData(data: {
  title: string
  description: string
  image: string
  url: string
  publishedTime: string
  modifiedTime?: string
  author: {
    name: string
    url?: string
  }
  tags?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.publishedTime,
    dateModified: data.modifiedTime || data.publishedTime,
    author: {
      '@type': 'Person',
      name: data.author.name,
      url: data.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: APP_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
    keywords: data.tags?.join(', '),
  }
}

/**
 * Gera structured data (JSON-LD) para blog
 */
export function generateBlogStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: APP_NAME,
    description: 'Blog sobre tecnologia, programação e desenvolvimento web',
    url: APP_URL,
    publisher: {
      '@type': 'Organization',
      name: APP_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/logo.png`,
      },
    },
  }
}

/**
 * Gera structured data (JSON-LD) para pessoa/autor
 */
export function generatePersonStructuredData(data: {
  name: string
  bio?: string
  image?: string
  url?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    description: data.bio,
    image: data.image,
    url: data.url,
    sameAs: Object.values(data.socialLinks || {}).filter(Boolean),
  }
}
