<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const store = useStore();
const jwt = computed(() => store.state.jwt);

const rewards = ref<any[]>([]);


const getRewards = async () => {
  try {
    const response = await axios.get('../api/rewards', {
      headers: {
        Accept: "application/json", // Corrected the Accept header
        Authorization: `Bearer ${jwt.value}`
      }
    });
    const sortedRewards = response.data.data.sort((a, b) => a.points - b.points);
    rewards.value = sortedRewards;
  } catch (error) {
    console.error(error);
  }
};

const addToCart = async (productId, productName: string) => {
  try {
    await axios.post('/api/self/cart/add-item', {
      reward_id: productId,
    }, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });

    store.dispatch('addToCart');
    const notificationMessage = `"${productName}" wurde in den Warenkorb gelegt`;
    const notificationEvent = new CustomEvent('add-notification', { detail: { message: notificationMessage, type: 'success' } });
    window.dispatchEvent(notificationEvent);
  } catch (error) {
    // Handle any errors here, such as alerting the user to the failure.
    const errorMessage = 'Ein Fehler ist aufgetreten';
    const notificationEvent = new CustomEvent('add-notification', { detail: { message: errorMessage, type: 'error' } });
    window.dispatchEvent(notificationEvent);
    console.error(error);
  }
};


onMounted(() => {
  getRewards();
});



</script>

<template>
  <div class="bg-gray-200 pt-4">

    <div class="flex justify-center mb-8 mt-2">
      <div class="w-full max-w-2xlrounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 bg-red-300 border border-red-600">
        <div class="px-4 py-2 text-sm text-center font-bold text-gray-800">
          Diese Seite ist derzeit nur für Administratoren und Moderatoren sichtbar.
        </div>
      </div>
    </div>

    
    <div class="flex justify-center mb-10">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">
          <div class="flex mb-2 border-b border-b-gray-400 pb-1">
            <div class="font-bold text-base md:text-xl">Produkte</div>
          </div>

          <p class="text-red-700 text-lg md:text-xl font-bold mt-4 mb-12">
            Bitte beachten Sie, dass sich unsere Webseite noch in der Testphase befindet.<br/>
            Die angezeigten Produkte, Preise und Punkte sind für interne Testzwecke frei erfunden.
          </p>

          <!-- Products Container -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">

            <div v-for="product in rewards" :key="product.id" class="mb-4">
              <!-- Product Details -->
              <div class="border-b border-gray-200">
                <div class="font-bold">{{ product.name }}</div>
                <div class="text-gray-500 font-normal px-1">{{ product.slogan }}</div>
              </div>
          
              <div class="text-sm text-gray-500 p-1 max-h-32 overflow-hidden text-justify">
                {{ product.description }}
              </div>
          
              <!-- Image and Points Section -->
              <div class="flex flex-row">
                <div class="w-3/5 p-2 h-44 flex items-center justify-center">
                  <img :src="product.src1 || '../../images/demoImage.png'" alt="Image preview" class="w-full h-full object-contain"/>
                </div>
                <div class="w-2/5 p-1 h-44 flex flex-col items-center justify-center">
                  <div class="font-semibold py-2 text-center">
                    {{ product.points.toLocaleString() }} Punkte<br/>
                    <span class="text-sm text-gray-400">{{ (product.euro/100).toFixed(2).replace('.', ',').toLocaleString() }} Euro</span>
                  </div>
                  <button class="bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm" @click="addToCart(product.id,product.name)">
                    In den Warenkorb
                  </button>
                </div>
              </div>
            </div>
          </div>
        

        </div>
      </div>
    </div>
  
  </div>
</template>




<style>

</style>
