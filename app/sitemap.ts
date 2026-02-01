import { MetadataRoute } from 'next'
import { getAllPublishedSlugs } from '@/lib/content'

const BASE_URL = 'https://nofone.us'

const TYPE_TO_PATH: Record<string, string> = {
  'blog-post': '/blog',
  'comparison': '/compare',
  'faq': '/faq',
  'landing-page': '/resources',
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/protocols`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sponsor`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  const publishedSlugs = getAllPublishedSlugs()
  const contentRoutes: MetadataRoute.Sitemap = publishedSlugs.map(({ type, slug }) => ({
    url: `${BASE_URL}${TYPE_TO_PATH[type] || '/blog'}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...contentRoutes]
}
