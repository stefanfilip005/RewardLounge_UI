<script setup lang="ts">
import { onMounted, ref, computed , } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const store = useStore();
const jwt = computed(() => store.state.jwt);


const stateCodes = ref({
  0: 'Offen',
  1: 'Teilweise Bestellt',
  2: 'Ist Bestellt',
  3: 'Abholbereit',
  4: 'Erledigt',
  5: 'Storniert'
});
const getStateCode = (state) => {
  return stateCodes.value[state] || 'Unknown state';
};

const loading = ref(true);
const rewards = ref<any[]>([]);
const orderContent = ref<any>({ data: [] });

const getRewards = async () => {
  rewards.value = [];
  try {
    const response = await axios.get('../api/rewards', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    console.log(response.data);
    rewards.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};
const getOrders = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/self/order/list', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    console.log(response.data);
    orderContent.value = response.data;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
};


const combinedOrderContent = computed(() => {
  if (!orderContent.value.data || !rewards.value.length) {
    return { data: [] };
  }

  // Enrich each order item with reward details
  const enrichedOrders = orderContent.value.data.map(order => {
    const enrichedItems = order.order_items.map(item => {
      // Assuming there's a way to match item to reward, e.g., via item.reward_id or similar
      const rewardMatch = rewards.value.find(reward => reward.id == item.reward_id);
      return {
        ...item,
        reward: rewardMatch // Append the found reward to the item
      };
    });

    return {
      ...order,
      order_items: enrichedItems // Replace original order_items with enriched ones
    };
  });

  return { ...orderContent.value, data: enrichedOrders };
});


onMounted(() => {
  getRewards();
  getOrders();
});

function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', options).format(date);
}

</script>

<template>
  <div class="bg-gray-200 pt-4">
    <div class="flex flex-col justify-center items-center mb-6 mx-2">


      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6">
        <div class="px-6 py-4">

          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Deine Bestellungen
          </div>

          <div class="flex flex-col w-full my-3 items-center">

            <div v-if="combinedOrderContent.data && combinedOrderContent.data.length" class="flex flex-col w-full my-3 items-center">
              <div v-for="order in combinedOrderContent.data" :key="order.id" class="mb-4 w-full border border-gray-400">
                <div class="bg-red-800 p-2 flex justify-between items-center text-white">
                  <div class="text-xs">
                    <div class="font-semibold">Bestellung aufgegeben</div>
                    <div class="">{{ formatDate(order.created_at) }}</div>
                  </div>
                  <div class="text-xs text-right self-start">
                    <div class="font-semibold">Status</div>
                    {{ getStateCode(order.state) }}
                  </div>
                </div>
                <div class="bg-white px-2 w-full">
                  <div v-for="(item, index) in order.order_items" :key="`item-${item.id}`" 
                        :class="{'border-b border-b-gray-300': index !== order.order_items.length - 1}" class="flex flex-col pt-4 pb-2">
                    <!-- Flex Container for Image and Details -->
                    <div class="flex items-start">
                      <!-- Image Block -->
                      <img :src="item.reward?.src1" alt="Reward Image" class="h-12 w-12 object-contain mr-2" v-if="item.reward?.src1">
                    
                      <!-- Text Content Block -->
                      <div class="flex-1 flex flex-col justify-between text-xs">
                        <div class="font-semibold">{{ item.quantity }} x {{ item.reward?.name }}</div>
                        <div class="text-gray-500">{{ item.reward?.slogan }}</div>
                      </div>
                    
                      <!-- Points on the far right, moved to top and semibold -->
                      <div class="ml-auto text-xs font-semibold">
                        {{ (item.reward?.points * item.quantity).toLocaleString() }} Punkte
                      </div>
                    </div>
                    
                    <!-- Comment below image as a full line -->
                    <div class="text-xs mt-1 italic text-slate-500" v-if="item.note">
                      <span class="font-semibold">Kommentar:</span><br/>
                      {{ item.note }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center p-4">
              Du hast noch keine Bestellungen aufgegeben.
            </div>
          </div>


        </div>
      </div>


    </div>
  </div>
</template>




<style>

</style>
