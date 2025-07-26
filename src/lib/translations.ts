import i18n from '../i18n';

export function getTranslation(key: string, language?: string): string {
  try {
    // If a specific language is provided, temporarily change it
    const currentLang = i18n.language;
    if (language && language !== currentLang) {
      i18n.changeLanguage(language);
    }

    const translation = i18n.t(key);
    
    // Restore original language if it was changed
    if (language && language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
    
    // If the translation is the same as the key, it might mean it wasn't found
    if (translation === key) {
      console.warn(`Translation key not found: ${key}`);
    }
    
    return translation;
  } catch (e) {
    console.error(`Error getting translation for key: ${key}`, e);
    return key;
  }
}

export function formatTranslation(text: string, params: Record<string, string | number>): string {
  try {
    return i18n.t(text, params);
  } catch (e) {
    // Fallback to basic string replacement if i18next fails
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() || '';
  });
  }
} 