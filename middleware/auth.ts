export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()
    if (to.path === '/login' || to.path === '/signup') {
        // console.log('login path');
        if (user.value) {
          return navigateTo('/');
        }
        // User is not authenticated, continue to login page
        return;
      }
      if (!user.value) {
        // console.log("login first");
        return navigateTo('/login');
      }
      return;
  })