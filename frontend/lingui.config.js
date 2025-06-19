
export default {
    locales: ['en', 'zh'],
    sourceLocale: 'zh',
    catalogs: [
        {
            path: '<rootDir>/src/locales/{locale}/messages',
            include: ['src'],
        },
    ],
    // compileNamespace: 'es'
}; 