export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: {
        lang: 'id',
      },
      title: 'Bakso Berkah — Gurih Kuahnya, Mantap Dagingnya',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        {
          name: 'description',
          content: 'Pesan Bakso Urat, Bakso Telur, Mie Ayam, Nasi Goreng, Mie Tiaw Sapi & Ayam dari Bakso Berkah dengan mudah lewat online dan WhatsApp.',
        },
        { name: 'theme-color', content: '#B91C1C' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    tidbHost: process.env.TIDB_HOST || '',
    tidbPort: process.env.TIDB_PORT || '4000',
    tidbUser: process.env.TIDB_USER || '',
    tidbPassword: process.env.TIDB_PASSWORD || '',
    tidbDatabase: process.env.TIDB_DATABASE || 'bakso_berkah',
    adminPin: process.env.ADMIN_PIN || '1234',
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || 'bakso-berkah-session-secret',
    public: {
      appName: 'Bakso Berkah',
    },
  },
})
