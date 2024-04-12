<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">AI Image Loader</h1>
    <form @submit.prevent="loadImage" class="flex flex-col items-center justify-center space-y-4 mb-8">
      <input v-model.trim="prompt" type="text" id="textInput" name="textInput" placeholder="Enter your prompt..." class="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
      <button type="submit" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ease-in-out">
        <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zM10 9a1 1 0 01-1-1V5a1 1 0 112 0v3a1 1 0 01-1 1z" clip-rule="evenodd" />
        </svg>
        Load Image
      </button>
    </form>
    <div v-if="loading" class="text-center">
      <div class="spinner"></div>
      <p class="mt-4">Loading...</p>
    </div>
    <div v-else-if="data.length === 0" class="text-center">
      <p>No images loaded yet.</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="(image, index) in data" :key="index" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <img :src="image" alt="AI-generated Image" class="object-cover w-full h-60">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false);
const data = ref([]);
const prompt = ref('');

async function query(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function loadImage() {
  loading.value = true;
  const imageUrl = await query({ "inputs": prompt.value });
  loading.value = false;
  data.value.unshift(imageUrl);
}
</script>

<style>
/* Custom Spinner Animation */
.spinner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
