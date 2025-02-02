<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

interface Employee {
    id: number; // assuming id is a number
    count: number;
    minutes: number;
    points: number;
    availablePoints: number;
    nef: number;
    rtw: number;
    ktw: number;
    bktw: number;
    df: number;
    misc: number;
    countLocale: string,
    hours: string,
    isAdministrator: boolean,
    isModerator: boolean,
    isDienstfuehrer: boolean,
    isDeveloper: boolean,
    pointsDisplay: string,
    availablePointsDisplay: number;
    last_shift_date: string,
    last_sms_sent: string,
    sms_count: number,
    haupt: string,
    Status: string,
    hidden: boolean,
    active: boolean,
    auszeit: boolean
}

const store = useStore();
const jwt = computed(() => store.state.jwt);
const loading = ref(true);

const currentYear = new Date().getFullYear();
const year = ref(currentYear);
const lowestYear = ref(2023);
const highestYear = ref(currentYear);

const showMyNameInRanking = ref(false);

const employees = ref({});
const employeesHollabrunn = ref({});
const employeesHaugsdorf = ref({});
const employeeMap = ref({});

const showCategorySelector = ref('points');

const showCategoryLocation = ref('combined');


const user = computed(() => store.state.user);

const isPrivileged = computed(() => {
    const user = store.state.user; // Directly accessing user from the state
    if (!user) return false; // Check if user is null
    return user.isAdministrator || user.isModerator || user.isDeveloper;
});
const isAdmin = computed(() => {
    const user = store.state.user; // Directly accessing user from the state
    if (!user) return false; // Check if user is null
    return user.isAdministrator || user.isDeveloper;
});


const getEmployees = async () => {
  employees.value = {};
  employeesHollabrunn.value = {};
  employeesHaugsdorf.value = {};
  employeeMap.value = {};
  let url = '../api/employees';
  if(!isPrivileged.value || !displayModusAdmin.value){
    url = '../api/employeesForRanking';
  }
  try {
    const response = await axios.get(url, {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    response.data.data.forEach(employee => {
      employeeMap.value[employee.remoteId] = employee;
      employeeMap.value[employee.remoteId].availablePoints = employee.points;
      employeeMap.value[employee.remoteId].availablePointsDisplay = (employee.points !== undefined && employee.points !== null) ? parseInt(employee.points,10).toLocaleString() : '';
    });
  } catch (error) {
    console.error(error);
  }
};


const makeAdmin = async (employeeId: number) => {
  employees.value = {};
  employeesHollabrunn.value = {};
  employeesHaugsdorf.value = {};
  try {
    await axios.post(`../api/employees/make-admin/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    await getEmployees();
    await getShifts();
  } catch (error) {
    console.error(error);
  }
};
const makeModerator = async (employeeId: number) => {
  employees.value = {};
  employeesHollabrunn.value = {};
  employeesHaugsdorf.value = {};
  try {
    await axios.post(`../api/employees/make-moderator/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    await getEmployees();
    await getShifts();
  } catch (error) {
    console.error(error);
  }
};
const makeDF = async (employeeId: number) => {
  employees.value = {};
  employeesHollabrunn.value = {};
  employeesHaugsdorf.value = {};
  try {
    await axios.post(`../api/employees/make-df/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    await getEmployees();
    await getShifts();
  } catch (error) {
    console.error(error);
  }
};
const removeAllRoles = async (employeeId: number) => {  
  if (!confirm('Soll die Rolle wirklich entfernt werden?')) {
    return; // Stop if the user cancels
  }
  try {
    await axios.post(`/api/employees/${employeeId}/remove-roles`, {}, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    await getEmployees();
    await getShifts();
  } catch (error) {
    console.error('Error removing roles from employee:', error);
  }
};


const myConfig = async () => {
  try {
    const response = await axios.get(`../api/self/employees/config`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    showMyNameInRanking.value = response.data.showNameInRanking;
    if(isPrivileged){
      showConfig.value = false;
    }else if(!showMyNameInRanking.value){
      showConfig.value = true;
    }
  } catch (error) {
    console.error(error);
  }
};


const getShifts = async () => {
  employees.value = {};
  employeesHollabrunn.value = {};
  employeesHaugsdorf.value = {};
  let url = '../api/shifts?year=';
  if(!isPrivileged.value || !displayModusAdmin.value){
    url = '../api/shiftsForRanking?year=';
  }
  try {
    const response = await axios.get(url + year.value, {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });

    for (let i = 0; i < response.data.data.length; i++) {
      const currentItem = response.data.data[i];
      const startTime = new Date(currentItem.start).getTime();
      const endTime = new Date(currentItem.end).getTime();
      
      if (employees.value[currentItem.employeeId] === undefined || employees.value[currentItem.employeeId] === null) {
        employees.value[currentItem.employeeId] = { 'id' : currentItem.employeeId, 'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0, 'count' : 0, 'minutes' : 0, 'points' : 0};
      }
      employees.value[currentItem.employeeId]['count']++;
      employees.value[currentItem.employeeId]['minutes'] += (endTime - startTime) / (1000 * 60);
      employees.value[currentItem.employeeId]['points'] += parseInt(currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points,10);



      if(currentItem.location == 38 || currentItem.location == 3316){
        //Hollabrunn
        if (employeesHollabrunn.value[currentItem.employeeId] === undefined || employeesHollabrunn.value[currentItem.employeeId] === null) {
          employeesHollabrunn.value[currentItem.employeeId] = { 'id' : currentItem.employeeId, 'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0, 'count' : 0, 'minutes' : 0, 'points' : 0 };
        }
        employeesHollabrunn.value[currentItem.employeeId]['count']++;
        employeesHollabrunn.value[currentItem.employeeId]['minutes'] += (endTime - startTime) / (1000 * 60);
        employeesHollabrunn.value[currentItem.employeeId]['points'] += parseInt(currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points,10);
      }else if(currentItem.location == 39 || currentItem.location == 82){
        //Haugsdorf
        if (employeesHaugsdorf.value[currentItem.employeeId] === undefined || employeesHaugsdorf.value[currentItem.employeeId] === null) {
          employeesHaugsdorf.value[currentItem.employeeId] = { 'id' : currentItem.employeeId, 'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0, 'count' : 0, 'minutes' : 0, 'points' : 0 };
        }
        employeesHaugsdorf.value[currentItem.employeeId]['count']++;
        employeesHaugsdorf.value[currentItem.employeeId]['minutes'] += (endTime - startTime) / (1000 * 60);
        employeesHaugsdorf.value[currentItem.employeeId]['points'] += parseInt(currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points,10);
      }



      if (["FBB","FBKTW"].includes(currentItem.demandType)) {
        employees.value[currentItem.employeeId]['bktw']++;
        if(currentItem.location == 38 || currentItem.location == 3316){
          employeesHollabrunn.value[currentItem.employeeId]['bktw']++;
        }else if(currentItem.location == 39 || currentItem.location == 82){
          employeesHaugsdorf.value[currentItem.employeeId]['bktw']++;
        }
      }else if (["FNB_NEF", "NEFAZUBI", "ANA", "PNEF", "PLNEF", "FNEF", "NFS", "PNAW", "FNAW", "FSNAW", "LSRTW"].includes(currentItem.demandType)) {
        employees.value[currentItem.employeeId]['nef']++;
        if(currentItem.location == 38 || currentItem.location == 3316){
          employeesHollabrunn.value[currentItem.employeeId]['nef']++;
        }else if(currentItem.location == 39 || currentItem.location == 82){
          employeesHaugsdorf.value[currentItem.employeeId]['nef']++;
        }
      }else if (["FRB", "FRC", "SR1", "SR2", "FRTW", "FRTWC", "LRTWC", "PRS", "PNFS"].includes(currentItem.demandType)) {
        employees.value[currentItem.employeeId]['rtw']++;
        if(currentItem.location == 38 || currentItem.location == 3316){
          employeesHollabrunn.value[currentItem.employeeId]['rtw']++;
        }else if(currentItem.location == 39 || currentItem.location == 82){
          employeesHaugsdorf.value[currentItem.employeeId]['rtw']++;
        }
      }else if (["FKB", "FKB-B", "FKC", "SK1", "SK2", "FKTW", "PKTW", "FKTWB", "BKTWB"].includes(currentItem.demandType)) {
        employees.value[currentItem.employeeId]['ktw']++;
        if(currentItem.location == 38 || currentItem.location == 3316){
          employeesHollabrunn.value[currentItem.employeeId]['ktw']++;
        }else if(currentItem.location == 39 || currentItem.location == 82){
          employeesHaugsdorf.value[currentItem.employeeId]['ktw']++;
        }
      }else if (["DF1", "DF2", "DF", "RUFDF"].includes(currentItem.demandType)) {
        employees.value[currentItem.employeeId]['df']++;
        if(currentItem.location == 38 || currentItem.location == 3316){
          employeesHollabrunn.value[currentItem.employeeId]['df']++;
        }else if(currentItem.location == 39 || currentItem.location == 82){
          employeesHaugsdorf.value[currentItem.employeeId]['df']++;
        }
      }else{
        employees.value[currentItem.employeeId]['misc']++;
        if(currentItem.location == 38 || currentItem.location == 3316){
          employeesHollabrunn.value[currentItem.employeeId]['misc']++;
        }else if(currentItem.location == 39 || currentItem.location == 82){
          employeesHaugsdorf.value[currentItem.employeeId]['misc']++;
        }
      }
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};








// Create a computed property for sorted employees
const sortedEmployees = computed(() => {
  let employeesArray: Employee[] = [];
  if(showCategoryLocation.value === 'combined'){
    employeesArray = Object.values(employees.value);
  }else if(showCategoryLocation.value === 'hollabrunn'){
    employeesArray = Object.values(employeesHollabrunn.value);
  }else if(showCategoryLocation.value === 'haugsdorf'){
    employeesArray = Object.values(employeesHaugsdorf.value);
  }

  if(showCategorySelector.value == 'counters'){
    employeesArray = employeesArray.filter(employee => employee.count !== 0).sort((a, b) => b.count - a.count);
  }else if(showCategorySelector.value == 'minutes'){
    employeesArray = employeesArray.filter(employee => employee.minutes !== 0).sort((a, b) => b.minutes - a.minutes);
  }else if(showCategorySelector.value == 'points'){
    employeesArray = employeesArray.filter(employee => employee.points !== 0).sort((a, b) => b.points - a.points);
  }else if(showCategorySelector.value == 'nef'){
    employeesArray = employeesArray.filter(employee => employee.nef !== 0).sort((a, b) => b.nef - a.nef);
  }else if(showCategorySelector.value == 'rtw'){
    employeesArray = employeesArray.filter(employee => employee.rtw !== 0).sort((a, b) => b.rtw - a.rtw);
  }else if(showCategorySelector.value == 'ktw'){
    employeesArray = employeesArray.filter(employee => employee.ktw !== 0).sort((a, b) => b.ktw - a.ktw);
  }else if(showCategorySelector.value == 'bktw'){
    employeesArray = employeesArray.filter(employee => employee.bktw !== 0).sort((a, b) => b.bktw - a.bktw);
  }else if(showCategorySelector.value == 'df'){
    employeesArray = employeesArray.filter(employee => employee.df !== 0).sort((a, b) => b.df - a.df);
  }else if(showCategorySelector.value == 'misc'){
    employeesArray = employeesArray.filter(employee => employee.misc !== 0).sort((a, b) => b.misc - a.misc);
  }
  employeesArray = employeesArray.map(employee => ({
    ...employee,
    countLocale: employee.count.toLocaleString(),
    hours: convertMinutesToHours(employee.minutes),
    pointsDisplay: employee.points !== 0 ? employee.points.toLocaleString() : '',
  }));

  if(!isPrivileged.value || !displayModusAdmin.value){
    employeesArray = employeesArray.filter(employee => !employeeMap.value[employee.id]?.hidden);
  }

  return employeesArray;
});

onMounted(async () => {
  await myConfig();
  await getEmployees();
  await getShifts();
});

async function changeYear(direction) {
  if ((direction === -1 && year.value > lowestYear.value) || (direction === 1 && year.value < highestYear.value)) {
    year.value += direction;
    loading.value = true;
    await getShifts();
  }
}

const convertMinutesToHours = (minutes) => {
  const hours = Math.floor(minutes / 60);
  return hours.toLocaleString();
};

const showRoleButtons = computed(() => {
    const user = store.state.user; // Directly accessing user from the state
    if (!user) return false; // Check if user is null
    return user.isAdministrator || user.isDeveloper;
});



const showConfig = ref(false);
const toggleShowConfig = async () => {
  showConfig.value = !showConfig.value;
};


const displayModusAdmin = ref(false);
const setDisplayModus = async (value) => {
  if (!confirm('Soll der Modus wirklich gewechselt werden? Bitte auf den Datenschutz achten!')) {
    return; // Stop if the user cancels
  }
  displayModusAdmin.value = value;
  await getEmployees();
  await getShifts();
};



const setShowMyNameInRanking = async (value) => {
  try {
    await axios.post(`../api/self/employees/config`, { showNameInRanking: value }, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    showMyNameInRanking.value = value;
  } catch (error) {
    console.error(error);
  }
};




const disableEmployee = async (employeeId: number) => {
  try {
    await axios.post(`../api/employees/disable/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employeeMap.value[employeeId].active = false;
  } catch (error) {
    console.error(error);
  }
};
const enableEmployee = async (employeeId: number) => {
  try {
    await axios.post(`../api/employees/enable/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employeeMap.value[employeeId].active = true;
  } catch (error) {
    console.error(error);
  }
};
const hideEmployee = async (employeeId: number) => {
  try {
    await axios.post(`../api/employees/hide/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employeeMap.value[employeeId].hidden = true;
  } catch (error) {
    console.error(error);
  }
};
const unhideEmployee = async (employeeId: number) => {
  try {
    await axios.post(`../api/employees/unhide/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employeeMap.value[employeeId].hidden = false;
  } catch (error) {
    console.error(error);
  }
};


const auszeitEmployee = async (employeeId: number) => {
  try {
    await axios.post(`../api/employees/auszeitTrue/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employeeMap.value[employeeId].auszeit = true;
  } catch (error) {
    console.error(error);
  }
};
const productiveEmployee = async (employeeId: number) => {
  try {
    await axios.post(`../api/employees/auszeitFalse/${employeeId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employeeMap.value[employeeId].auszeit = false;
  } catch (error) {
    console.error(error);
  }
};



</script>

<template>
  <div class="bg-gray-200 pt-4">

    

    <div class="flex flex-col justify-center items-center mb-6 mx-2">


      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Meine Einstellungen
            <div v-if="showConfig" @click="toggleShowConfig()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showConfig" @click="toggleShowConfig()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>
      
          <!-- Adding flex-col for vertical stacking and my-3 for margin separation -->
          <div class="flex flex-col w-full my-3" v-if="showConfig">
            <div class="w-full mb-4"> <!-- Maintain margin-bottom for visual separation -->
              <div class="flex justify-between items-center">
                <span class="text-left font-semibold">Darf dein Klarname für Alle angezeigt werden?</span>
                <div class="flex gap-2">
                  <!-- Anonym Button -->
                  <button 
                      :class="{'bg-gray-500 text-white hover:bg-gray-600': !showMyNameInRanking, 'bg-gray-200 hover:bg-gray-300': showMyNameInRanking}" 
                      class="py-1 px-3 rounded duration-300 ease-in-out cursor-pointer transition" 
                      @click="setShowMyNameInRanking(false)">
                      Anonym
                  </button>
      
                  <!-- Klarname Button -->
                  <button 
                      :class="{'bg-gray-500 text-white hover:bg-gray-600': showMyNameInRanking, 'bg-gray-200 hover:bg-gray-300': !showMyNameInRanking}" 
                      class="py-1 px-3 rounded duration-300 ease-in-out cursor-pointer transition" 
                      @click="setShowMyNameInRanking(true)">
                      Klarname
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Separate div for admin settings, ensuring it is visually separated -->
            <div class="w-full">
              <div class="flex justify-between items-center" v-if="isPrivileged">
                <span class="text-left font-semibold">Anzeige Modus (Nur für Administration/Moderatoren sichtbar)</span>
                <div class="flex gap-2">
                  <button 
                      :class="{'bg-gray-500 text-white hover:bg-gray-600': displayModusAdmin, 'bg-gray-200 hover:bg-gray-300': !displayModusAdmin}" 
                      class="py-1 px-3 rounded duration-300 ease-in-out cursor-pointer transition" 
                      @click="setDisplayModus(true)">
                      Vollständig
                  </button>
      
                  <!-- Klarname Button -->
                  <button 
                      :class="{'bg-gray-500 text-white hover:bg-gray-600': !displayModusAdmin, 'bg-gray-200 hover:bg-gray-300': displayModusAdmin}" 
                      class="py-1 px-3 rounded duration-300 ease-in-out cursor-pointer transition" 
                      @click="setDisplayModus(false)">
                      Eingeschränkt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      

      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">
          <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
            <div class="font-bold text-base md:text-xl">Mitarbeiter Übersicht</div>    
            <div v-if="!loading" class="flex items-center font-bold text-base md:text-xl text-gray-500">
              <div 
                class="cursor-pointer"
                :class="{ 'text-gray-300': year === lowestYear, 'cursor-not-allowed': year === lowestYear }"
                @click="changeYear(-1)">
                <i class="fa fa-chevron-left"></i>
              </div>
              <div class="mx-2">{{ year }}</div>
              <div 
                class="cursor-pointer"
                :class="{ 'text-gray-300': year === highestYear, 'cursor-not-allowed': year === highestYear }"
                @click="changeYear(1)">
                <i class="fa fa-chevron-right"></i>
              </div>
            </div>
          </div>
          
          <div class="flex w-full my-2 justify-center items-center" v-if="loading">
            <div class="flex items-center mt-4">
              <i class="fas fa-spinner fa-spin text-gray-500 text-lg mr-2"></i>
              <span class="text-gray-500 text-lg">Daten werden geladen</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row mb-2 justify-between" v-if="!loading">
            <div class="flex items-center justify-center mb-2 py-1 space-x-2 text-sm sm:text-base">
              <div 
                class="py-1 px-3 bg-gray-300 border border-gray-400 rounded-l-lg transition duration-300 ease-in-out hover:bg-gray-600 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategoryLocation === 'combined' }" 
                @click="showCategoryLocation='combined'">
                Kombiniert
              </div>
              <div
                class="py-1 px-3 bg-gray-300 border border-gray-400 transition duration-300 ease-in-out hover:bg-gray-600 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategoryLocation === 'hollabrunn' }" 
                @click="showCategoryLocation='hollabrunn'">
                Hollabrunn
              </div>
              <div
                class="py-1 px-3 bg-gray-300 border border-gray-400 rounded-r-lg transition duration-300 ease-in-out hover:bg-gray-600 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategoryLocation === 'haugsdorf' }" 
                @click="showCategoryLocation='haugsdorf'">
                Haugsdorf
              </div>
            </div>    
            <div class="flex items-center justify-center mb-2 py-1 space-x-2 text-sm sm:text-base">
              <div 
                class="py-1 px-3 bg-gray-300 border border-gray-400 rounded-l-lg transition duration-300 ease-in-out hover:bg-gray-600 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategorySelector === 'counters' }" 
                @click="showCategorySelector='counters'">
                vergangene Dienste
              </div>
              <div
                class="py-1 px-3 bg-gray-300 border border-gray-400 transition duration-300 ease-in-out hover:bg-gray-600 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategorySelector === 'minutes' }" 
                @click="showCategorySelector='minutes'">
                Dauer <small>(Std.)</small>
              </div>
              <div
                class="py-1 px-3 bg-gray-300 border border-gray-400 rounded-r-lg transition duration-300 ease-in-out hover:bg-gray-600 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategorySelector === 'points' }" 
                @click="showCategorySelector='points'">
                Punkte
              </div>
            </div>
          </div>

          


          <div class="overflow-x-auto mt-8" v-if="!loading">
            <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
              <thead>
                <tr class="bg-red-800 text-white">
                  <th class="px-2 py-1 text-left">Rang</th>
                  <th class="px-2 py-1 text-left border-r border-r-gray-600">Name</th>


                  <th class="px-2 py-1 text-center cursor-pointer" @click="showCategorySelector='nef'" :class="{ 'bg-red-400': showCategorySelector === 'nef' }"><i class="fa-sharp fa-solid fa-stethoscope fa-sm"></i></th>
                  <th class="px-2 py-1 text-center cursor-pointer" @click="showCategorySelector='rtw'" :class="{ 'bg-red-400': showCategorySelector === 'rtw' }"><i class="fa-sharp fa-solid fa-truck-medical fa-sm"></i></th>
                  <th class="px-2 py-1 text-center cursor-pointer" @click="showCategorySelector='ktw'" :class="{ 'bg-red-400': showCategorySelector === 'ktw' }"><i class="fa-sharp fa-solid fa-stretcher fa-sm"></i></th>
                  <th class="px-2 py-1 text-center cursor-pointer" @click="showCategorySelector='bktw'" :class="{ 'bg-red-400': showCategorySelector === 'bktw' }"><i class="fa-sharp fa-solid fa-car-mirrors fa-sm"></i></th>
                  <th class="px-2 py-1 text-center cursor-pointer" @click="showCategorySelector='df'" :class="{ 'bg-red-400': showCategorySelector === 'df' }"><i class="fa-sharp fa-solid fa-phone fa-sm"></i></th>
                  <th class="px-2 py-1 text-center cursor-pointer border-r border-r-gray-600" @click="showCategorySelector='misc'" :class="{ 'bg-red-400': showCategorySelector === 'misc' }"><i class="fa-sharp fa-solid fa-ellipsis-h fa-sm"></i></th>

                  <th class="px-2 py-1 text-center cursor-pointer" @click="showCategorySelector='counters'" :class="{ 'bg-red-400': showCategorySelector === 'counters' }">Dienste</th>
                  <th class="px-2 py-1 text-center cursor-pointer" @click="showCategorySelector='minutes'" :class="{ 'bg-red-400': showCategorySelector === 'minutes' }">Dauer (Std.)</th>
                  <th class="px-2 py-1 text-center cursor-pointer" @click="showCategorySelector='points'" :class="{ 'bg-red-400': showCategorySelector === 'points' }">Punkte</th>

                  <th class="px-2 py-1 text-center border-l border-l-gray-600" v-if="displayModusAdmin">restl. Pkt.</th>

                  <th class="px-2 py-1 text-center border-r border-r-gray-600" v-if="isAdmin && displayModusAdmin" colspan="4">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(employee, index) in sortedEmployees" :key="employee.id" 
                  :class="{'bg-gray-200': index % 2 === 0 && !employeeMap[employee.id]?.self, 'bg-red-300':employeeMap[employee.id]?.self,  'hover:bg-blue-300': !employeeMap[employee.id]?.isDeveloper && !employeeMap[employee.id]?.isAdministrator && !employeeMap[employee.id]?.isModerator, 'hover:bg-red-300': employeeMap[employee.id]?.isDeveloper || employeeMap[employee.id]?.isAdministrator || employeeMap[employee.id]?.isModerator}">
                  <td class="px-2 py-1">{{ index + 1 }}</td>

                  <td class="px-2 py-1 border-r border-r-gray-600 flex justify-between items-center">
                    <div v-if="!employeeMap[employee.id]?.anonym">
                      <i v-if="employeeMap[employee.id]?.isDeveloper" class="fas fa-user-police-tie text-xs text-gray-600"></i>
                      <i v-if="employeeMap[employee.id]?.isAdministrator" class="fas fa-user-crown text-xs text-red-600"></i>
                      <i v-if="employeeMap[employee.id]?.isModerator" class="fas fa-user-shield text-xs text-blue-600"></i>
                      <i v-if="employeeMap[employee.id]?.isDienstfuehrer" class="fas fa-phone text-xs text-sky-600"></i>
                      <!-- <img :src="employeeMap[employee.id]?.picture_base64" class="max-h-8 w-auto"/> -->
                      <span class="text-red-500" v-if="employeeMap[employee.id]?.haupt && employeeMap[employee.id]?.haupt != 'HAUPT'">(GAST) </span>
                      <span class="text-red-500" v-if="!employeeMap[employee.id]?.active">(ABGEMELDET) </span>
                      <span class="text-blue-500" v-if="employeeMap[employee.id]?.auszeit">(AUSZEIT) </span>

                      <span v-if="employeeMap[employee.id]?.hidden" class="line-through">
                        {{ employeeMap[employee.id]?.firstname }} {{ employeeMap[employee.id]?.lastname }}
                      </span>
                      <span v-if="!employeeMap[employee.id]?.hidden">
                        {{ employeeMap[employee.id]?.firstname }} {{ employeeMap[employee.id]?.lastname }}
                      </span>

                      
                      
                      &nbsp;<span v-if="!employeeMap[employee.id]?.public" class="text-xs text-gray-500">
                        <router-link 
                          v-if="displayModusAdmin"
                          :to="'/dienste-' + employee.id"
                          class="text-gray-500 no-underline hover:text-blue-700 hover:underline">
                          {{ employee.id }}
                        </router-link></span>
                    </div>
                    <div v-if="employeeMap[employee.id]?.anonym && !employeeMap[employee.id]?.self" class="text-gray-400">
                      <span class="text-red-500" v-if="employeeMap[employee.id]?.haupt && employeeMap[employee.id]?.haupt != 'HAUPT'">(GAST) </span>
                      <span class="text-red-500" v-if="!employeeMap[employee.id]?.active">(ABGEMELDET) </span>
                      <span class="text-blue-500" v-if="employeeMap[employee.id]?.auszeit">(AUSZEIT) </span>
                      Anonym
                    </div>
                    <div v-if="employeeMap[employee.id]?.anonym && employeeMap[employee.id]?.self">
                      <span class="text-red-500" v-if="employeeMap[employee.id]?.haupt && employeeMap[employee.id]?.haupt != 'HAUPT'">(GAST) </span>
                      <span class="text-red-500" v-if="!employeeMap[employee.id]?.active">(ABGEMELDET) </span>
                      <span class="text-blue-500" v-if="employeeMap[employee.id]?.auszeit">(AUSZEIT) </span>
                      Anonym <small class="text-gray-500">({{ user.firstname }} {{ user.lastname }})</small>
                    </div>
                  
                  </td>
                  

                  <td class="px-2 py-1 text-center text-gray-500">{{ employee.nef !== 0 ? employee.nef : '' }}</td>
                  <td class="px-2 py-1 text-center text-gray-500">{{ employee.rtw !== 0 ? employee.rtw : '' }}</td>
                  <td class="px-2 py-1 text-center text-gray-500">{{ employee.ktw !== 0 ? employee.ktw : '' }}</td>
                  <td class="px-2 py-1 text-center text-gray-500">{{ employee.bktw !== 0 ? employee.bktw : '' }}</td>
                  <td class="px-2 py-1 text-center text-gray-500">{{ employee.df !== 0 ? employee.df : '' }}</td>
                  <td class="px-2 py-1 text-center text-gray-500">{{ employee.misc !== 0 ? employee.misc : '' }}</td>


                  <td class="px-2 py-1 text-center border-l border-l-gray-600 text-gray-500" :class="{ 'text-gray-800': showCategorySelector === 'counters' }" >{{ employee.countLocale }}</td>
                  <td class="px-2 py-1 text-center text-gray-500" :class="{ 'text-gray-800': showCategorySelector === 'minutes' }">{{ employee.hours }}</td>
                  <td class="px-2 py-1 text-center text-gray-500" :class="{ 'text-gray-800': showCategorySelector === 'points' }">{{ employee.pointsDisplay }}</td>
                  <td class="px-2 py-1 text-center text-gray-500 border-l border-l-gray-600" v-if="displayModusAdmin" ><span v-if="employeeMap[employee.id]?.availablePointsDisplay">{{ employeeMap[employee.id].availablePointsDisplay }}</span></td>

                  
                  <td class="px-2 py-1 text-center border-l border-l-gray-600" v-if="isAdmin && displayModusAdmin">
                    <div class="flex items-center gap-2">
                      <button v-if="showRoleButtons && !employeeMap[employee.id]?.isDeveloper && (employeeMap[employee.id]?.isModerator)" @click="makeAdmin(employee.id)" class="text-xs bg-red-200 text-white px-2 py-1 rounded hover:bg-red-600">Adm. ern.</button>
                      <button v-if="showRoleButtons && !employeeMap[employee.id]?.isDeveloper && (employeeMap[employee.id]?.isDienstfuehrer && !employeeMap[employee.id]?.isModerator && !employeeMap[employee.id]?.isAdministrator)" @click="makeModerator(employee.id)" class="text-xs bg-blue-200 text-white px-2 py-1 rounded hover:bg-blue-600">Mod. ern.</button>
                      <button v-if="showRoleButtons && !employeeMap[employee.id]?.isDeveloper && (!employeeMap[employee.id]?.isDienstfuehrer && !employeeMap[employee.id]?.isModerator && !employeeMap[employee.id]?.isAdministrator)" @click="makeDF(employee.id)" class="text-xs bg-sky-200 text-white px-2 py-1 rounded hover:bg-sky-600">DF ern.</button>
                      <button v-if="showRoleButtons && !employeeMap[employee.id]?.isDeveloper && employeeMap[employee.id]?.isAdministrator" @click="removeAllRoles(employee.id)" class="text-xs bg-red-400 text-white px-2 py-1 rounded hover:bg-red-600">Rechte entf.</button>
                      <button v-if="showRoleButtons && employeeMap[employee.id]?.isDeveloper" class="text-xs bg-red-400 text-white px-2 py-1 rounded cursor-default">Entwickler</button>
                    </div>
                  </td>
                  <td class="px-2 py-1 text-center" v-if="isAdmin && displayModusAdmin">
                    <div v-if="!employeeMap[employee.id]?.hidden">
                      <button @click="hideEmployee(employee.id)" class="text-xs bg-gray-300 hover:bg-gray-500 text-white px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-eye-slash"></i></button>
                    </div>
                    <div v-if="employeeMap[employee.id]?.hidden">
                      <button @click="unhideEmployee(employee.id)" class="text-xs bg-slate-400 hover:bg-slate-600 text-black px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-eye"></i></button>
                    </div>
                  </td>

                  

                  <td class="px-2 py-1 text-center" v-if="isAdmin && displayModusAdmin">
                    <div v-if="!employeeMap[employee.id]?.auszeit">
                      <button @click="auszeitEmployee(employee.id)" class="text-xs bg-blue-400 hover:bg-blue-600 text-white px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-umbrella-beach"></i></button>
                    </div>
                    <div v-if="employeeMap[employee.id]?.auszeit">
                      <button @click="productiveEmployee(employee.id)" class="text-xs bg-cyan-400 hover:bg-cyan-600 text-black px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-briefcase"></i></button>
                    </div>
                  </td>

                  <td class="px-2 py-1 text-center border-r border-r-gray-600" v-if="isAdmin && displayModusAdmin">
                    <div v-if="employeeMap[employee.id]?.active">
                      <button @click="disableEmployee(employee.id)" class="text-xs bg-red-400 hover:bg-red-600 text-white px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-thumbs-down"></i></button>
                    </div>
                    <div v-if="!employeeMap[employee.id]?.active">
                      <button @click="enableEmployee(employee.id)" class="text-xs bg-green-400 hover:bg-green-600 text-black px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-thumbs-up"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        
        </div>
      </div>
    </div>
    

  </div>
</template>




<style>

</style>
