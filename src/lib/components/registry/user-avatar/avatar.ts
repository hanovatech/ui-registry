/** Initials + background colour for the letter avatar shown when a person has
 *  no profile picture. Pure and isomorphic — the colour is derived from a
 *  stable seed (user id, email) so the same person keeps the same colour on
 *  every page and across renames. */

/** Up to two letters: first letter of the first and last word. Words that
 *  start with punctuation (`(Support)`) contribute their first letter or digit.
 *  Falls back to the email's first letter, then to '?' — an empty avatar would
 *  read as a broken image. */
export function avatarInitials(name: string | null | undefined, email?: string | null): string {
  const words = (name ?? '')
    .trim()
    .split(/\s+/)
    .map((w) => w.match(/[\p{L}\p{N}]/u)?.[0])
    .filter((c): c is string => Boolean(c));

  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  if (letters.length > 0) return letters.join('').toLocaleUpperCase();

  const fromEmail = (email ?? '').trim().match(/[\p{L}\p{N}]/u)?.[0];
  return fromEmail ? fromEmail.toLocaleUpperCase() : '?';
}

/** Solid fills that all carry white text with sufficient contrast, in both
 *  themes. Literal class strings so Tailwind picks them up. */
export const AVATAR_COLORS = [
  'bg-red-600',
  'bg-orange-600',
  'bg-amber-700',
  'bg-lime-700',
  'bg-green-600',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-700',
  'bg-sky-600',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-fuchsia-600',
  'bg-pink-600',
  'bg-rose-600'
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

/** Deterministic palette pick (FNV-1a over the seed). Seeds are normalised
 *  case-insensitively so `Max@Firma.de` and `max@firma.de` match. */
export function avatarColor(seed: string): AvatarColor {
  let hash = 0x811c9dc5;
  for (const ch of seed.trim().toLowerCase()) {
    hash ^= ch.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193);
  }
  return AVATAR_COLORS[(hash >>> 0) % AVATAR_COLORS.length];
}
