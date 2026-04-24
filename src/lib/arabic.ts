/**
 * Arabic text normalization helpers.
 * Used to make search work without diacritics (tashkeel) and tolerant of
 * common letter variants (alef forms, ya/alef-maksura, ta-marbuta/ha).
 */

// U+064B..U+065F (tashkeel) + U+0670 (superscript alef) + U+0640 (tatweel)
const DIACRITICS_RE = /[\u064B-\u065F\u0670\u0640]/g;

export function normalizeArabic(input: string): string {
  if (!input) return '';
  return input
    .toString()
    .normalize('NFKD')
    .replace(DIACRITICS_RE, '')
    // Unify alef forms
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    // ya / alef maksura
    .replace(/\u0649/g, '\u064A')
    // ta marbuta -> ha
    .replace(/\u0629/g, '\u0647')
    // hamza on waw / ya
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .toLowerCase()
    .trim();
}

/** True when needle appears anywhere inside haystack (both normalized). */
export function arabicIncludes(haystack: string, needle: string): boolean {
  const n = normalizeArabic(needle);
  if (!n) return true;
  return normalizeArabic(haystack).includes(n);
}
