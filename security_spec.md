# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Any path not explicitly matched is denied for all reads and writes (`match /{document=**} { allow read, write: if false; }`).
2. **Admin Authorization Invariant (`isAdmin()`)**:
   - Only authenticated users with a verified email matching the bootstrapped owner email (`skjiyaul842@gmail.com`) OR whose UID exists in `/admins/$(request.auth.uid)` are recognized as authorized administrators.
   - Public users cannot create or modify documents in `/admins`, `/adminProfiles`, `/apps`, `/games`, `/categories`, `/banners`, `/analytics`, or `/websiteSettings`.
3. **PII Isolation Invariant**:
   - `/admins/{adminUid}` and `/adminProfiles/{adminUid}` contain admin emails and account metadata. Reading (`get`, `list`) and writing are strictly restricted to `isAdmin()` or the owner (`request.auth.uid == adminUid` when bootstrapping).
4. **Public Website Read Sync Invariant**:
   - Public website clients can read active catalog collections (`/apps`, `/games`, `/categories`, `/banners`, `/websiteSettings`) so changes made in the Admin Panel immediately reflect on the public website, while writes (`create`, `update`, `delete`) are strictly restricted to `isAdmin()` with full schema and timestamp validation (`request.time`).
5. **Strict Schema, Size, and Temporal Integrity**:
   - Every string field enforces `.size() <= MAX`.
   - Every array field (`screenshotUrls`) enforces `.size() <= 6`.
   - All document IDs enforce `isValidId(id)` (`id.matches('^[a-zA-Z0-9_\\-]+$') && id.size() <= 128`).
   - All `createdAt` and `updatedAt` timestamps must equal `request.time`.

## 2. The "Dirty Dozen" Payloads (Designed to Fail with `PERMISSION_DENIED`)
1. **Unauthenticated Admin Write**: Anonymous client attempts `create` on `/apps/telegram` -> Denied (`!isAdmin()`).
2. **Unverified Email Spoof**: Authenticated user with `email == 'skjiyaul842@gmail.com'` but `email_verified == false` attempts `create` on `/apps/telegram` -> Denied (`email_verified != true`).
3. **Privilege Escalation (`/admins` Self-Promotion)**: Non-admin user attempts `setDoc('/admins/attackerUid', { uid: 'attackerUid', email: 'a@b.com', role: 'super_admin', createdAt: SERVER_TIMESTAMP })` -> Denied (`!isAdmin()`).
4. **PII Blanket Read on `/adminProfiles`**: Non-admin authenticated user attempts `get('/adminProfiles/otherAdminUid')` -> Denied (`!isAdmin()`).
5. **Shadow Field Injection on `/apps`**: Admin sends valid `ApkApp` payload plus extra ghost key `isHacked: true` -> Denied (`!incoming().keys().hasOnly(...)`).
6. **Value Poisoning on `/apps`**: Admin updates `name` with a 10,000-character string or numeric value -> Denied (`!isValidApkApp(incoming())`).
7. **Timestamp Forgery on `/apps` Create**: Admin sends `createdAt: Timestamp.fromMillis(1000)` instead of `request.time` -> Denied (`incoming().createdAt != request.time`).
8. **Immutable Field Mutation on `/apps` Update**: Admin attempts to mutate `createdAt` or `id` during `update` -> Denied (`incoming().createdAt != existing().createdAt`).
9. **Unbounded Array Attack on `/apps`**: Admin sends `screenshotUrls` with 25 elements -> Denied (`incoming().screenshotUrls.size() > 6`).
10. **ID Poisoning Attack**: Admin attempts to create `/categories/bad..id$$` or 200-char ID -> Denied (`!isValidId(categoryId)`).
11. **Invalid Enum on `/banners`**: Admin sends `status: 'published'` instead of `'active' | 'inactive'` -> Denied (`!(incoming().status in ['active', 'inactive'])`).
12. **Unauthorized Website Settings Tampering**: Non-admin authenticated user attempts `update` on `/websiteSettings/global` -> Denied (`!isAdmin()`).
