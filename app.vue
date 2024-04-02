<template>
  <NuxtLayout>
    <NuxtPage></NuxtPage>
  </NuxtLayout>
</template>

<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser()

// watch(user => {
//   if(!user){
//     navigateTo('/login')
//   }
// })

</script>
