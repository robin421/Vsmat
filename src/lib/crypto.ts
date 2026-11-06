/**
 * Native Web Crypto API (SubtleCrypto)
 * PBKDF2-SHA256 + AES-256-GCM authenticated encryption.
 *
 * The master password is only used to derive a non-extractable AES-GCM key.
 * Correctness of the password is established by whether GCM authentication
 * succeeds — there is no separate (brute-forceable) password hash.
 */

/** Current PBKDF2 work factor (OWASP 2023 guidance for PBKDF2-HMAC-SHA256). */
export const CURRENT_KDF_ITERATIONS = 600_000;
/** Work factor used by vault format v1 (kept only to read old vaults). */
export const LEGACY_KDF_ITERATIONS = 100_000;

export class WrongPasswordError extends Error {
  constructor() {
    super('解密失败：主密码错误或密文损坏');
    this.name = 'WrongPasswordError';
  }
}

export interface CipherBlob {
  iv: string;
  data: string;
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return bufferToBase64(array);
}

/** Derive a non-extractable AES-256-GCM key from the master password. */
export async function deriveKey(
  password: string,
  salt: string,
  iterations: number = CURRENT_KDF_ITERATIONS
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: base64ToBuffer(salt), iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptWithKey(plainText: string, key: CryptoKey): Promise<CipherBlob> {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plainText)
  );
  return { iv: bufferToBase64(iv), data: bufferToBase64(encrypted) };
}

export async function decryptWithKey(blob: CipherBlob, key: CryptoKey): Promise<string> {
  if (!blob || typeof blob.iv !== 'string' || typeof blob.data !== 'string') {
    throw new WrongPasswordError();
  }
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBuffer(blob.iv) },
      key,
      base64ToBuffer(blob.data)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new WrongPasswordError();
  }
}
