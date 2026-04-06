import EN from './en.json';
import type { Translations } from '$lib/types/i18n';

export const defaultTranslations: Translations = EN;

export function getTranslations(): Translations {
  return defaultTranslations;
}
