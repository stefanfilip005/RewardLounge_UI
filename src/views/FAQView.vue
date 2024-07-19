<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  isOpen: boolean;
  answerLines?: string[]; 
}


const store = useStore();

const jwt = computed(() => store.state.jwt);

const faqs = ref<FAQ[]>([]); 

const getFAQs = async () => {
  faqs.value = [];
  try {
    const response = await axios.get('../api/faqs', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    faqs.value = response.data.data
      .map((faq: FAQ) => ({
        ...faq,
        isOpen: false
      }))
      .sort((a: FAQ, b: FAQ) => a.sort_order - b.sort_order);
  } catch (error) {
    console.error(error);
  }
};
const toggleFAQ = (id: number): void => {
  const faq = faqs.value.find(f => f.id === id);
  if (faq) {
    faq.isOpen = !faq.isOpen;
  }
};

onMounted(() => {
  getFAQs();
});

const processedFAQs = computed(() => {
  return faqs.value.map(faq => ({
    ...faq,
    answerLines: faq.answer.split('\n')
  }));
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
            <div v-for="faq in processedFAQs" :key="faq.id" class="faq-item mb-4 cursor-pointer" @click="toggleFAQ(faq.id)">
              <h3 class=" text-lg flex items-center px-2">
                <div class="flex-grow flex-1 mr-8">{{ faq.question }}</div>
                <div class="flex-shrink-0">
                  <i :class="{'fas fa-chevron-down': !faq.isOpen, 'fas fa-chevron-up': faq.isOpen}"></i>
                </div>
              </h3>
              <p v-if="faq.isOpen" class="text-gray-600 transition-height duration-500 ease-in-out mr-4 mt-2 pl-4 pr-12 text-justify">
                <template v-for="(line, index) in faq.answerLines">
                  {{ line }}
                  <!-- Do not add a break after the last line -->
                  <br v-if="index < faq.answerLines.length - 1">
                </template>
              </p>
              <!-- Linie wird nach der Antwort gezeigt, wenn geöffnet, sonst nach der Frage -->
              <div v-if="faq.isOpen" class="border-b border-gray-300 mt-3 mx-2"></div>
              <div v-else class="border-b border-gray-300 mt-3 mx-2"></div>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  </div>
</template>




<style>

</style>
