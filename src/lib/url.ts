/**
 * Only http(s) URLs may be opened or linked. Values come from user input,
 * pasted text and imported backups, so `javascript:` / `data:` must never reach
 * an href or window.open.
 */
export function safeHttpUrl(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : undefined;
  } catch {
    return undefined;
  }
}
