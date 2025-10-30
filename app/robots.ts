import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/my-posts/',
          '/posts/create/',
          '/posts/edit/',
          '/*.json$',
          '/auth/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/settings/', '/my-posts/', '/auth/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
