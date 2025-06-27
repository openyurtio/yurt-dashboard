export const SUPPORTED_LANGUAGE_CODES = ['en', 'zh'];

export const APP_I18N_OPTIONS = {
    supportedLangs: SUPPORTED_LANGUAGE_CODES,
    sourceLang: 'zh',
    defaultLocale: 'zh',
};

export const SUPPORTED_LANGUAGES = {
    en: {
        full: 'English',
        short: 'en',
    },
    zh: {
        full: '中文',
        short: 'zh',
    },
};

export const isValidLanguageCode = (code) =>
    SUPPORTED_LANGUAGE_CODES.includes(code); 