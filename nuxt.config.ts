export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  telemetry: false,

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css'
  ],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      appName: 'SafeZone',
      version: '1.0.0'
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'id'
      },
      title: 'SafeZone: Pemantauan Keamanan Jalan Malam & Rute Aman',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Peta keselamatan jalan malam berbasis laporan warga. Cek titik rawan kejahatan, lampu jalan mati, dan rute ke tempat berlindung 24 jam.'
        },
        { name: 'theme-color', content: '#0b0f19' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
        }
      ]
    }
  }
})
