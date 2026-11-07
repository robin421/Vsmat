import { useCallback, useEffect, useRef, useState } from 'react';
import { AppData } from '../types';
import {
  createEmptyData,
  changeMasterPassword,
  hasBiometricsConfigured,
  lockVault,
  persistVault,
  readVaultState,
  setBiometricsEnabled,
  setRememberUnlocked,
  setupVault,
  unlockVault,
  unlockVaultWithBiometrics,
} from '../lib/storage';
import {
  getBiometricsInfo,
  isBiometricsSupported as checkBiometricsSupported,
} from '../lib/biometrics';
import { WrongPasswordError } from '../lib/crypto';

export type VaultStatus = 'loading' | 'setup' | 'locked' | 'ready';

type Updater = AppData | ((prev: AppData) => AppData);

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

/**
 * Owns vault lifecycle: load, set up, unlock, lock (manual + idle), and
 * serialised encrypted persistence. All mutations go through `update`, which
 * always applies to the latest data, so rapid consecutive actions can't
 * overwrite one another with stale state.
 */
export function useVault() {
  const [data, setData] = useState<AppData>(createEmptyData);
  const [status, setStatus] = useState<VaultStatus>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isBiometricsSupported, setIsBiometricsSupported] = useState(false);
  const [isBiometricsEnrolled, setIsBiometricsEnrolled] = useState(false);
  const dataRef = useRef<AppData>(data);
  const statusRef = useRef<VaultStatus>('loading');

  const biometricsInfo = getBiometricsInfo();

  useEffect(() => {
    checkBiometricsSupported().then(setIsBiometricsSupported);
    hasBiometricsConfigured().then(setIsBiometricsEnrolled);
  }, [status]);

  const applyStatus = useCallback((s: VaultStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const applyData = useCallback((d: AppData) => {
    dataRef.current = d;
    setData(d);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const state = await readVaultState();
        if (cancelled) return;
        switch (state.kind) {
          case 'empty':
            applyData(createEmptyData());
            applyStatus('setup');
            break;
          case 'legacy-plain':
            applyData(state.data);
            applyStatus('setup');
            break;
          case 'locked':
            applyData(createEmptyData());
            applyStatus('locked');
            break;
          case 'unlocked':
            applyData(state.data);
            applyStatus('ready');
            break;
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to init vault:', err);
        setLoadError(err instanceof Error ? err.message : '加载保险箱失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyData, applyStatus]);

  const update = useCallback(
    (updater: Updater) => {
      if (statusRef.current !== 'ready') return;
      const next = typeof updater === 'function' ? updater(dataRef.current) : updater;
      applyData(next);
      persistVault(next).then(
        () => setSaveError(null),
        (err) => {
          console.error('Vault save failed:', err);
          setSaveError(err instanceof Error ? err.message : '保存失败');
        }
      );
    },
    [applyData]
  );

  const setup = useCallback(
    async (password: string, remember: boolean) => {
      const saved = await setupVault(dataRef.current, password, remember);
      applyData(saved);
      applyStatus('ready');
    },
    [applyData, applyStatus]
  );

  /** Resolves false for a wrong password; other failures throw. */
  const unlock = useCallback(
    async (password: string, remember: boolean): Promise<boolean> => {
      try {
        const loaded = await unlockVault(password, remember);
        applyData(loaded);
        applyStatus('ready');
        return true;
      } catch (err) {
        if (err instanceof WrongPasswordError) return false;
        throw err;
      }
    },
    [applyData, applyStatus]
  );

  /** Resolves false for a wrong current password; other failures throw. */
  const changePassword = useCallback(async (current: string, next: string): Promise<boolean> => {
    try {
      await changeMasterPassword(dataRef.current, current, next);
      return true;
    } catch (err) {
      if (err instanceof WrongPasswordError) return false;
      throw err;
    }
  }, []);

  const setRemember = useCallback(
    (remember: boolean) => {
      // The key store changes first: the switch must not claim "off" while the key still exists
      setRememberUnlocked(remember).then(
        () => update((prev) => ({ ...prev, settings: { ...prev.settings, rememberUnlocked: remember } })),
        (err) => {
          console.error('Could not update remembered key:', err);
          setSaveError(err instanceof Error ? err.message : '保存失败');
        }
      );
    },
    [update]
  );

  const lock = useCallback(async () => {
    applyStatus('locked');
    applyData(createEmptyData()); // decrypted secrets leave memory/React state
    await lockVault();
  }, [applyData, applyStatus]);

  // Idle auto-lock.
  const autoLockMinutes = data.settings.autoLockMinutes;
  useEffect(() => {
    if (status !== 'ready' || !autoLockMinutes || autoLockMinutes <= 0) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void lock(), autoLockMinutes * 60_000);
    };
    arm();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [status, autoLockMinutes, lock]);

  const unlockBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const loaded = await unlockVaultWithBiometrics();
      applyData(loaded);
      applyStatus('ready');
      return true;
    } catch (err) {
      console.warn('Biometric unlock failed or cancelled:', err);
      return false;
    }
  }, [applyData, applyStatus]);

  const toggleBiometrics = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      try {
        const success = await setBiometricsEnabled(enabled);
        setIsBiometricsEnrolled(success);
        update((prev) => ({
          ...prev,
          settings: { ...prev.settings, biometricsEnabled: success },
        }));
        return success;
      } catch (err) {
        console.error('Failed to toggle biometrics:', err);
        throw err;
      }
    },
    [update]
  );

  return {
    data,
    status,
    loadError,
    saveError,
    isBiometricsSupported,
    isBiometricsEnrolled,
    biometricsInfo,
    dismissSaveError: () => setSaveError(null),
    update,
    setup,
    unlock,
    unlockBiometrics,
    toggleBiometrics,
    lock,
    changePassword,
    setRemember,
  };
}
