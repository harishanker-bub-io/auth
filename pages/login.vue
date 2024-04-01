<script setup>
import { ref } from "vue";
const submitted = ref(false);
const submitHandler = async (data) => {
  console.log(data);
};

definePageMeta({
  middleware: ["auth"],
});
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

        <FormKit type="submit" label="Register" />
      </FormKit>
      <hr class="border border-black"/>
      <NuxtLink to="/signup">Not a user ? Signup</NuxtLink>
    </div>

    <div class="flex justify-between items-center w-[300px] mt-4"   >
        <FormKit type="submit" label="github" />
        <FormKit type="submit" label="magiclink" />
    </div>
  </div>

  <div v-if="submitted">
    <h2 class="text-xl text-green-500">Submission successful!</h2>
  </div>
</template>
