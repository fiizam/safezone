// https://nuxt.com/docs/api/configuration/nuxt-config
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
      title: 'SafeZone — Crowdsourced Night-Commute & Street Safety Intelligence',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        {
          name: 'description',
          content: 'Platform intelijen keselamatan jalanan dan rute pulang malam berbasis crowdsource. Temukan titik rawan kejahatan, jalan gelap, dan safe haven 24 jam.'
        },
        { name: 'theme-color', content: '#0b0f19' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'
        }
      ]
    }
  }
})
