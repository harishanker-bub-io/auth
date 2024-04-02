<template>
    <div class="flex justify-end items-center bg-amber-950 p-2">
        <div>
            <FormKit @click="signOut" type="submit" label="Signout" />
        </div>
    </div>  
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser()

definePageMeta({
  middleware: ["auth"],
});

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
      navigateTo("/login");
    }
}
</script>
