import { AppData, AppSettings } from '../types';
import {
  CURRENT_KDF_ITERATIONS,
  LEGACY_KDF_ITERATIONS,
  CipherBlob,
  WrongPasswordError,
  decryptWithKey,
  deriveKey,
  encryptWithKey,
  generateSalt,
} from './crypto';
import { addMonthsClamped, formatLocalDate, parseLocalDate } from './date';

const STORAGE_KEY = 'vsmat_vault_storage_v1';
const KEY_DB_NAME = 'vsmat_keystore';
const KEY_STORE = 'keys';
const KEY_RECORD_ID = 'vault-key';

export const EMPTY_DATA: AppData = {
  settings: {
    isConfigured: false,
    rememberUnlocked: true,
    enableBrowserNotifications: true,
    preferredCurrency: 'CNY',
    usdToCnyRate: 7.25,
    autoLockMinutes: 30,
  },
  tokens: [],
  subscriptions: [],
  vouchers: [],
};

export function createEmptyData(): AppData {
  return structuredClone(EMPTY_DATA);
}

/* ------------------------------------------------------------------ */
/* Storage formats                                                    */
/* ------------------------------------------------------------------ */

/** v2: everything (including settings) is inside the encrypted payload. */
interface VaultEnvelopeV2 {
  v: 2;
  kdf: { name: 'PBKDF2'; hash: 'SHA-256'; iterations: number };
  salt: string;
  payload: CipherBlob;
}

/** v1 (legacy): `payload` is a JSON string of CipherBlob, plus a password hash. */
interface VaultEnvelopeV1 {
  isEncrypted: true;
  salt: string;
  hash?: string;
  payload: string;
}

export type VaultState =
  /** Nothing stored yet: a new vault must be created. */
  | { kind: 'empty' }
  /** Old unencrypted vault found: user must set a password to encrypt it. */
  | { kind: 'legacy-plain'; data: AppData }
  /** Encrypted vault present, key not available. */
  | { kind: 'locked' }
  /** Encrypted vault present and unlocked via a remembered key. */
  | { kind: 'unlocked'; data: AppData };

interface Session {
  key: CryptoKey;
  salt: string;
  iterations: number;
}

/** Key lives in memory only; it is never written to sessionStorage/localStorage. */
let session: Session | null = null;

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Validate and normalise untrusted data (imported file / decrypted payload).
 * Fills missing optional collections/settings so the UI can't crash on them,
 * and drops legacy fields that must not be persisted any more.
 */
export function normalizeAppData(input: unknown): AppData {
  if (!isObj(input) || !Array.isArray(input.tokens) || !Array.isArray(input.subscriptions)) {
    throw new Error('备份文件格式不正确：缺少 tokens / subscriptions');
  }
  const vouchers = input.vouchers === undefined ? [] : input.vouchers;
  if (!Array.isArray(vouchers)) throw new Error('备份文件格式不正确：vouchers 不是数组');

  const arrOfObjects = (name: string, arr: unknown[]) => {
    if (!arr.every(isObj)) throw new Error(`备份文件格式不正确：${name} 含有非法条目`);
  };
  arrOfObjects('tokens', input.tokens);
  arrOfObjects('subscriptions', input.subscriptions);
  arrOfObjects('vouchers', vouchers);

  const s = isObj(input.settings) ? input.settings : {};
  const base = EMPTY_DATA.settings;
  const settings: AppSettings = {
    isConfigured: true,
    rememberUnlocked: typeof s.rememberUnlocked === 'boolean' ? s.rememberUnlocked : base.rememberUnlocked,
    enableBrowserNotifications:
      typeof s.enableBrowserNotifications === 'boolean' ? s.enableBrowserNotifications : base.enableBrowserNotifications,
    preferredCurrency: s.preferredCurrency === 'USD' ? 'USD' : 'CNY',
    usdToCnyRate:
      typeof s.usdToCnyRate === 'number' && Number.isFinite(s.usdToCnyRate) && s.usdToCnyRate > 0
        ? s.usdToCnyRate
        : base.usdToCnyRate,
    autoLockMinutes:
      typeof s.autoLockMinutes === 'number' && Number.isFinite(s.autoLockMinutes) && s.autoLockMinutes >= 0
        ? s.autoLockMinutes
        : base.autoLockMinutes,
  };

  return {
    tokens: input.tokens as AppData['tokens'],
    subscriptions: (input.subscriptions as AppData['subscriptions']).map((sub) => ({
      ...sub,
      history: Array.isArray(sub.history) ? sub.history : [],
    })),
    vouchers: vouchers as AppData['vouchers'],
    settings,
  };
}

/* ------------------------------------------------------------------ */
/* "Remember on this device": non-extractable CryptoKey in IndexedDB   */
/* ------------------------------------------------------------------ */

function openKeyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(KEY_DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(KEY_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbRun<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openKeyDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(KEY_STORE, mode);
      const req = fn(tx.objectStore(KEY_STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function rememberKey(s: Session): Promise<void> {
  try {
    await idbRun('readwrite', (st) => st.put({ key: s.key, salt: s.salt, iterations: s.iterations }, KEY_RECORD_ID));
  } catch (err) {
    console.warn('Could not persist unlock key; vault will lock on reload.', err);
  }
}

async function forgetKey(): Promise<void> {
  try {
    await idbRun('readwrite', (st) => st.delete(KEY_RECORD_ID));
  } catch {
    /* nothing to forget */
  }
}

async function loadRememberedKey(): Promise<Session | null> {
  try {
    const rec = await idbRun<unknown>('readonly', (st) => st.get(KEY_RECORD_ID));
    if (isObj(rec) && rec.key instanceof CryptoKey && typeof rec.salt === 'string' && typeof rec.iterations === 'number') {
      return { key: rec.key, salt: rec.salt, iterations: rec.iterations };
    }
  } catch {
    /* IndexedDB unavailable */
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Reading                                                            */
/* ------------------------------------------------------------------ */

function readRaw(): unknown {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('本地保险箱数据已损坏，无法解析');
  }
}

function isV2(p: unknown): p is VaultEnvelopeV2 {
  return isObj(p) && p.v === 2 && isObj(p.kdf) && typeof p.salt === 'string' && isObj(p.payload);
}

function isV1(p: unknown): p is VaultEnvelopeV1 {
  return isObj(p) && p.isEncrypted === true && typeof p.salt === 'string' && typeof p.payload === 'string';
}

async function decryptEnvelope(env: VaultEnvelopeV2 | VaultEnvelopeV1, key: CryptoKey): Promise<AppData> {
  const blob: CipherBlob = isV2(env) ? env.payload : JSON.parse(env.payload);
  const json = await decryptWithKey(blob, key);
  return normalizeAppData(JSON.parse(json));
}

/**
 * Inspect storage and try to resume with a remembered key.
 * Never returns decrypted data unless a valid remembered key exists.
 */
export async function readVaultState(): Promise<VaultState> {
  const parsed = readRaw();
  if (parsed === null) return { kind: 'empty' };

  if (isV2(parsed) || isV1(parsed)) {
    const remembered = await loadRememberedKey();
    // Only v2 vaults can be resumed; a remembered key is bound to the current salt.
    if (remembered && isV2(parsed) && remembered.salt === parsed.salt && remembered.iterations === parsed.kdf.iterations) {
      try {
        const data = await decryptEnvelope(parsed, remembered.key);
        session = remembered;
        return { kind: 'unlocked', data };
      } catch {
        await forgetKey();
      }
    }
    return { kind: 'locked' };
  }

  // Pre-encryption data written by older versions.
  try {
    return { kind: 'legacy-plain', data: normalizeAppData(parsed) };
  } catch {
    throw new Error('本地保险箱数据格式无法识别');
  }
}

/* ------------------------------------------------------------------ */
/* Writing (serialised so concurrent updates cannot interleave)       */
/* ------------------------------------------------------------------ */

let writeQueue: Promise<void> = Promise.resolve();

async function writeEnvelope(data: AppData, s: Session): Promise<void> {
  const payload = await encryptWithKey(JSON.stringify(data), s.key);
  const envelope: VaultEnvelopeV2 = {
    v: 2,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: s.iterations },
    salt: s.salt,
    payload,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

/** Encrypt and persist. Resolves when this snapshot (and all earlier ones) are written. */
export function persistVault(data: AppData): Promise<void> {
  const snapshot = structuredClone(data); // later mutations can't leak into a queued write
  const run = writeQueue.then(async () => {
    if (!session) throw new Error('保险箱已锁定，无法保存');
    await writeEnvelope(snapshot, session);
  });
  writeQueue = run.catch(() => undefined); // keep the chain alive after a failure
  return run;
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                          */
/* ------------------------------------------------------------------ */

async function newSession(password: string): Promise<Session> {
  const salt = generateSalt();
  const key = await deriveKey(password, salt, CURRENT_KDF_ITERATIONS);
  return { key, salt, iterations: CURRENT_KDF_ITERATIONS };
}

/** Create (or re-encrypt) the vault under a new master password. */
export async function setupVault(data: AppData, password: string, remember: boolean): Promise<AppData> {
  const next: AppData = { ...data, settings: { ...data.settings, isConfigured: true, rememberUnlocked: remember } };
  const s = await newSession(password);
  await writeEnvelope(next, s);
  session = s;
  if (remember) await rememberKey(s);
  else await forgetKey();
  return next;
}

/** Unlock with the master password. Throws WrongPasswordError on a bad password. */
export async function unlockVault(password: string, remember: boolean): Promise<AppData> {
  const parsed = readRaw();
  if (!isV2(parsed) && !isV1(parsed)) throw new Error('未找到加密的保险箱数据');

  const iterations = isV2(parsed) ? parsed.kdf.iterations : LEGACY_KDF_ITERATIONS;
  const key = await deriveKey(password, parsed.salt, iterations);
  const data = await decryptEnvelope(parsed, key); // throws WrongPasswordError

  if (isV2(parsed) && iterations >= CURRENT_KDF_ITERATIONS) {
    session = { key, salt: parsed.salt, iterations };
  } else {
    // Migrate legacy / weaker vaults: fresh salt + current work factor.
    session = await newSession(password);
    await writeEnvelope(data, session);
  }
  data.settings.rememberUnlocked = remember;
  if (remember) await rememberKey(session);
  else await forgetKey();
  return data;
}

/** Drop the key from memory and from IndexedDB. */
export async function lockVault(): Promise<void> {
  session = null;
  await forgetKey();
}

export function hasActiveSession(): boolean {
  return session !== null;
}

/* ------------------------------------------------------------------ */
/* Backups                                                            */
/* ------------------------------------------------------------------ */

const BACKUP_FORMAT = 'vsmat-backup';

interface BackupFileV2 {
  format: typeof BACKUP_FORMAT;
  v: 2;
  kdf: VaultEnvelopeV2['kdf'];
  salt: string;
  payload: CipherBlob;
}

/**
 * Export an encrypted backup. It is encrypted under the vault's own key, so it
 * opens with the current master password and never contains plaintext secrets.
 */
export async function exportBackup(data: AppData, filename?: string): Promise<void> {
  if (!session) throw new Error('保险箱已锁定，无法导出');
  const backup: BackupFileV2 = {
    format: BACKUP_FORMAT,
    v: 2,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: session.iterations },
    salt: session.salt,
    payload: await encryptWithKey(JSON.stringify(data), session.key),
  };
  const name = filename ?? `vsmat-backup-${new Date().toLocaleDateString('sv-SE')}.vsmat.json`;
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type BackupProbe =
  | { kind: 'encrypted'; needsPassword: boolean }
  | { kind: 'plain' };

function parseBackupText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('解析备份文件失败：不是有效的 JSON');
  }
}

function isBackupV2(p: unknown): p is BackupFileV2 {
  return isObj(p) && p.format === BACKUP_FORMAT && p.v === 2 && isObj(p.kdf) && typeof p.salt === 'string' && isObj(p.payload);
}

/** Identify a backup file without decrypting it. */
export function probeBackup(text: string): BackupProbe {
  const parsed = parseBackupText(text);
  if (isBackupV2(parsed)) {
    // Same salt as the open vault => same key, no password prompt needed.
    return { kind: 'encrypted', needsPassword: !session || session.salt !== parsed.salt };
  }
  normalizeAppData(parsed); // throws a descriptive error if it is neither format
  return { kind: 'plain' };
}

/**
 * Parse + validate a backup. Nothing is applied here; the caller decides
 * whether to replace the current vault after confirming with the user.
 */
export async function parseBackup(text: string, password?: string): Promise<AppData> {
  const parsed = parseBackupText(text);
  if (!isBackupV2(parsed)) return normalizeAppData(parsed);

  let key: CryptoKey;
  if (session && session.salt === parsed.salt && session.iterations === parsed.kdf.iterations) {
    key = session.key;
  } else {
    if (!password) throw new WrongPasswordError();
    key = await deriveKey(password, parsed.salt, parsed.kdf.iterations);
  }
  return normalizeAppData(JSON.parse(await decryptWithKey(parsed.payload, key)));
}

/**
 * Advance next billing date based on billing cycle when user clicks "我已续费"
 */
export function advanceBillingDate(currentDateStr: string, cycle: string): string {
  if (cycle === 'lifetime') return currentDateStr; // one-off purchase, nothing to renew
  const base = parseLocalDate(currentDateStr) ?? new Date();
  switch (cycle) {
    case 'quarterly':
      return formatLocalDate(addMonthsClamped(base, 3));
    case 'semi-annually':
      return formatLocalDate(addMonthsClamped(base, 6));
    case 'annually':
      return formatLocalDate(addMonthsClamped(base, 12));
    case 'monthly':
    default:
      return formatLocalDate(addMonthsClamped(base, 1));
  }
}
