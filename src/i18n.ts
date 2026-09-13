import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uk from './locales/uk.json'
import pl from './locales/pl.json'
import en from './locales/en.json'
import { readPreferences, STORAGE_KEY } from './quiz'

function savedLanguage() {
  try {
    return readPreferences(localStorage.getItem(STORAGE_KEY)).language
  } catch {
    return 'uk'
  }
}

void i18n.use(initReactI18next).init({
  resources: { uk: { translation: uk }, pl: { translation: pl }, en: { translation: en } },
  lng: savedLanguage(),
  fallbackLng: 'uk',
  supportedLngs: ['uk', 'pl', 'en'],
  initAsync: false,
  interpolation: { escapeValue: false },
})

export default i18n
