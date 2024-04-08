<script setup>
import { ref } from "vue";
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const submitted = ref(false);
const showMagicLinkForm = ref(false);


const submitHandler = async (data) => {
  signInWithEmail(data)
};

async function signInWithEmail(form) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })
  if(data){
    navigateTo("/")
  }
}

async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  })
  // console.log(data, error)
}

async function signInWithMagicLink(formData) {
  // console.log(formData)
  const { data, error } = await supabase.auth.signInWithOtp({
    email: formData.email,
    options: {
      // set this to false if you do not want the user to be automatically signed up
      shouldCreateUser: false,
      // emailRedirectTo: data,
    },
  })
  // console.log(data, error)
  if(data){
    navigateTo("/")
  }
}

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <div class="w-full h-[100vh] flex flex-col justify-center items-center bg-slate-300">
    <div class="w-[300px]">
      <!-- Form for email and password login -->
      <FormKit
        type="form"
        id="email-password-form"
        :form-class="submitted ? 'hide' : 'show'"
        submit-label="Login"
        @submit="submitHandler"
        :actions="false"
        v-if="!showMagicLinkForm"
      >
        <h1 class="text-2xl font-bold mb-2 text-center">Login</h1>
        <FormKit
          type="text"
          name="email"
          label="Your email"
          placeholder="jane@example.com"
          help="What email should we use?"
          validation="required|email"
        />
        <div class="double">
          <FormKit
            type="password"
            name="password"
            label="Password"
            validation="required|length:6|matches:/[^a-zA-Z]/"
            :validation-messages="{
              matches: 'Please include at least one symbol',
            }"
            placeholder="Your password"
            help="Choose a password"
          />
        </div>

        <FormKit type="submit" label="Login" />
      </FormKit>

      <!-- Form for magic link login -->
      <FormKit
        type="form"
        id="magic-link-form"
        :form-class="submitted ? 'hide' : 'show'"
        submit-label="Login"
        @submit="signInWithMagicLink"
        :actions="false"
        v-else
      >
        <h1 class="text-2xl font-bold mb-2 text-center">Login with Magic Link</h1>
        <FormKit
          type="text"
          name="email"
          label="Your email"
          placeholder="jane@example.com"
          help="What email should we use?"
          validation="required|email"
        />
        <!-- Magic link form doesn't require password input -->
        <div class="double">
        </div>

        <FormKit type="submit" label="Login" />
      </FormKit>

      <hr class="border border-black"/>
      <NuxtLink to="/signup">Not a user? Signup</NuxtLink>
    </div>

    <div class="flex justify-between items-center w-[300px] mt-4">
      <FormKit type="submit" label="GitHub" @click="signInWithGithub"/>
      <FormKit type="submit" label="Magic Link" @click="showMagicLinkForm = !showMagicLinkForm"/>
    </div>
  </div>
</template>
