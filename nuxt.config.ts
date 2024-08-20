// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', 'nuxt-headlessui'],
  app: {
    head: {
      titleTemplate: '%s | Task Manager App',
      htmlAttrs: { lang: 'en' },
      meta: [
        {
          name: 'description',
          content:
            'Stay on top of your game with our Task Manager App – the ultimate tool for organizing, prioritizing, and completing your to-dos.',
        },
      ],
    },
  },
})
