import { i18n } from '@lingui/core';
import { SUPPORTED_LANGUAGE_CODES } from '../constants/i18n';

export const getInitialLocale = () => {
  const savedLocale = localStorage.getItem('preferredLanguage');
  if (savedLocale && SUPPORTED_LANGUAGE_CODES.includes(savedLocale)) {
    return savedLocale;
  }
  return 'zh';
};

export const dynamicActivate = async (locale) => {
  try {
    const messages = await import(`../locales/${locale}/messages.js`);
    i18n.load(locale, messages.messages);
    i18n.activate(locale);
  } catch (error) {
    console.error(`Failed to load locale: ${locale}`, error);
  }
}; 