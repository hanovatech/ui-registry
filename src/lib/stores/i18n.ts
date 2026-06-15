import { writable, derived } from 'svelte/store';
import { getTranslations } from '$lib/i18n';
import type { Translations } from '$lib/types/i18n';

export const translations = writable<Translations>(getTranslations());

export function setTranslations(trans: Translations) {
  translations.set(trans);
}

export const t = derived(translations, $translations => $translations);
