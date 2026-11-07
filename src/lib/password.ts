export const MIN_PASSWORD_LENGTH = 10;

export const STRENGTH_LABELS = ['太弱', '较弱', '一般', '良好', '很强'];

/** Rough 0–4 strength score: length plus character-class variety. */
export function passwordStrength(pw: string): number {
  if (!pw) return 0;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  let score = 0;
  if (pw.length >= MIN_PASSWORD_LENGTH) score++;
  if (pw.length >= 14) score++;
  if (classes >= 3) score++;
  if (pw.length >= 18 || (pw.length >= 14 && classes === 4)) score++;
  return score;
}
