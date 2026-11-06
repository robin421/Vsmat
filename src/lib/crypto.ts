/**
 * Native Web Crypto API (SubtleCrypto)
 * PBKDF2 (100,000 rounds) + AES-256-GCM authenticated encryption
 */

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
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

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(salt + password + 'vsmat-vault-salt-v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToBase64(hashBuffer);
}

async function getEncryptionKey(password: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = enc.encode(password);
  const saltBytes = base64ToBuffer(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(plainText: string, password: string, salt: string): Promise<string> {
  if (!plainText) return '';
  const key = await getEncryptionKey(password, salt);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const enc = new TextEncoder();
  const encodedData = enc.encode(plainText);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  return JSON.stringify({
    iv: bufferToBase64(iv),
    data: bufferToBase64(encryptedBuffer),
  });
}

export async function decryptText(cipherJson: string, password: string, salt: string): Promise<string> {
  if (!cipherJson) return '';
  try {
    const { iv, data } = JSON.parse(cipherJson);
    if (!iv || !data) return cipherJson; // Fallback if plain

    const key = await getEncryptionKey(password, salt);
    const ivBytes = base64ToBuffer(iv);
    const dataBytes = base64ToBuffer(data);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes as unknown as BufferSource,
      },
      key,
      dataBytes as unknown as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption failed, incorrect password or corrupted data', err);
    throw new Error('解密失败：主密码错误或密文损坏');
  }
}

export async function encryptObject<T>(obj: T, password: string, salt: string): Promise<string> {
  const json = JSON.stringify(obj);
  return await encryptText(json, password, salt);
}

export async function decryptObject<T>(cipherJson: string, password: string, salt: string): Promise<T> {
  const decrypted = await decryptText(cipherJson, password, salt);
  return JSON.parse(decrypted);
}
