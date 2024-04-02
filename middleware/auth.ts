export default defineNuxtRouteMiddleware((to, from) => {
    console.log(to.path)
    console.log(from.path)
    const user = useSupabaseUser()
    console.log('user.value is',user.value)
    if (to.path === '/login' || to.path === '/signup') {
        console.log('login path');
        if (user.value) {
          return navigateTo('/');
        }
        // User is not authenticated, continue to login page
        return;
      }
      if (!user.value) {
        console.log("login first");
        return navigateTo('/login');
      }
      return;
  })