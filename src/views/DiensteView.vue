<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import axios, { AxiosResponse } from 'axios';

import { Shift } from './../types.ts';
import { monthNames, convertMinutesToHours, getLocationName, formatPoints, calculateDuration, formatTime, formatDate } from './../utils.ts';

const route = useRoute();
const store = useStore();

interface Employee {
    id: number; // assuming id is a number
    count: number;
    minutes: number;
    points: number;
    nef: number;
    rtw: number;
    ktw: number;
    bktw: number;
    df: number;
    misc: number;
    firstname: string,
    lastname: string,
    countLocale: string,
    hours: string,
    isAdministrator: boolean,
    isModerator: boolean,
    isDienstfuehrer: boolean,
    isDeveloper: boolean,
    pointsDisplay: string,
    last_shift_date: string,
    last_sms_sent: string,
    sms_count: number,
}

const jwt = computed(() => store.state.jwt);
const loading = ref(true);

const showPunkte = ref(false);
const toggleShowPunkte = async () => {
  showPunkte.value = !showPunkte.value;
};

const employeeId = ref<string | string[] | null>(null);
const employeeData = ref<Employee>({ id: 0, firstname:'',lastname:'', count: 0, minutes: 0, points: 0, nef: 0, rtw: 0, ktw: 0, bktw: 0, df: 0, misc: 0, countLocale: '', hours: '', isAdministrator: false, isModerator: false, isDienstfuehrer: false, isDeveloper: false, pointsDisplay: '', last_shift_date: '', last_sms_sent: '', sms_count: 0 });

/*
const showEmployeeSelection = ref(false);
const toggleShowEmployeeSelection = async () => {
  showEmployeeSelection.value = !showEmployeeSelection.value;
};*/

const currentYear = new Date().getFullYear();
const year = ref(currentYear);
const lowestYear = ref(2023);
const highestYear = ref(currentYear);
//const searchPersonalNumber = ref('');

const shifts = ref<Shift[]>([]);
const shiftsHollabrunn = ref<Shift[]>([]);
const shiftsHaugsdorf = ref<Shift[]>([]);

const categoryCount = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});
const categoryMinutes = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});
const categoryPoints = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});

const categoryCountHollabrunn = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});
const categoryMinutesHollabrunn = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});
const categoryPointsHollabrunn = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});

const categoryCountHaugsdorf = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});
const categoryMinutesHaugsdorf = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});
const categoryPointsHaugsdorf = ref({'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0});

const showCategorySelector = ref('counters');
const showCategoryLocation = ref('combined');


const getEmployeeData = async () => {
  try {
    const response = await axios.get('../api/employeeFromId?employeeId=' + employeeId.value, {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    employeeData.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const getShifts = async () => {
  shifts.value = [];
  shiftsHollabrunn.value = [];
  shiftsHaugsdorf.value = [];
  try {
    let response: AxiosResponse | null = null;
    if(employeeId.value === null){
      response = await axios.get('../api/self/shifts?year=' + year.value, {
        headers: {
          Accepts: "application:json",
          Authorization: `Bearer ${jwt.value}`
        }
      });
    }else{
      response = await axios.get('../api/shiftsForEmployee?year=' + year.value + '&employeeId=' + employeeId.value, {
        headers: {
          Accepts: "application:json",
          Authorization: `Bearer ${jwt.value}`
        }
      });
    }


    shifts.value = response!.data.data;
    categoryCount.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};
    categoryMinutes.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};
    categoryPoints.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};

    categoryCountHollabrunn.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};
    categoryMinutesHollabrunn.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};
    categoryPointsHollabrunn.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};

    categoryCountHaugsdorf.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};
    categoryMinutesHaugsdorf.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};
    categoryPointsHaugsdorf.value = {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0};

    for (let i = 0; i < shifts.value.length; i++) {
      const currentItem = shifts.value[i];

      if(currentItem.location == 38 || currentItem.location == 3316){
        shiftsHollabrunn.value.push(currentItem);
      }else if(currentItem.location == 39 || currentItem.location == 82){
        shiftsHaugsdorf.value.push(currentItem);
      }

      const startTime = new Date(currentItem.start).getTime();
      const endTime = new Date(currentItem.end).getTime();
      if (["FBB", "FBKTW"].includes(currentItem.demandType)) {
        categoryCount.value['bktw']++;
        categoryMinutes.value['bktw'] += (endTime - startTime) / (1000 * 60);
        categoryPoints.value['bktw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        if(currentItem.location == 38 || currentItem.location == 3316){
          //Hollabrunn
          categoryCountHollabrunn.value['bktw']++;
          categoryMinutesHollabrunn.value['bktw'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHollabrunn.value['bktw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }else if(currentItem.location == 39 || currentItem.location == 82){
          //Haugsdorf
          categoryCountHaugsdorf.value['bktw']++;
          categoryMinutesHaugsdorf.value['bktw'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHaugsdorf.value['bktw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }

      }else if (["FNB_NEF", "NEFAZUBI", "ANA", "PNEF", "PLNEF", "FNEF", "NFS", "PNAW", "FNAW", "FSNAW", "LSRTW"].includes(currentItem.demandType)) {
        categoryCount.value['nef']++;
        categoryMinutes.value['nef'] += (endTime - startTime) / (1000 * 60);
        categoryPoints.value['nef'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        if(currentItem.location == 38 || currentItem.location == 3316){
          //Hollabrunn
          categoryCountHollabrunn.value['nef']++;
          categoryMinutesHollabrunn.value['nef'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHollabrunn.value['nef'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }else if(currentItem.location == 39 || currentItem.location == 82){
          //Haugsdorf
          categoryCountHaugsdorf.value['nef']++;
          categoryMinutesHaugsdorf.value['nef'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHaugsdorf.value['nef'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }
      }else if (["FRB", "FRC", "SR1", "SR2", "FRTW", "FRTWC", "LRTWC", "PRS", "PNFS"].includes(currentItem.demandType)) {
        categoryCount.value['rtw']++;
        categoryMinutes.value['rtw'] += (endTime - startTime) / (1000 * 60);
        categoryPoints.value['rtw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        if(currentItem.location == 38 || currentItem.location == 3316){
          //Hollabrunn
          categoryCountHollabrunn.value['rtw']++;
          categoryMinutesHollabrunn.value['rtw'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHollabrunn.value['rtw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }else if(currentItem.location == 39 || currentItem.location == 82){
          //Haugsdorf
          categoryCountHaugsdorf.value['rtw']++;
          categoryMinutesHaugsdorf.value['rtw'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHaugsdorf.value['rtw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }
      }else if (["FKB", "FKB-B", "FKC", "SK1", "SK2", "FKTW", "PKTW", "FKTWB", "BKTWB"].includes(currentItem.demandType)) {
        categoryCount.value['ktw']++;
        categoryMinutes.value['ktw'] += (endTime - startTime) / (1000 * 60);
        categoryPoints.value['ktw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        if(currentItem.location == 38 || currentItem.location == 3316){
          //Hollabrunn
          categoryCountHollabrunn.value['ktw']++;
          categoryMinutesHollabrunn.value['ktw'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHollabrunn.value['ktw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }else if(currentItem.location == 39 || currentItem.location == 82){
          //Haugsdorf
          categoryCountHaugsdorf.value['ktw']++;
          categoryMinutesHaugsdorf.value['ktw'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHaugsdorf.value['ktw'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }
      }else if (["DF1", "DF2", "DF", "RUFDF"].includes(currentItem.demandType)) {
        categoryCount.value['df']++;
        categoryMinutes.value['df'] += (endTime - startTime) / (1000 * 60);
        categoryPoints.value['df'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        if(currentItem.location == 38 || currentItem.location == 3316){
          //Hollabrunn
          categoryCountHollabrunn.value['df']++;
          categoryMinutesHollabrunn.value['df'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHollabrunn.value['df'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }else if(currentItem.location == 39 || currentItem.location == 82){
          //Haugsdorf
          categoryCountHaugsdorf.value['df']++;
          categoryMinutesHaugsdorf.value['df'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHaugsdorf.value['df'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }
      }else{
        categoryCount.value['misc']++;
        categoryMinutes.value['misc'] += (endTime - startTime) / (1000 * 60);
        categoryPoints.value['misc'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        if(currentItem.location == 38 || currentItem.location == 3316){
          //Hollabrunn
          categoryCountHollabrunn.value['misc']++;
          categoryMinutesHollabrunn.value['misc'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHollabrunn.value['misc'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }else if(currentItem.location == 39 || currentItem.location == 82){
          //Haugsdorf
          categoryCountHaugsdorf.value['misc']++;
          categoryMinutesHaugsdorf.value['misc'] += (endTime - startTime) / (1000 * 60);
          categoryPointsHaugsdorf.value['misc'] += parseInt((currentItem.overwrittenPoints !== null ? currentItem.overwrittenPoints : currentItem.points).toString(),10);
        }
      }
    }

    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
};

onMounted(() => {
  employeeId.value = route.params.id || null;
  if(employeeId.value !== null){
    //Grab the name of the employee
    getEmployeeData();
  }
  getShifts();
});
async function changeYear(direction) {
  if ((direction === -1 && year.value > lowestYear.value) || (direction === 1 && year.value < highestYear.value)) {
    year.value += direction;
    loading.value = true;
    await getShifts();
  }
}



const months = ref(monthNames.map((name, index) => ({
  name,
  isSelected: false,
  monthNumber: (index + 1).toString().padStart(2, '0'),
})));
const updateSelection = (selectedMonthNumber) => {
  months.value.forEach(month => {
    month.isSelected = month.monthNumber === selectedMonthNumber;
  });
};


const filteredShifts = computed(() => {
  // Get the current date info
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Default to the first month or the current month if the year matches
  let selectedMonthNumber = year.value === currentYear ? currentMonth : 1;

  const selectedMonth = months.value.find(month => month.isSelected);
  if (selectedMonth) {
    selectedMonthNumber = parseInt(selectedMonth.monthNumber, 10);
  } else {
    // Update to the current month if the year matches, otherwise default to '01'
    const defaultMonth = year.value === currentYear ? currentMonth.toString().padStart(2, '0') : '01';
    updateSelection(defaultMonth);
  }

  return shifts.value
    .filter(item => {
      const itemMonth = new Date(item.start).getMonth() + 1;
      const locationName = getLocationName(item.location);

      // Determine if the shift's location matches the selected category
      let matchesLocation = true; // Assume it matches by default (for 'combined')
      if (showCategoryLocation.value === 'hollabrunn' && locationName !== 'Hollabrunn') {
        matchesLocation = false;
      } else if (showCategoryLocation.value === 'haugsdorf' && locationName !== 'Haugsdorf') {
        matchesLocation = false;
      }

      return itemMonth === selectedMonthNumber && matchesLocation;
    })
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
});



</script>

<template>
  <div class="bg-gray-200 pt-4">
    
    <div class="flex flex-col justify-center items-center mb-6 mx-2">


      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6">
        <div class="px-6 py-4">

          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Regelwerk der Punkteverteilung
            <div v-if="showPunkte" @click="toggleShowPunkte()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div v-if="!showPunkte" @click="toggleShowPunkte()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <div class="flex w-full my-3 justify-center items-center" v-if="showPunkte">
            <div class="bg-blue-100 border border-slate-500 px-4 py-2 rounded relative" role="alert">
              <span class="block sm:inline">Wenn du einen Dienst (außer  DF) zwischen 19:00 und 05:59 antrittst, werden die dafür erzielten Punkte um 25% erhöht.</span>
            </div>
          </div>


          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 place-items-center" v-if="showPunkte">
            <!-- Dienstführer -->
            <div class="flex flex-col items-center p-2 w-64">
              <i class="fa-sharp fa-solid fa-phone fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">Dienstführer</div>
              <div class="text-center font-semibold py-2 text-gray-500">
                <table class="table-auto w-full text-sm text-left text-gray-500">  
                  <thead>
                    <tr>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">pro Stunde</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2">DF</td>
                      <td class="border px-4 py-2 text-center font-normal">12</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- BEL -->
            <div class="flex flex-col items-center p-2 w-64">
              <i class="fa-sharp fa-solid fa-vest fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">BEL</div>
              <div class="text-center font-semibold py-2 text-gray-500">
                <table class="table-auto w-full text-sm text-left text-gray-500">  
                  <thead>
                    <tr>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">pro Stunde</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2">Fahrer</td>
                      <td class="border px-4 py-2 text-center font-normal">4.8</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- BKTW -->
            <div class="flex flex-col items-center p-2 w-86">
              <i class="fa-sharp fa-solid fa-car-mirrors fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">BKTW</div>
              <div class="text-center font-semibold py-2 text-gray-500">
                <table class="table-auto w-full text-sm text-left text-gray-500">  
                  <thead>
                    <tr>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">pro Stunde</th>
                      <th class="px-4 py-2">pro Dienst</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2">Fahrer</td>
                      <td class="border px-4 py-2 text-center font-normal">24</td>
                      <td class="border px-4 py-2 text-center font-normal">50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 mt-4 place-items-center" v-if="showPunkte">




            <!-- NEF -->
            <div class="flex flex-col items-center p-2 w-64">
              <i class="fa-sharp fa-solid fa-stethoscope fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">NEF</div>
              <div class="text-center font-semibold py-2 text-gray-500">
                <table class="table-auto w-full text-sm text-left text-gray-500">    
                  <thead>
                    <tr>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">pro Stunde</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2">Fahrer</td>
                      <td class="border px-4 py-2 text-center font-normal">24</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">Azubi</td>
                      <td class="border px-4 py-2 text-center font-normal">12</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- RTW -->
            <div class="flex flex-col items-center p-2 w-64">
              <i class="fa-sharp fa-solid fa-truck-medical fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">RTW</div>
              <div class="text-center font-semibold py-2 text-gray-500">
                <table class="table-auto w-full text-sm text-left text-gray-500">  
                  <thead>
                    <tr>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">pro Stunde</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2">Fahrer</td>
                      <td class="border px-4 py-2 text-center font-normal">24</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">Sanitäter 1</td>
                      <td class="border px-4 py-2 text-center font-normal">24</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">Sanitäter 2</td>
                      <td class="border px-4 py-2 text-center font-normal">12</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- KTW -->
            <div class="flex flex-col items-center p-2 w-86">
              <i class="fa-sharp fa-solid fa-stretcher fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">KTW</div>
              <div class="text-center font-semibold py-2 text-gray-500">
                <table class="table-auto w-full text-sm text-left text-gray-500">  
                  <thead>
                    <tr>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">pro Stunde</th>
                      <th class="px-4 py-2">pro Dienst</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2">Fahrer</td>
                      <td class="border px-4 py-2 text-center font-normal">24</td>
                      <td class="border px-4 py-2 text-center font-normal">50</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">San. 1</td>
                      <td class="border px-4 py-2 text-center font-normal">24</td>
                      <td class="border px-4 py-2 text-center font-normal">50</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">San. 2</td>
                      <td class="border px-4 py-2 text-center font-normal">12</td>
                      <td class="border px-4 py-2 text-center font-normal"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        </div>
      </div>


      <!--
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-4 border-b border-b-gray-400 pb-1 flex justify-between items-center">
            Mitarbeiter Selektion
            <div v-if="showEmployeeSelection" @click="toggleShowEmployeeSelection()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
            <div v-if="!showEmployeeSelection" @click="toggleShowEmployeeSelection()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
          </div>


          <div class="flex w-full my-3 justify-center items-center" v-if="showEmployeeSelection">
            <div class="bg-red-100 border border-red-500 px-2 py-1 rounded relative" role="alert">
              <span class="block sm:inline">Die Selektion ist nur für Dienstführer, Moderatoren und Administratoren sichtbar</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 place-items-center" v-if="showEmployeeSelection">
            <input type="text" v-model="searchPersonalNumber" class="shadow appearance-none border border-gray-800 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>

        </div>
      </div>
    -->








      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6">
        <div class="px-6 py-4">
          <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
            <div v-if="employeeId" class="font-bold text-base md:text-xl">
              Dienste von {{ employeeData.firstname }} {{ employeeData.lastname }}
            </div>
            <div v-else class="font-bold text-base md:text-xl">
              Deine Dienste
            </div>
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



          <div v-if="!loading && employeeId !== null" class=" mt-4 mb-2">
            <!-- Single div acting as a container with all necessary styling -->
            <div class="flex items-center text-center justify-center py-1 w-full bg-blue-100 border border-blue-500 px-2 rounded" role="alert">
              <span class="block sm:inline text-blue-700"><span class="font-bold">Du hast einen Mitarbeiter ausgewählt.<br/></span>Es werden nicht deine eigenen Dienste angezeigt.</span>
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


          <div class="grid grid-cols-3 md:grid-cols-6 gap-4 p-2 place-items-center text-sm sm:text-base" v-if="!loading">
            <!-- NEF -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-stethoscope fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">NEF</div>
              <hr class="w-full"/>
              <div class="text-center font-semibold py-1 text-gray-500">
                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ categoryCount.nef.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(categoryMinutes.nef) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ categoryPoints.nef.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ categoryCountHollabrunn.nef.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(categoryMinutesHollabrunn.nef) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ categoryPointsHollabrunn.nef.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ categoryCountHaugsdorf.nef.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(categoryMinutesHaugsdorf.nef) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ categoryPointsHaugsdorf.nef.toLocaleString() }}</span>
              </div>
            </div>

            <!-- RTW -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-truck-medical fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">RTW</div>
              <hr class="w-full"/>
              <div class="text-center font-semibold py-1 text-gray-500">
                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ categoryCount.rtw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(categoryMinutes.rtw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ categoryPoints.rtw.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ categoryCountHollabrunn.rtw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(categoryMinutesHollabrunn.rtw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ categoryPointsHollabrunn.rtw.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ categoryCountHaugsdorf.rtw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(categoryMinutesHaugsdorf.rtw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ categoryPointsHaugsdorf.rtw.toLocaleString() }}</span>
              </div>
            </div>

            <!-- KTW -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-stretcher fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">KTW</div>
              <hr class="w-full"/>
              <div class="text-center font-semibold py-1 text-gray-500">
                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ categoryCount.ktw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(categoryMinutes.ktw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ categoryPoints.ktw.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ categoryCountHollabrunn.ktw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(categoryMinutesHollabrunn.ktw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ categoryPointsHollabrunn.ktw.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ categoryCountHaugsdorf.ktw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(categoryMinutesHaugsdorf.ktw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ categoryPointsHaugsdorf.ktw.toLocaleString() }}</span>
              </div>
            </div>

            <!-- BKTW -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-car-mirrors fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">BKTW</div>
              <hr class="w-full"/>
              <div class="text-center font-semibold py-1 text-gray-500">
                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ categoryCount.bktw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(categoryMinutes.bktw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ categoryPoints.bktw.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ categoryCountHollabrunn.bktw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(categoryMinutesHollabrunn.bktw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ categoryPointsHollabrunn.bktw.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ categoryCountHaugsdorf.bktw.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(categoryMinutesHaugsdorf.bktw) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ categoryPointsHaugsdorf.bktw.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Dienstführer -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-phone fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">Dienstführer</div>
              <hr class="w-full"/>
              <div class="text-center font-semibold py-1 text-gray-500">
                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ categoryCount.df.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(categoryMinutes.df) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ categoryPoints.df.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ categoryCountHollabrunn.df.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(categoryMinutesHollabrunn.df) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ categoryPointsHollabrunn.df.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ categoryCountHaugsdorf.df.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(categoryMinutesHaugsdorf.df) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ categoryPointsHaugsdorf.df.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Sonstiges -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-ellipsis-h fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">Sonstiges</div>
              <hr class="w-full"/>
              <div class="text-center font-semibold py-1 text-gray-500">
                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ categoryCount.misc.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(categoryMinutes.misc) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ categoryPoints.misc.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ categoryCountHollabrunn.misc.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(categoryMinutesHollabrunn.misc) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ categoryPointsHollabrunn.misc.toLocaleString() }}</span>

                <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ categoryCountHaugsdorf.misc.toLocaleString() }}</span>
                <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(categoryMinutesHaugsdorf.misc) }}</span>
                <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ categoryPointsHaugsdorf.misc.toLocaleString() }}</span>
              </div>
            </div>
          </div>


          
          <div class="mx-[-1.5rem] border-t-2 border-gray-300 mt-3 mb-6"></div>

          <div class="overflow-x-auto mb-1">
            <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base my-2">
              <tbody>
                <tr v-for="i in [0, 6]" :key="i" class="grid grid-cols-3 sm:grid-cols-6">
                  <td v-for="month in months.slice(i, i + 6)" :key="month.monthNumber" @click="updateSelection(month.monthNumber)"
                      class="px-2 py-1 text-center border border-gray-300 cursor-pointer"
                      :class="{ 'font-semibold': month.isSelected, 'bg-slate-300': month.isSelected, 'hover:bg-blue-300': !month.isSelected }">
                    {{ month.name }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="overflow-x-auto" v-if="!loading">
            <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base my-2">
              <thead>
                <tr class="bg-red-800 text-white">
                  <th class="px-2 py-1 text-center border border-gray-300">Datum</th>
                  <th class="px-2 py-1 text-center border border-gray-300">Zeitraum</th>
                  <th class="px-2 py-1 text-center border border-gray-300 hidden sm:table-cell">Dauer</th>
                  <th class="px-2 py-1 text-center border border-gray-300">Dienst</th>
                  <th class="px-2 py-1 text-center border border-gray-300 hidden sm:table-cell">Ort</th>
                  <th class="px-2 py-1 text-center border border-gray-300">Punkte</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(shift, index) in filteredShifts" :key="shift.employeeId + shift.start" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                  <td class="px-2 py-1 text-center border border-gray-300">{{ formatDate(shift.start) }}</td>
                  <td class="px-2 py-1 text-center border border-gray-300">{{ formatTime(shift.start) }} - {{ formatTime(shift.end) }}</td>
                  <td class="px-2 py-1 text-center border border-gray-300 hidden sm:table-cell">
                    <span v-if="calculateDuration(shift.start, shift.end).hours != 0">{{ calculateDuration(shift.start, shift.end).hours }}</span>
                    <span v-if="calculateDuration(shift.start, shift.end).hours != 0" class="text-gray-400"> h</span>&nbsp;&nbsp;
                    <span v-if="calculateDuration(shift.start, shift.end).minutes != 0">{{ calculateDuration(shift.start, shift.end).minutes }}</span>
                    <span v-if="calculateDuration(shift.start, shift.end).minutes != 0" class="text-gray-400"> min</span>
                  </td>
                  <td class="px-2 py-1 text-center border border-gray-300">{{ shift.demandType }}</td>
                  <td class="px-2 py-1 text-center border border-gray-300 hidden sm:table-cell">{{ getLocationName(shift.location) }}</td>
                  <td class="px-2 py-1 text-center border border-gray-300">
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
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
    

  </div>
</template>