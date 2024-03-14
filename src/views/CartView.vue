<script setup lang="ts">
import { onMounted, ref, computed , watch, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const store = useStore();
const jwt = computed(() => store.state.jwt);
const user = computed(() => store.state.user);

interface Reward {
  id: number;
  name: string;
  slogan: string;
  description: string;
  src1: string;
  points: number;
  // Add other properties of Reward as needed
}

const defaultReward = <Reward>{
  id: 0,
  name: '',
  slogan: '',
  description: '',
  src1: '',
  points: 0
};

interface CartItem {
  reward_id: number;
  quantity: number;
  reward: Reward;
  note: string;
  id: number;
  // Add other properties of CartItem as needed
  debounceTimeoutId: null | number; // Assuming this is the correct type for debounceTimeoutId
}

interface CartContent {
  data: {
    items: CartItem[];
  }
}

const rewards = ref<Reward[]>([]);
  const cartContent = ref<CartContent>({
  data: {
    items: <CartItem[]>[] // Ensure a default empty array so that it's always safe to access `cartContent.value.data.items`
  }
});

const loading = ref(true);


const sentCart = ref(false);


const getRewards = async () => {
  rewards.value = [];
  try {
    const response = await axios.get('../api/rewards', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    rewards.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};
const getCartContent = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/self/cart/content', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    cartContent.value = response.data;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
};
const updateCartItemQuantity = async (itemId, quantity) => {
  try {
    await axios.patch(`/api/self/cart/item/${itemId}/quantity`, { quantity }, {
      headers: {
        'Authorization': `Bearer ${jwt.value}`,
        'Accept': 'application/json'
      }
    });
    // Optionally, refresh cart content or update UI accordingly
    getCartContent();
    const notificationMessage = `Menge wurde verändert`;
    const notificationEvent = new CustomEvent('add-notification', { detail: { message: notificationMessage, type: 'success' } });
    window.dispatchEvent(notificationEvent);
  } catch (error) {
    console.error('Failed to update cart item quantity:', error);
  }
};




const deleteCartItem = async (itemId) => {
  try {
    await axios.delete(`/api/self/cart/item/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${jwt.value}`,
        'Accept': 'application/json'
      }
    });
    // After deletion, refresh the cart contents
    getCartContent();
    const notificationMessage = `Produkte wurde entfernt`;
    const notificationEvent = new CustomEvent('add-notification', { detail: { message: notificationMessage, type: 'success' } });
    window.dispatchEvent(notificationEvent);
  } catch (error) {
    console.error('Failed to delete cart item:', error);
  }
};

const sendOrder = async () => {
  loading.value = true;
  try {
    await axios.post('/api/self/cart/checkout', {}, {
      headers: {
        'Authorization': `Bearer ${jwt.value}`, // Use jwt.value where jwt is your reactive JWT token
        'Accept': 'application/json'
      }
    });
    // Handle success (e.g., show a success message, clear the cart, etc.)
    
    cartContent.value = {data: { items: [] }};
    getCartContent();
    const notificationMessage = `Bestellung abgeschlossen`;
    const notificationEvent = new CustomEvent('add-notification', { detail: { message: notificationMessage, type: 'success' } });
    window.dispatchEvent(notificationEvent);
    sentCart.value = true;
  } catch (error) {
    console.error('Error sending order', error);
    // Handle error (e.g., show an error message)
    cartContent.value = {data: { items: [] }};
    getCartContent();
  }
};

const cartItemsWithDetails = computed(() => {
  return cartContent.value.data.items.map((item) => {
    const rewardDetails = rewards.value.find(reward => reward.id === item.reward_id) || defaultReward;
    return {
      ...item,
      reward: rewardDetails,
      debounceTimeoutId: null
    };
  });
});
function debounceSave(item) {
  if (item.debounceTimeoutId) {
    clearTimeout(item.debounceTimeoutId);
  }
  item.debounceTimeoutId = setTimeout(() => {
    updateItemNote(item.id, item.note);
  }, 750);
}
async function updateItemNote(itemId, note) {
  try {
    const response = await axios.patch(`/api/self/cart/item/${itemId}/note`, { note }, {
      headers: {
        'Authorization': `Bearer ${jwt.value}`, // Use jwt.value where jwt is your reactive JWT token
        'Accept': 'application/json'
      }
    });
    console.log('Note updated successfully', response.data);
    const notificationEvent = new CustomEvent('add-notification', { detail: { message: "Kommentar wurde gespeichert", type: 'success' } });
    window.dispatchEvent(notificationEvent);
  } catch (error) {
    console.error('Error updating note', error);
    const notificationEvent = new CustomEvent('add-notification', { detail: { message: "Kommentar konnte nicht gespeichert werden", type: 'error' } });
    window.dispatchEvent(notificationEvent);
  }
}
function onNoteInput(item) {
  debounceSave(item);
}

onUnmounted(() => {
  cartItemsWithDetails.value.forEach(item => {
    if (item.debounceTimeoutId) {
      clearTimeout(item.debounceTimeoutId);
    }
  });
});

// Total Item Count
const totalItemCount = computed(() => {
  return cartItemsWithDetails.value.reduce((total, item) => total + item.quantity, 0);
});

// Total Price
const totalPrice = computed(() => {
  return cartItemsWithDetails.value.reduce((total, item) => {
    const points = item.reward?.points ?? 0; // Fallback to 0 if item.reward is undefined
    return total + (item.quantity * points);
  }, 0);
});

const showCartContent = computed(() => {
  return (cartContent.value && cartContent.value.data.items && cartContent.value.data.items.length > 0);
});

watch(totalItemCount, (newCount) => {
  store.dispatch('updateCartCount', newCount);
});

onMounted(() => {
  getRewards();
  getCartContent();
});
</script>

<template>
  <div class="bg-gray-200 pt-4">
    <div class="flex justify-center mb-6">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">


          <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
            <div class="font-bold text-base md:text-xl">Einkaufswagen</div>

            <div v-if="!loading && cartContent && cartContent.data.items && cartContent.data.items.length > 0" class="flex items-center font-bold text-base md:text-xl text-gray-500">
              <span class="font-normal">Summe ({{ totalItemCount }} Artikel): </span> &nbsp;{{ totalPrice.toLocaleString() }} Punkte
            </div>
            <div v-else class="flex items-center font-bold text-base md:text-xl text-gray-500">
              <span class="font-normal">Summe (0 Artikel): </span> &nbsp;0 Punkte
            </div>
          </div>

          <div v-if="!loading && cartContent && cartContent.data.items && cartContent.data.items.length > 0 && (totalPrice > user.points)" class="text-center text-red-600 font-semibold border-b border-b-gray-400 pt-2 pb-4 mb-2">
            Du hast nicht genügend Punkte um diese Bestellung durchzuführen!
            <div class="text-sm text-gray-600 font-normal">
              Dir fehlen <span class="font-semibold">{{ (totalPrice - user.points).toLocaleString() }}</span> Punkte
            </div>
          </div>


          <div v-if="loading" class="text-center text-gray-600 font-semibold pt-6 pb-4 mb-2">
            Der Inhalt des Warenkorbs wird geladen...
          </div>


          <!-- Check if there are items -->
          <div v-if="!loading && showCartContent">
            <div v-for="item in cartItemsWithDetails" :key="item.id" class="flex flex-col md:flex-row md:items-center p-2 mb-4 border-b-gray-200 border-b">
              <template v-if="item.reward">

                <div v-if="item.reward" class="flex-none w-full md:w-auto mb-4 md:mb-0">
                  <img :src="item.reward.src1" alt="Reward Image" class=" w-32 h-32 object-contain ">
                </div>

                <div class="flex-grow mx-4">
                  <div class="text-normal font-semibold">{{ item.reward.name }}</div>
                  <div class="text-sm text-gray-700">{{ item.reward.slogan }}</div>
                  <div class="text-xs text-gray-500 mb-2">{{ item.reward.description }}</div>
                </div>

                <div class="flex-none w-full md:w-auto mx-4">
                  <div class="text-normal font-semibold">Dein Kommentar</div>
                  <textarea v-model="item.note" @input="onNoteInput(item)" class="w-full h-24 p-2 bg-white border-2 border-gray-200 rounded"></textarea>
                </div>

                <!-- Right part: Price and Comment Textarea -->
                <div class="flex-none w-full ml-4 md:w-auto text-right">
                  <div class="text-lg font-semibold mb-4">{{ item.reward.points.toLocaleString() }} Punkte</div>
                  <select v-model="item.quantity" @change="updateCartItemQuantity(item.id, item.quantity)" class="mb-4 text-xs bg-gray-200 rounded-md p-1 border border-gray-400 shadow-md">
                    <option v-for="count in 20" :key="count" :value="count">Menge: &nbsp; {{ count }}</option>
                  </select>
                  <br/>
                  <a href="#" class="text-red-600 text-xs" @click.prevent="deleteCartItem(item.id)">Löschen</a>
                </div>
              </template>
            </div>



            <div class="mx-auto max-w-lg md:max-w-md p-4">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <div class="text-left w-48">Deine Punkte</div>
                  <div>{{ Math.floor(user.points).toLocaleString() }} Punkte</div>
                </div>
                
                <div class="flex justify-between">
                  <div class="text-left w-48">Einkaufswagen</div>
                  <div class="text-red-600">- {{ Math.floor(totalPrice).toLocaleString() }} Punkte</div>
                </div>
                
                <div class="border-b-2 border-gray-200 my-2"></div>
                
                <div class="flex justify-between">
                  <div class="text-left w-48">Dein neuer Punktestand</div>
                  <div :class="{'text-green-600': (parseInt(user.points) - totalPrice) >= 0, 'text-red-600': (parseInt(user.points) - totalPrice) < 0}">
                    {{ (Math.floor(user.points) - totalPrice).toLocaleString() }} Punkte
                  </div>
                </div>

                <div v-if="(parseInt(user.points) - totalPrice) < 0" class="pt-4 text-center">
                  <div class="mb-2 font-bold">Du brauchst mehr Punkte?</div>                 
                  <a href="https://portal.n.roteskreuz.at/index.php?modul=rps&seite=dienstplan" target="_blank" 
                    class="mt-2 py-1 px-3 bg-gray-300 border rounded-lg border-gray-400 transition duration-300 ease-in-out hover:text-white hover:bg-gray-500 cursor-pointer" >
                    Hier geht es zum RPS
                  </a>
                </div>

              </div>
            
              <div class="flex justify-center mt-4">
                <button v-if="user.points >= totalPrice" @click="sendOrder" class="mt-4 mb-4 bg-blue-500 hover:bg-blue-700 text-white text-base font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Jetzt Testbestellung durchführen
                </button>
              </div>
            </div>

          </div>
          
          <!-- Display when cart is empty -->
          <div v-if="!loading && !showCartContent && !sentCart" class="text-center py-8">
            Dein Einkaufswagen ist leer
          </div>

          <div v-if="!loading && !showCartContent && sentCart" class="text-center py-2 mt-4 text-sm font-bold text-green-800 bg-green-400 max-w-[500px] align-middle mx-auto">
            Deine Bestellung wurde aufgegeben<br/>
            Du erhältst in Kürze eine Bestätigung per E-Mail<br/>
            <br/>
            Vielen Dank für deine Bestellung!
          </div>
          


        </div>
      </div>
    </div>
  </div>
</template>




<style>

</style>
