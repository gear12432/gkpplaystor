export type AdminSection =
  | 'dashboard'
  | 'apps'
  | 'add-app'
  | 'edit-app'
  | 'games'
  | 'categories'
  | 'banners'
  | 'downloads'
  | 'analytics'
  | 'settings'
  | 'profile';

export interface AdminProfileDoc {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string;
  accountStatus: 'active' | 'suspended';
  role: 'super_admin' | 'admin';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ApkRecord {
  id: string;
  slug: string;
  name: string;
  developer: string;
  packageName: string;
  category: string;
  version: string;
  size: string;
  minAndroid: string;
  releaseDate: string;
  shortDescription: string;
  fullDescription: string;
  whatsNew: string;
  iconUrl: string;
  screenshotUrls: string[];
  apkFileName: string;
  apkDownloadUrl: string;
  externalDownloadUrl: string;
  status: 'active' | 'inactive';
  downloadEnabled: boolean;
  featured: boolean;
  trending: boolean;
  downloads: number;
  rating: number;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  totalApps: number;
  status: 'active' | 'inactive';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BannerRecord {
  id: string;
  title: string;
  subtitle: string;
  desktopBannerUrl: string;
  mobileBannerUrl: string;
  buttonText: string;
  destinationUrl: string;
  position: 'hero' | 'mid_promo' | 'footer_promo' | 'category_top';
  status: 'active' | 'inactive';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DownloadEventRecord {
  id: string;
  targetId: string;
  targetType: 'app' | 'game';
  appName: string;
  packageName: string;
  version: string;
  dateKey: string;
  monthKey: string;
  createdAt?: unknown;
}

export interface AnalyticsSummaryRecord {
  id: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  label: string;
  downloads: number;
  updatedAt?: unknown;
}

export interface WebsiteSettingsRecord {
  id: string;
  websiteName: string;
  websiteLogoUrl: string;
  websiteFaviconUrl: string;
  websiteDescription: string;
  contactEmail: string;
  footerText: string;
  privacyPolicy: string;
  termsConditions: string;
  disclaimer: string;
  facebookUrl: string;
  twitterUrl: string;
  telegramUrl: string;
  youtubeUrl: string;
  maintenanceMode: boolean;
  directDownloadsEnabled: boolean;
  requireChecksumVerification: boolean;
  maxDownloadSpeedLabel: string;
  updatedAt?: unknown;
}

export function sanitizeDocId(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return cleaned || `item-${Date.now()}`;
}

export const DEFAULT_CATEGORIES_SEED: Omit<
  CategoryRecord,
  'createdAt' | 'updatedAt'
>[] = [
  {
    id: 'social-media',
    name: 'Social Media',
    slug: 'social-media',
    description: 'Connect, share stories, and message friends globally.',
    iconUrl: '💬',
    totalApps: 2,
    status: 'active',
  },
  {
    id: 'games',
    name: 'Games',
    slug: 'games',
    description: 'Action, battle royale, sandbox, and arcade Android games.',
    iconUrl: '🎮',
    totalApps: 4,
    status: 'active',
  },
  {
    id: 'productivity',
    name: 'Productivity',
    slug: 'productivity',
    description: 'Note taking, document editing, and workflow automation.',
    iconUrl: '⚡',
    totalApps: 1,
    status: 'active',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Video streaming, media players, and creator platforms.',
    iconUrl: '🎬',
    totalApps: 2,
    status: 'active',
  },
  {
    id: 'tools',
    name: 'Tools',
    slug: 'tools',
    description: 'System utilities, file managers, and open-source clients.',
    iconUrl: '🛠️',
    totalApps: 2,
    status: 'active',
  },
  {
    id: 'photography',
    name: 'Photography',
    slug: 'photography',
    description: 'RAW camera controls, photo editors, and filters.',
    iconUrl: '📷',
    totalApps: 1,
    status: 'active',
  },
  {
    id: 'education',
    name: 'Education',
    slug: 'education',
    description: 'Language learning, coding, and reference dictionaries.',
    iconUrl: '📚',
    totalApps: 1,
    status: 'active',
  },
  {
    id: 'communication',
    name: 'Communication',
    slug: 'communication',
    description: 'Encrypted messengers, browsers, and VoIP calling apps.',
    iconUrl: '📡',
    totalApps: 3,
    status: 'active',
  },
  {
    id: 'music-audio',
    name: 'Music & Audio',
    slug: 'music-audio',
    description: 'Lossless audio players, podcasts, and music streaming.',
    iconUrl: '🎵',
    totalApps: 1,
    status: 'active',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Daily habits, weather, fitness, and smart home control.',
    iconUrl: '🌟',
    totalApps: 1,
    status: 'active',
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'business',
    description: 'Remote desktop, enterprise team chat, and invoicing.',
    iconUrl: '💼',
    totalApps: 1,
    status: 'active',
  },
  {
    id: 'security',
    name: 'Security',
    slug: 'security',
    description: '2FA authenticators, password managers, and VPN tools.',
    iconUrl: '🛡️',
    totalApps: 2,
    status: 'active',
  },
];

export const DEFAULT_APPS_SEED: Omit<
  ApkRecord,
  'createdBy' | 'createdAt' | 'updatedAt'
>[] = [
  {
    id: 'telegram',
    slug: 'telegram',
    name: 'Telegram',
    developer: 'Telegram FZ-LLC',
    packageName: 'org.telegram.messenger.web',
    category: 'Communication',
    version: '11.4.2',
    size: '71.2 MB',
    minAndroid: 'Android 6.0+ (API 23)',
    releaseDate: '2026-11-10',
    shortDescription:
      'Fast, cloud-synced messenger with reproducible open-source Android APK builds.',
    fullDescription:
      'Telegram for Android is an officially distributed, reproducible open-source messaging application supporting 2 GB file transfers, channels, and cloud storage.',
    whatsNew:
      'Direct independent auto-updater for standalone APK installations and hardware-accelerated AV1 video playback.',
    iconUrl: '',
    screenshotUrls: [],
    apkFileName: 'org.telegram.messenger.web-v11.4.2.apk',
    apkDownloadUrl: 'https://telegram.org/dl/android/apk',
    externalDownloadUrl: 'https://telegram.org/android',
    status: 'active',
    downloadEnabled: true,
    featured: true,
    trending: true,
    downloads: 18420,
    rating: 4.8,
  },
  {
    id: 'vlc-android',
    slug: 'vlc-android',
    name: 'VLC for Android',
    developer: 'VideoLabs',
    packageName: 'org.videolan.vlc',
    category: 'Entertainment',
    version: '3.6.3',
    size: '42.8 MB',
    minAndroid: 'Android 5.0+ (API 21)',
    releaseDate: '2026-11-08',
    shortDescription:
      'Free and open-source cross-platform multimedia player for all video and audio codecs.',
    fullDescription:
      'VLC for Android plays most local video and audio files, as well as network streams, DVD ISOs, MKV, MP4, FLAC, and multi-track audio.',
    whatsNew:
      'Improved hardware decoding on Android 15 devices and Picture-in-Picture subtitle rendering.',
    iconUrl: '',
    screenshotUrls: [],
    apkFileName: 'org.videolan.vlc-v3.6.3.apk',
    apkDownloadUrl:
      'https://get.videolan.org/vlc-android/3.6.3/VLC-Android-3.6.3-arm64-v8a.apk',
    externalDownloadUrl: 'https://www.videolan.org/vlc/download-android.html',
    status: 'active',
    downloadEnabled: true,
    featured: true,
    trending: true,
    downloads: 14350,
    rating: 4.7,
  },
  {
    id: 'signal-messenger',
    slug: 'signal-messenger',
    name: 'Signal Private Messenger',
    developer: 'Signal Foundation',
    packageName: 'org.thoughtcrime.securesms',
    category: 'Security',
    version: '7.24.2',
    size: '68.5 MB',
    minAndroid: 'Android 6.0+ (API 23)',
    releaseDate: '2026-11-09',
    shortDescription:
      'State-of-the-art end-to-end encrypted messaging and voice/video calls.',
    fullDescription:
      'Signal uses an advanced open-source end-to-end encryption protocol to keep your conversations private every single time.',
    whatsNew:
      'Post-quantum PQXDH key agreement protocol and username privacy controls.',
    iconUrl: '',
    screenshotUrls: [],
    apkFileName: 'org.thoughtcrime.securesms-v7.24.2.apk',
    apkDownloadUrl: 'https://signal.org/android/apk/',
    externalDownloadUrl: 'https://signal.org/android/apk/',
    status: 'active',
    downloadEnabled: true,
    featured: true,
    trending: true,
    downloads: 11290,
    rating: 4.9,
  },
  {
    id: 'firefox-android',
    slug: 'firefox-android',
    name: 'Mozilla Firefox Browser',
    developer: 'Mozilla',
    packageName: 'org.mozilla.firefox',
    category: 'Communication',
    version: '132.0.1',
    size: '89.4 MB',
    minAndroid: 'Android 8.0+ (API 26)',
    releaseDate: '2026-11-07',
    shortDescription:
      'Fast, private mobile browser backed by non-profit Mozilla with full add-on support.',
    fullDescription:
      'Firefox for Android features Enhanced Tracking Protection by default and hundreds of desktop-grade browser extensions.',
    whatsNew:
      'Expanded mobile extension ecosystem and faster GeckoView page rendering.',
    iconUrl: '',
    screenshotUrls: [],
    apkFileName: 'org.mozilla.firefox-v132.0.1.apk',
    apkDownloadUrl: 'https://www.mozilla.org/en-US/firefox/android/all/',
    externalDownloadUrl: 'https://www.mozilla.org/en-US/firefox/new/',
    status: 'active',
    downloadEnabled: true,
    featured: false,
    trending: true,
    downloads: 9640,
    rating: 4.6,
  },
  {
    id: 'k9-mail',
    slug: 'k9-mail',
    name: 'Thunderbird / K-9 Mail',
    developer: 'MZLA Technologies',
    packageName: 'com.fsck.k9',
    category: 'Productivity',
    version: '8.0',
    size: '19.4 MB',
    minAndroid: 'Android 6.0+ (API 23)',
    releaseDate: '2026-11-05',
    shortDescription:
      'Open-source multi-account email client supporting IMAP, POP3, and OpenPGP.',
    fullDescription:
      'K-9 Mail (now Thunderbird for Android) is an independent open-source email application focused on managing multiple accounts and OpenPGP encryption.',
    whatsNew: 'Unified inbox filters and Material You dynamic color palettes.',
    iconUrl: '',
    screenshotUrls: [],
    apkFileName: 'com.fsck.k9-v8.0.apk',
    apkDownloadUrl: 'https://f-droid.org/repo/com.fsck.k9_39000.apk',
    externalDownloadUrl: 'https://k9mail.app',
    status: 'inactive',
    downloadEnabled: false,
    featured: false,
    trending: false,
    downloads: 4210,
    rating: 4.5,
  },
];

export const DEFAULT_GAMES_SEED: Omit<
  ApkRecord,
  'createdBy' | 'createdAt' | 'updatedAt'
>[] = [
  {
    id: 'minetest-luanti',
    slug: 'minetest-luanti',
    name: 'Luanti (Minetest Sandbox)',
    developer: 'Luanti Open Source Community',
    packageName: 'net.minetest.minetest',
    category: 'Games',
    version: '5.10.0',
    size: '28.6 MB',
    minAndroid: 'Android 6.0+ (API 23)',
    releaseDate: '2026-11-06',
    shortDescription:
      'Infinite-world open-source voxel sandbox game engine with multiplayer servers.',
    fullDescription:
      'Luanti (formerly Minetest) is a near-infinite-world block sandbox game and game engine supporting custom Lua mods and 60fps mobile touch controls.',
    whatsNew:
      'Dynamic shadows on OpenGL ES 3.2 and revamped Android touch joystick.',
    iconUrl: '',
    screenshotUrls: [],
    apkFileName: 'net.minetest.minetest-v5.10.0.apk',
    apkDownloadUrl: 'https://www.luanti.org/downloads/',
    externalDownloadUrl: 'https://www.luanti.org',
    status: 'active',
    downloadEnabled: true,
    featured: true,
    trending: true,
    downloads: 16200,
    rating: 4.7,
  },
  {
    id: 'supertuxkart-mobile',
    slug: 'supertuxkart-mobile',
    name: 'SuperTuxKart 3D Racing',
    developer: 'SuperTuxKart Team',
    packageName: 'org.supertuxkart.stk',
    category: 'Games',
    version: '1.4',
    size: '148.0 MB',
    minAndroid: 'Android 7.0+ (API 24)',
    releaseDate: '2026-11-04',
    shortDescription:
      '3D open-source arcade kart racer with online multiplayer and story mode.',
    fullDescription:
      'SuperTuxKart is a 3D open-source arcade racer with a variety of characters, tracks, and modes including Battle Mode, Soccer Mode, and Online Multiplayer.',
    whatsNew:
      'Vulkan renderer support for Android devices and new battle arenas.',
    iconUrl: '',
    screenshotUrls: [],
    apkFileName: 'org.supertuxkart.stk-v1.4.apk',
    apkDownloadUrl: 'https://supertuxkart.net/Download',
    externalDownloadUrl: 'https://supertuxkart.net',
    status: 'active',
    downloadEnabled: true,
    featured: true,
    trending: true,
    downloads: 12890,
    rating: 4.8,
  },
  {
    id: 'shattered-pixel-dungeon',
    slug: 'shattered-pixel-dungeon',
    name: 'Shattered Pixel Dungeon',
    developer: 'Shattered Pixel',
    packageName: 'com.shatteredpixel.shatteredpixeldungeon',
    category: 'Games',
    version: '2.5.2',
    size: '22.1 MB',
    minAndroid: 'Android 5.0+ (API 21)',
    releaseDate: '2026-11-03',
    shortDescription:
      'Traditional roguelike dungeon crawler RPG with 5 heroes and procedural levels.',
    fullDescription:
      'Shattered Pixel Dungeon is a traditional roguelike dungeon crawler RPG that is simple to get into but deep to master. Every game is a unique challenge.',
    whatsNew: 'New Cleric hero preview and 12 additional alchemical trinkets.',
    iconUrl: '',
    screenshotUrls: [],
    apkFileName: 'com.shatteredpixel.shatteredpixeldungeon-v2.5.2.apk',
    apkDownloadUrl: 'https://github.com/00-Evan/shattered-pixel-dungeon/releases',
    externalDownloadUrl: 'https://shatteredpixel.com',
    status: 'active',
    downloadEnabled: true,
    featured: true,
    trending: false,
    downloads: 9410,
    rating: 4.9,
  },
];

export const DEFAULT_BANNERS_SEED: Omit<
  BannerRecord,
  'createdAt' | 'updatedAt'
>[] = [
  {
    id: 'hero-main-banner',
    title: 'Fast & Secure APK Downloader',
    subtitle: 'Download Your Favourite Apps & Games for Android Free!',
    desktopBannerUrl: '',
    mobileBannerUrl: '',
    buttonText: 'Explore Top APKs',
    destinationUrl: '/apps',
    position: 'hero',
    status: 'active',
  },
  {
    id: 'mid-promo-banner',
    title: 'Get The Latest APK Updates!',
    subtitle: 'Fast • Safe • Free Verified Packages',
    desktopBannerUrl: '',
    mobileBannerUrl: '',
    buttonText: 'Download Now',
    destinationUrl: '/top-charts',
    position: 'mid_promo',
    status: 'active',
  },
];

export const DEFAULT_ANALYTICS_SEED: Omit<
  AnalyticsSummaryRecord,
  'updatedAt'
>[] = [
  { id: 'daily-mon', periodType: 'daily', label: 'Mon', downloads: 1240 },
  { id: 'daily-tue', periodType: 'daily', label: 'Tue', downloads: 1580 },
  { id: 'daily-wed', periodType: 'daily', label: 'Wed', downloads: 1890 },
  { id: 'daily-thu', periodType: 'daily', label: 'Thu', downloads: 1720 },
  { id: 'daily-fri', periodType: 'daily', label: 'Fri', downloads: 2340 },
  { id: 'daily-sat', periodType: 'daily', label: 'Sat', downloads: 2890 },
  { id: 'daily-sun', periodType: 'daily', label: 'Sun', downloads: 3120 },
  { id: 'weekly-w1', periodType: 'weekly', label: 'Week 1', downloads: 9850 },
  { id: 'weekly-w2', periodType: 'weekly', label: 'Week 2', downloads: 12430 },
  { id: 'weekly-w3', periodType: 'weekly', label: 'Week 3', downloads: 14120 },
  { id: 'weekly-w4', periodType: 'weekly', label: 'Week 4', downloads: 16890 },
  { id: 'monthly-jun', periodType: 'monthly', label: 'Jun', downloads: 38200 },
  { id: 'monthly-jul', periodType: 'monthly', label: 'Jul', downloads: 44100 },
  { id: 'monthly-aug', periodType: 'monthly', label: 'Aug', downloads: 51900 },
  { id: 'monthly-sep', periodType: 'monthly', label: 'Sep', downloads: 58400 },
  { id: 'monthly-oct', periodType: 'monthly', label: 'Oct', downloads: 64200 },
  { id: 'monthly-nov', periodType: 'monthly', label: 'Nov', downloads: 72190 },
];

export const DEFAULT_WEBSITE_SETTINGS_SEED: Omit<
  WebsiteSettingsRecord,
  'updatedAt'
> = {
  id: 'global',
  websiteName: 'APK Hub',
  websiteLogoUrl: '',
  websiteFaviconUrl: '',
  websiteDescription:
    'Fast & Secure APK Downloader — Download Your Favourite Apps & Games for Android Free!',
  contactEmail: 'admin@apkhub.store',
  footerText: '© 2026 APK Hub. Download Unlimited APK • Fast, Safe & Free.',
  privacyPolicy:
    'APK Hub respects user privacy. We do not require user accounts for downloading public APK packages and only record anonymous download telemetry.',
  termsConditions:
    'All applications distributed on APK Hub are verified open-source builds or official developer links. Users must comply with local software laws.',
  disclaimer:
    'Android, Google Play, and the Google Play logo are trademarks of Google LLC. APK Hub is an independent directory.',
  facebookUrl: 'https://facebook.com/apkhub',
  twitterUrl: 'https://x.com/apkhub',
  telegramUrl: 'https://t.me/apkhub',
  youtubeUrl: 'https://youtube.com/@apkhub',
  maintenanceMode: false,
  directDownloadsEnabled: true,
  requireChecksumVerification: true,
  maxDownloadSpeedLabel: 'Unlimited CDN High-Speed',
};
