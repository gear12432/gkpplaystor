import type { MetadataRoute } from 'next';
import { APK_ITEMS } from '@/lib/apk-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL || 'https://apkhub.example.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/apps',
    '/games',
    '/categories',
    '/top-charts',
    '/about',
    '/contact',
    '/legal',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const appRoutes: MetadataRoute.Sitemap = APK_ITEMS.flatMap((app) => [
    {
      url: `${baseUrl}/app/${app.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/download/${app.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]);

  return [...staticRoutes, ...appRoutes];
}
