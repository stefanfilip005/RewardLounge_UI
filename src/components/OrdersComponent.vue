<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

import { formatPoints } from './../utils.ts';




const showOpenOrders = ref(false);
const toggleShowOpenOrders = () => {
    showOpenOrders.value = !showOpenOrders.value;
};


const selectedTab = ref('Offen');
const updateTabSelection = (status) => {
    selectedTab.value = status;
};
const isSelected = (status) => {
    return selectedTab.value === status;
};



const store = useStore();
const jwt = computed(() => store.state.jwt);
const rewards = ref<Reward[]>([]);
const orders = ref<any[]>([]);
const employees = ref<any[]>([]);
interface Reward {
  id: number;
  name: string;
  src1: string;
  slogan: string;
  selected: boolean;
  description: string;
  points: any;
  euro: any;
}
const getOrderItems = async () => {
  rewards.value = [];
  try {
    const response = await axios.get('../api/rewards', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    rewards.value = response.data.data.map(reward => ({ ...reward, selected: false }));
  } catch (error) {
    console.error(error);
  }
};
const getOrders = async () => {
  try {
    const response = await axios.get('/api/orders', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    console.log(response.data);
    orders.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const employeesFromOrders = async () => {
  try {
    const response = await axios.get('/api/employeesFromOrders', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    console.log(response.data);
    employees.value = response.data.data;
    employees.value.forEach(employee => {
      employeeMap[employee.remoteId] = employee;
    });
  } catch (error) {
    console.error(error);
  }
};

const changeOrderState = async (orderId: number, newState: number) => {
  try {
    const response = await axios.post(`/api/order/${orderId}/change-state`, {
      state: newState,
    }, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`,
      }
    });
    console.log('Order state updated successfully:', response.data);
    // Handle success (e.g., update UI or notify the user)
    getOrders();
    employeesFromOrders();
  } catch (error) {
    console.error('Error updating order state:', error);
    // Handle error (e.g., show error message to the user)
  }
};


onMounted(() => {
  getOrderItems();
  getOrders();
  employeesFromOrders();
});

const employeeMap = computed(() => {
  return employees.value.reduce((map, employee) => {
    map[employee.remoteId] = employee;
    return map;
  }, {});
});


const stateCodes = {
    'Offen': 0,
    'In Prüfung': 1,
    'Ist Bestellt': 2,
    'Abholbereit': 3,
    'Erledigt': 4,
    'Storniert': 5
};
const stateCodesMap = ref({
  0: 'Offen',
  1: 'In Prüfung',
  2: 'Ist Bestellt',
  3: 'Abholbereit',
  4: 'Erledigt',
  5: 'Storniert'
});
const getStateCode = (state) => {
  return stateCodesMap.value[state] || 'Unknown state';
};
const filteredOrders = computed(() => {
    const selectedStateCode = stateCodes[selectedTab.value];
    return orders.value.filter(order => order.state === selectedStateCode);
});

const orderCounts = computed(() => {
    const counts = {
        'Offen': 0,
        'In Prüfung': 0,
        'Ist Bestellt': 0,
        'Abholbereit': 0,
        'Erledigt': 0,
        'Storniert': 0
    };

    orders.value.forEach(order => {
        // Assuming 'state' is a number and maps directly to the status array
        const status = Object.keys(stateCodes).find(key => stateCodes[key] === order.state);
        if (status) {
            counts[status]++;
        }
    });

    return counts;
});



function debounceSave(order) {
  if (order.debounceTimeoutId) {
    clearTimeout(order.debounceTimeoutId);
  }
  order.debounceTimeoutId = setTimeout(() => {
    updateOrderNote(order.id, order.note);
  }, 1000); // Waits 500ms after the last keystroke to call saveNoteToBackend
}
async function updateOrderNote(orderId, note) {
  try {
    const response = await axios.patch(`/api/order/${orderId}/note`, { note }, {
      headers: {
        'Authorization': `Bearer ${jwt.value}`, // Use jwt.value where jwt is your reactive JWT token
        'Accept': 'application/json'
      }
    });
    console.log('Note updated successfully', response.data);
  } catch (error) {
    console.error('Error updating note', error);
  }
}
function onNoteInput(order) {
  debounceSave(order);
}

</script>


<template>
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mb-6">
        <div class="px-6 py-4">
            <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
                Bestellungen
                <div v-if="showOpenOrders" @click="toggleShowOpenOrders()" class="cursor-pointer pr-2">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div v-if="!showOpenOrders" @click="toggleShowOpenOrders()" class="cursor-pointer pr-2">
                    <i class="fas fa-chevron-up"></i>
                </div>
            </div>

            <div v-if="showOpenOrders">
                <div class="overflow-x-auto">
                    <div class="min-w-full bg-white mt-0 mb-0">
                      <div class="grid grid-cols-2 sm:grid-cols-4 text-xs sm:text-sm md:text-base">
                          <!-- Tab items -->
                          <div v-for="status in ['Offen', 'Ist Bestellt', 'Abholbereit', 'Storniert']" :key="status"
                            @click="updateTabSelection(status)"
                            class="px-2 py-1 text-center border border-gray-300 cursor-pointer"
                            :class="{'font-semibold bg-slate-300': isSelected(status), 'hover:bg-blue-300': !isSelected(status)}">
                            {{ status }} ({{ orderCounts[status] }})
                        </div>
                      </div>
                    </div>
                </div>

                <div v-for="order in filteredOrders" :key="order.id">
                  <div class="mx-[-1.5rem] border-t-2 border-gray-300 mt-4 mb-4"></div>

                    <div class="overflow-x-auto border border-gray-500 rounded-md bg-gray-200">
                      <div class="min-w-full">
                          <div class="grid grid-cols-1 sm:grid-cols-2 text-xs sm:text-sm py-2 px-4">
                              <div class="font-semibold">Bestellung Nr &nbsp;&bull;&nbsp; [ {{ order.id }} ]<br/>{{ employeeMap[order.remoteId]?.firstname ?? 'Unknown' }} {{ employeeMap[order.remoteId]?.lastname ?? 'Employee' }} &nbsp;&bull;&nbsp; [ {{ order.remoteId }} ]</div>
                              <div class="font-semibold">Kosten &nbsp;&bull;&nbsp; {{ formatPoints(order.total_points) }} Punkte<br/>Status &nbsp;&bull;&nbsp; {{getStateCode(order.state)}} </div>
                          </div>
                      </div>

                      <div class="w-full border-t border-t-gray-500 border-t-">
                        <div class="grid grid-cols-2 sm:grid-cols-4 text-xs sm:text-sm md:text-base">
                          <div class="px-2 py-1 text-center border border-gray-300">
                            <button v-if="order.state != 0" @click="changeOrderState(order.id, 0)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs p-1 rounded">
                              Zurücksetzen
                            </button>
                            <div class="text-xs">
                              <strong>Bestellt am</strong><br/>
                              {{ order.created_at_datetime }}<br/>
                              <strong>Bestellt von</strong><br/>
                              {{ employeeMap[order.remoteId]?.firstname ?? '' }} {{ employeeMap[order.remoteId]?.lastname ?? '' }}<br/>
                            </div>
                          </div>
                          <!--
                          <div class="px-2 py-1 text-center border border-gray-300">
                            <button v-if="order.state != 1" @click="changeOrderState(order.id, 1)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs p-1 rounded">
                              Prüfung starten
                            </button>
                            <div v-else class="font-bold text-red-600">
                              In Prüfung
                            </div>
                            <div class="text-xs" v-if="order.state_1_datetime">
                              <strong>Geprüft am</strong><br/>
                              {{ order.state_1_datetime }}<br/>
                              <strong>Geprüft von</strong><br/>
                              {{ employeeMap[order.state_1_user_id]?.firstname ?? '' }} {{ employeeMap[order.state_1_user_id]?.lastname ?? '' }}<br/>
                            </div>
                          </div>-->
                          <div class="px-2 py-1 text-center border border-gray-300">
                            <button v-if="order.state != 2" @click="changeOrderState(order.id, 2)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs p-1 rounded">
                              Bestellung durchgeführt
                            </button>
                            <div v-else class="font-bold text-red-600">
                              Ist Bestellt
                            </div>
                            <div class="text-xs" v-if="order.state_2_datetime">
                              <strong>Bestellt am</strong><br/>
                              {{ order.state_2_datetime }}<br/>
                              <strong>Bestellt von</strong><br/>
                              {{ employeeMap[order.state_2_user_id]?.firstname ?? '' }} {{ employeeMap[order.state_2_user_id]?.lastname ?? '' }}<br/>
                            </div>
                          </div>
                          <div class="px-2 py-1 text-center border border-gray-300">
                            <button v-if="order.state != 3" @click="changeOrderState(order.id, 3)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs p-1 rounded">
                              Bestellung abholbereit
                            </button>
                            <div v-else class="font-bold text-red-600">
                              Abholbereit
                            </div>
                            <div class="text-xs" v-if="order.state_3_datetime">
                              <strong>Hinterlegt am</strong><br/>
                              {{ order.state_3_datetime }}<br/>
                              <strong>Hinterlegt von</strong><br/>
                              {{ employeeMap[order.state_3_user_id]?.firstname ?? '' }} {{ employeeMap[order.state_3_user_id]?.lastname ?? '' }}<br/>
                            </div>
                          </div>
                          <!--
                          <div class="px-2 py-1 text-center border border-gray-300">
                            <button v-if="order.state != 4" @click="changeOrderState(order.id, 4)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs p-1 rounded">
                              Bestellung abgeschlossen
                            </button>
                            <div v-else class="font-bold text-red-600">
                              Abgeschlossen
                            </div>
                            <div class="text-xs" v-if="order.state_4_datetime">
                              <strong>Abgeschlossen am</strong><br/>
                              {{ order.state_4_datetime }}<br/>
                              <strong>Abgeschlossen von</strong><br/>
                              {{ employeeMap[order.state_4_user_id]?.firstname ?? '' }} {{ employeeMap[order.state_4_user_id]?.lastname ?? '' }}<br/>
                            </div>
                          </div>
                          -->
                          <div class="px-2 py-1 text-center border border-gray-300">
                            <button v-if="order.state != 5" @click="changeOrderState(order.id, 5)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs p-1 rounded">
                              Bestellung stornieren
                            </button>
                            <div v-else class="font-bold text-red-600">
                              Storniert
                            </div>
                            <div class="text-xs" v-if="order.state_5_datetime">
                              <strong>Storniert am</strong><br/>
                              {{ order.state_5_datetime }}<br/>
                              <strong>Storniert von</strong><br/>
                              {{ employeeMap[order.state_5_user_id]?.firstname ?? '' }} {{ employeeMap[order.state_5_user_id]?.lastname ?? '' }}<br/>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="bg-gray-200">
                        <div class="text-center font-semibold pt-2">
                          Administrator-Kommentare
                        </div>
                        <div class="px-4 py-2">
                          <textarea class="w-full h-20 p-2 text-xs text-red-600" v-model="order.note" @input="onNoteInput(order)"></textarea>
                        </div>
                      </div>


                      <table class="w-full mb-1">
                        <thead class="bg-gray-300">
                            <tr>
                              <th class="px-4 py-2 text-left">Bild</th>
                              <th class="px-4 py-2 text-left">Art. Nr.</th>
                              <th class="px-4 py-2 text-left">Produkt</th>
                              <th class="px-4 py-2 text-left">Kundenkommentar</th>
                              <th class="px-4 py-2 text-left">Kosten</th>
                            </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in order.order_items">
                            <td>
                              <img :src="item.src1" alt="Reward Image" class="h-12 w-12 object-contain mx-2" v-if="item.src1">
                            </td>
                            <td class="text-sm text-gray-600">
                              {{ item.article_number }}
                            </td>
                            <td>
                              <span class="font-semibold" v-if="item.quantity > 1">{{ item.quantity }} x {{ item.name }}</span><span class="font-semibold">{{ item.name }}</span><br/>
                              <small class="text-gray-600">{{item.slogan}}</small>
                            </td>
                            <td class="text-sm text-gray-600">
                              {{ item.note }}
                            </td>
                            <td>
                              <span class="font-semibold">{{ (item.points * item.quantity) }} Punkte</span>
                              <!--<br/>
                              <small class="text-gray-600">{{ (item.euro/100 * item.quantity)}} EUR</small>-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                </div>

            </div>
        </div>
    </div>


    <div>
  </div>
</template>