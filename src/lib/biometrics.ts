/**
 * Apple Touch ID / Face ID & Platform Biometrics WebAuthn module.
 *
 * Provides hardware-backed biometric unlock via W3C Web Authentication API
 * bound to local non-extractable WebCrypto keys in IndexedDB.
 */

const KEY_DB_NAME = 'vsmat_keystore';
const KEY_STORE = 'keys';
const BIOMETRIC_RECORD_ID = 'biometric_credential';

export interface BiometricRecord {
  credentialId: string;
  key: CryptoKey;
  salt: string;
  iterations: number;
  enrolledAt: string;
  deviceLabel: string;
}

export interface BiometricInfo {
  isApple: boolean;
  name: string;
  short: string;
  description: string;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64ToBuffer(base64: string): Uint8Array {
  const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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

/** Detect whether platform authenticator (Apple Touch ID / Face ID) is supported. */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.isSecureContext) return false;
  if (!('PublicKeyCredential' in window) || !window.PublicKeyCredential) return false;
  if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') return false;

  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/** Get localized system biometric branding details (Apple Touch ID, Face ID, Windows Hello). */
export function getBiometricsInfo(): BiometricInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isApple = /Macintosh|Mac OS X|iPhone|iPad|iPod/.test(ua);
  const isIos = /iPhone|iPad|iPod/.test(ua);
  const isWindows = /Windows/.test(ua);

  if (isApple) {
    if (isIos) {
      return {
        isApple: true,
        name: '面容 ID / 触控 ID (Face ID / Touch ID)',
        short: '触控 / 面容 ID',
        description: '使用 Apple 面容 ID 或触控 ID 快速解锁保险箱',
      };
    }
    return {
      isApple: true,
      name: '触控 ID (Touch ID)',
      short: '触控 ID (Touch ID)',
      description: '轻触 Mac 键盘右上角触控 ID 即可秒速解锁保险箱',
    };
  }

  if (isWindows) {
    return {
      isApple: false,
      name: 'Windows Hello',
      short: 'Windows Hello',
      description: '使用 Windows Hello 指纹或面部识别快速解锁保险箱',
    };
  }

  return {
    isApple: false,
    name: '生物识别 (指纹 / 面部)',
    short: '指纹 / 生物识别',
    description: '使用本机硬件指纹或生物特征快速解锁保险箱',
  };
}

/** Check if a biometric credential is currently stored for this vault. */
export async function hasBiometricsEnrolled(): Promise<boolean> {
  try {
    const rec = await idbRun<unknown>('readonly', (st) => st.get(BIOMETRIC_RECORD_ID));
    if (
      typeof rec === 'object' &&
      rec !== null &&
      'key' in rec &&
      (rec as BiometricRecord).key instanceof CryptoKey &&
      typeof (rec as BiometricRecord).credentialId === 'string'
    ) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Load current biometric record if present. */
export async function loadBiometricRecord(): Promise<BiometricRecord | null> {
  try {
    const rec = await idbRun<unknown>('readonly', (st) => st.get(BIOMETRIC_RECORD_ID));
    if (
      typeof rec === 'object' &&
      rec !== null &&
      'key' in rec &&
      (rec as BiometricRecord).key instanceof CryptoKey &&
      typeof (rec as BiometricRecord).credentialId === 'string'
    ) {
      return rec as BiometricRecord;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Register Apple Touch ID / Platform biometric credential.
 * Requires user to touch Touch ID to complete registration.
 */
export async function registerBiometrics(
  key: CryptoKey,
  salt: string,
  iterations: number
): Promise<boolean> {
  const supported = await isBiometricsSupported();
  if (!supported) throw new Error('当前设备或浏览器不支持触控 ID / 硬件生物识别');

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const rpId = window.location.hostname === '127.0.0.1' ? undefined : window.location.hostname;

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Vsmat Vault', id: rpId },
      user: {
        id: userId,
        name: 'vsmat-vault',
        displayName: 'Vsmat Vault Local User',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('未创建有效的生物识别凭证');
  }

  const credentialId = bufferToBase64(credential.rawId);
  const info = getBiometricsInfo();

  const record: BiometricRecord = {
    credentialId,
    key,
    salt,
    iterations,
    enrolledAt: new Date().toISOString(),
    deviceLabel: info.short,
  };

  await idbRun('readwrite', (st) => st.put(record, BIOMETRIC_RECORD_ID));
  return true;
}

/**
 * Authenticate with Apple Touch ID / Platform Biometrics.
 * Triggers native system fingerprint prompt. On success, returns unlocked session key.
 */
export async function authenticateWithBiometrics(
  expectedSalt: string,
  expectedIterations: number
): Promise<{ key: CryptoKey; salt: string; iterations: number }> {
  const record = await loadBiometricRecord();
  if (!record) {
    throw new Error('未配置触控 ID 或生物识别凭证');
  }

  if (record.salt !== expectedSalt || record.iterations !== expectedIterations) {
    await removeBiometrics();
    throw new Error('保险箱主密码已变更，请使用新主密码解锁后重新启用触控 ID');
  }

  const credentialIdBytes = base64ToBuffer(record.credentialId);
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const rpId = window.location.hostname === '127.0.0.1' ? undefined : window.location.hostname;

  // This prompts the native Touch ID / Face ID / Windows Hello system dialog
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId,
      allowCredentials: [
        {
          id: credentialIdBytes,
          type: 'public-key',
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    },
  });

  if (!assertion) {
    throw new Error('触控 ID 验证未完成');
  }

  return {
    key: record.key,
    salt: record.salt,
    iterations: record.iterations,
  };
}

/** Update the stored key when vault re-encrypts or master password changes. */
export async function updateBiometricsSession(
  key: CryptoKey,
  salt: string,
  iterations: number
): Promise<void> {
  const existing = await loadBiometricRecord();
  if (!existing) return;

  const updated: BiometricRecord = {
    ...existing,
    key,
    salt,
    iterations,
  };
  await idbRun('readwrite', (st) => st.put(updated, BIOMETRIC_RECORD_ID));
}

/** Remove biometric credential and key from keystore. */
export async function removeBiometrics(): Promise<void> {
  try {
    await idbRun('readwrite', (st) => st.delete(BIOMETRIC_RECORD_ID));
  } catch {
    /* nothing to delete */
  }
}
