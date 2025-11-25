import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from '../locales/en';
import { fr } from '../locales/fr';

const resources = {
  en: {
    common: en.common,
    company: en.company,
    users: en.users,
    settings: en.settings,
    vehicles: en.vehicles,
    apiToken: en.apiToken,
    events: en.events,
    costs: en.costs,
    workflows: en.workflows,
    shootInspect: en.shootInspect,
  },
  fr: {
    common: fr.common,
    company: fr.company,
    users: fr.users,
    settings: fr.settings,
    vehicles: fr.vehicles,
    apiToken: fr.apiToken,
    events: fr.events,
    costs: fr.costs,
    workflows: fr.workflows,
    shootInspect: fr.shootInspect,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'company', 'users', 'settings', 'vehicles', 'apiToken', 'events', 'costs', 'workflows', 'shootInspect'],

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];
