/**
 * Firestore Security Rules — Dirty Dozen Payload Verification Suite
 * Verifies that all 12 adversarial payloads defined in security_spec.md
 * are rejected with PERMISSION_DENIED by our validation invariants.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: {
    uid: string | null;
    email?: string;
    email_verified?: boolean;
    isAdminRecordPresent?: boolean;
  };
  docId: string;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_PAYLOADS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Admin Write on /apps',
    collection: 'apps',
    operation: 'create',
    auth: { uid: null },
    docId: 'telegram',
    payload: { id: 'telegram', name: 'Telegram' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Spoof Attack on /apps',
    collection: 'apps',
    operation: 'create',
    auth: {
      uid: 'spoof-uid',
      email: 'skjiyaul842@gmail.com',
      email_verified: false,
    },
    docId: 'telegram',
    payload: { id: 'telegram', name: 'Telegram' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Privilege Escalation Self-Promotion on /admins',
    collection: 'admins',
    operation: 'create',
    auth: {
      uid: 'attacker-1',
      email: 'attacker@example.com',
      email_verified: true,
      isAdminRecordPresent: false,
    },
    docId: 'attacker-1',
    payload: {
      uid: 'attacker-1',
      email: 'attacker@example.com',
      role: 'super_admin',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'PII Blanket Read on /adminProfiles by Non-Owner',
    collection: 'adminProfiles',
    operation: 'get',
    auth: {
      uid: 'regular-user',
      email: 'user@example.com',
      email_verified: true,
    },
    docId: 'admin-owner-uid',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow Field Injection on /apps',
    collection: 'apps',
    operation: 'create',
    auth: {
      uid: 'admin-1',
      email: 'skjiyaul842@gmail.com',
      email_verified: true,
    },
    docId: 'whatsapp',
    payload: {
      id: 'whatsapp',
      name: 'WhatsApp',
      ghostField: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Value Poisoning on /apps (Oversized Name String)',
    collection: 'apps',
    operation: 'update',
    auth: {
      uid: 'admin-1',
      email: 'skjiyaul842@gmail.com',
      email_verified: true,
    },
    docId: 'whatsapp',
    payload: {
      name: 'A'.repeat(500),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Timestamp Forgery on /apps Create',
    collection: 'apps',
    operation: 'create',
    auth: {
      uid: 'admin-1',
      email: 'skjiyaul842@gmail.com',
      email_verified: true,
    },
    docId: 'signal',
    payload: {
      id: 'signal',
      createdAt: '1999-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immutable Field Mutation (createdBy changed on /apps update)',
    collection: 'apps',
    operation: 'update',
    auth: {
      uid: 'admin-1',
      email: 'skjiyaul842@gmail.com',
      email_verified: true,
    },
    docId: 'signal',
    payload: {
      createdBy: 'different-uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbounded Array Attack on /apps screenshotUrls (> 6 items)',
    collection: 'apps',
    operation: 'create',
    auth: {
      uid: 'admin-1',
      email: 'skjiyaul842@gmail.com',
      email_verified: true,
    },
    docId: 'vlc',
    payload: {
      screenshotUrls: ['1', '2', '3', '4', '5', '6', '7'],
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'ID Poisoning Attack on /categories with invalid characters',
    collection: 'categories',
    operation: 'create',
    auth: {
      uid: 'admin-1',
      email: 'skjiyaul842@gmail.com',
      email_verified: true,
    },
    docId: 'invalid/id$$$',
    payload: {
      id: 'invalid/id$$$',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Invalid Status Enum on /banners',
    collection: 'banners',
    operation: 'create',
    auth: {
      uid: 'admin-1',
      email: 'skjiyaul842@gmail.com',
      email_verified: true,
    },
    docId: 'hero-1',
    payload: {
      id: 'hero-1',
      status: 'published_invalid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthorized Website Settings Tampering by Non-Admin',
    collection: 'websiteSettings',
    operation: 'update',
    auth: {
      uid: 'user-99',
      email: 'random@example.com',
      email_verified: true,
      isAdminRecordPresent: false,
    },
    docId: 'global',
    payload: {
      websiteName: 'Pwned APK Hub',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
