export const LEGACY_ORIGIN = 'https://vsmat.pages.dev';
export const NEW_ORIGIN = 'https://vsmat.aisubdeal.com';
export const STORAGE_KEY = 'vsmat_vault_storage_v1';
export const STORAGE_LANG_KEY = 'vsmat_lang';

export function isAllowedMigrationOrigin(origin: string): boolean {
  if (!origin) return false;
  if (origin === LEGACY_ORIGIN || origin === NEW_ORIGIN) return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  if (origin.endsWith('.pages.dev')) return true;
  return false;
}

export function isLegacyDomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.origin === LEGACY_ORIGIN;
}

export function isNewDomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.origin === NEW_ORIGIN;
}

export function hasLocalVault(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(
      (parsed.v === 2 && parsed.salt && parsed.payload) ||
      (parsed.isEncrypted === true && parsed.salt && parsed.payload)
    );
  } catch {
    return false;
  }
}

/**
 * Initiates export from the current domain (usually legacy domain) to target domain via client-side URL hash.
 * URL fragment hash (#) is strictly evaluated in the browser and never transmitted in HTTP headers.
 */
export function startMigrationToNewDomain(targetOrigin?: string): void {
  if (typeof window === 'undefined') return;
  const target = targetOrigin || NEW_ORIGIN;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.location.href = `${target}/?migration_empty=1`;
    return;
  }
  const lang = localStorage.getItem(STORAGE_LANG_KEY) || 'zh';
  const hash = new URLSearchParams({
    vsmat_migrate: raw,
    lang,
  }).toString();

  window.location.href = `${target}/#${hash}`;
}

/**
 * Initiates migration request from new domain to old domain to retrieve stored vault data.
 */
export function requestMigrationFromOldDomain(currentOrigin?: string): void {
  if (typeof window === 'undefined') return;
  const origin = currentOrigin || window.location.origin;
  window.location.href = `${LEGACY_ORIGIN}/?action=export_migrate&target=${encodeURIComponent(origin)}`;
}

export interface IncomingMigrationResult {
  migrated: boolean;
  error?: string;
}

/**
 * Inspects URL fragment hash on boot for incoming migrated vault data, writes to localStorage, and strips the hash.
 */
export function handleIncomingMigration(): IncomingMigrationResult {
  if (typeof window === 'undefined') return { migrated: false };
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!hash || !hash.includes('vsmat_migrate=')) {
    return { migrated: false };
  }

  try {
    const params = new URLSearchParams(hash);
    const rawVault = params.get('vsmat_migrate');
    const lang = params.get('lang');

    if (!rawVault) {
      return { migrated: false };
    }

    const parsed = JSON.parse(rawVault);
    const isValid = Boolean(
      (parsed.v === 2 && parsed.salt && parsed.payload) ||
      (parsed.isEncrypted === true && parsed.salt && parsed.payload)
    );

    if (!isValid) {
      return { migrated: false, error: 'Invalid vault envelope' };
    }

    localStorage.setItem(STORAGE_KEY, rawVault);
    if (lang && ['zh', 'en', 'ja', 'ko'].includes(lang)) {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    }

    // Clean hash from address bar immediately without reloading
    const cleanUrl = window.location.pathname + window.location.search;
    window.history.replaceState(null, '', cleanUrl);

    return { migrated: true };
  } catch (err) {
    return { migrated: false, error: err instanceof Error ? err.message : 'Migration failed' };
  }
}

/**
 * Handles automatic redirect if current page is opened with ?action=export_migrate.
 */
export function handleOutgoingAutoMigration(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.location.search) return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('action') !== 'export_migrate') return false;

  const rawTarget = params.get('target');
  let target = NEW_ORIGIN;
  if (rawTarget) {
    try {
      const url = new URL(rawTarget);
      if (isAllowedMigrationOrigin(url.origin)) {
        target = url.origin;
      }
    } catch {
      target = NEW_ORIGIN;
    }
  }

  startMigrationToNewDomain(target);
  return true;
}
