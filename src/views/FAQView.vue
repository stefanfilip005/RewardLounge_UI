<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const store = useStore();

const jwt = computed(() => store.state.jwt);

const faqs = ref<any[]>([]);

const getFAQs = async () => {
  faqs.value = [];
  try {
    const response = await axios.get('../api/faqs', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    faqs.value = response.data.data.map(faq => ({
      ...faq,
      isOpen: false
    })).sort((a, b) => a.sort_order - b.sort_order);
  } catch (error) {
    console.error(error);
  }
};
const toggleFAQ = (faqId) => {
  const faq = faqs.value.find(f => f.id === faqId);
  if (faq) {
    faq.isOpen = !faq.isOpen;
  }
};

onMounted(() => {
  getFAQs();
});
</script>


<template>
  <div class="bg-gray-200 pt-4">
    
    <div class="flex flex-col justify-center items-center mb-6">



      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6">
        <div class="px-6 py-4">
          <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
            <div class="font-bold text-base md:text-xl">Häufig gestellte Fragen</div>
          </div>

          <div class="mx-auto bg-white overflow-hidden py-4">
            <div v-for="faq in faqs" :key="faq.id" class="faq-item mb-4 cursor-pointer" @click="toggleFAQ(faq.id)">
              <h3 class="font-semibold text-lg flex justify-between items-center">
                {{ faq.question }}
                <i :class="{'fas fa-chevron-down': !faq.isOpen, 'fas fa-chevron-up': faq.isOpen}"></i>
              </h3>
              <p v-if="faq.isOpen" class="text-gray-600 transition-height duration-500 ease-in-out px-2 mr-4 mt-2">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>




<style>

</style>
