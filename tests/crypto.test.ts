import { describe, expect, it } from 'vitest';
import { WrongPasswordError, decryptWithKey, deriveKey, encryptWithKey, generateSalt } from '../src/lib/crypto';

describe('crypto', () => {
  const salt = generateSalt();

  it('round-trips text', async () => {
    const key = await deriveKey('correct horse battery', salt);
    const blob = await encryptWithKey('sk-secret-123', key);
    expect(blob.data).not.toContain('sk-secret');
    expect(await decryptWithKey(blob, key)).toBe('sk-secret-123');
  });

  it('rejects a wrong password with WrongPasswordError', async () => {
    const blob = await encryptWithKey('x', await deriveKey('right-password', salt));
    await expect(decryptWithKey(blob, await deriveKey('wrong-password', salt))).rejects.toBeInstanceOf(WrongPasswordError);
  });

  it('detects tampering (GCM authentication)', async () => {
    const key = await deriveKey('pw-for-tamper', salt);
    const blob = await encryptWithKey('hello world', key);
    const bytes = Uint8Array.from(atob(blob.data), (c) => c.charCodeAt(0));
    bytes[0] ^= 1;
    const tampered = { ...blob, data: btoa(String.fromCharCode(...bytes)) };
    await expect(decryptWithKey(tampered, key)).rejects.toBeInstanceOf(WrongPasswordError);
  });

  it('uses a fresh IV per encryption and non-extractable keys', async () => {
    const key = await deriveKey('pw', salt);
    const a = await encryptWithKey('same', key);
    const b = await encryptWithKey('same', key);
    expect(a.iv).not.toBe(b.iv);
    expect(a.data).not.toBe(b.data);
    expect(key.extractable).toBe(false);
  });

  it('rejects malformed ciphertext objects', async () => {
    const key = await deriveKey('pw', salt);
    await expect(decryptWithKey({} as never, key)).rejects.toBeInstanceOf(WrongPasswordError);
  });
});
