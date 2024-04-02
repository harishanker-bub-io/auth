// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase','@formkit/nuxt','@nuxtjs/tailwindcss'],
  formkit: {
    // Experimental support for auto loading (see note):
    autoImport: true
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
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
