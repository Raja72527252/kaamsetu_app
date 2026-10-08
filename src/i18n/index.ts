import { Language } from '../types';
import hi from './hi.json';
import en from './en.json';
import hinglish from './hinglish.json';

type TranslationKeys = typeof en;

const translations: Record<Language, TranslationKeys> = { hi, en, hinglish };

let currentLanguage: Language = 'hi';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, lang?: Language): string {
  const lng = lang ?? currentLanguage;
  const dict = translations[lng] as Record<string, unknown>;
  const parts = key.split('.');
  let value: unknown = dict;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in (value as object)) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof value === 'string' ? value : key;
}
