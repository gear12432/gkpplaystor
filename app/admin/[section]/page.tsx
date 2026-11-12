import React from 'react';
import { AdminPanelApp } from '@/components/AdminPanelApp';
import { AdminSection } from '@/lib/admin-types';

const VALID_SECTIONS: AdminSection[] = [
  'dashboard',
  'apps',
  'add-app',
  'edit-app',
  'games',
  'categories',
  'banners',
  'downloads',
  'analytics',
  'settings',
  'profile',
];

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const clean = section.replace(/\.html$/i, '') as AdminSection;
  const resolved: AdminSection = VALID_SECTIONS.includes(clean)
    ? clean
    : 'dashboard';

  return <AdminPanelApp initialSection={resolved} />;
}
