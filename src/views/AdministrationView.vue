<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';


const newFaq = reactive({
  question: '',
  answer: '',
  sort_order: 0
});

import OrdersComponent from '../components/OrdersComponent.vue';

const store = useStore();

const jwt = computed(() => store.state.jwt);

const newProduct = ref<Product>({
  'id': 0,
  'name': '',
  'slogan': '',
  'description': '',
  'src1': null,
  'points': '',
  'price': '',
  'comment_required': false,
  'article_number': ''
});

interface Product {
  id: number;
  name: string;
  slogan: string;
  description: string;
  src1: string | ArrayBuffer | null; // Updated type for src1
  points: string;
  price: string;
  comment_required: boolean;
  article_number: string;
}
interface Reward {
  id: number;
  name: string;
  src1: string;
  slogan: string;
  selected: boolean;
  description: string;
  points: any;
  euro: any;
  is_active: boolean;
  comment_required: boolean;
  article_number: string;
}
interface LoginLog {
  id: number;
  remoteId: number;
  firstname: string;
  lastname: string;
  logged_in_at: string;
  ip_address: string;
}
interface AccessLog {
  id: number;
  remoteId: number;
  firstname: string;
  lastname: string;
  date: string;
  count: string;
}

const currentYear = new Date().getFullYear();
const year = ref(currentYear);
const lowestYear = ref(2023);
const highestYear = ref(currentYear);

const monthFiles = ref({});
const monthNames = [
    'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];
const fileLinks = ref({}); // Object to store the links


const uploadFile = async (monthIndex) => {
  const fileInput = document.getElementById(`fileInput${monthIndex}`) as HTMLInputElement;
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('Please select a file to upload.');
    return;
  }

  const file = fileInput.files[0];
  const month = (monthIndex + 1).toString().padStart(2, '0'); // Define the month variable

  let formData = new FormData();
  formData.append('file', file);
  formData.append('year', year.value.toString());
  formData.append('month', month);

  try {
    await axios.post('../api/infoblaetter/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${jwt.value}` // Add your auth token
      }
    });
    alert('Datei wurde erfolgreich hochgeladen.');
    getInfoblaetter();
  } catch (error) {
    console.error(error);
    getInfoblaetter();
    alert('Fehler beim Hochladen der Datei.');
  }
};


const isAdministrator = computed(() => {
    const user = store.state.user; // Directly accessing user from the state
    if (!user) return false; // Check if user is null
    return user.isAdministrator || user.isDeveloper;
});


const showGreeting = ref(false);
const showFAQ = ref(false);
const showWishes = ref(false);
//const showUserSimulation = ref(false);
const showAccessLog = ref(false);
//const showQuestion1 = ref(false);
const showLoginLog = ref(false);
const showShifts = ref(false);
const showInfoblaetter = ref(false);
const showNewProduct = ref(false);
const showEditProduct = ref(false);
const showDeletePopup = ref(false);

const accessLogs = ref<AccessLog[]>([]);
const loginLogs = ref<LoginLog[]>([]);
const rewards = ref<Reward[]>([]);
const orders = ref<any[]>([]);

const saveRunning = ref(false);


const greeting = ref("");
const getGreeting = async () => {
  greeting.value = "";
  try {
    const response = await axios.get('../api/greeting', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    console.log(response.data.text);
    greeting.value = response.data.text;
  } catch (error) {
    console.error(error);
  }
};
const updateGreeting = async () => {
  try {
    const response = await axios.patch('/api/greeting', { text: greeting.value }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt.value}`,
      },
    });

    console.log('Greeting updated successfully:', response.data);
    // Optionally, clear the textarea or give user feedback
  } catch (error) {
    console.error('Error updating greeting:', error);
    // Handle error (e.g., user feedback)
  }
};



const toDeleteReward = ref<Reward | null>(null);


const newImage = ref<string | null>(null);
const selectedImageUpdate = ref<string | null>(null);

const selectedReward = computed(() => {
  const found = rewards.value.find(reward => reward.selected);
  return found || null;
});
const selectReward = (selectedReward) => {
  rewards.value.forEach(reward => {
    if(reward === selectedReward){
      reward.selected = true;
      selectedImageUpdate.value = reward.src1;
    }else{
      reward.selected = false;
    }
  });
};
const abortDeletion = async () => {
  toDeleteReward.value = null;
};
const deleteReward = async () => {
  if (toDeleteReward.value) {
    try {
      // Sending a DELETE request to your Laravel backend
      await axios.delete(`/api/rewards/${toDeleteReward.value.id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${jwt.value}`,
        },
      });
      toDeleteReward.value = null;
      getRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  } else {
    console.error('Attempted to delete a reward, but no reward was selected');
  }
  showDeletePopup.value = false;
};

const getLoginLogs = async () => {
  loginLogs.value = [];
  try {
    const response = await axios.get('/api/login-logs', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      },
    });
    loginLogs.value = response.data.data.sort((a: LoginLog, b: LoginLog) => {
      return new Date(b.logged_in_at).getTime() - new Date(a.logged_in_at).getTime();
    });
  } catch (error) {
    console.error(error);
  }
};
const getAccessLogs = async () => {
  loginLogs.value = [];
  try {
    const response = await axios.get('/api/access-logs', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      },
    });
    accessLogs.value = response.data.data.sort((a: AccessLog, b: AccessLog) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error(error);
  }
};
const getRewards = async () => {
  rewards.value = [];
  try {
    const response = await axios.get('../api/allRewards', {
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

const getInfoblaetter = async () => {
    try {
        const response = await axios.get(`../api/infoblaetter/${year.value}`, {
            headers: {
                Accepts: "application/json",
                Authorization: `Bearer ${jwt.value}`
            }
        });
        monthFiles.value = response.data.data[0];
        parseResponseData(response.data);
    } catch (error) {
        console.error(error);
    }
};
const parseResponseData = (responseData) => {
  if (responseData.data.length > 0) {
    const yearData = responseData.data[0];
    for (let month = 1; month <= 12; month++) {
      let monthKey = month.toString().padStart(2, '0'); // Ensure month is in '01', '02', ... format
      fileLinks.value[monthKey] = yearData[monthKey]; // Assign link to the corresponding month
    }
  } else {
    fileLinks.value = {}; // Reset if no data
  }
};

onMounted(() => {
  getAccessLogs();
  getLoginLogs();
  getGreeting();
  getRewards();
  getOrders();
  getFAQs();
  getInfoblaetter();
});


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



const previewImage = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      newImage.value = e.target?.result as string | null;
    };
    reader.readAsDataURL(file);
  }
};

const previewEditImage = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImageUpdate.value = e.target?.result as string | null;
    };
    reader.readAsDataURL(file);
  }
};


const saveNewProduct = async () => {
  saveRunning.value = true;
  try {
    const payload = {
      ...newProduct.value,
      src1: newImage.value
    };
    const response = await axios.post('/api/rewards', payload, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`,
      },
    });

    console.log('Product saved successfully:', response.data);

    newProduct.value = {
      id: 0,
      name: '',
      slogan: '',
      description: '',
      src1: null,
      points: '',
      price: '',
      comment_required: false,
      article_number: ''
    };
  } catch (error) {
    console.error('Error saving product:', error);
  }
  saveRunning.value = false;
  showNewProduct.value = false;
  showEditProduct.value = true;
  getRewards();
};

const updateProduct = async () => {
  if (selectedReward.value) {
    saveRunning.value = true;
    try {
      const payload = {
        ...selectedReward.value,
        src1: selectedImageUpdate.value
      };
      const response = await axios.put(`/api/rewards/${selectedReward.value.id}`, payload, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${jwt.value}`,
          'Content-Type': 'application/json', // Indicating that the request body is JSON
        },
      });

      console.log('Product updated successfully:', response.data);

      // Optional: Fetch updated rewards list or handle UI updates
      // getRewards(); or other UI update logic
    } catch (error) {
      console.error('Error updating product:', error);
    }
    saveRunning.value = false;
    selectReward(null);
    getRewards();
  }
};

async function downloadFile(monthIndex) {
  const monthKey = ('0' + (monthIndex + 1)).slice(-2);
  const fileLink = fileLinks.value[monthKey];
  if (!fileLink) return;

  try {
    const response = await axios.get(`/api/${fileLink}`, {
      headers: {
        Authorization: `Bearer ${jwt.value}`
      },
      responseType: 'blob', // Important to handle PDF files
    });

    // Create a Blob from the PDF Stream
    const file = new Blob([response.data], { type: 'application/pdf' });
    // Build a URL from the file
    const fileURL = URL.createObjectURL(file);
    // Open the URL on new Window
    window.open(fileURL);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};



const faqs = ref<any[]>([]);

const getFAQs = async () => {
  faqs.value = [];
  try {
    const response = await axios.get('../api/faqs', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    faqs.value = response.data.data.map(faq => ({
      ...faq,
      isOpen: false,
    })).sort((a, b) => a.sort_order - b.sort_order); // Ensure client-side sorting as a fallback
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
  }
};

const toggleFAQ = (faq) => {
  faq.isOpen = !faq.isOpen;
};
const addNewFAQ = async () => {
  if (!newFaq.question.trim() || !newFaq.answer.trim()) {
    alert('Please fill in both the question and answer.');
    return;
  }

  try {
    await axios.post('../api/faqs', newFaq, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });

    // Add the newly created FAQ to the local list and clear the form
    newFaq.question = '';
    newFaq.answer = '';
    getFAQs();
  } catch (error) {
    console.error('Failed to add new FAQ:', error);
  }
};
const saveFAQ = async (faq) => {
  try {
    const url = faq.id ? `../api/faqs/${faq.id}` : '../api/faqs';
    await axios.post(url, {
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order // Include sort_order in the payload
    }, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    getFAQs(); // Refresh the list to reflect changes
  } catch (error) {
    console.error('Failed to save FAQ:', error);
  }
};
const deleteFAQ = async (faqId) => {
  // Confirm with the user
  if (!confirm('Soll dieser Eintrag wirklich gelöscht werden?')) {
    return; // Stop if the user cancels
  }

  try {
    await axios.delete(`../api/faqs/${faqId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    // Remove the FAQ from the local list
    faqs.value = faqs.value.filter(f => f.id !== faqId);
  } catch (error) {
    console.error('Failed to delete FAQ:', error);
  }
};




const toggleShowFAQ = async () => {
  showFAQ.value = !showFAQ.value;
};
const toggleShowWishes = async () => {
  showWishes.value = !showWishes.value;
};
/*
const toggleShowUserSimulation = async () => {
  showUserSimulation.value = !showUserSimulation.value;
};*/

const toggleShowGreeting = async () => {
  showGreeting.value = !showGreeting.value;
};

const toggleShowAccessLog = async () => {
  showAccessLog.value = !showAccessLog.value;
};
/*
const toggleShowQuestion1 = async () => {
  showQuestion1.value = !showQuestion1.value;
};
*/
const toggleShowLoginLog = async () => {
  showLoginLog.value = !showLoginLog.value;
};

const toggleShowShifts = async () => {
  showShifts.value = !showShifts.value;
};



const toggleShowInfoblaetter = async () => {
  showInfoblaetter.value = !showInfoblaetter.value;
};
const toggleNewProduct = async () => {
  showNewProduct.value = !showNewProduct.value;
};
const toggleEditProduct = async () => {
  showEditProduct.value = !showEditProduct.value;
};

const pressedDelete = async (reward) => {
  showDeletePopup.value = true;
  toDeleteReward.value = reward;
};
async function changeYear(direction) {
  if ((direction === -1 && year.value > lowestYear.value) || (direction === 1 && year.value < highestYear.value)) {
    year.value += direction;
    //loading.value = true;
    await getInfoblaetter();
  }
}



const dateSelection = ref('');
const locationSelection = ref('');
const personalNumber = ref('');
const sendRequest = async () => {
  filteredShifts.value = [];
    try {
        const response = await axios.post('/api/shifts/search', {
            date: dateSelection.value,
            location: locationSelection.value,
            personalNumber: personalNumber.value
        }, {
            headers: {
                Authorization: `Bearer ${jwt.value}`
            }
        });
        console.log(response.data);
        filteredShifts.value = response.data.data;
        // Handle response
    } catch (error) {
        console.error('There was an error!', error);
        // Handle error
    }
};
const sendNewPoints = async (shift) => {
    try {
        const response = await axios.post('/api/shifts/update-points', {
            id: shift.id,
            overwrittenPoints: shift.overwrittenPoints
        }, {
            headers: {
                Authorization: `Bearer ${jwt.value}`
            }
        });
        // Handle success
        console.log('Points updated successfully', response);
        alert("Gespeichert");
    } catch (error) {
        // Handle error
        console.error('Error updating points', error);
        alert("Error");
    }
};

interface Shift {
  id: number;
    employeeId: string; // or number, depending on your data
    start: string; // Assuming it's a string, adjust if it's a Date
    end: string; // Same as above
    demandType: string;
    location: number; // or string, depending on your data
    points: string;
    overwrittenPoints: number;
}
const filteredShifts = ref<Shift[]>([]);

const formatPoints = (points) => {
  const numericPoints = parseFloat(points);
  return Number.isInteger(numericPoints) ? numericPoints.toString() : points;
};

const formatDate = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleDateString();
};

const formatTime = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getLocationName = (locationId) => {
  switch(locationId) {
    case 39: return 'Haugsdorf';
    case 38: return 'Hollabrunn';
    default: return locationId;
  }
};


</script>

<template>
  <div class="bg-gray-200 pt-4">
    <div class="flex justify-center mb-8 mt-2">
      <div class="w-full max-w-2xlrounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 bg-red-300 border border-red-600">
        <div class="px-4 py-2 text-sm text-center font-bold text-gray-800">
          Diese Seite ist nur für Administratoren und Moderatoren sichtbar.
        </div>
      </div>
    </div>

    
    <div class="flex flex-col justify-center items-center mb-6 mx-2">


      <OrdersComponent></OrdersComponent>



      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Benutzer Zugriffs Log
            <div v-if="showAccessLog" @click="toggleShowAccessLog()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showAccessLog" @click="toggleShowAccessLog()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div v-if="showAccessLog">
            <div class="overflow-x-auto">
              <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
                <thead>
                  <tr class="bg-red-800 text-white">
                    <th class="px-2 py-1 text-left">Zugriffsdatum (UTC)</th>
                    <th class="px-2 py-1 text-left">Nummer</th>
                    <th class="px-2 py-1 text-left">Vorname</th>
                    <th class="px-2 py-1 text-left">Nachname</th>
                    <th class="px-2 py-1 text-left">API-Aufrufe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(log, index) in accessLogs" :key="log.id" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                    <td class="px-2 py-1">{{ log.date }}</td>
                    <td class="px-2 py-1">
                      <router-link 
                        :to="'/dienste-' + log.remoteId"
                        class="text-gray-500 no-underline hover:text-blue-700 hover:underline">
                        {{ log.remoteId }}
                      </router-link>
                    </td>
                    <td class="px-2 py-1">{{ log.firstname }}</td>
                    <td class="px-2 py-1">{{ log.lastname }}</td>
                    <td class="px-2 py-1">{{ log.count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>



      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Benutzer Anmeldungen Log
            <div v-if="showLoginLog" @click="toggleShowLoginLog()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showLoginLog" @click="toggleShowLoginLog()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div v-if="showLoginLog">
            <div class="overflow-x-auto">
              <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
                <thead>
                  <tr class="bg-red-800 text-white">
                    <th class="px-2 py-1 text-left">Anmeldedatum (UTC)</th>
                    <th class="px-2 py-1 text-left">Nummer</th>
                    <th class="px-2 py-1 text-left">Vorname</th>
                    <th class="px-2 py-1 text-left">Nachname</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(log, index) in loginLogs" :key="log.id" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                    <td class="px-2 py-1">{{ log.logged_in_at }}</td>
                    <td class="px-2 py-1">
                      <router-link 
                        :to="'/dienste-' + log.remoteId"
                        class="text-gray-500 no-underline hover:text-blue-700 hover:underline">
                        {{ log.remoteId }}
                      </router-link>
                    </td>
                    <td class="px-2 py-1">{{ log.firstname }}</td>
                    <td class="px-2 py-1">{{ log.lastname }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Begrüßungs Text
            <div v-if="showGreeting" @click="toggleShowGreeting()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showGreeting" @click="toggleShowGreeting()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div v-if="showGreeting">
            <div class="overflow-x-auto">
              <p class="text-center font-semibold">
                Welcher Text soll dem Benutzer auf der Startseite angezeigt werden?
              </p>
              <p>
                <textarea class="w-full h-32 border border-gray-400 rounded-md p-2 mt-2" v-model="greeting"></textarea>
              </p>
              <p>
                <button @click="updateGreeting" class="bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm">
                  Speichern
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>


      <!--
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Benutzer simulieren
            <div v-if="showUserSimulation" @click="toggleShowUserSimulation()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showUserSimulation" @click="toggleShowUserSimulation()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div v-if="showUserSimulation">
            <div class="overflow-x-auto">
              ToDo
            </div>
          </div>
        </div>
      </div>
      -->



      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Häufig gestellte Fragen (FAQ)
            <div v-if="showFAQ" @click="toggleShowFAQ()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showFAQ" @click="toggleShowFAQ()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div v-if="showFAQ">
            <div class="overflow-x-auto">

              <div class="mb-4 p-4 border rounded shadow bg-gray-300">
                <h3 class="mb-2">Eine neue Frage und Antwort eintragen</h3>
                <div>
                  <input type="text" v-model="newFaq.question" placeholder="Neue Frage eingeben" class="w-full p-2 border rounded mb-2 border-red-700" />
                  <textarea v-model="newFaq.answer" placeholder="Neue Antwort eingeben" class="w-full p-2 border rounded mb-2 border-red-700" rows="3"></textarea>
                  <input type="number" v-model="newFaq.sort_order" placeholder="Sortierreihenfolge" class="w-full p-2 border rounded mb-2 border-red-700" />
                  <button @click="addNewFAQ" class="bg-red-600 text-white p-2 rounded">Neue Frage und Antwort speichern</button>
                </div>
              </div>

              <div v-for="faq in faqs" :key="faq.id" class="mb-4 p-2 border rounded shadow bg-gray-300">
                <div class="flex justify-between items-center cursor-pointer" @click="toggleFAQ(faq)">
                  <span class="font-semibold">{{ faq.question }}</span>
                  <div v-if="faq.isOpen">
                      <i class="fas fa-chevron-up"></i>
                  </div>
                  <div v-else>
                      <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
                <div v-if="faq.isOpen" class="mt-4 text-center">
                  <input type="text" v-model="faq.question" class="w-full p-1 border rounded border-red-700" />
                  <textarea v-model="faq.answer" class="w-full p-1 border rounded mt-2 border-red-700" rows="3"></textarea>
                  <input type="number" v-model="faq.sort_order" class="w-full p-1 border rounded mb-2 border-red-700" placeholder="Sortierreihenfolge" />
                  <button @click.stop="saveFAQ(faq)" class="bg-red-600 text-white p-2 rounded mt-2 font-bold">FAQ Speichern</button>
                  <button @click.stop="deleteFAQ(faq.id)" class="bg-gray-500 text-white p-2 rounded mt-2 ml-2">FAQ Löschen</button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      

      
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Dienst-Punktevergabe verwalten
            <div v-if="showShifts" @click="toggleShowShifts()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showShifts" @click="toggleShowShifts()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div v-if="showShifts">
            <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
              <thead>
                <tr class="bg-red-800 text-white">
                  <th class="px-2 py-1 text-left">Datum</th>
                  <th class="px-2 py-1 text-left">Dienststelle</th>
                  <th class="px-2 py-1 text-left">Personalnummer</th>
                  <th class="px-2 py-1 text-left"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td class="px-2 py-1">
                        <input type="date" v-model="dateSelection" class="shadow appearance-none border-gray-800 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </td>
                    <td class="px-2 py-1">
                        <select v-model="locationSelection" class="shadow appearance-none border border-gray-800 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="none">None</option>
                            <option value="Hollabrunn">Hollabrunn</option>
                            <option value="Haugsdorf">Haugsdorf</option>
                        </select>
                    </td>
                    <td class="px-2 py-1">
                        <input type="text" v-model="personalNumber" class="shadow appearance-none border border-gray-800 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </td>
                    <td class="px-2 py-1 text-center">
                        <button @click="sendRequest" class="bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm">
                            Suche starten
                        </button>
                    </td>
                </tr>
              </tbody>
            </table>

            <div class="my-3">
              <strong>Information</strong><br>
              Es werden maximal 10 Einträge angezeigt. <br>
              Die neuen Punkte werden erst in der Nacht übernommen und die Neuberechnung der Rangliste erfolgt ebenfalls in der Nacht.<br/>
              <a href="https://intern.rkhl.at/api/startPointsCalculationForAllEmployees" target="_blank" class="text-blue-500">Die Punkteberechnung jetzt sofort neu starten</a><br/>
              <a href="https://intern.rkhl.at/api/startRankingCalculation" target="_blank" class="text-blue-500">Die Ranking Berechnung jetzt sofort neu starten (Bitte erst nachdem die Punkteberechnung fertig ist)</a>
            </div>

            <div class="overflow-x-auto mt-8">
              <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
                <thead>
                  <tr class="bg-red-800 text-white">
                    <th class="px-2 py-1 text-left">Datum</th>
                    <th class="px-2 py-1 text-left">Nummer</th>
                    <th class="px-2 py-1 text-left">Beginn</th>
                    <th class="px-2 py-1 text-left">Ende</th>
                    <th class="px-2 py-1 text-left">Klasse</th>
                    <th class="px-2 py-1 text-left hidden sm:table-cell">Dienststelle</th>
                    <th class="px-2 py-1 text-left">Punkte</th>
                    <th class="px-2 py-1 text-left">Punkte Neu</th>
                    <th class="px-2 py-1 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(shift, index) in filteredShifts" :key="shift.id"  :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                    <td class="px-2 py-1">{{ formatDate(shift.start) }}</td>
                    <td class="px-2 py-1">{{ shift.employeeId }}</td>
                    <td class="px-2 py-1">{{ formatTime(shift.start) }}</td>
                    <td class="px-2 py-1">{{ formatTime(shift.end) }}</td>
                    <td class="px-2 py-1">{{ shift.demandType }}</td>
                    <td class="px-2 py-1 hidden sm:table-cell">{{ getLocationName(shift.location) }}</td>
                    <td class="px-2 py-1">
                      <span v-if="shift.overwrittenPoints !== null" class="text-gray-400 line-through">
                        {{ formatPoints(shift.points) }}
                      </span>
                      <span v-else>
                        {{ formatPoints(shift.points) }}
                      </span>
                      <span v-if="shift.overwrittenPoints !== null">
                        / 
                      </span>
                      <span v-if="shift.overwrittenPoints !== null">
                        {{ formatPoints(shift.overwrittenPoints) }}
                      </span>
                    </td>
                    <td class="px-2 py-1"><input type="text" v-model="shift.overwrittenPoints" class="w-16 shadow appearance-none border border-gray-800 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></td>
                    <td class="px-2 py-1">
                      <button @click="sendNewPoints(shift)" class="bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm">
                        speichern
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>


          </div>
        </div>
      </div>









      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Infoblätter

            <div class="flex items-center font-bold text-base md:text-xl text-gray-500">
              <div 
                class="cursor-pointer"
                :class="{ 'text-gray-300': year === lowestYear, 'cursor-not-allowed': year === lowestYear }"
                @click="changeYear(-1)">
                <i class="fa fa-chevron-left"></i>
              </div>
              <div class="mx-2">{{ year }}</div>
              <div 
                class="cursor-pointer mr-5"
                :class="{ 'text-gray-300': year === highestYear, 'cursor-not-allowed': year === highestYear }"
                @click="changeYear(1)">
                <i class="fa fa-chevron-right"></i>
              </div>
              
              <div v-if="showInfoblaetter" @click="toggleShowInfoblaetter()" class="cursor-pointer pr-2">
                  <i class="fas fa-chevron-up"></i>
              </div>
              <div v-if="!showInfoblaetter" @click="toggleShowInfoblaetter()" class="cursor-pointer pr-2">
                  <i class="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <div v-if="showInfoblaetter">
            <div class="overflow-x-auto">

              <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
                <thead>
                  <tr class="bg-red-800 text-white">
                    <th class="px-2 py-1 text-left">Monat</th>
                    <th class="px-2 py-1 text-center">Datei ansehen</th>
                    <th class="px-2 py-1 text-center">Datei hochladen</th>
                    <th class="px-2 py-1 text-center">Hochladen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(monthName, index) in monthNames" :key="index" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                    <td class="px-2 py-1">{{ monthName }}</td>
                    <td class="px-2 py-1 text-center">
                      <template v-if="fileLinks[('0' + (index + 1)).slice(-2)]">
                        <button @click="downloadFile(index)">öffnen</button>
                      </template>
                      <template v-else>
                        -
                      </template>
                    </td>
                    <td class="px-2 py-1 text-center">
                      <input type="file" class="text-xs leading-tight focus:outline-none focus:shadow-outline" :id="`fileInput${index}`">
                    </td>
                    <td class="px-2 py-1 text-center">
                      <button class="bg-blue-500 hover:bg-blue-700 text-white text-xs font-semibold py-1 px-2 rounded focus:outline-none focus:shadow-outline mx-auto" @click="uploadFile(index)">
                        Datei speichern
                      </button>
                    </td>
                  </tr>


                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>




      
<!--
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Umfrage - Frage 1
            <div v-if="showQuestion1" @click="toggleShowQuestion1()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showQuestion1" @click="toggleShowQuestion1()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div v-if="showQuestion1">
            <div class="overflow-x-auto">

              <p class="text-center font-semibold">
                Welche Frage soll dem Benutzer auf der Startseite angezeigt werden?
              </p>
              <p>
                <textarea class="w-full h-32 border border-gray-400 rounded-md p-2 mt-2" v-model="greeting"></textarea>
              </p>
              <p>
                <button @click="updateGreeting" class="bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm">
                  Speichern
                </button>
              </p>

            </div>
          </div>
        </div>
      </div>
    -->




      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Neues Produkt anlegen
            <div v-if="showNewProduct" @click="toggleNewProduct()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showNewProduct" @click="toggleNewProduct()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div class="flex w-full my-2 justify-center items-center" v-if="showNewProduct && saveRunning">
            <div class="flex items-center mt-4">
              <i class="fas fa-spinner fa-spin text-gray-500 text-lg mr-2"></i>
              <span class="text-gray-500 text-lg">Produkt wird gespeichert</span>
            </div>
          </div>
          <div v-if="showNewProduct && !saveRunning">
            <div class="grid grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Produktname</label>
                <input type="text" v-model="newProduct.name" id="name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
              </div>
              <div class="mb-4">
                <label for="slogan" class="block text-gray-700 text-sm font-bold mb-2">Zusatztext</label>
                <input type="text" v-model="newProduct.slogan" id="slogan" name="slogan" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
            </div>
  
            <div class="grid grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Beschreibung</label>
                <textarea id="description" v-model="newProduct.description" name="description" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
              </div>
              <div class="mb-4">
                <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Bild</label>
                <input type="file" id="image" name="image" class="shadow w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" @change="previewImage">
              </div>
            </div>
  
            <div class="grid grid-cols-2 gap-4">
              <div class="mb-4">
                  <label for="points" class="block text-gray-700 text-sm font-bold mb-2">Punkte</label>
                  <input type="number" v-model="newProduct.points" id="points" name="points" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
              <div class="mb-4">
                  <label for="price" class="block text-gray-700 text-sm font-bold mb-2">Preis in cent</label>
                  <input type="number" v-model="newProduct.price" step="1" id="price" name="price" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="mb-4">
                  <label for="article_number" class="block text-gray-700 text-sm font-bold mb-2">Artikelnummer RK-Shop</label>
                  <input type="text" v-model="newProduct.article_number" id="article_number" name="article_number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
            </div>

            
            <div class="grid grid-cols-2 gap-4">
              <div class="mb-4 flex">
                <label for="points" class="block text-gray-700 text-sm font-bold mb-2">Kommentar erforderlich?</label>
                <div class=" hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mx-auto text-center cursor-pointer"
                :class="{ 'bg-blue-500': newProduct.comment_required, 'bg-gray-300':!newProduct.comment_required }" @click="newProduct.comment_required = true">
                  Ja
                </div>
                <div class=" hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mx-auto text-center cursor-pointer"
                :class="{ 'bg-blue-500': !newProduct.comment_required, 'bg-gray-300':newProduct.comment_required }" @click="newProduct.comment_required = false">
                  Nein
                </div>
              </div>
            </div>

  
            <!--
            <div class="grid grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="valid_from" class="block text-gray-700 text-sm font-bold mb-2">Gültig ab</label>
                <input type="date" id="valid_from" name="valid_from" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
              <div class="mb-4">
                <label for="valid_to" class="block text-gray-700 text-sm font-bold mb-2">Gültig bis</label>
                <input type="date" id="valid_to" name="valid_to" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
            </div>
            -->
        
            <div class="flex items-center justify-center mb-8">
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto" @click="saveNewProduct">
                Produkt hinzufügen
              </button>
            </div>
  
            <div class="mt-6 py-2 px-4 border-2 border-slate-400">
              <div class="flex justify-center items-center w-full text-center mb-6 pb-1 border-b border-gray-400 font-bold">
                Live Produktvorschau &nbsp; <span class="text-gray-400 text-xs">(links)</span>
              </div>
  
              
              <!-- Products Container -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-16">
  
                <!-- Product 1 -->
                <div class="">
                  <div class="w-full border-b border-b-gray-200">
                      <div class="font-bold">
                          {{ newProduct.name !== '' ? newProduct.name : 'Platzhalter Titel'}}
                      </div>
                      <div class="text-gray-500 font-normal">
                        {{ newProduct.slogan !== '' ? newProduct.slogan : 'Platzhalter Slogan'}}
                      </div>
                  </div>
                  <div class="w-full mb-1 text-sm text-gray-500 p-1 max-h-32 overflow-hidden text-justify">
                    {{
                      (newProduct && newProduct.description && newProduct.description.length > 1) ? newProduct.description : 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'
                    }}
                  </div>
                  <div class="flex flex-row w-full">
                      <div class="w-2/3 p-4 h-44 flex items-center justify-center">
                        <div class="w-full h-full">
                            <img :src="(newImage !== null) ? newImage : 'https://intern.rkhl.at/images/demo_image2.PNG'" alt="Image preview" class="w-full h-full object-contain"/>
                        </div>
                      </div>
                      <div class="w-1/3 h-44 justify-center mt-3">
                        <div class="font-semibold py-2 text-center">
                          {{ newProduct.points !== '' ? newProduct.points.toLocaleString() : 'X.XXX'  }} Punkte<br/>
                          <span class="text-sm text-gray-400">
                            {{ newProduct.price !== '' ? ((+newProduct.price) / 100).toLocaleString() : 'XX,XX' }} Euro
                          </span>
                        </div>
                        <button class="bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm">
                          In den Warenkorb
                        </button>
                      </div>
                  </div>
                </div>
  
                <!-- Product 2 -->
                <div class="">
                  <div class="w-full border-b border-b-gray-200">
                      <div class="font-bold">
                        Uniformpolo Funktionsfaser Damen
                      </div>
                      <div class="text-gray-500 font-normal">
                        mit Schulterlaschen
                      </div>
                  </div>
                  <div class="w-full mb-1 text-sm text-gray-500 p-1 max-h-32 overflow-hidden text-justify">
                    aus weißer TENCEL® Faser, leicht, atmungsaktiv und feuchtigkeitsabsorbierend Logostick an rechter Brust und linkem Ärmel mit Napoleontasche mit Schulterlaschen angenehmer, leicht kühlender Tragekomfort Pflegeleicht, kein Bügeln, 60° Wäsche
                    Damengrößen von Gr. 32 - Gr. 54
                  </div>
                  <div class="flex flex-row w-full">
                      <div class="w-2/3 p-4 h-44 flex items-center justify-center">
                        <div class="w-full h-full">
                            <img src="https://intern.rkhl.at/images/demo_image1.PNG" alt="Image preview" class="w-full h-full object-contain"/>
                        </div>
                      </div>
                      <div class="w-1/3 h-44 justify-center mt-3">
                        <div class="font-semibold py-2 text-center">3.150 Punkte<br/><span class="text-sm text-gray-400">31,50 Euro</span></div>
                        <button class=" bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm">
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




      

      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Produkte verwalten
            <div v-if="showEditProduct" @click="toggleEditProduct()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showEditProduct" @click="toggleEditProduct()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div class="flex w-full my-2 justify-center items-center" v-if="showEditProduct && saveRunning">
            <div class="flex items-center mt-4">
              <i class="fas fa-spinner fa-spin text-gray-500 text-lg mr-2"></i>
              <span class="text-gray-500 text-lg">Produkt wird gespeichert</span>
            </div>
          </div>
          <div v-if="showEditProduct && !saveRunning">

            <div class="overflow-x-auto mb-10">
              <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
                <thead>
                  <tr class="bg-gray-400">
                    <th class="px-2 py-1 text-left"></th>
                    <th class="px-2 py-1 text-left">Produkt</th>
                    <th class="px-2 py-1 text-left">Zusatztext</th>
                    <th class="px-2 py-1 text-center"></th>
                    <th class="px-2 py-1 text-center"></th>
                    <th class="px-2 py-1 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(reward, index) in rewards" :key="reward.id" 
                      :class="{
                        'bg-gray-200': index % 2 === 0 && !reward.selected, 
                        'bg-blue-400': reward.selected, 
                        'hover:bg-blue-300': true}">
                      <td class="px-2 py-1">
                        <div v-if="reward.selected">
                          <i class="fa-solid fa-right"></i>
                        </div>
                      </td>
                      <td class="px-2 py-1" :class="{ 'text-gray-400': !reward.is_active }"><span v-if="!reward.is_active">[inaktiv] </span>{{ reward.name }}</td>
                      <td class="px-2 py-1" :class="{ 'text-gray-400': !reward.is_active }"><span v-if="!reward.is_active">[inaktiv] </span>{{ reward.slogan }}</td>
                      <th class="px-2 py-1 text-center">
                        <div v-if="reward.is_active">
                          <i class="fa-solid fa-eye"></i>
                        </div>
                        <div v-if="!reward.is_active">
                          <i class="fa-solid fa-eye-slash text-gray-400"></i>
                        </div>
                      </th>
                      <td class="px-2 py-1 cursor-pointer" :class="{ 'text-gray-400': !reward.is_active }" @click="selectReward(reward)"><i class="fa-solid fa-pen-to-square"></i></td>
                      <td class="px-2 py-1 cursor-pointer" :class="{ 'text-gray-400': !reward.is_active }" @click="pressedDelete(reward)"><i class="fa-solid fa-trash"></i></td>
                  </tr>
                </tbody>
              </table>
            </div>


            <div v-if="selectedReward != null">
              <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                  <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Produktname</label>
                  <input type="text" v-model="selectedReward.name" id="name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-4">
                  <label for="slogan" class="block text-gray-700 text-sm font-bold mb-2">Zusatztext</label>
                  <input type="text" v-model="selectedReward.slogan" id="slogan" name="slogan" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
              </div>
    
              <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                  <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Beschreibung</label>
                  <textarea id="description" v-model="selectedReward.description" name="description" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                </div>
                <div class="mb-4">
                  <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Bild</label>
                  <input type="file" id="image" name="image" class="shadow w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" @change="previewEditImage">
                </div>
              </div>
    
              <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label for="points" class="block text-gray-700 text-sm font-bold mb-2">Punkte</label>
                    <input type="number" v-model="selectedReward.points" id="points" name="points" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="mb-4">
                    <label for="price" class="block text-gray-700 text-sm font-bold mb-2">Preis in cent</label>
                    <input type="number" v-model="selectedReward.euro" step="1" id="price" name="price" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
              </div>


              <div class="grid grid-cols-2 gap-4">
                <div class="mb-4 flex">
                    <label for="points" class="block text-gray-700 text-sm font-bold mb-2">Produkt sichtbar?</label>
                    <div class=" hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mx-auto text-center cursor-pointer"
                    :class="{ 'bg-blue-500': selectedReward.is_active, 'bg-gray-300':!selectedReward.is_active }" @click="selectedReward.is_active = true">
                      Ja
                    </div>
                    <div class=" hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mx-auto text-center cursor-pointer"
                    :class="{ 'bg-blue-500': !selectedReward.is_active, 'bg-gray-300':selectedReward.is_active }" @click="selectedReward.is_active = false">
                      Nein
                    </div>
                </div>
                <div class="mb-4 flex">
                    <label for="points" class="block text-gray-700 text-sm font-bold mb-2">Kommentar erforderlich?</label>
                    <div class=" hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mx-auto text-center cursor-pointer"
                    :class="{ 'bg-blue-500': selectedReward.comment_required, 'bg-gray-300':!selectedReward.comment_required }" @click="selectedReward.comment_required = true">
                      Ja
                    </div>
                    <div class=" hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mx-auto text-center cursor-pointer"
                    :class="{ 'bg-blue-500': !selectedReward.comment_required, 'bg-gray-300':selectedReward.comment_required }" @click="selectedReward.comment_required = false">
                      Nein
                    </div>
                </div>
              </div>


              <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label for="article_number" class="block text-gray-700 text-sm font-bold mb-2">Artikelnummer RK-Shop</label>
                    <input type="text" v-model="selectedReward.article_number" id="article_number" name="article_number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
              </div>


    
              <div class="flex items-center justify-center mb-8">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto" @click="updateProduct">
                  Produkt ändern
                </button>
              </div>
    
              <div class="mt-6 py-2 px-4 border-2 border-slate-400">
                <div class="flex justify-center items-center w-full text-center mb-6 pb-1 border-b border-gray-400 font-bold">
                  Live Produktvorschau &nbsp; <span class="text-gray-400 text-xs">(links)</span>
                </div>
    
                
                <!-- Products Container -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-16">
    
                  <!-- Product 1 -->
                  <div class="">
                    <div class="w-full border-b border-b-gray-200">
                        <div class="font-bold">
                            {{ selectedReward.name !== '' ? selectedReward.name : 'Platzhalter Titel'}}
                        </div>
                        <div class="text-gray-500 font-normal">
                          {{ selectedReward.slogan !== '' ? selectedReward.slogan : 'Platzhalter Slogan'}}
                        </div>
                    </div>
                    <div class="w-full mb-1 text-sm text-gray-500 p-1 max-h-32 overflow-hidden text-justify">
                      {{ (selectedReward && selectedReward.description && selectedReward.description.length > 1) ? selectedReward.description : 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'}}
                    </div>
                    <div class="flex flex-row w-full">
                        <div class="w-2/3 p-4 h-44 flex items-center justify-center">
                          <div class="w-full h-full">
                              <img :src="(selectedImageUpdate !== null) ? selectedImageUpdate : 'https://intern.rkhl.at/images/demo_image2.PNG'" alt="Image preview" class="w-full h-full object-contain"/>
                          </div>
                        </div>
                        <div class="w-1/3 h-44 justify-center mt-3">
                          <div class="font-semibold py-2 text-center">
                            {{ selectedReward.points !== '' ? selectedReward.points.toLocaleString() : 'X.XXX'  }} Punkte<br/>
                            <span class="text-sm text-gray-400">{{ selectedReward.euro !== '' ? (selectedReward.euro/100).toLocaleString() : 'XX,XX'  }} Euro</span>
                          </div>
                          <button class="bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm">
                            In den Warenkorb
                          </button>
                        </div>
                    </div>
                  </div>
    
                  <!-- Product 2 -->
                  <div class="">
                    <div class="w-full border-b border-b-gray-200">
                        <div class="font-bold">
                          Uniformpolo Funktionsfaser Damen
                        </div>
                        <div class="text-gray-500 font-normal">
                          mit Schulterlaschen
                        </div>
                    </div>
                    <div class="w-full mb-1 text-sm text-gray-500 p-1 max-h-32 overflow-hidden text-justify">
                      aus weißer TENCEL® Faser, leicht, atmungsaktiv und feuchtigkeitsabsorbierend Logostick an rechter Brust und linkem Ärmel mit Napoleontasche mit Schulterlaschen angenehmer, leicht kühlender Tragekomfort Pflegeleicht, kein Bügeln, 60° Wäsche
                      Damengrößen von Gr. 32 - Gr. 54
                    </div>
                    <div class="flex flex-row w-full">
                        <div class="w-2/3 p-4 h-44 flex items-center justify-center">
                          <div class="w-full h-full">
                              <img src="https://intern.rkhl.at/images/demo_image1.PNG" alt="Image preview" class="w-full h-full object-contain"/>
                          </div>
                        </div>
                        <div class="w-1/3 h-44 justify-center mt-3">
                          <div class="font-semibold py-2 text-center">3.150 Punkte<br/><span class="text-sm text-gray-400">31,50 Euro</span></div>
                          <button class=" bg-red-800 text-white font-semibold rounded-md px-4 py-2 mt-2 flex items-center text-xs md:text-sm">
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
      </div>



      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6" v-if="isAdministrator">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Wünsche und Ideen an die Entwicklung
            <div v-if="showWishes" @click="toggleShowWishes()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showWishes" @click="toggleShowWishes()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div v-if="showWishes">
            <div class="overflow-x-auto">
              <ul class="list-none p-0 m-0">
                
                <li class="mb-4 p-4 bg-gray-100 flex justify-between items-start">
                  <span class="flex-1">Möglichkeit eine Umfrage auf der Startseite anzuzeigen</span>
                  <span class="flex-none ml-4 text-sm"> <!-- Kleine Schrift für die Beschreibungen -->
                    <div class="flex items-center mb-1">
                      <span class="mr-2 font-semibold">Aufwand:</span> <!-- Beschreibungsfeld -->
                      <span class="text-red-500 flex items-center">
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                      </span>
                    </div>
                  </span>
                </li>

                <li class="mb-4 p-4 bg-gray-100 flex justify-between items-start">
                  <span class="flex-1">Möglichkeit eine einzige Frage mit 2 Antwortmöglichkeiten auf der Startseite anzuzeigen</span>
                  <span class="flex-none ml-4 text-sm"> <!-- Kleine Schrift für die Beschreibungen -->
                    <div class="flex items-center mb-1">
                      <span class="mr-2 font-semibold">Aufwand:</span> <!-- Beschreibungsfeld -->
                      <span class="text-yellow-500 flex items-center">
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                        <i class="far fa-circle"></i>
                      </span>
                    </div>
                  </span>
                </li>
                
                <li class="mb-4 p-4 bg-gray-100 flex justify-between items-start">
                  <span class="flex-1">Wunschprodukt auf der Startseite angezeigt mit Message "dir fehlen dafür noch xy Punkte" und einer Call to Action</span>
                  <span class="flex-none ml-4 text-sm"> <!-- Kleine Schrift für die Beschreibungen -->
                    <div class="flex items-center mb-1">
                      <span class="mr-2 font-semibold">Aufwand:</span> <!-- Beschreibungsfeld -->
                      <span class="text-yellow-500 flex items-center">
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                        <i class="far fa-circle"></i>
                      </span>
                    </div>
                  </span>
                </li>
                
                <li class="mb-4 p-4 bg-gray-100 flex justify-between items-start">
                  <span class="flex-1">Im RPS nach offenen Diensten suchen und ableichen mit den eigenen vergangenen Diensten. 
                    Wenn es eine Übereinstimmung mit Personal und/oder Dienstlage gibt, dann im Dashboard vorschlagen. 
                    (Ableich ob die Person zu dieser Zeit schon selber eingetragen ist).
                    Bereits probiert, im Moment würde immer die gleiche Person für z.B. Samstag NM vorgeschlagen werden.
                  </span>
                  <span class="flex-none ml-4 text-sm"> <!-- Kleine Schrift für die Beschreibungen -->
                    <div class="flex items-center mb-1">
                      <span class="mr-2 font-semibold">Aufwand:</span> <!-- Beschreibungsfeld -->
                      <span class="text-red-500 flex items-center">
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                      </span>
                    </div>
                  </span>
                </li>


                <li class="mb-4 p-4 bg-gray-100 flex justify-between items-start">
                  <span class="flex-1">
                    Jahresabschluss oder Monatsabschluss einbauen, damit nicht mehr alles immer Berechnet werden muss.
                  </span>
                  <span class="flex-none ml-4 text-sm"> <!-- Kleine Schrift für die Beschreibungen -->
                    <div class="flex items-center mb-1">
                      <span class="mr-2 font-semibold">Aufwand:</span> <!-- Beschreibungsfeld -->
                      <span class="text-red-500 flex items-center">
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                      </span>
                    </div>
                  </span>
                </li>

                <li class="mb-4 p-4 bg-gray-100 flex justify-between items-start">
                  <span class="flex-1">
                    Produktbilder von der Backend API ins Frontend bringen.
                  </span>
                  <span class="flex-none ml-4 text-sm"> <!-- Kleine Schrift für die Beschreibungen -->
                    <div class="flex items-center mb-1">
                      <span class="mr-2 font-semibold">Aufwand:</span> <!-- Beschreibungsfeld -->
                      <span class="text-red-500 flex items-center">
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                      </span>
                    </div>
                  </span>
                </li>

                <li class="mb-4 p-4 bg-gray-100 flex justify-between items-start">
                  <span class="flex-1">
                    Möglichkeit die Punktevergabe zu verändern, je nachdem was gerade Schwierig zu besetzen ist.
                  </span>
                  <span class="flex-none ml-4 text-sm"> <!-- Kleine Schrift für die Beschreibungen -->
                    <div class="flex items-center mb-1">
                      <span class="mr-2 font-semibold">Aufwand:</span> <!-- Beschreibungsfeld -->
                      <span class="text-red-500 flex items-center">
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                      </span>
                    </div>
                  </span>
                </li>

                <li class="mb-4 p-4 bg-gray-100 flex justify-between items-start">
                  <span class="flex-1">
                    Möglichkeit der Punktevergabe unterschiedliche zwischen Dienststellen. (Hollabrunn/Haugsdorf)
                  </span>
                  <span class="flex-none ml-4 text-sm"> <!-- Kleine Schrift für die Beschreibungen -->
                    <div class="flex items-center mb-1">
                      <span class="mr-2 font-semibold">Aufwand:</span> <!-- Beschreibungsfeld -->
                      <span class="text-yellow-500 flex items-center">
                        <i class="fas fa-circle"></i>
                        <i class="fas fa-circle"></i>
                        <i class="far fa-circle"></i> <!-- 3 von 5 Punkten für Komplexität -->
                      </span>
                    </div>
                  </span>
                </li>


              </ul>
            </div>
          </div>
          
        </div>
      </div>




    </div>
  </div>

  <div v-if="showDeletePopup && toDeleteReward != null" class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
    <div class="bg-white p-6 rounded-lg shadow-xl">
      <h2 class="text-xl font-bold mb-4">Wirklich löschen?</h2>
      <p class="mb-4">
        Soll das Produkt <strong>[{{ toDeleteReward.name }} <span class="text-xs">{{ toDeleteReward.slogan }}</span>]</strong> wirklich gelöscht werden?
        
      </p>
      <div class="flex justify-end space-x-4">
        <button class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600" @click="deleteReward">Löschen</button>
        <button class="px-4 py-2 rounded border border-gray-300 hover:border-gray-400 hover:bg-gray-100" @click="abortDeletion">Abbrechen</button>
      </div>
    </div>
  </div>

</template>




<style>

</style>
