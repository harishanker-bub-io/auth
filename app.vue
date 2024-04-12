<template>
    <div class="flex justify-between items-center bg-amber-950 p-2">
      <div class="flex gap-4 ml-3">
        <NuxtLink to="/todo" class="bg-blue-700 p-3 text-white">TODOs</NuxtLink>
        <NuxtLink to="/text-image"  class="bg-blue-700 p-3 text-white">Image Generator</NuxtLink>
      </div>
    <div>
      <FormKit @click="signOut" type="submit" label="Signout" />
    </div>
  </div>
  <NuxtLayout>
    <NuxtPage></NuxtPage>
  </NuxtLayout>
</template>

<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser()

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
      navigateTo("/login");
    }
}

</script>
