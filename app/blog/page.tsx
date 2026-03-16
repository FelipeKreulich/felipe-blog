import { Metadata } from 'next'
import { generateBlogStructuredData } from '@/lib/seo/metadata'
import BlogPageClient from './BlogPageClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Blog | Kreulich Blog',
  description: 'Artigos sobre tecnologia, programação, desenvolvimento web e mais.',
  alternates: {
    canonical: `${APP_URL}/blog`,
  },
  openGraph: {
    title: 'Blog | Kreulich Blog',
    description: 'Artigos sobre tecnologia, programação, desenvolvimento web e mais.',
    url: `${APP_URL}/blog`,
    type: 'website',
  },
}

export default function BlogPage() {
  const jsonLd = generateBlogStructuredData()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPageClient />
    </>
  )
}
