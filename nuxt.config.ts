// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase','@formkit/nuxt','@nuxtjs/tailwindcss'],
  formkit: {
    // Experimental support for auto loading (see note):
    autoImport: true
  },
  runtimeConfig: {
    apiSecret: '', // can be overridden by NUXT_API_SECRET environment variable
    public: {
      apiKey: process.env.API_KEY, // can be overridden by NUXT_PUBLIC_API_BASE environment variable
      openaiApiKey: process.env.OPENAI_API_KEY, // can be overridden by NUXT_PUBLIC_API_BASE environment variable
    }
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/',
      include: [],
      exclude: ['/signup'],
      cookieRedirect: false,
    }
  },
})
  