import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/sponsor/studies',
          '/sponsor/create',
          '/study/*/join/',
          '/study/*/assessment/',
          '/study/*/dashboard',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://nofone.us/sitemap.xml',
  }
}
