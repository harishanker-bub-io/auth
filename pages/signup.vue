<script setup>
import { ref } from "vue";
const user = useSupabaseUser();
console.log(user)
  const supabase = useSupabaseClient();

const submitted = ref(false);
const submitHandler = async (data) => {
  await signUpNewUser(data)
  
};

async function signUpNewUser(form) {
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    user_metadata: { name: form.name}
    
  })
}

async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  })
}

</script>

<template>
  <div class="w-full h-[100vh] flex flex-col justify-center items-center bg-slate-300">
    <div class="w-[300px]">
      <FormKit
        type="form"
        id="registration-example"
        :form-class="submitted ? 'hide' : 'show'"
        submit-label="Register"
        @submit="submitHandler"
        :actions="false"
        #default="{ value }"
      >
        <h1 class="text-2xl font-bold mb-2 text-center">Register!</h1>
        <FormKit
          type="text"
          name="name"
          label="Your name"
          placeholder="Jane Doe"
          help="What do people call you?"
          validation="required"
        />
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
          <FormKit
            type="password"
            name="password_confirm"
            label="Confirm password"
            placeholder="Confirm password"
            validation="required|confirm"
            help="Confirm your password"
          />
        </div>

        <FormKit type="submit" label="Register" />
      </FormKit>
      <hr class="border border-black"/>
      <NuxtLink to="/login">Already a user ? Login</NuxtLink>
    </div>

    <div class="flex justify-between items-center w-[300px] mt-4"   >
        <FormKit type="submit" label="github"  @click="signInWithGithub"/>
    </div>
  </div>
</template>
