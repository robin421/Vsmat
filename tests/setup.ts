import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';

// jsdom doesn't ship SubtleCrypto; use Node's.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}
