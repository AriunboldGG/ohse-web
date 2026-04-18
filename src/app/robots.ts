import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bayan-undur.mn'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/cart', '/order'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
