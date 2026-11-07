import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  isAllowedMigrationOrigin,
  hasLocalVault,
  handleIncomingMigration,
  startMigrationToNewDomain,
  STORAGE_KEY,
  STORAGE_LANG_KEY,
  NEW_ORIGIN,
  LEGACY_ORIGIN,
} from '../src/lib/migration';

const sampleEnvelopeV2 = {
  v: 2,
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: 100000 },
  salt: 'c2FsdA==',
  payload: { iv: 'aXY=', data: 'ZW5jcnlwdGVk' },
};

describe('migration origin security whitelist', () => {
  it('allows trusted origins and local development hosts', () => {
    expect(isAllowedMigrationOrigin(LEGACY_ORIGIN)).toBe(true);
    expect(isAllowedMigrationOrigin(NEW_ORIGIN)).toBe(true);
    expect(isAllowedMigrationOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedMigrationOrigin('http://127.0.0.1:3000')).toBe(true);
    expect(isAllowedMigrationOrigin('https://preview-123.pages.dev')).toBe(true);
  });

  it('rejects untrusted third-party origins', () => {
    expect(isAllowedMigrationOrigin('https://malicious-site.com')).toBe(false);
    expect(isAllowedMigrationOrigin('https://evil-pages.dev.attacker.com')).toBe(false);
    expect(isAllowedMigrationOrigin('')).toBe(false);
  });
});

describe('hasLocalVault check', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false when storage is empty or corrupted', () => {
    expect(hasLocalVault()).toBe(false);
    localStorage.setItem(STORAGE_KEY, '{invalid json');
    expect(hasLocalVault()).toBe(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2 }));
    expect(hasLocalVault()).toBe(false);
  });

  it('returns true when valid v2 envelope exists', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEnvelopeV2));
    expect(hasLocalVault()).toBe(true);
  });
});

describe('handleIncomingMigration', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('does nothing when hash does not contain vsmat_migrate', () => {
    window.location.hash = '#some-other-hash';
    const result = handleIncomingMigration();
    expect(result.migrated).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('successfully unpacks vault envelope and language from hash', () => {
    const rawVault = JSON.stringify(sampleEnvelopeV2);
    const hash = new URLSearchParams({
      vsmat_migrate: rawVault,
      lang: 'ja',
    }).toString();
    window.location.hash = `#${hash}`;

    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    const result = handleIncomingMigration();
    expect(result.migrated).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(rawVault);
    expect(localStorage.getItem(STORAGE_LANG_KEY)).toBe('ja');
    expect(replaceSpy).toHaveBeenCalled();
  });

  it('fails gracefully on invalid JSON in hash', () => {
    window.location.hash = '#vsmat_migrate=%7Binvalid';
    const result = handleIncomingMigration();
    expect(result.migrated).toBe(false);
    expect(result.error).toBeDefined();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('startMigrationToNewDomain', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('redirects with fragment hash when local vault exists', () => {
    const rawVault = JSON.stringify(sampleEnvelopeV2);
    localStorage.setItem(STORAGE_KEY, rawVault);
    localStorage.setItem(STORAGE_LANG_KEY, 'ko');

    const deleteLocation = vi.fn();
    delete (window as unknown as { location?: unknown }).location;
    window.location = { href: '', origin: LEGACY_ORIGIN } as unknown as Location;

    startMigrationToNewDomain('https://vsmat.aisubdeal.com');
    expect(window.location.href).toContain('https://vsmat.aisubdeal.com/#vsmat_migrate=');
    expect(window.location.href).toContain('lang=ko');
  });

  it('redirects with migration_empty=1 when local vault is empty', () => {
    delete (window as unknown as { location?: unknown }).location;
    window.location = { href: '', origin: LEGACY_ORIGIN } as unknown as Location;

    startMigrationToNewDomain('https://vsmat.aisubdeal.com');
    expect(window.location.href).toBe('https://vsmat.aisubdeal.com/?migration_empty=1');
  });
});
