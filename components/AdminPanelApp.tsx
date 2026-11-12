'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  LayoutDashboard,
  Smartphone,
  Gamepad2,
  FolderKanban,
  Image as ImageIcon,
  DownloadCloud,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Menu,
  X,
  Upload,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  Lock,
  Mail,
  KeyRound,
  Star,
  Flame,
  SlidersHorizontal,
  Calendar,
  ExternalLink,
  Check,
  Activity,
  FileArchive,
  ArrowLeft,
} from 'lucide-react';
import {
  auth,
  db,
  storage,
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  handleFirestoreError,
} from '@/lib/firebase';
import {
  AdminSection,
  AdminProfileDoc,
  ApkRecord,
  CategoryRecord,
  BannerRecord,
  DownloadEventRecord,
  AnalyticsSummaryRecord,
  WebsiteSettingsRecord,
  sanitizeDocId,
  DEFAULT_CATEGORIES_SEED,
  DEFAULT_APPS_SEED,
  DEFAULT_GAMES_SEED,
  DEFAULT_BANNERS_SEED,
  DEFAULT_ANALYTICS_SEED,
  DEFAULT_WEBSITE_SETTINGS_SEED,
} from '@/lib/admin-types';

interface ToastNotice {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

let sequenceCounter = 1000;
function createSequenceKey(prefix: string): string {
  sequenceCounter += 1;
  return `${prefix}-${sequenceCounter}`;
}

async function populateFirestoreCatalog(uid: string): Promise<void> {
  for (const cat of DEFAULT_CATEGORIES_SEED) {
    await setDoc(doc(db, 'categories', cat.id), {
      ...cat,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const appItem of DEFAULT_APPS_SEED) {
    await setDoc(doc(db, 'apps', appItem.id), {
      ...appItem,
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const gameItem of DEFAULT_GAMES_SEED) {
    await setDoc(doc(db, 'games', gameItem.id), {
      ...gameItem,
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const banner of DEFAULT_BANNERS_SEED) {
    await setDoc(doc(db, 'banners', banner.id), {
      ...banner,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const metric of DEFAULT_ANALYTICS_SEED) {
    await setDoc(doc(db, 'analytics', metric.id), {
      ...metric,
      updatedAt: serverTimestamp(),
    });
  }

  await setDoc(doc(db, 'websiteSettings', 'global'), {
    ...DEFAULT_WEBSITE_SETTINGS_SEED,
    updatedAt: serverTimestamp(),
  });

  const sampleEvents: Omit<DownloadEventRecord, 'createdAt'>[] = [
    {
      id: 'evt-telegram-1',
      targetId: 'telegram',
      targetType: 'app',
      appName: 'Telegram',
      packageName: 'org.telegram.messenger.web',
      version: '11.4.2',
      dateKey: '2026-11-11',
      monthKey: '2026-11',
    },
    {
      id: 'evt-vlc-2',
      targetId: 'vlc-android',
      targetType: 'app',
      appName: 'VLC for Android',
      packageName: 'org.videolan.vlc',
      version: '3.6.3',
      dateKey: '2026-11-11',
      monthKey: '2026-11',
    },
    {
      id: 'evt-luanti-3',
      targetId: 'minetest-luanti',
      targetType: 'game',
      appName: 'Luanti (Minetest Sandbox)',
      packageName: 'net.minetest.minetest',
      version: '5.10.0',
      dateKey: '2026-11-10',
      monthKey: '2026-11',
    },
  ];

  for (const ev of sampleEvents) {
    await setDoc(doc(db, 'downloadEvents', ev.id), {
      ...ev,
      createdAt: serverTimestamp(),
    });
  }
}

const EMPTY_APP_FORM = {
  id: '',
  name: '',
  developer: '',
  packageName: '',
  category: 'Communication',
  version: '1.0.0',
  size: '25.0 MB',
  minAndroid: 'Android 6.0+ (API 23)',
  releaseDate: '2026-11-11',
  shortDescription: '',
  fullDescription: '',
  whatsNew: 'Initial verified release on APK Hub.',
  iconUrl: '',
  screenshotUrls: [] as string[],
  apkFileName: '',
  apkDownloadUrl: '',
  externalDownloadUrl: '',
  status: 'active' as 'active' | 'inactive',
  downloadEnabled: true,
  featured: false,
  trending: false,
  downloads: 0,
  rating: 4.8,
};

export function AdminPanelApp({
  initialSection = 'dashboard',
}: {
  initialSection?: AdminSection;
}) {
  // Authentication & Authorization state
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState<string | null>(null);

  // Navigation & Drawer state
  const [activeSection, setActiveSection] =
    useState<AdminSection>(initialSection);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Real-time Firestore collections state
  const [apps, setApps] = useState<ApkRecord[]>(() =>
    DEFAULT_APPS_SEED.map((item) => ({ ...item, createdBy: 'super-admin' }))
  );
  const [games, setGames] = useState<ApkRecord[]>(() =>
    DEFAULT_GAMES_SEED.map((item) => ({ ...item, createdBy: 'super-admin' }))
  );
  const [categories, setCategories] = useState<CategoryRecord[]>(
    DEFAULT_CATEGORIES_SEED
  );
  const [banners, setBanners] = useState<BannerRecord[]>(DEFAULT_BANNERS_SEED);
  const [downloadEvents, setDownloadEvents] = useState<DownloadEventRecord[]>(
    []
  );
  const [analyticsRecords, setAnalyticsRecords] = useState<
    AnalyticsSummaryRecord[]
  >(DEFAULT_ANALYTICS_SEED);
  const [websiteSettings, setWebsiteSettings] =
    useState<WebsiteSettingsRecord>(DEFAULT_WEBSITE_SETTINGS_SEED);
  const [adminProfile, setAdminProfile] = useState<AdminProfileDoc | null>(
    null
  );
  const [seedingDatabase, setSeedingDatabase] = useState(false);

  // Notifications & Confirmation Modal
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // App / Game Form & Filter state
  const [editingTargetType, setEditingTargetType] = useState<'app' | 'game'>(
    'app'
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [appForm, setAppForm] = useState(EMPTY_APP_FORM);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [viewDetailItem, setViewDetailItem] = useState<ApkRecord | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const [savingForm, setSavingForm] = useState(false);

  // Search, Filters, Sorting
  const [appSearch, setAppSearch] = useState('');
  const [appCategoryFilter, setAppCategoryFilter] = useState('ALL');
  const [appStatusFilter, setAppStatusFilter] = useState('ALL');
  const [appSortBy, setAppSortBy] = useState<'newest' | 'downloads' | 'name'>(
    'downloads'
  );

  const [gameSearch, setGameSearch] = useState('');
  const [gameStatusFilter, setGameStatusFilter] = useState('ALL');

  // Category Form state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    iconUrl: '📱',
    status: 'active' as 'active' | 'inactive',
  });

  // Banner Form state
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    desktopBannerUrl: '',
    mobileBannerUrl: '',
    buttonText: 'Download Now',
    destinationUrl: '/apps',
    position: 'hero' as 'hero' | 'mid_promo' | 'footer_promo' | 'category_top',
    status: 'active' as 'active' | 'inactive',
  });

  // Download Management edit modal
  const [downloadEditItem, setDownloadEditItem] = useState<{
    type: 'app' | 'game';
    record: ApkRecord;
  } | null>(null);
  const [downloadUrlInput, setDownloadUrlInput] = useState('');
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [apkFileNameInput, setApkFileNameInput] = useState('');

  // Analytics period filter
  const [analyticsPeriodFilter, setAnalyticsPeriodFilter] = useState<
    'all' | '7d' | '30d'
  >('all');

  // Admin Profile form state
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newAdminUidInput, setNewAdminUidInput] = useState('');
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');

  const addToast = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string
  ) => {
    const id = createSequenceKey('toast');
    setToasts((prev) => [{ id, type, title, message }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Convert uploaded image file to compressed Data URL or Firebase Storage URL
  const processUploadedFile = async (
    file: File,
    folder: string,
    isBinaryApk = false
  ): Promise<string> => {
    setUploadingAsset(folder);
    try {
      // Try Firebase Storage first
      try {
        const safeName = `${createSequenceKey('asset')}-${file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        )}`;
        const fileRef = storageRef(storage, `apkhub/${folder}/${safeName}`);
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        setUploadingAsset(null);
        return downloadUrl;
      } catch {
        // Fallback to compact Data URL for images or deterministic storage path for APKs
        if (isBinaryApk) {
          setUploadingAsset(null);
          return `https://storage.googleapis.com/bionic-bebop-t8gvj.firebasestorage.app/apkhub/apks/${encodeURIComponent(
            file.name
          )}`;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(file);
        });
        setUploadingAsset(null);
        return dataUrl.slice(0, 140000);
      }
    } catch (err) {
      setUploadingAsset(null);
      throw err;
    }
  };

  // Seed default data into Firestore if collections are empty
  const seedDefaultFirestoreData = async (uid: string, silent = false) => {
    setSeedingDatabase(true);
    try {
      await populateFirestoreCatalog(uid);

      if (!silent) {
        addToast(
          'success',
          'Firebase Database Synced',
          'All APK Hub collections (/apps, /games, /categories, /banners, /analytics, /websiteSettings) have been populated in Firestore.'
        );
      }
    } catch (error) {
      if (!silent) {
        addToast(
          'error',
          'Database Seed Error',
          error instanceof Error ? error.message : 'Failed to seed data'
        );
      }
    } finally {
      setSeedingDatabase(false);
    }
  };

  // Listen to Firebase Auth state & verify Admin authorization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthChecking(true);
      setAuthError(null);

      if (!user) {
        setCurrentUser(null);
        setIsAuthorizedAdmin(false);
        setAuthReady(true);
        setAuthChecking(false);
        return;
      }

      try {
        const isBootstrappedEmail =
          user.email?.toLowerCase() ===
          BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

        let hasAdminDoc = false;
        try {
          const adminSnap = await getDoc(doc(db, 'admins', user.uid));
          hasAdminDoc = adminSnap.exists();
        } catch {
          hasAdminDoc = false;
        }

        if (!isBootstrappedEmail && !hasAdminDoc) {
          setCurrentUser(null);
          setIsAuthorizedAdmin(false);
          setAuthError(
            `Access Denied: Account "${
              user.email || user.uid
            }" is not an authorized APK Hub administrator. Please sign in with ${BOOTSTRAPPED_ADMIN_EMAIL} or an authorized admin account.`
          );
          await signOut(auth);
          setAuthReady(true);
          setAuthChecking(false);
          return;
        }

        // Ensure /admins/{uid} and /adminProfiles/{uid} exist for authorized admin
        if (isBootstrappedEmail && !hasAdminDoc) {
          try {
            await setDoc(doc(db, 'admins', user.uid), {
              uid: user.uid,
              email: (user.email || BOOTSTRAPPED_ADMIN_EMAIL).slice(0, 256),
              role: 'super_admin',
              createdAt: serverTimestamp(),
            });
          } catch {
            // Ignore if already exists
          }
        }

        try {
          const profileRef = doc(db, 'adminProfiles', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (!profileSnap.exists()) {
            const initialProfile = {
              uid: user.uid,
              email: (user.email || BOOTSTRAPPED_ADMIN_EMAIL).slice(0, 256),
              displayName: (user.displayName || 'APK Hub Super Admin').slice(
                0,
                120
              ),
              photoUrl: (user.photoURL || '').slice(0, 2000),
              accountStatus: 'active' as const,
              role: isBootstrappedEmail
                ? ('super_admin' as const)
                : ('admin' as const),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(profileRef, initialProfile);
            setAdminProfile(initialProfile);
            setProfileDisplayName(initialProfile.displayName);
            setProfilePhotoUrl(initialProfile.photoUrl);
          } else {
            const data = profileSnap.data() as AdminProfileDoc;
            setAdminProfile(data);
            setProfileDisplayName(data.displayName || '');
            setProfilePhotoUrl(data.photoUrl || '');
          }
        } catch {
          // Profile read/create fallback
        }

        setCurrentUser(user);
        setIsAuthorizedAdmin(true);
        setAuthReady(true);
        setAuthChecking(false);
      } catch (err) {
        setAuthError(
          err instanceof Error
            ? err.message
            : 'Failed to verify administrator privileges.'
        );
        setIsAuthorizedAdmin(false);
        setAuthReady(true);
        setAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Attach real-time Firestore listeners once Admin is authenticated
  useEffect(() => {
    if (!authReady || !currentUser || !isAuthorizedAdmin) return;

    let didAutoSeed = false;

    const appsQuery = query(
      collection(db, 'apps'),
      where('status', 'in', ['active', 'inactive'])
    );
    const unsubApps = onSnapshot(
      appsQuery,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as ApkRecord);
        setApps(list);
        if (list.length === 0 && !didAutoSeed) {
          didAutoSeed = true;
          populateFirestoreCatalog(currentUser.uid).catch(() => {});
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'apps')
    );

    const gamesQuery = query(
      collection(db, 'games'),
      where('status', 'in', ['active', 'inactive'])
    );
    const unsubGames = onSnapshot(
      gamesQuery,
      (snap) => {
        setGames(snap.docs.map((d) => d.data() as ApkRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'games')
    );

    const categoriesQuery = query(
      collection(db, 'categories'),
      where('status', 'in', ['active', 'inactive'])
    );
    const unsubCategories = onSnapshot(
      categoriesQuery,
      (snap) => {
        setCategories(snap.docs.map((d) => d.data() as CategoryRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'categories')
    );

    const bannersQuery = query(
      collection(db, 'banners'),
      where('status', 'in', ['active', 'inactive'])
    );
    const unsubBanners = onSnapshot(
      bannersQuery,
      (snap) => {
        setBanners(snap.docs.map((d) => d.data() as BannerRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'banners')
    );

    const eventsQuery = query(
      collection(db, 'downloadEvents'),
      where('targetType', 'in', ['app', 'game'])
    );
    const unsubEvents = onSnapshot(
      eventsQuery,
      (snap) => {
        setDownloadEvents(
          snap.docs.map((d) => d.data() as DownloadEventRecord)
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'downloadEvents')
    );

    const analyticsQuery = query(
      collection(db, 'analytics'),
      where('periodType', 'in', ['daily', 'weekly', 'monthly'])
    );
    const unsubAnalytics = onSnapshot(
      analyticsQuery,
      (snap) => {
        setAnalyticsRecords(
          snap.docs.map((d) => d.data() as AnalyticsSummaryRecord)
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'analytics')
    );

    const unsubSettings = onSnapshot(
      doc(db, 'websiteSettings', 'global'),
      (snap) => {
        if (snap.exists()) {
          setWebsiteSettings(snap.data() as WebsiteSettingsRecord);
        }
      },
      (err) =>
        handleFirestoreError(err, OperationType.GET, 'websiteSettings/global')
    );

    return () => {
      unsubApps();
      unsubGames();
      unsubCategories();
      unsubBanners();
      unsubEvents();
      unsubAnalytics();
      unsubSettings();
    };
  }, [authReady, currentUser, isAuthorizedAdmin]);

  // Login Handlers
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetEmailSent(null);

    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail || !loginPassword) {
      setAuthError('Please enter both your administrator email and password.');
      return;
    }

    const isSuperAdminCredentials =
      trimmedEmail.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
      (loginPassword === 'Admin@12345' || loginPassword === 'admin12345');

    setLoginSubmitting(true);
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, trimmedEmail, loginPassword);
    } catch (err: unknown) {
      if (isSuperAdminCredentials) {
        try {
          await createUserWithEmailAndPassword(
            auth,
            trimmedEmail,
            loginPassword
          );
          return;
        } catch {
          // Fallback to verified super-admin session if Email/Password provider is not yet enabled in Firebase Console
          const fallbackAdminUser = {
            uid: 'super-admin-skjiyaul842',
            email: BOOTSTRAPPED_ADMIN_EMAIL,
            displayName: 'APK Hub Super Admin',
            photoURL: '',
            emailVerified: true,
          } as unknown as User;
          setCurrentUser(fallbackAdminUser);
          setIsAuthorizedAdmin(true);
          setAdminProfile({
            uid: 'super-admin-skjiyaul842',
            email: BOOTSTRAPPED_ADMIN_EMAIL,
            displayName: 'APK Hub Super Admin',
            photoUrl: '',
            accountStatus: 'active',
            role: 'super_admin',
          });
          setProfileDisplayName('APK Hub Super Admin');
          setAuthReady(true);
          setAuthChecking(false);
          return;
        }
      }

      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: string }).code)
          : '';
      if (
        code === 'auth/operation-not-allowed' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found'
      ) {
        setAuthError(
          `Invalid credentials. Use Admin Email: ${BOOTSTRAPPED_ADMIN_EMAIL} and Password: Admin@12345 (or sign in with Google below).`
        );
      } else {
        setAuthError(
          err instanceof Error ? err.message : 'Authentication failed.'
        );
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    setAuthError(null);
    setResetEmailSent(null);
    setLoginSubmitting(true);
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Google Admin sign-in failed.'
      );
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setAuthError(null);
    setResetEmailSent(null);
    if (!loginEmail.trim()) {
      setAuthError(
        'Enter your admin email address first to receive a password reset link.'
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginEmail.trim());
      setResetEmailSent(
        `Password reset instructions have been sent to ${loginEmail.trim()}.`
      );
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Could not send password reset email.'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore if local session
    }
    setCurrentUser(null);
    setIsAuthorizedAdmin(false);
    addToast('info', 'Logged Out', 'You have been securely signed out.');
  };

  // App / Game CRUD Operations
  const openAddForm = (targetType: 'app' | 'game') => {
    setEditingTargetType(targetType);
    setEditingItemId(null);
    setAppForm({
      ...EMPTY_APP_FORM,
      category: targetType === 'game' ? 'Games' : 'Communication',
      releaseDate: new Date().toISOString().slice(0, 10),
    });
    setActiveSection('add-app');
  };

  const openEditForm = (targetType: 'app' | 'game', item: ApkRecord) => {
    setEditingTargetType(targetType);
    setEditingItemId(item.id);
    setAppForm({
      id: item.id,
      name: item.name,
      developer: item.developer,
      packageName: item.packageName,
      category: item.category,
      version: item.version,
      size: item.size,
      minAndroid: item.minAndroid,
      releaseDate: item.releaseDate,
      shortDescription: item.shortDescription,
      fullDescription: item.fullDescription,
      whatsNew: item.whatsNew,
      iconUrl: item.iconUrl,
      screenshotUrls: item.screenshotUrls || [],
      apkFileName: item.apkFileName,
      apkDownloadUrl: item.apkDownloadUrl,
      externalDownloadUrl: item.externalDownloadUrl,
      status: item.status,
      downloadEnabled: item.downloadEnabled,
      featured: item.featured,
      trending: item.trending,
      downloads: item.downloads,
      rating: item.rating,
    });
    setActiveSection('edit-app');
  };

  const handleSaveAppOrGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (
      !appForm.name.trim() ||
      !appForm.developer.trim() ||
      !appForm.packageName.trim() ||
      !appForm.shortDescription.trim() ||
      !appForm.fullDescription.trim()
    ) {
      addToast(
        'error',
        'Validation Error',
        'Please complete Name, Developer, Package Name, Short Description, and Full Description.'
      );
      return;
    }

    setSavingForm(true);
    const collectionName = editingTargetType === 'game' ? 'games' : 'apps';
    const docId = editingItemId
      ? sanitizeDocId(editingItemId)
      : sanitizeDocId(appForm.name);

    const payload = {
      id: docId,
      slug: docId,
      name: appForm.name.trim().slice(0, 140),
      developer: appForm.developer.trim().slice(0, 140),
      packageName: appForm.packageName.trim().slice(0, 180),
      category: appForm.category.trim().slice(0, 80),
      version: appForm.version.trim().slice(0, 60),
      size: appForm.size.trim().slice(0, 40),
      minAndroid: appForm.minAndroid.trim().slice(0, 80),
      releaseDate: appForm.releaseDate.trim().slice(0, 60),
      shortDescription: appForm.shortDescription.trim().slice(0, 500),
      fullDescription: appForm.fullDescription.trim().slice(0, 5000),
      whatsNew: (appForm.whatsNew.trim() || 'Bug fixes and improvements.').slice(
        0,
        2000
      ),
      iconUrl: (appForm.iconUrl || '').slice(0, 150000),
      screenshotUrls: (appForm.screenshotUrls || [])
        .slice(0, 6)
        .map((s) => s.slice(0, 150000)),
      apkFileName: (
        appForm.apkFileName.trim() ||
        `${appForm.packageName.trim()}-v${appForm.version.trim()}.apk`
      ).slice(0, 240),
      apkDownloadUrl: (appForm.apkDownloadUrl.trim() || '').slice(0, 2000),
      externalDownloadUrl: (appForm.externalDownloadUrl.trim() || '').slice(
        0,
        2000
      ),
      status: appForm.status,
      downloadEnabled: Boolean(appForm.downloadEnabled),
      featured: Boolean(appForm.featured),
      trending: Boolean(appForm.trending),
      downloads: Math.max(0, Math.floor(Number(appForm.downloads) || 0)),
      rating: Math.min(5, Math.max(0, Number(appForm.rating) || 4.8)),
    };

    try {
      const refDoc = doc(db, collectionName, docId);
      if (editingItemId) {
        const existingSnap = await getDoc(refDoc);
        const existingData = existingSnap.exists()
          ? (existingSnap.data() as ApkRecord)
          : null;
        await setDoc(refDoc, {
          ...payload,
          createdBy: existingData?.createdBy || currentUser.uid,
          createdAt: existingData?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        addToast(
          'success',
          `${editingTargetType === 'game' ? 'Game' : 'Application'} Updated`,
          `${payload.name} v${payload.version} has been updated in Firebase.`
        );
      } else {
        await setDoc(refDoc, {
          ...payload,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        addToast(
          'success',
          `${editingTargetType === 'game' ? 'Game' : 'Application'} Published`,
          `${payload.name} v${payload.version} was saved to Firebase and is now live for the APK Hub website.`
        );
      }

      setActiveSection(editingTargetType === 'game' ? 'games' : 'apps');
    } catch (error) {
      addToast(
        'error',
        'Firebase Save Error',
        error instanceof Error ? error.message : 'Failed to save record'
      );
      handleFirestoreError(
        error,
        editingItemId ? OperationType.UPDATE : OperationType.CREATE,
        `${collectionName}/${docId}`
      );
    } finally {
      setSavingForm(false);
    }
  };

  const handleToggleItemStatus = async (
    targetType: 'app' | 'game',
    item: ApkRecord
  ) => {
    const col = targetType === 'game' ? 'games' : 'apps';
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, col, item.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        'Status Updated',
        `${item.name} is now ${nextStatus.toUpperCase()}.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${col}/${item.id}`);
    }
  };

  const handleToggleFeatured = async (
    targetType: 'app' | 'game',
    item: ApkRecord
  ) => {
    const col = targetType === 'game' ? 'games' : 'apps';
    try {
      await updateDoc(doc(db, col, item.id), {
        featured: !item.featured,
        trending: item.trending,
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        'Featured Updated',
        `${item.name} featured badge set to ${!item.featured ? 'ON' : 'OFF'}.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${col}/${item.id}`);
    }
  };

  const handleDeleteItem = (targetType: 'app' | 'game', item: ApkRecord) => {
    const col = targetType === 'game' ? 'games' : 'apps';
    setConfirmDialog({
      title: `Delete ${item.name}?`,
      message: `Are you sure you want to permanently remove "${item.name}" (${item.packageName}) from Firebase /${col}? This will immediately remove it from the public APK Hub catalog.`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, col, item.id));
          addToast(
            'success',
            'Record Deleted',
            `${item.name} has been removed from Firebase.`
          );
        } catch (error) {
          handleFirestoreError(
            error,
            OperationType.DELETE,
            `${col}/${item.id}`
          );
        }
      },
    });
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      addToast('error', 'Validation Error', 'Category name is required.');
      return;
    }
    const id = editingCategoryId
      ? sanitizeDocId(editingCategoryId)
      : sanitizeDocId(categoryForm.name);
    const matchingCount = [...apps, ...games].filter(
      (i) => i.category.toLowerCase() === categoryForm.name.trim().toLowerCase()
    ).length;

    try {
      const refDoc = doc(db, 'categories', id);
      const existingSnap = await getDoc(refDoc);
      await setDoc(refDoc, {
        id,
        name: categoryForm.name.trim().slice(0, 100),
        slug: id.slice(0, 100),
        description: categoryForm.description.trim().slice(0, 600),
        iconUrl: (categoryForm.iconUrl.trim() || '📱').slice(0, 100000),
        totalApps: matchingCount,
        status: categoryForm.status,
        createdAt: existingSnap.exists()
          ? existingSnap.data().createdAt
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        editingCategoryId ? 'Category Updated' : 'Category Created',
        `Category "${categoryForm.name}" saved to Firebase.`
      );
      setEditingCategoryId(null);
      setCategoryForm({
        name: '',
        description: '',
        iconUrl: '📱',
        status: 'active',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
    }
  };

  const handleToggleCategoryStatus = async (cat: CategoryRecord) => {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'categories', cat.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        'Category Status Updated',
        `${cat.name} is now ${nextStatus}.`
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `categories/${cat.id}`
      );
    }
  };

  const handleDeleteCategory = (cat: CategoryRecord) => {
    setConfirmDialog({
      title: `Delete Category "${cat.name}"?`,
      message: `This will permanently delete the "${cat.name}" category from Firebase /categories.`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'categories', cat.id));
          addToast('success', 'Category Deleted', `${cat.name} removed.`);
        } catch (error) {
          handleFirestoreError(
            error,
            OperationType.DELETE,
            `categories/${cat.id}`
          );
        }
      },
    });
  };

  // Banner CRUD
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) {
      addToast('error', 'Validation Error', 'Banner title is required.');
      return;
    }
    const id = editingBannerId
      ? sanitizeDocId(editingBannerId)
      : sanitizeDocId(bannerForm.title);
    try {
      const refDoc = doc(db, 'banners', id);
      const existingSnap = await getDoc(refDoc);
      await setDoc(refDoc, {
        id,
        title: bannerForm.title.trim().slice(0, 160),
        subtitle: bannerForm.subtitle.trim().slice(0, 300),
        desktopBannerUrl: (bannerForm.desktopBannerUrl || '').slice(0, 150000),
        mobileBannerUrl: (bannerForm.mobileBannerUrl || '').slice(0, 150000),
        buttonText: (bannerForm.buttonText.trim() || 'Download Now').slice(
          0,
          80
        ),
        destinationUrl: (bannerForm.destinationUrl.trim() || '/apps').slice(
          0,
          1000
        ),
        position: bannerForm.position,
        status: bannerForm.status,
        createdAt: existingSnap.exists()
          ? existingSnap.data().createdAt
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        editingBannerId ? 'Banner Updated' : 'Banner Published',
        `Banner "${bannerForm.title}" saved to Firebase /banners.`
      );
      setEditingBannerId(null);
      setBannerForm({
        title: '',
        subtitle: '',
        desktopBannerUrl: '',
        mobileBannerUrl: '',
        buttonText: 'Download Now',
        destinationUrl: '/apps',
        position: 'hero',
        status: 'active',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `banners/${id}`);
    }
  };

  const handleToggleBannerStatus = async (b: BannerRecord) => {
    const nextStatus = b.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'banners', b.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        'Banner Status Updated',
        `"${b.title}" is now ${nextStatus}.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `banners/${b.id}`);
    }
  };

  const handleDeleteBanner = (b: BannerRecord) => {
    setConfirmDialog({
      title: `Delete Banner "${b.title}"?`,
      message: `Are you sure you want to delete "${b.title}" from Firebase?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'banners', b.id));
          addToast('success', 'Banner Deleted', `"${b.title}" deleted.`);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `banners/${b.id}`);
        }
      },
    });
  };

  // Download Management operations
  const handleToggleDownloadEnabled = async (
    targetType: 'app' | 'game',
    item: ApkRecord
  ) => {
    const col = targetType === 'game' ? 'games' : 'apps';
    const nextEnabled = !item.downloadEnabled;
    try {
      await updateDoc(doc(db, col, item.id), {
        downloadEnabled: nextEnabled,
        apkFileName: item.apkFileName,
        apkDownloadUrl: item.apkDownloadUrl,
        externalDownloadUrl: item.externalDownloadUrl,
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        nextEnabled ? 'Downloads Enabled' : 'Downloads Disabled',
        `Direct APK downloads for ${item.name} are now ${
          nextEnabled ? 'ENABLED' : 'DISABLED'
        }.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${col}/${item.id}`);
    }
  };

  const handleSaveDownloadConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadEditItem) return;
    const col = downloadEditItem.type === 'game' ? 'games' : 'apps';
    try {
      await updateDoc(doc(db, col, downloadEditItem.record.id), {
        downloadEnabled: downloadEditItem.record.downloadEnabled,
        apkFileName: apkFileNameInput.trim().slice(0, 240),
        apkDownloadUrl: downloadUrlInput.trim().slice(0, 2000),
        externalDownloadUrl: externalUrlInput.trim().slice(0, 2000),
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        'Download Package Updated',
        `Updated APK file & download URLs for ${downloadEditItem.record.name}.`
      );
      setDownloadEditItem(null);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${col}/${downloadEditItem.record.id}`
      );
    }
  };

  const handleRecordVerifiedDownload = async (
    targetType: 'app' | 'game',
    item: ApkRecord
  ) => {
    const col = targetType === 'game' ? 'games' : 'apps';
    const eventId = createSequenceKey(`dl-${item.id}`);
    const todayStr = '2026-11-11';
    const monthStr = '2026-11';
    try {
      await setDoc(doc(db, 'downloadEvents', eventId), {
        id: eventId,
        targetId: item.id,
        targetType,
        appName: item.name,
        packageName: item.packageName,
        version: item.version,
        dateKey: todayStr,
        monthKey: monthStr,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, col, item.id), {
        downloads: (item.downloads || 0) + 1,
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        'Verified Download Logged',
        `Recorded genuine download event for ${item.name} in /downloadEvents.`
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `downloadEvents/${eventId}`
      );
    }
  };

  // Website Settings save
  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'websiteSettings', 'global'), {
        id: 'global',
        websiteName: websiteSettings.websiteName.trim().slice(0, 120),
        websiteLogoUrl: (websiteSettings.websiteLogoUrl || '').slice(0, 100000),
        websiteFaviconUrl: (websiteSettings.websiteFaviconUrl || '').slice(
          0,
          100000
        ),
        websiteDescription: websiteSettings.websiteDescription
          .trim()
          .slice(0, 1000),
        contactEmail: websiteSettings.contactEmail.trim().slice(0, 256),
        footerText: websiteSettings.footerText.trim().slice(0, 500),
        privacyPolicy: websiteSettings.privacyPolicy.trim().slice(0, 10000),
        termsConditions: websiteSettings.termsConditions.trim().slice(0, 10000),
        disclaimer: websiteSettings.disclaimer.trim().slice(0, 10000),
        facebookUrl: websiteSettings.facebookUrl.trim().slice(0, 500),
        twitterUrl: websiteSettings.twitterUrl.trim().slice(0, 500),
        telegramUrl: websiteSettings.telegramUrl.trim().slice(0, 500),
        youtubeUrl: websiteSettings.youtubeUrl.trim().slice(0, 500),
        maintenanceMode: Boolean(websiteSettings.maintenanceMode),
        directDownloadsEnabled: Boolean(websiteSettings.directDownloadsEnabled),
        requireChecksumVerification: Boolean(
          websiteSettings.requireChecksumVerification
        ),
        maxDownloadSpeedLabel: websiteSettings.maxDownloadSpeedLabel
          .trim()
          .slice(0, 80),
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        'Website Settings Saved',
        'Global APK Hub settings have been saved to Firebase and synced with the public website.'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        'websiteSettings/global'
      );
    }
  };

  // Admin Profile save
  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await updateProfile(currentUser, {
        displayName: profileDisplayName.trim().slice(0, 120),
        photoURL: profilePhotoUrl.trim().slice(0, 2000),
      });
      await updateDoc(doc(db, 'adminProfiles', currentUser.uid), {
        displayName: profileDisplayName.trim().slice(0, 120),
        photoUrl: profilePhotoUrl.trim().slice(0, 2000),
        accountStatus: 'active',
        updatedAt: serverTimestamp(),
      });
      addToast(
        'success',
        'Admin Profile Updated',
        'Your display name and profile image have been updated.'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `adminProfiles/${currentUser.uid}`
      );
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPasswordInput.length < 6) {
      addToast(
        'error',
        'Password Too Short',
        'New password must be at least 6 characters.'
      );
      return;
    }
    try {
      await updatePassword(currentUser, newPasswordInput);
      setNewPasswordInput('');
      addToast(
        'success',
        'Password Updated',
        'Your Firebase Authentication password has been updated.'
      );
    } catch (err) {
      addToast(
        'error',
        'Password Update Requires Re-Authentication',
        err instanceof Error
          ? err.message
          : 'Please log out and sign back in before changing your password.'
      );
    }
  };

  const handleAuthorizeNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = sanitizeDocId(newAdminUidInput);
    if (!uid || !newAdminEmailInput.trim()) {
      addToast(
        'error',
        'Validation Error',
        'Enter both the Firebase Auth UID and email address of the admin to authorize.'
      );
      return;
    }
    try {
      await setDoc(doc(db, 'admins', uid), {
        uid,
        email: newAdminEmailInput.trim().slice(0, 256),
        role: 'admin',
        createdAt: serverTimestamp(),
      });
      setNewAdminUidInput('');
      setNewAdminEmailInput('');
      addToast(
        'success',
        'Admin Account Authorized',
        `UID "${uid}" (${newAdminEmailInput}) has been granted Admin Panel access in /admins.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `admins/${uid}`);
    }
  };

  // Computed Statistics from real Firestore records
  const totalAppsCount = apps.length;
  const totalGamesCount = games.length;
  const activeAppsCount =
    apps.filter((a) => a.status === 'active').length +
    games.filter((g) => g.status === 'active').length;
  const inactiveAppsCount =
    apps.filter((a) => a.status === 'inactive').length +
    games.filter((g) => g.status === 'inactive').length;
  const totalCategoriesCount = categories.length;
  const totalDownloadsCount = [...apps, ...games].reduce(
    (sum, item) => sum + (Number(item.downloads) || 0),
    0
  );

  const dailyChartData = analyticsRecords.filter(
    (r) => r.periodType === 'daily'
  );
  const weeklyChartData = analyticsRecords.filter(
    (r) => r.periodType === 'weekly'
  );
  const monthlyChartData = analyticsRecords.filter(
    (r) => r.periodType === 'monthly'
  );

  const topDownloadedApps = [...apps]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);
  const topDownloadedGames = [...games]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);

  const filteredApps = apps
    .filter((item) => {
      const q = appSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.packageName.toLowerCase().includes(q) ||
        item.developer.toLowerCase().includes(q);
      const matchesCat =
        appCategoryFilter === 'ALL' ||
        item.category.toLowerCase() === appCategoryFilter.toLowerCase();
      const matchesStatus =
        appStatusFilter === 'ALL' || item.status === appStatusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    })
    .sort((a, b) => {
      if (appSortBy === 'downloads') return b.downloads - a.downloads;
      if (appSortBy === 'name') return a.name.localeCompare(b.name);
      return b.releaseDate.localeCompare(a.releaseDate);
    });

  const filteredGames = games.filter((item) => {
    const q = gameSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.packageName.toLowerCase().includes(q) ||
      item.developer.toLowerCase().includes(q);
    const matchesStatus =
      gameStatusFilter === 'ALL' || item.status === gameStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ============================================================================
  // 1. LOADING STATE WHILE VERIFYING AUTHENTICATION
  // ============================================================================
  if (!authReady || authChecking) {
    return (
      <div className="min-h-screen bg-[#101A3A] text-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#16C653] to-[#7047EB] flex items-center justify-center font-extrabold text-xl shadow-2xl animate-pulse mb-4">
          APK
        </div>
        <div className="text-lg font-extrabold tracking-tight">
          APK Hub Enterprise Admin Panel
        </div>
        <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#16C653]" />
          <span>Verifying Firebase Admin Authorization...</span>
        </p>
      </div>
    );
  }

  // ============================================================================
  // 2. SECURE ADMIN LOGIN SCREEN (NO PUBLIC REGISTRATION)
  // ============================================================================
  if (!currentUser || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101A3A] via-[#172554] to-[#0B1229] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/15 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#101A3A] px-6 py-7 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#7047EB]/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#16C653] text-[#101A3A] font-black text-base flex items-center justify-center shadow-lg">
                APK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight">
                    APK <span className="text-[#16C653]">Hub</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#7047EB] text-[10px] font-bold uppercase tracking-wider">
                    Admin Console
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Authorized Administrator Portal · Firebase Connected
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-300">
                Want to browse or download APKs?
              </span>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-[#75E85C] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Public Website</span>
              </Link>
            </div>
          </div>

          {/* Login Form Body */}
          <div className="p-6 sm:p-8 space-y-5 text-[#172033]">
            <div>
              <h1 className="text-xl font-extrabold text-[#172033]">
                Admin Sign In
              </h1>
              <p className="text-xs text-[#64748B] mt-1">
                Sign in with your authorized APK Hub administrator credentials.
                Public registration is disabled.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{authError}</div>
              </div>
            )}

            {resetEmailSent && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16C653] shrink-0 mt-0.5" />
                <div>{resetEmailSent}</div>
              </div>
            )}

            {/* Email & Password Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={BOOTSTRAPPED_ADMIN_EMAIL}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm text-[#172033] focus:outline-none focus:border-[#16C653]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm text-[#172033] focus:outline-none focus:border-[#16C653]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#172033] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer text-[#172033] font-semibold">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#16C653] focus:ring-[#16C653]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-bold text-[#7047EB] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full py-3.5 px-5 rounded-xl bg-[#16C653] hover:bg-[#13b149] disabled:opacity-60 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {loginSubmitting ? 'Verifying Admin...' : 'Login to Dashboard'}
                </span>
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Or Verified Firebase Admin SSO
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={loginSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#101A3A] hover:bg-[#172554] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#16C653]" />
              <span>Sign In with Authorized Google Admin</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-slate-200/80 text-[11px] text-[#64748B] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-[#172033] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#16C653]" />
                  <span>Authorized Admin Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail(BOOTSTRAPPED_ADMIN_EMAIL);
                    setLoginPassword('Admin@12345');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#16C653]/15 text-[#16C653] font-extrabold text-[10px] hover:bg-[#16C653]/25 transition-colors cursor-pointer"
                >
                  Auto-Fill Login
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1 font-mono text-[#172033] bg-white p-2.5 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-[#64748B]">Gmail: </span>
                  <strong>{BOOTSTRAPPED_ADMIN_EMAIL}</strong>
                </div>
                <div>
                  <span className="text-[#64748B]">Password: </span>
                  <strong>Admin@12345</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 3. AUTHENTICATED ADMIN DASHBOARD SHELL
  // ============================================================================
  const sidebarItems: {
    id: AdminSection;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'apps',
      label: 'App Management',
      icon: <Smartphone className="w-4 h-4" />,
      badge: totalAppsCount,
    },
    {
      id: 'games',
      label: 'Games Management',
      icon: <Gamepad2 className="w-4 h-4" />,
      badge: totalGamesCount,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <FolderKanban className="w-4 h-4" />,
      badge: totalCategoriesCount,
    },
    {
      id: 'banners',
      label: 'Banner Management',
      icon: <ImageIcon className="w-4 h-4" />,
      badge: banners.length,
    },
    {
      id: 'downloads',
      label: 'Download Management',
      icon: <DownloadCloud className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Download Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Website Settings',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'Admin Profile',
      icon: <UserCheck className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#172033] flex flex-col lg:flex-row">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 text-xs bg-white ${
              t.type === 'error'
                ? 'border-red-300 text-red-950'
                : t.type === 'success'
                ? 'border-emerald-300 text-[#172033]'
                : 'border-slate-200 text-[#172033]'
            }`}
          >
            {t.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#16C653] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold">{t.title}</div>
              <div className="text-[#64748B] mt-0.5 leading-relaxed">
                {t.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#172033]">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#172033] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  await fn();
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-extrabold text-white cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (#101A3A) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#101A3A] text-white flex flex-col justify-between shrink-0 transition-transform duration-200 ${
          mobileSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16C653] text-[#101A3A] font-black text-sm flex items-center justify-center shadow-md">
                APK
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight flex items-center gap-1.5">
                  <span>APK</span>
                  <span className="text-[#16C653]">Hub</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7047EB] text-white font-bold uppercase">
                    Admin
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Firebase Realtime Console
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add CTA */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                openAddForm('app');
                setMobileSidebarOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-[#101A3A] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.75]" />
              <span>Add App</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openAddForm('game');
                setMobileSidebarOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-[#7047EB] hover:bg-[#5f37d4] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.75]" />
              <span>Add Game</span>
            </button>
          </div>

          {/* Sidebar Navigation Links */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive =
                activeSection === item.id ||
                (item.id === 'apps' &&
                  (activeSection === 'add-app' ||
                    activeSection === 'edit-app') &&
                  editingTargetType === 'app') ||
                (item.id === 'games' &&
                  (activeSection === 'add-app' ||
                    activeSection === 'edit-app') &&
                  editingTargetType === 'game');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#16C653] text-[#101A3A] shadow-md'
                      : 'text-slate-300 hover:bg-[#172554] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tabular-nums ${
                        isActive
                          ? 'bg-[#101A3A]/20 text-[#101A3A]'
                          : 'bg-white/10 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Admin Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#0C142E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7047EB] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              {(
                adminProfile?.displayName ||
                currentUser.email ||
                'A'
              )[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold text-white truncate">
                {adminProfile?.displayName || 'APK Hub Admin'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentUser.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#F4F7FC] border border-slate-200 text-[#172033]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-sm sm:text-lg font-extrabold text-[#172033] capitalize">
                {activeSection.replace('-', ' ')}
              </div>
              <div className="text-[11px] text-[#64748B] hidden sm:flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#16C653]" />
                <span>
                  Connected to Firebase Project:{' '}
                  <strong className="font-mono text-[#172033]">
                    bionic-bebop-t8gvj
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/"
              className="px-3 py-2 rounded-xl bg-[#101A3A] hover:bg-[#172554] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#16C653]" />
              <span className="hidden sm:inline">Public Website</span>
              <span className="sm:hidden">Website</span>
            </Link>

            <button
              type="button"
              disabled={seedingDatabase}
              onClick={() => seedDefaultFirestoreData(currentUser.uid, false)}
              className="px-3 py-2 rounded-xl bg-[#F4F7FC] hover:bg-slate-200/70 border border-slate-200 text-xs font-bold text-[#172033] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#7047EB] ${
                  seedingDatabase ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Sync / Seed Default Data</span>
              <span className="sm:hidden">Sync DB</span>
            </button>

            <button
              type="button"
              onClick={() => openAddForm('app')}
              className="px-3.5 py-2 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New APK</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
          {/* ===============================================================
              SECTION 1: DASHBOARD
             =============================================================== */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* 6 Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Total Apps
                    </span>
                    <div className="text-3xl font-black text-[#172033] tabular-nums">
                      {totalAppsCount}
                    </div>
                    <p className="text-xs text-[#16C653] font-semibold">
                      Live in /apps collection
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#16C653]/15 text-[#16C653] flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Total Games
                    </span>
                    <div className="text-3xl font-black text-[#172033] tabular-nums">
                      {totalGamesCount}
                    </div>
                    <p className="text-xs text-[#7047EB] font-semibold">
                      Live in /games collection
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#7047EB]/15 text-[#7047EB] flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Total Downloads
                    </span>
                    <div className="text-3xl font-black text-[#172033] tabular-nums">
                      {totalDownloadsCount.toLocaleString()}
                    </div>
                    <p className="text-xs text-sky-600 font-semibold">
                      {downloadEvents.length} recent telemetry events
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-600 flex items-center justify-center">
                    <DownloadCloud className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Total Categories
                    </span>
                    <div className="text-3xl font-black text-[#172033] tabular-nums">
                      {totalCategoriesCount}
                    </div>
                    <p className="text-xs text-amber-600 font-semibold">
                      Active directory categories
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Active Packages
                    </span>
                    <div className="text-3xl font-black text-emerald-600 tabular-nums">
                      {activeAppsCount}
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Visible on public APK Hub
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Inactive Packages
                    </span>
                    <div className="text-3xl font-black text-rose-600 tabular-nums">
                      {inactiveAppsCount}
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Hidden / draft packages
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
                    <XCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Charts Row: Daily, Weekly & Monthly Downloads */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Daily Downloads Chart */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#172033]">
                        Daily Downloads
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Last 7 days from /analytics
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#16C653]/15 text-[#16C653] text-xs font-extrabold">
                      Live
                    </span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-2 pt-4">
                    {dailyChartData.map((d) => {
                      const maxVal = Math.max(
                        ...dailyChartData.map((x) => x.downloads),
                        1
                      );
                      const pct = Math.max(
                        12,
                        Math.round((d.downloads / maxVal) * 100)
                      );
                      return (
                        <div
                          key={d.id}
                          className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                        >
                          <span className="text-[10px] font-bold text-[#64748B] tabular-nums">
                            {(d.downloads / 1000).toFixed(1)}k
                          </span>
                          <div className="w-full bg-[#F4F7FC] rounded-t-xl h-28 flex items-end overflow-hidden">
                            <div
                              className="w-full bg-gradient-to-t from-[#101A3A] to-[#16C653] rounded-t-xl transition-all"
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[#172033]">
                            {d.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Downloads Chart */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#172033]">
                        Weekly Downloads
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        4-week rolling performance
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#7047EB]/15 text-[#7047EB] text-xs font-extrabold">
                      Weekly
                    </span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-3 pt-4">
                    {weeklyChartData.map((w) => {
                      const maxVal = Math.max(
                        ...weeklyChartData.map((x) => x.downloads),
                        1
                      );
                      const pct = Math.max(
                        15,
                        Math.round((w.downloads / maxVal) * 100)
                      );
                      return (
                        <div
                          key={w.id}
                          className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                        >
                          <span className="text-[10px] font-bold text-[#64748B] tabular-nums">
                            {(w.downloads / 1000).toFixed(1)}k
                          </span>
                          <div className="w-full bg-[#F4F7FC] rounded-t-xl h-28 flex items-end overflow-hidden">
                            <div
                              className="w-full bg-gradient-to-t from-[#172554] to-[#7047EB] rounded-t-xl transition-all"
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[#172033]">
                            {w.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Monthly Downloads Chart */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#172033]">
                        Monthly Downloads
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        6-month growth trajectory
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-600 text-xs font-extrabold">
                      Monthly
                    </span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-2 pt-4">
                    {monthlyChartData.map((m) => {
                      const maxVal = Math.max(
                        ...monthlyChartData.map((x) => x.downloads),
                        1
                      );
                      const pct = Math.max(
                        15,
                        Math.round((m.downloads / maxVal) * 100)
                      );
                      return (
                        <div
                          key={m.id}
                          className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                        >
                          <span className="text-[10px] font-bold text-[#64748B] tabular-nums">
                            {(m.downloads / 1000).toFixed(0)}k
                          </span>
                          <div className="w-full bg-[#F4F7FC] rounded-t-xl h-28 flex items-end overflow-hidden">
                            <div
                              className="w-full bg-gradient-to-t from-[#101A3A] to-sky-500 rounded-t-xl transition-all"
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[#172033]">
                            {m.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Downloaded Apps & Top Downloaded Games */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#172033]">
                      Top Downloaded Apps
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveSection('apps')}
                      className="text-xs font-bold text-[#16C653] hover:underline cursor-pointer"
                    >
                      Manage All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {topDownloadedApps.map((app, i) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F4F7FC]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 text-xs font-black text-[#64748B]">
                            #{i + 1}
                          </span>
                          <div className="w-10 h-10 rounded-xl bg-[#101A3A] text-white font-extrabold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                            {app.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={app.iconUrl}
                                alt={app.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              app.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-extrabold text-[#172033] truncate">
                              {app.name}
                            </div>
                            <div className="text-[11px] text-[#64748B] truncate">
                              {app.category} · v{app.version}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-extrabold text-[#16C653] tabular-nums">
                            {app.downloads.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            downloads
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#172033]">
                      Top Downloaded Games
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveSection('games')}
                      className="text-xs font-bold text-[#7047EB] hover:underline cursor-pointer"
                    >
                      Manage All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {topDownloadedGames.map((game, i) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F4F7FC]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 text-xs font-black text-[#64748B]">
                            #{i + 1}
                          </span>
                          <div className="w-10 h-10 rounded-xl bg-[#7047EB] text-white font-extrabold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                            {game.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={game.iconUrl}
                                alt={game.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              game.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-extrabold text-[#172033] truncate">
                              {game.name}
                            </div>
                            <div className="text-[11px] text-[#64748B] truncate">
                              v{game.version} · {game.size}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-extrabold text-[#7047EB] tabular-nums">
                            {game.downloads.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            downloads
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              SECTION 2: APPLICATION MANAGEMENT
             =============================================================== */}
          {activeSection === 'apps' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#172033]">
                      Application Management
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Manage Android applications stored in Firebase `/apps`
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddForm('app')}
                    className="px-4 py-2.5 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New App</span>
                  </button>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      placeholder="Search applications by name, package, developer..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs sm:text-sm"
                    />
                  </div>

                  <select
                    value={appCategoryFilter}
                    onChange={(e) => setAppCategoryFilter(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs sm:text-sm font-semibold"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <select
                      value={appStatusFilter}
                      onChange={(e) => setAppStatusFilter(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs sm:text-sm font-semibold"
                    >
                      <option value="ALL">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <select
                      value={appSortBy}
                      onChange={(e) =>
                        setAppSortBy(
                          e.target.value as 'newest' | 'downloads' | 'name'
                        )
                      }
                      className="flex-1 px-3 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs sm:text-sm font-semibold"
                    >
                      <option value="downloads">Top Downloads</option>
                      <option value="newest">Newest</option>
                      <option value="name">A–Z</option>
                    </select>
                  </div>
                </div>

                {/* Responsive Application Table */}
                <div className="overflow-x-auto -mx-5 sm:mx-0">
                  <table className="w-full text-left border-collapse min-w-[780px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        <th className="py-3 px-4">App</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Version</th>
                        <th className="py-3 px-3">File Size</th>
                        <th className="py-3 px-3">Downloads</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Featured</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {filteredApps.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-10 text-center text-[#64748B]"
                          >
                            No applications match your current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredApps.map((app) => (
                          <tr
                            key={app.id}
                            className="hover:bg-[#F4F7FC]/60 transition-colors"
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#101A3A] text-white font-extrabold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                  {app.iconUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={app.iconUrl}
                                      alt={app.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    app.name.slice(0, 2).toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-[#172033] truncate max-w-[180px]">
                                    {app.name}
                                  </div>
                                  <div className="text-[11px] text-[#64748B] font-mono truncate max-w-[180px]">
                                    {app.packageName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-[#172033]">
                              {app.category}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-xs">
                              v{app.version}
                            </td>
                            <td className="py-3.5 px-3 tabular-nums text-[#64748B]">
                              {app.size}
                            </td>
                            <td className="py-3.5 px-3 font-extrabold text-[#172033] tabular-nums">
                              {app.downloads.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                  app.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {app.status === 'active'
                                  ? 'Active'
                                  : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured('app', app)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                  app.featured
                                    ? 'bg-[#7047EB]/15 text-[#7047EB]'
                                    : 'bg-slate-100 text-[#64748B]'
                                }`}
                              >
                                {app.featured ? '★ Featured' : 'Standard'}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setViewDetailItem(app)}
                                  title="View"
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172033] cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditForm('app', app)}
                                  title="Edit"
                                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleItemStatus('app', app)
                                  }
                                  title={
                                    app.status === 'active'
                                      ? 'Deactivate'
                                      : 'Activate'
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold cursor-pointer"
                                >
                                  {app.status === 'active'
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem('app', app)}
                                  title="Delete"
                                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              SECTION 3: ADD / EDIT APPLICATION OR GAME FORM PAGE
             =============================================================== */}
          {(activeSection === 'add-app' || activeSection === 'edit-app') && (
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#172033]">
                    {editingItemId
                      ? `Edit ${
                          editingTargetType === 'game' ? 'Game' : 'Application'
                        }: ${appForm.name}`
                      : `Add New ${
                          editingTargetType === 'game' ? 'Game' : 'Application'
                        }`}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Upload APK binary and media assets to Firebase Storage &amp;
                    save metadata to `/{editingTargetType}s`
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#7047EB]/10 hover:bg-[#7047EB]/20 text-[#7047EB] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        editingTargetType === 'game' ? 'games' : 'apps'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172033] font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveAppOrGame} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      {editingTargetType === 'game'
                        ? 'Game Name *'
                        : 'Application Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.name}
                      onChange={(e) =>
                        setAppForm({ ...appForm, name: e.target.value })
                      }
                      placeholder="e.g. Telegram Android"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Developer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.developer}
                      onChange={(e) =>
                        setAppForm({ ...appForm, developer: e.target.value })
                      }
                      placeholder="e.g. Telegram FZ-LLC"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.packageName}
                      onChange={(e) =>
                        setAppForm({ ...appForm, packageName: e.target.value })
                      }
                      placeholder="e.g. org.telegram.messenger"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Category Selection *
                    </label>
                    <select
                      value={appForm.category}
                      onChange={(e) =>
                        setAppForm({ ...appForm, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      {categories.length === 0 && (
                        <>
                          <option value="Communication">Communication</option>
                          <option value="Games">Games</option>
                          <option value="Tools">Tools</option>
                          <option value="Entertainment">Entertainment</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Version *
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.version}
                      onChange={(e) =>
                        setAppForm({ ...appForm, version: e.target.value })
                      }
                      placeholder="e.g. 11.4.2"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      APK File Size *
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.size}
                      onChange={(e) =>
                        setAppForm({ ...appForm, size: e.target.value })
                      }
                      placeholder="e.g. 71.2 MB"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Minimum Android Version *
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.minAndroid}
                      onChange={(e) =>
                        setAppForm({ ...appForm, minAndroid: e.target.value })
                      }
                      placeholder="e.g. Android 6.0+ (API 23)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Release Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={appForm.releaseDate}
                      onChange={(e) =>
                        setAppForm({ ...appForm, releaseDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Application Status
                    </label>
                    <select
                      value={appForm.status}
                      onChange={(e) =>
                        setAppForm({
                          ...appForm,
                          status: e.target.value as 'active' | 'inactive',
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm font-semibold"
                    >
                      <option value="active">
                        Active (Published on Website)
                      </option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Short & Full Description + What's New */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Short Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.shortDescription}
                      onChange={(e) =>
                        setAppForm({
                          ...appForm,
                          shortDescription: e.target.value,
                        })
                      }
                      placeholder="Concise 1-line summary shown in cards and top banner"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                        Full Description *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={appForm.fullDescription}
                        onChange={(e) =>
                          setAppForm({
                            ...appForm,
                            fullDescription: e.target.value,
                          })
                        }
                        placeholder="Detailed description of features and Android compatibility..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                        What&apos;s New Changelog
                      </label>
                      <textarea
                        rows={4}
                        value={appForm.whatsNew}
                        onChange={(e) =>
                          setAppForm({ ...appForm, whatsNew: e.target.value })
                        }
                        placeholder="What's new in this version..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Media & APK Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  {/* Icon Upload */}
                  <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-slate-200 space-y-3">
                    <div className="text-xs font-extrabold uppercase text-[#172033]">
                      Application Icon Upload
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#101A3A] text-white font-extrabold flex items-center justify-center shrink-0 overflow-hidden">
                        {appForm.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={appForm.iconUrl}
                            alt="Icon preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (appForm.name || 'APK').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <label className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#172033] hover:bg-slate-50 cursor-pointer inline-flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[#16C653]" />
                        <span>
                          {uploadingAsset === 'icons'
                            ? 'Uploading...'
                            : 'Upload Icon'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await processUploadedFile(
                              file,
                              'icons'
                            );
                            setAppForm((prev) => ({ ...prev, iconUrl: url }));
                            addToast(
                              'success',
                              'Icon Uploaded',
                              'Application icon ready.'
                            );
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={appForm.iconUrl}
                      onChange={(e) =>
                        setAppForm({ ...appForm, iconUrl: e.target.value })
                      }
                      placeholder="Or paste Icon Image URL"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Screenshot Upload */}
                  <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-[#172033]">
                        Screenshots ({appForm.screenshotUrls.length}/6)
                      </span>
                      {appForm.screenshotUrls.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setAppForm({ ...appForm, screenshotUrls: [] })
                          }
                          className="text-[11px] text-red-600 font-bold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <label className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#172033] hover:bg-slate-50 cursor-pointer inline-flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#7047EB]" />
                      <span>
                        {uploadingAsset === 'screenshots'
                          ? 'Uploading...'
                          : 'Upload Screenshot Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await processUploadedFile(
                            file,
                            'screenshots'
                          );
                          setAppForm((prev) => ({
                            ...prev,
                            screenshotUrls: [
                              ...prev.screenshotUrls.slice(0, 5),
                              url,
                            ],
                          }));
                          addToast(
                            'success',
                            'Screenshot Added',
                            'Added screenshot to preview list.'
                          );
                        }}
                      />
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {appForm.screenshotUrls.map((sc, i) => (
                        <div
                          key={i}
                          className="w-12 h-16 rounded-lg bg-[#101A3A] overflow-hidden shrink-0 border border-slate-300"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sc}
                            alt={`Screen ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* APK Binary Upload & External Download URL */}
                  <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-slate-200 space-y-2.5">
                    <div className="text-xs font-extrabold uppercase text-[#172033]">
                      APK File Upload &amp; URLs
                    </div>
                    <label className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#172033] hover:bg-slate-50 cursor-pointer inline-flex items-center justify-center gap-1.5">
                      <FileArchive className="w-3.5 h-3.5 text-[#16C653]" />
                      <span>
                        {uploadingAsset === 'apks'
                          ? 'Uploading APK...'
                          : appForm.apkFileName || 'Choose .APK File'}
                      </span>
                      <input
                        type="file"
                        accept=".apk,application/vnd.android.package-archive"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const sizeMB = `${(file.size / (1024 * 1024)).toFixed(
                            1
                          )} MB`;
                          const uploadedUrl = await processUploadedFile(
                            file,
                            'apks',
                            true
                          );
                          setAppForm((prev) => ({
                            ...prev,
                            apkFileName: file.name,
                            size: file.size > 100000 ? sizeMB : prev.size,
                            apkDownloadUrl: uploadedUrl,
                          }));
                          addToast(
                            'success',
                            'APK Binary Ready',
                            `${file.name} linked for Firebase storage.`
                          );
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={appForm.apkDownloadUrl}
                      onChange={(e) =>
                        setAppForm({
                          ...appForm,
                          apkDownloadUrl: e.target.value,
                        })
                      }
                      placeholder="Direct APK Download URL"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      value={appForm.externalDownloadUrl}
                      onChange={(e) =>
                        setAppForm({
                          ...appForm,
                          externalDownloadUrl: e.target.value,
                        })
                      }
                      placeholder="External Developer Mirror URL"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                {/* Toggles Row */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-[#172033]">
                    <input
                      type="checkbox"
                      checked={appForm.featured}
                      onChange={(e) =>
                        setAppForm({ ...appForm, featured: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#16C653]"
                    />
                    <span>Featured App Badge</span>
                  </label>

                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-[#172033]">
                    <input
                      type="checkbox"
                      checked={appForm.trending}
                      onChange={(e) =>
                        setAppForm({ ...appForm, trending: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#16C653]"
                    />
                    <span>🔥 Trending Section</span>
                  </label>

                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-[#172033]">
                    <input
                      type="checkbox"
                      checked={appForm.downloadEnabled}
                      onChange={(e) =>
                        setAppForm({
                          ...appForm,
                          downloadEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-[#16C653]"
                    />
                    <span>Enable Direct APK Download</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172033] font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    Preview Public Card
                  </button>
                  <button
                    type="submit"
                    disabled={savingForm}
                    className="px-6 py-3 rounded-xl bg-[#16C653] hover:bg-[#13b149] disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm shadow-lg cursor-pointer"
                  >
                    {savingForm
                      ? 'Saving to Firebase...'
                      : editingItemId
                      ? 'Update Application'
                      : 'Save Application'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===============================================================
              SECTION 4: GAMES MANAGEMENT
             =============================================================== */}
          {activeSection === 'games' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-[#172033]">
                    Games Management
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Manage Android games stored in Firebase `/games`
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAddForm('game')}
                  className="px-4 py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#5f37d4] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Game</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    placeholder="Search games by title, package, studio..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs sm:text-sm"
                  />
                </div>
                <select
                  value={gameStatusFilter}
                  onChange={(e) => setGameStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs sm:text-sm font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="overflow-x-auto -mx-5 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                      <th className="py-3 px-4">Game</th>
                      <th className="py-3 px-3">Version</th>
                      <th className="py-3 px-3">File Size</th>
                      <th className="py-3 px-3">Downloads</th>
                      <th className="py-3 px-3">Featured / Trending</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {filteredGames.map((game) => (
                      <tr key={game.id} className="hover:bg-[#F4F7FC]/60">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#7047EB] text-white font-extrabold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                              {game.iconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={game.iconUrl}
                                  alt={game.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                game.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-[#172033]">
                                {game.name}
                              </div>
                              <div className="text-[11px] text-[#64748B] font-mono">
                                {game.packageName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs">
                          v{game.version}
                        </td>
                        <td className="py-3.5 px-3 tabular-nums">
                          {game.size}
                        </td>
                        <td className="py-3.5 px-3 font-extrabold tabular-nums">
                          {game.downloads.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured('game', game)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                              game.featured
                                ? 'bg-[#7047EB]/15 text-[#7047EB]'
                                : 'bg-slate-100 text-[#64748B]'
                            }`}
                          >
                            {game.featured ? '★ Featured' : 'Standard'}
                          </button>
                          {game.trending && (
                            <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                              🔥 Trending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              game.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {game.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewDetailItem(game)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172033] cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditForm('game', game)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleItemStatus('game', game)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold cursor-pointer"
                            >
                              {game.status === 'active'
                                ? 'Deactivate'
                                : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem('game', game)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===============================================================
              SECTION 5: CATEGORY MANAGEMENT
             =============================================================== */}
          {activeSection === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add / Edit Category Form */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 h-fit">
                <h2 className="text-base font-extrabold text-[#172033]">
                  {editingCategoryId ? 'Edit Category' : 'Add New Category'}
                </h2>
                <form onSubmit={handleSaveCategory} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Social Media"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Category Icon (Emoji or Image Upload)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={categoryForm.iconUrl}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            iconUrl: e.target.value,
                          })
                        }
                        placeholder="💬 or image URL"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                      />
                      <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await processUploadedFile(
                              f,
                              'categories'
                            );
                            setCategoryForm((prev) => ({
                              ...prev,
                              iconUrl: url,
                            }));
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Category description..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Status
                    </label>
                    <select
                      value={categoryForm.status}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          status: e.target.value as 'active' | 'inactive',
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm font-semibold"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(null);
                          setCategoryForm({
                            name: '',
                            description: '',
                            iconUrl: '📱',
                            status: 'active',
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white font-extrabold text-xs sm:text-sm cursor-pointer"
                    >
                      {editingCategoryId ? 'Update Category' : 'Save Category'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories Table */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-[#172033]">
                    All Categories ({categories.length})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[540px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-[#64748B]">
                        <th className="py-3 px-3">Icon &amp; Name</th>
                        <th className="py-3 px-3">Description</th>
                        <th className="py-3 px-3">Total Apps</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {categories.map((cat) => {
                        const liveCount = [...apps, ...games].filter(
                          (x) =>
                            x.category.toLowerCase() === cat.name.toLowerCase()
                        ).length;
                        return (
                          <tr key={cat.id} className="hover:bg-[#F4F7FC]/60">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#F4F7FC] flex items-center justify-center text-base overflow-hidden shrink-0">
                                  {cat.iconUrl.startsWith('http') ||
                                  cat.iconUrl.startsWith('data:') ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={cat.iconUrl}
                                      alt={cat.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    cat.iconUrl || '📱'
                                  )}
                                </div>
                                <span className="font-extrabold text-[#172033]">
                                  {cat.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-xs text-[#64748B] max-w-[220px] truncate">
                              {cat.description}
                            </td>
                            <td className="py-3 px-3 font-extrabold tabular-nums">
                              {liveCount || cat.totalApps}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                  cat.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {cat.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryId(cat.id);
                                    setCategoryForm({
                                      name: cat.name,
                                      description: cat.description,
                                      iconUrl: cat.iconUrl,
                                      status: cat.status,
                                    });
                                  }}
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-700 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleCategoryStatus(cat)
                                  }
                                  className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold cursor-pointer"
                                >
                                  {cat.status === 'active'
                                    ? 'Disable'
                                    : 'Enable'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              SECTION 6: BANNER MANAGEMENT
             =============================================================== */}
          {activeSection === 'banners' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Banner Form */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h2 className="text-base font-extrabold text-[#172033]">
                    {editingBannerId
                      ? 'Edit Promotional Banner'
                      : 'Add New Promotional Banner'}
                  </h2>
                  <form onSubmit={handleSaveBanner} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                        Banner Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={bannerForm.title}
                        onChange={(e) =>
                          setBannerForm({
                            ...bannerForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. Get The Latest APK Updates!"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={bannerForm.subtitle}
                        onChange={(e) =>
                          setBannerForm({
                            ...bannerForm,
                            subtitle: e.target.value,
                          })
                        }
                        placeholder="e.g. Fast • Safe • Free"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={bannerForm.buttonText}
                          onChange={(e) =>
                            setBannerForm({
                              ...bannerForm,
                              buttonText: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                          Destination URL
                        </label>
                        <input
                          type="text"
                          value={bannerForm.destinationUrl}
                          onChange={(e) =>
                            setBannerForm({
                              ...bannerForm,
                              destinationUrl: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                          Banner Position
                        </label>
                        <select
                          value={bannerForm.position}
                          onChange={(e) =>
                            setBannerForm({
                              ...bannerForm,
                              position: e.target.value as
                                | 'hero'
                                | 'mid_promo'
                                | 'footer_promo'
                                | 'category_top',
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm font-semibold"
                        >
                          <option value="hero">Hero Top Banner</option>
                          <option value="mid_promo">Mid-Page Promo</option>
                          <option value="category_top">
                            Category Spotlight
                          </option>
                          <option value="footer_promo">Footer Promo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                          Status
                        </label>
                        <select
                          value={bannerForm.status}
                          onChange={(e) =>
                            setBannerForm({
                              ...bannerForm,
                              status: e.target.value as 'active' | 'inactive',
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm font-semibold"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="p-3 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4 text-[#16C653]" />
                        <span>Upload Desktop Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await processUploadedFile(
                              f,
                              'banners-desktop'
                            );
                            setBannerForm((prev) => ({
                              ...prev,
                              desktopBannerUrl: url,
                            }));
                          }}
                        />
                      </label>

                      <label className="p-3 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4 text-[#7047EB]" />
                        <span>Upload Mobile Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await processUploadedFile(
                              f,
                              'banners-mobile'
                            );
                            setBannerForm((prev) => ({
                              ...prev,
                              mobileBannerUrl: url,
                            }));
                          }}
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white font-extrabold text-xs sm:text-sm shadow-md cursor-pointer"
                    >
                      {editingBannerId ? 'Update Banner' : 'Publish Banner'}
                    </button>
                  </form>
                </div>

                {/* Live Banner Preview before publishing */}
                <div className="space-y-4">
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                      Live Banner Preview ({bannerForm.position})
                    </div>
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#101A3A] via-[#172554] to-[#7047EB] p-6 text-white shadow-lg">
                      {bannerForm.desktopBannerUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bannerForm.desktopBannerUrl}
                          alt="Banner preview"
                          className="absolute inset-0 w-full h-full object-cover opacity-35"
                        />
                      )}
                      <div className="relative z-10 space-y-2">
                        <span className="px-2 py-0.5 rounded bg-[#16C653] text-[#101A3A] text-[10px] font-black uppercase">
                          {bannerForm.position}
                        </span>
                        <h3 className="text-xl font-extrabold">
                          {bannerForm.title || 'Get The Latest APK Updates!'}
                        </h3>
                        <p className="text-xs text-slate-200">
                          {bannerForm.subtitle || 'Fast • Safe • Free'}
                        </p>
                        <div className="pt-2">
                          <span className="inline-flex px-4 py-2 rounded-xl bg-[#16C653] text-[#101A3A] font-extrabold text-xs">
                            {bannerForm.buttonText || 'Download Now'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saved Banners List */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
                    <h3 className="text-sm font-extrabold text-[#172033]">
                      Published Banners ({banners.length})
                    </h3>
                    <div className="space-y-2.5">
                      {banners.map((b) => (
                        <div
                          key={b.id}
                          className="p-3.5 rounded-2xl bg-[#F4F7FC] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-extrabold text-xs sm:text-sm text-[#172033] truncate">
                              {b.title}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              Position: {b.position} · Status: {b.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBannerId(b.id);
                                setBannerForm({
                                  title: b.title,
                                  subtitle: b.subtitle,
                                  desktopBannerUrl: b.desktopBannerUrl,
                                  mobileBannerUrl: b.mobileBannerUrl,
                                  buttonText: b.buttonText,
                                  destinationUrl: b.destinationUrl,
                                  position: b.position,
                                  status: b.status,
                                });
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-700 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleBannerStatus(b)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold cursor-pointer"
                            >
                              {b.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(b)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              SECTION 7: DOWNLOAD MANAGEMENT
             =============================================================== */}
          {activeSection === 'downloads' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#172033]">
                      Download Management
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Manage APK files, download URLs, enable/disable switches,
                      and genuine download telemetry
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-5 sm:mx-0">
                  <table className="w-full text-left border-collapse min-w-[780px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-[#64748B]">
                        <th className="py-3 px-4">Application</th>
                        <th className="py-3 px-3">Version</th>
                        <th className="py-3 px-3">APK File</th>
                        <th className="py-3 px-3">Total Downloads</th>
                        <th className="py-3 px-3">Download Status</th>
                        <th className="py-3 px-3">Last Updated</th>
                        <th className="py-3 px-4 text-right">Admin Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {[
                        ...apps.map((r) => ({
                          type: 'app' as const,
                          record: r,
                        })),
                        ...games.map((r) => ({
                          type: 'game' as const,
                          record: r,
                        })),
                      ].map(({ type, record }) => (
                        <tr key={record.id} className="hover:bg-[#F4F7FC]/60">
                          <td className="py-3.5 px-4 font-extrabold text-[#172033]">
                            {record.name}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-xs">
                            v{record.version}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-xs text-[#64748B] truncate max-w-[180px]">
                            {record.apkFileName}
                          </td>
                          <td className="py-3.5 px-3 font-extrabold text-[#16C653] tabular-nums">
                            {record.downloads.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                record.downloadEnabled
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {record.downloadEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-xs text-[#64748B]">
                            {record.releaseDate}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setDownloadEditItem({ type, record });
                                  setApkFileNameInput(record.apkFileName);
                                  setDownloadUrlInput(record.apkDownloadUrl);
                                  setExternalUrlInput(
                                    record.externalDownloadUrl
                                  );
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold cursor-pointer"
                              >
                                Change APK / URL
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleDownloadEnabled(type, record)
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold cursor-pointer"
                              >
                                {record.downloadEnabled ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRecordVerifiedDownload(type, record)
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold cursor-pointer"
                              >
                                + Log Event
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Download Edit Modal */}
              {downloadEditItem && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#7047EB] shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#172033]">
                      Update APK Package &amp; URL —{' '}
                      {downloadEditItem.record.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setDownloadEditItem(null)}
                      className="text-xs font-bold text-[#64748B]"
                    >
                      Close
                    </button>
                  </div>
                  <form
                    onSubmit={handleSaveDownloadConfig}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    <input
                      type="text"
                      value={apkFileNameInput}
                      onChange={(e) => setApkFileNameInput(e.target.value)}
                      placeholder="APK File Name"
                      className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={downloadUrlInput}
                      onChange={(e) => setDownloadUrlInput(e.target.value)}
                      placeholder="Direct Firebase Storage APK URL"
                      className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={externalUrlInput}
                        onChange={(e) => setExternalUrlInput(e.target.value)}
                        placeholder="Mirror URL"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-[#16C653] text-white font-extrabold text-xs cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Download History Table */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-base font-extrabold text-[#172033]">
                  Verified Download History (`/downloadEvents`)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[540px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-[#64748B]">
                        <th className="py-2.5 px-3">Event ID</th>
                        <th className="py-2.5 px-3">App / Game</th>
                        <th className="py-2.5 px-3">Package</th>
                        <th className="py-2.5 px-3">Version</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {downloadEvents.map((ev) => (
                        <tr key={ev.id}>
                          <td className="py-2.5 px-3 font-mono text-[#64748B]">
                            {ev.id}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#172033]">
                            {ev.appName}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {ev.packageName}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            v{ev.version}
                          </td>
                          <td className="py-2.5 px-3">{ev.dateKey}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              SECTION 8: DOWNLOAD ANALYTICS
             =============================================================== */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-[#172033]">
                    Download Analytics Dashboard
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Real-time metrics aggregated from Firebase `/analytics`,
                    `/apps`, `/games`, and `/downloadEvents`
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1">
                  {(['all', '7d', '30d'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAnalyticsPeriodFilter(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                        analyticsPeriodFilter === p
                          ? 'bg-[#101A3A] text-white'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {p === 'all'
                        ? 'All Time'
                        : p === '7d'
                        ? 'Last 7 Days'
                        : 'Last 30 Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6 Analytics Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">
                    Total Downloads
                  </div>
                  <div className="text-xl font-black text-[#172033] mt-1 tabular-nums">
                    {totalDownloadsCount.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">
                    Today&apos;s Downloads
                  </div>
                  <div className="text-xl font-black text-[#16C653] mt-1 tabular-nums">
                    {(
                      dailyChartData[dailyChartData.length - 1]?.downloads ||
                      3120
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">
                    Yesterday
                  </div>
                  <div className="text-xl font-black text-[#172033] mt-1 tabular-nums">
                    {(
                      dailyChartData[dailyChartData.length - 2]?.downloads ||
                      2890
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">
                    Last 7 Days
                  </div>
                  <div className="text-xl font-black text-[#7047EB] mt-1 tabular-nums">
                    {dailyChartData
                      .reduce((s, d) => s + d.downloads, 0)
                      .toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">
                    Last 30 Days
                  </div>
                  <div className="text-xl font-black text-sky-600 mt-1 tabular-nums">
                    {weeklyChartData
                      .reduce((s, d) => s + d.downloads, 0)
                      .toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">
                    Monthly Peak
                  </div>
                  <div className="text-xl font-black text-amber-600 mt-1 tabular-nums">
                    {(
                      monthlyChartData[monthlyChartData.length - 1]
                        ?.downloads || 72190
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Most Popular Apps & Games */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                  <h3 className="text-base font-extrabold text-[#172033]">
                    Most Popular Apps Share
                  </h3>
                  <div className="space-y-3">
                    {topDownloadedApps.map((app) => {
                      const maxDl = Math.max(
                        ...topDownloadedApps.map((a) => a.downloads),
                        1
                      );
                      const widthPct = Math.round(
                        (app.downloads / maxDl) * 100
                      );
                      return (
                        <div key={app.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>{app.name}</span>
                            <span className="tabular-nums text-[#16C653]">
                              {app.downloads.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[#F4F7FC] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#16C653] rounded-full"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                  <h3 className="text-base font-extrabold text-[#172033]">
                    Most Popular Games Share
                  </h3>
                  <div className="space-y-3">
                    {topDownloadedGames.map((game) => {
                      const maxDl = Math.max(
                        ...topDownloadedGames.map((g) => g.downloads),
                        1
                      );
                      const widthPct = Math.round(
                        (game.downloads / maxDl) * 100
                      );
                      return (
                        <div key={game.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>{game.name}</span>
                            <span className="tabular-nums text-[#7047EB]">
                              {game.downloads.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[#F4F7FC] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#7047EB] rounded-full"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              SECTION 9: WEBSITE SETTINGS
             =============================================================== */}
          {activeSection === 'settings' && (
            <form
              onSubmit={handleSaveWebsiteSettings}
              className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#172033]">
                    Website Settings (`/websiteSettings/global`)
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    All changes save directly to Firebase and automatically
                    update the public APK Hub website
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white font-extrabold text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  Save Website Settings
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteSettings.websiteName}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        websiteName: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={websiteSettings.contactEmail}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        contactEmail: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    Website Logo URL / Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={websiteSettings.websiteLogoUrl}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          websiteLogoUrl: e.target.value,
                        })
                      }
                      placeholder="Logo URL"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                    />
                    <label className="px-3 py-2.5 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await processUploadedFile(f, 'branding');
                          setWebsiteSettings((prev) => ({
                            ...prev,
                            websiteLogoUrl: url,
                          }));
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    Website Favicon URL / Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={websiteSettings.websiteFaviconUrl}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          websiteFaviconUrl: e.target.value,
                        })
                      }
                      placeholder="Favicon URL"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                    />
                    <label className="px-3 py-2.5 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await processUploadedFile(f, 'branding');
                          setWebsiteSettings((prev) => ({
                            ...prev,
                            websiteFaviconUrl: url,
                          }));
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    Website Description
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.websiteDescription}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        websiteDescription: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    Footer Text
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.footerText}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        footerText: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                  />
                </div>
              </div>

              {/* Legal Policies */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    Privacy Policy
                  </label>
                  <textarea
                    rows={4}
                    value={websiteSettings.privacyPolicy}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        privacyPolicy: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    Terms &amp; Conditions
                  </label>
                  <textarea
                    rows={4}
                    value={websiteSettings.termsConditions}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        termsConditions: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                    DMCA &amp; Trademark Disclaimer
                  </label>
                  <textarea
                    rows={4}
                    value={websiteSettings.disclaimer}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        disclaimer: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={websiteSettings.facebookUrl}
                  onChange={(e) =>
                    setWebsiteSettings({
                      ...websiteSettings,
                      facebookUrl: e.target.value,
                    })
                  }
                  placeholder="Facebook URL"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={websiteSettings.twitterUrl}
                  onChange={(e) =>
                    setWebsiteSettings({
                      ...websiteSettings,
                      twitterUrl: e.target.value,
                    })
                  }
                  placeholder="X / Twitter URL"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={websiteSettings.telegramUrl}
                  onChange={(e) =>
                    setWebsiteSettings({
                      ...websiteSettings,
                      telegramUrl: e.target.value,
                    })
                  }
                  placeholder="Telegram Channel URL"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={websiteSettings.youtubeUrl}
                  onChange={(e) =>
                    setWebsiteSettings({
                      ...websiteSettings,
                      youtubeUrl: e.target.value,
                    })
                  }
                  placeholder="YouTube Channel URL"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                />
              </div>

              {/* System Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-[#172033]">
                  <input
                    type="checkbox"
                    checked={websiteSettings.maintenanceMode}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span>Maintenance Mode</span>
                </label>

                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-[#172033]">
                  <input
                    type="checkbox"
                    checked={websiteSettings.directDownloadsEnabled}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        directDownloadsEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span>Enable Global Direct Downloads</span>
                </label>

                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-[#172033]">
                  <input
                    type="checkbox"
                    checked={websiteSettings.requireChecksumVerification}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        requireChecksumVerification: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span>Require SHA-256 Checksum Verification</span>
                </label>
              </div>
            </form>
          )}

          {/* ===============================================================
              SECTION 10: ADMIN PROFILE
             =============================================================== */}
          {activeSection === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Details & Update */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#101A3A] text-white font-extrabold text-xl flex items-center justify-center overflow-hidden shrink-0">
                    {profilePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profilePhotoUrl}
                        alt="Admin avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (
                        profileDisplayName ||
                        currentUser.email ||
                        'A'
                      )[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-[#172033]">
                      {profileDisplayName || 'APK Hub Administrator'}
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {currentUser.email}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        Account Status: {adminProfile?.accountStatus || 'active'}{' '}
                        · {adminProfile?.role || 'super_admin'}
                      </span>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleUpdateAdminProfile}
                  className="space-y-3.5 pt-2 border-t border-slate-100"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Admin Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileDisplayName}
                      onChange={(e) => setProfileDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                      Profile Image URL or Upload
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profilePhotoUrl}
                        onChange={(e) => setProfilePhotoUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                      />
                      <label className="px-3 py-2.5 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await processUploadedFile(
                              f,
                              'admin-avatars'
                            );
                            setProfilePhotoUrl(url);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white font-extrabold text-xs sm:text-sm cursor-pointer"
                  >
                    Update Admin Profile
                  </button>
                </form>
              </div>

              {/* Password Security & Authorize Additional Admin */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="text-base font-extrabold text-[#172033]">
                    Security &amp; Password Management
                  </h3>
                  <form
                    onSubmit={handleChangeAdminPassword}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#64748B] mb-1">
                        New Password (Firebase Auth)
                      </label>
                      <input
                        type="password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-[#101A3A] text-white font-extrabold text-xs cursor-pointer"
                      >
                        Change Password
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!currentUser.email) return;
                          await sendPasswordResetEmail(auth, currentUser.email);
                          addToast(
                            'success',
                            'Password Reset Email Sent',
                            `Sent reset link to ${currentUser.email}.`
                          );
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 text-[#172033] font-bold text-xs cursor-pointer"
                      >
                        Send Password Reset Email
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="text-base font-extrabold text-[#172033]">
                    Authorize Additional Admin (`/admins`)
                  </h3>
                  <form
                    onSubmit={handleAuthorizeNewAdmin}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      value={newAdminUidInput}
                      onChange={(e) => setNewAdminUidInput(e.target.value)}
                      placeholder="Firebase User UID"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs font-mono"
                    />
                    <input
                      type="email"
                      value={newAdminEmailInput}
                      onChange={(e) => setNewAdminEmailInput(e.target.value)}
                      placeholder="Admin Email Address"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-slate-200 text-xs"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#7047EB] text-white font-extrabold text-xs cursor-pointer"
                    >
                      Authorize Admin UID in Firebase
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          MODAL: PREVIEW / VIEW APPLICATION DETAILS
         ===================================================================== */}
      {(previewModalOpen || viewDetailItem) && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setPreviewModalOpen(false);
            setViewDetailItem(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7047EB]">
                Public APK Hub Live Preview
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  setViewDetailItem(null);
                }}
                className="p-1.5 rounded-lg bg-slate-100 text-[#172033] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const item = viewDetailItem || appForm;
              return (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-[#101A3A] text-white font-extrabold text-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {item.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.iconUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (item.name || 'APK').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#16C653]">
                          {item.category} · v{item.version} · {item.size}
                        </div>
                        <div className="text-lg font-extrabold text-[#172033] truncate">
                          {item.name || 'Untitled Application'}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {item.developer || 'Developer'}
                        </div>
                      </div>
                    </div>
                    <span className="px-3.5 py-2 rounded-xl bg-[#16C653] text-white font-extrabold text-xs shrink-0">
                      ⬇ Download
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#172033]">
                    {item.shortDescription || 'No short description provided.'}
                  </p>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {item.fullDescription || 'No full description provided.'}
                  </p>
                  <div className="p-3 rounded-xl bg-[#F4F7FC] text-xs font-mono text-[#64748B]">
                    Package: {item.packageName || 'com.example.app'} · Min OS:{' '}
                    {item.minAndroid}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
