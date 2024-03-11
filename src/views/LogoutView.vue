<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  localStorage.removeItem('token');
  window.location.href = '/';
});
</script>

<template>
  <div class="bg-gray-200 pt-4">
    
    <div class="flex justify-center mb-6">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">

          Du wurdest abgemeldet

        </div>
      </div>
    </div>
  </div>
</template>

<style>
</style>
