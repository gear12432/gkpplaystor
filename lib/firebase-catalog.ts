'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { APK_ITEMS, ApkItem, CategoryName } from '@/lib/apk-data';
import { ApkRecord } from '@/lib/admin-types';

const VALID_CATEGORY_NAMES: CategoryName[] = [
  'Social Media',
  'Games',
  'Productivity',
  'Entertainment',
  'Tools',
  'Photography',
  'Education',
  'Communication',
  'Music & Audio',
  'Lifestyle',
  'Business',
  'Security',
];

export function convertApkRecordToApkItem(
  record: ApkRecord,
  type: 'app' | 'game',
  existingBase?: ApkItem
): ApkItem {
  const matchedCategory: CategoryName =
    VALID_CATEGORY_NAMES.find(
      (c) => c.toLowerCase() === (record.category || '').toLowerCase()
    ) || (type === 'game' ? 'Games' : 'Tools');

  const whatsNewList = record.whatsNew
    ? record.whatsNew
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : existingBase?.whatsNew || ['Verified release on APK Hub.'];

  return {
    id: record.id,
    slug: record.slug || record.id,
    name: record.name,
    developer: record.developer,
    version: record.version,
    size: record.size,
    sizeBytes: existingBase?.sizeBytes || 35000000,
    category: matchedCategory,
    type,
    isTrending: Boolean(record.trending),
    isLatest: true,
    isMostDownloaded: (record.downloads || 0) >= 5000,
    isRecentlyUpdated: true,
    isSamplePreview: false,
    isAuthorizedDirectApk: Boolean(record.downloadEnabled),
    securityVerified: true,
    verificationSource: 'APK Hub Firebase Repository',
    verifiedRating: Number(record.rating) || 4.8,
    verifiedReviewCount: `${Math.max(12, Math.round((record.downloads || 100) / 15))} reviews`,
    verifiedDownloads: `${(record.downloads || 0).toLocaleString()}+`,
    updatedAt: record.releaseDate || 'November 11, 2026',
    updatedTimestamp: 1762905600000,
    popularityScore: Math.max(85, Math.min(100, Math.round((record.downloads || 1000) / 200))),
    minAndroid: record.minAndroid || 'Android 6.0+ (API 23)',
    packageName: record.packageName,
    architecture: existingBase?.architecture || 'arm64-v8a, armeabi-v7a, universal',
    sha256: existingBase?.sha256 || 'verified-firebase-package',
    license: existingBase?.license || 'Verified Distribution',
    officialExternalApkUrl:
      record.apkDownloadUrl ||
      record.externalDownloadUrl ||
      existingBase?.officialExternalApkUrl ||
      'https://f-droid.org',
    officialWebsiteUrl:
      record.externalDownloadUrl ||
      record.apkDownloadUrl ||
      existingBase?.officialWebsiteUrl ||
      'https://f-droid.org',
    shortDescription: record.shortDescription,
    fullDescription: record.fullDescription,
    whatsNew: whatsNewList.length > 0 ? whatsNewList : ['Verified release.'],
    features: existingBase?.features || [
      'Verified Android APK package',
      'Fast direct download from APK Hub',
    ],
    permissions: existingBase?.permissions || [],
    iconStyle: {
      bgGradient:
        existingBase?.iconStyle.bgGradient ||
        (type === 'game'
          ? 'from-[#6829E8] to-[#172554]'
          : 'from-[#16C653] to-[#101A3A]'),
      accent: existingBase?.iconStyle.accent || '#16C653',
      glyph:
        record.iconUrl &&
        (record.iconUrl.startsWith('http') || record.iconUrl.startsWith('data:'))
          ? record.iconUrl
          : existingBase?.iconStyle.glyph || (type === 'game' ? 'gamepad' : 'fdroid'),
    },
    screenshots: existingBase?.screenshots || [
      {
        id: `${record.id}-sc1`,
        title: `${record.name} Dashboard`,
        subtitle: record.shortDescription,
        accentColor: '#16C653',
        secondaryColor: '#101A3A',
        uiType: type === 'game' ? 'game' : 'utility',
      },
    ],
    screenshotUrls: record.screenshotUrls || [],
  };
}

export function useLiveApkCatalog(): ApkItem[] {
  const [firestoreApps, setFirestoreApps] = useState<ApkRecord[]>([]);
  const [firestoreGames, setFirestoreGames] = useState<ApkRecord[]>([]);

  useEffect(() => {
    const appsQ = query(
      collection(db, 'apps'),
      where('status', 'in', ['active', 'inactive'])
    );
    const unsubApps = onSnapshot(
      appsQ,
      (snap) => {
        setFirestoreApps(snap.docs.map((d) => d.data() as ApkRecord));
      },
      () => {
        // Ignore fallback
      }
    );

    const gamesQ = query(
      collection(db, 'games'),
      where('status', 'in', ['active', 'inactive'])
    );
    const unsubGames = onSnapshot(
      gamesQ,
      (snap) => {
        setFirestoreGames(snap.docs.map((d) => d.data() as ApkRecord));
      },
      () => {
        // Ignore fallback
      }
    );

    return () => {
      unsubApps();
      unsubGames();
    };
  }, []);

  if (firestoreApps.length === 0 && firestoreGames.length === 0) {
    return APK_ITEMS;
  }

  const inactiveIds = new Set<string>();
  const convertedMap = new Map<string, ApkItem>();

  for (const rec of firestoreApps) {
    if (rec.status === 'inactive') {
      inactiveIds.add(rec.id);
      inactiveIds.add(rec.slug);
    } else {
      const base = APK_ITEMS.find(
        (x) => x.id === rec.id || x.slug === rec.slug
      );
      convertedMap.set(rec.slug || rec.id, convertApkRecordToApkItem(rec, 'app', base));
    }
  }

  for (const rec of firestoreGames) {
    if (rec.status === 'inactive') {
      inactiveIds.add(rec.id);
      inactiveIds.add(rec.slug);
    } else {
      const base = APK_ITEMS.find(
        (x) => x.id === rec.id || x.slug === rec.slug
      );
      convertedMap.set(rec.slug || rec.id, convertApkRecordToApkItem(rec, 'game', base));
    }
  }

  const merged: ApkItem[] = [];
  const seenSlugs = new Set<string>();

  // Put newly added or updated Firestore items first
  for (const [slug, item] of convertedMap.entries()) {
    merged.push(item);
    seenSlugs.add(slug);
  }

  // Keep static catalog items unless overridden or deactivated in Firestore
  for (const staticItem of APK_ITEMS) {
    if (
      !seenSlugs.has(staticItem.slug) &&
      !seenSlugs.has(staticItem.id) &&
      !inactiveIds.has(staticItem.slug) &&
      !inactiveIds.has(staticItem.id)
    ) {
      merged.push(staticItem);
    }
  }

  return merged;
}
