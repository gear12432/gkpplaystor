import React from 'react';
import type { Metadata } from 'next';
import { APK_ITEMS, getAppBySlug } from '@/lib/apk-data';
import { AppDetailsAndDownloadView } from '@/components/AppDetailsAndDownloadView';

export async function generateStaticParams() {
  return APK_ITEMS.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = getAppBySlug(slug);
  if (!app) {
    return {
      title: 'APK Details – APK Hub',
    };
  }
  return {
    title: `${app.name} APK v${app.version} (${app.size}) – APK Hub`,
    description: `${app.shortDescription} View screenshots, features, description, and download ${app.name} APK on APK Hub.`,
    openGraph: {
      title: `${app.name} APK v${app.version} – APK Hub`,
      description: app.shortDescription,
      type: 'website',
    },
  };
}

export default async function AppDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  return (
    <main className="flex-1">
      <AppDetailsAndDownloadView app={app} slug={slug} />
    </main>
  );
}
