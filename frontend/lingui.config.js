
export default {
    locales: ['en', 'zh'],
    sourceLocale: 'en',
    catalogs: [
        {
            path: '<rootDir>/src/locales/{locale}/messages',
            include: ['src'],
        },
    ],
    compileNamespace: 'es'
}; 