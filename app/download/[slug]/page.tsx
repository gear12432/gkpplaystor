import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAppBySlug } from '@/lib/apk-data';
import { ApkDownloaderClient } from '@/components/ApkDownloaderClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = getAppBySlug(slug);
  if (!app) {
    return {
      title: 'Download Not Found – APK Hub',
    };
  }
  return {
    title: `Download ${app.name} APK v${app.version} (${app.size}) – APK Hub`,
    description: `Download ${app.name} (${app.packageName}) version ${app.version} (${app.size}) for ${app.minAndroid}. Check SHA-256 file integrity and package specifications on APK Hub.`,
  };
}

export default async function ApkDownloadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ApkDownloaderClient app={app} />
    </main>
  );
}
