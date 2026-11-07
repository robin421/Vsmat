import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authenticateWithBiometrics,
  getBiometricsInfo,
  hasBiometricsEnrolled,
  isBiometricsSupported,
  registerBiometrics,
  removeBiometrics,
} from '../src/lib/biometrics';
import { deriveKey, generateSalt } from '../src/lib/crypto';

beforeEach(async () => {
  localStorage.clear();
  await new Promise<void>((res) => {
    const r = indexedDB.deleteDatabase('vsmat_keystore');
    r.onsuccess = r.onerror = () => res();
  });
  vi.restoreAllMocks();
});

describe('biometrics support and branding', () => {
  it('detects Apple Touch ID info on macOS user agent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' });
    const info = getBiometricsInfo();
    expect(info.isApple).toBe(true);
    expect(info.short).toContain('触控 ID');
    expect(info.name).toContain('Touch ID');
  });

  it('detects iPhone / iPad Face ID / Touch ID on iOS user agent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    const info = getBiometricsInfo();
    expect(info.isApple).toBe(true);
    expect(info.short).toContain('触控 / 面容 ID');
  });

  it('reports unsupported when PublicKeyCredential is not available', async () => {
    vi.stubGlobal('window', { isSecureContext: true });
    expect(await isBiometricsSupported()).toBe(false);
  });

  it('reports supported when platform authenticator is available', async () => {
    vi.stubGlobal('window', {
      isSecureContext: true,
      PublicKeyCredential: {
        isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
      },
    });
    expect(await isBiometricsSupported()).toBe(true);
  });
});

describe('biometrics registration and authentication flow', () => {
  const PW = 'test-master-password';

  async function mockWebAuthn() {
    const fakeRawId = new Uint8Array([10, 20, 30, 40, 50]).buffer;
    vi.stubGlobal('window', {
      isSecureContext: true,
      location: { hostname: 'localhost' },
      PublicKeyCredential: {
        isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
      },
    });

    const createMock = vi.fn().mockResolvedValue({
      id: 'mock-cred-id',
      rawId: fakeRawId,
      type: 'public-key',
    });

    const getMock = vi.fn().mockResolvedValue({
      id: 'mock-cred-id',
      type: 'public-key',
    });

    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      credentials: {
        create: createMock,
        get: getMock,
      },
    });

    return { createMock, getMock };
  }

  it('registers Touch ID and verifies successfully', async () => {
    const { createMock, getMock } = await mockWebAuthn();
    const salt = generateSalt();
    const key = await deriveKey(PW, salt, 1000);

    expect(await hasBiometricsEnrolled()).toBe(false);

    // Register
    const registered = await registerBiometrics(key, salt, 1000);
    expect(registered).toBe(true);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(await hasBiometricsEnrolled()).toBe(true);

    // Authenticate (Touch ID prompt)
    const session = await authenticateWithBiometrics(salt, 1000);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(session.salt).toBe(salt);
    expect(session.iterations).toBe(1000);
    expect(session.key).toBeInstanceOf(CryptoKey);
  });

  it('fails and removes biometric credential if salt changes (password changed)', async () => {
    await mockWebAuthn();
    const salt = generateSalt();
    const key = await deriveKey(PW, salt, 1000);

    await registerBiometrics(key, salt, 1000);
    expect(await hasBiometricsEnrolled()).toBe(true);

    // Master password changed -> new salt
    await expect(authenticateWithBiometrics('different-salt', 1000)).rejects.toThrow(
      /保险箱主密码已变更/
    );

    // Biometrics should be invalidated
    expect(await hasBiometricsEnrolled()).toBe(false);
  });

  it('can explicitly remove biometrics credential', async () => {
    await mockWebAuthn();
    const salt = generateSalt();
    const key = await deriveKey(PW, salt, 1000);

    await registerBiometrics(key, salt, 1000);
    expect(await hasBiometricsEnrolled()).toBe(true);

    await removeBiometrics();
    expect(await hasBiometricsEnrolled()).toBe(false);
  });
});
