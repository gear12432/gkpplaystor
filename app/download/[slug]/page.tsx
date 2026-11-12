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
      title: 'Download APK – APK Hub',
    };
  }
  return {
    title: `Download ${app.name} APK v${app.version} (${app.size}) – APK Hub`,
    description: `Download ${app.name} (${app.packageName}) version ${app.version} (${app.size}) for ${app.minAndroid} with screenshots and full description on APK Hub.`,
  };
}

export default async function ApkDownloadPage({
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
