import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppData } from '../src/types';

const KEY = 'vsmat_vault_storage_v1';
const PW = 'correct horse battery';

/** Fresh module instance = fresh in-memory session (like a page reload). */
async function load() {
  vi.resetModules();
  return import('../src/lib/storage');
}

function sample(mod: Awaited<ReturnType<typeof load>>, name = 'Svc'): AppData {
  const d = mod.createEmptyData();
  d.subscriptions.push({
    id: 's1', name, serviceKey: 'custom', category: 'ai', accountEmail: 'me@example.com', cycle: 'monthly',
    price: 5, currency: 'USD', nextBillingDate: '2027-01-01', autoRenew: true, history: [], createdAt: '2026-01-01', updatedAt: '2026-01-01',
  });
  return d;
}

beforeEach(async () => {
  localStorage.clear();
  await new Promise<void>((res) => { const r = indexedDB.deleteDatabase('vsmat_keystore'); r.onsuccess = r.onerror = () => res(); });
});

describe('vault lifecycle', () => {
  it('starts empty and writes nothing until setup', async () => {
    const s = await load();
    expect(await s.readVaultState()).toEqual({ kind: 'empty' });
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('setup encrypts everything (v2, 600k, no hash, no plaintext)', async () => {
    const s = await load();
    await s.setupVault(sample(s, 'TopSecretName'), PW, false);
    const raw = localStorage.getItem(KEY)!;
    const env = JSON.parse(raw);
    expect(env.v).toBe(2);
    expect(env.kdf.iterations).toBe(600_000);
    expect(env).not.toHaveProperty('hash');
    expect(raw).not.toContain('TopSecretName');
    expect(raw).not.toContain('me@example.com');
  });

  it('unlock: wrong password -> WrongPasswordError, right password -> data', async () => {
    const s1 = await load();
    await s1.setupVault(sample(s1, 'Alpha'), PW, false);
    const s2 = await load(); // "reload"
    expect((await s2.readVaultState()).kind).toBe('locked');
    await expect(s2.unlockVault('nope-nope-nope', false)).rejects.toMatchObject({ name: 'WrongPasswordError' });
    const data = await s2.unlockVault(PW, false);
    expect(data.subscriptions[0].name).toBe('Alpha');
  });

  it('remember=true resumes after reload; lockVault revokes it', async () => {
    const s1 = await load();
    await s1.setupVault(sample(s1, 'Beta'), PW, true);
    const s2 = await load();
    const st = await s2.readVaultState();
    expect(st.kind).toBe('unlocked');
    await s2.lockVault();
    const s3 = await load();
    expect((await s3.readVaultState()).kind).toBe('locked');
  });

  it('remember=false does not resume after reload', async () => {
    const s1 = await load();
    await s1.setupVault(sample(s1), PW, false);
    expect((await (await load()).readVaultState()).kind).toBe('locked');
  });

  it('serialises concurrent writes: the last update wins and nothing interleaves', async () => {
    const s = await load();
    await s.setupVault(s.createEmptyData(), PW, false);
    const writes: Promise<void>[] = [];
    for (let i = 0; i < 15; i++) {
      const d = sample(s, `rev-${i}`);
      writes.push(s.persistVault(d));
    }
    await Promise.all(writes);
    const s2 = await load();
    const data = await s2.unlockVault(PW, false);
    expect(data.subscriptions[0].name).toBe('rev-14');
  });

  it('persist fails loudly (and recovers) when locked', async () => {
    const s = await load();
    await expect(s.persistVault(s.createEmptyData())).rejects.toThrow();
    await s.setupVault(s.createEmptyData(), PW, false);
    await expect(s.persistVault(sample(s))).resolves.toBeUndefined();
  });

  it('migrates a legacy v1 vault (100k iterations + hash) on unlock', async () => {
    const { webcrypto } = await import('node:crypto');
    const subtle = webcrypto.subtle;
    const salt = webcrypto.getRandomValues(new Uint8Array(16));
    const base = await subtle.importKey('raw', new TextEncoder().encode('legacy-pass'), 'PBKDF2', false, ['deriveKey']);
    const k = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const s = await load();
    const plain = sample(s, 'Legacy');
    const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(JSON.stringify(plain))));
    const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
    localStorage.setItem(KEY, JSON.stringify({ isEncrypted: true, salt: b64(salt), hash: 'x', payload: JSON.stringify({ iv: b64(iv), data: b64(ct) }) }));

    const data = await s.unlockVault('legacy-pass', false);
    expect(data.subscriptions[0].name).toBe('Legacy');
    const env = JSON.parse(localStorage.getItem(KEY)!);
    expect(env.v).toBe(2);
    expect(env.kdf.iterations).toBe(600_000);
    expect(env.salt).not.toBe(b64(salt));
    expect(env).not.toHaveProperty('hash');
    // and it still opens with the same password afterwards
    expect((await (await load()).unlockVault('legacy-pass', false)).subscriptions[0].name).toBe('Legacy');
  });

  it('detects a legacy plaintext vault', async () => {
    const s = await load();
    localStorage.setItem(KEY, JSON.stringify(sample(s, 'Plain')));
    const st = await s.readVaultState();
    expect(st.kind).toBe('legacy-plain');
  });

  it('refuses to guess on corrupt storage', async () => {
    const s = await load();
    localStorage.setItem(KEY, '{not json');
    await expect(s.readVaultState()).rejects.toThrow();
  });
});

describe('normalizeAppData', () => {
  it('fills defaults and strips legacy settings fields', async () => {
    const s = await load();
    const out = s.normalizeAppData({
      tokens: [], subscriptions: [{ id: 'a' }],
      settings: { masterPasswordHash: 'x', salt: 'y', preferredCurrency: 'USD', usdToCnyRate: -3 },
    });
    expect(out.vouchers).toEqual([]);
    expect(out.subscriptions[0].history).toEqual([]);
    expect(out.settings).not.toHaveProperty('masterPasswordHash');
    expect(out.settings).not.toHaveProperty('salt');
    expect(out.settings.preferredCurrency).toBe('USD');
    expect(out.settings.usdToCnyRate).toBe(7.25);
  });

  it.each([null, [], 'x', { tokens: 1, subscriptions: [] }, { tokens: [1], subscriptions: [] }, { tokens: [], subscriptions: [], vouchers: 'no' }])(
    'rejects %j', async (bad) => {
      const s = await load();
      expect(() => s.normalizeAppData(bad)).toThrow();
    });
});

describe('backups', () => {
  it('probe/parse: same vault needs no password; other vault needs the backup password', async () => {
    const s1 = await load();
    await s1.setupVault(sample(s1, 'Exported'), PW, false);

    // capture the exported file text
    let text = '';
    const origBlob = globalThis.Blob;
    globalThis.Blob = class extends origBlob { constructor(parts: BlobPart[], o?: BlobPropertyBag) { super(parts, o); text = String(parts[0]); } } as typeof Blob;
    URL.createObjectURL = () => 'blob:x'; URL.revokeObjectURL = () => undefined;
    HTMLAnchorElement.prototype.click = () => undefined;
    await s1.exportBackup(sample(s1, 'Exported'));
    globalThis.Blob = origBlob;

    expect(text).not.toContain('Exported');
    expect(s1.probeBackup(text)).toEqual({ kind: 'encrypted', needsPassword: false });
    expect((await s1.parseBackup(text)).subscriptions[0].name).toBe('Exported');

    localStorage.clear();
    const s2 = await load();
    await s2.setupVault(s2.createEmptyData(), 'a totally different pass', false);
    expect(s2.probeBackup(text)).toEqual({ kind: 'encrypted', needsPassword: true });
    await expect(s2.parseBackup(text)).rejects.toMatchObject({ name: 'WrongPasswordError' });
    await expect(s2.parseBackup(text, 'wrong')).rejects.toMatchObject({ name: 'WrongPasswordError' });
    expect((await s2.parseBackup(text, PW)).subscriptions[0].name).toBe('Exported');
  });

  it('accepts legacy plaintext backups after validation, rejects garbage', async () => {
    const s = await load();
    const plain = JSON.stringify(sample(s, 'OldBackup'));
    expect(s.probeBackup(plain)).toEqual({ kind: 'plain' });
    expect((await s.parseBackup(plain)).subscriptions[0].name).toBe('OldBackup');
    expect(() => s.probeBackup('nope')).toThrow();
    expect(() => s.probeBackup(JSON.stringify({ tokens: [] }))).toThrow();
  });
});
