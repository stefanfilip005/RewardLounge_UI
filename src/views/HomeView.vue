<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

interface Shift {
    employeeId: string; // or number, depending on your data
    start: string; // Assuming it's a string, adjust if it's a Date
    end: string; // Same as above
    demandType: string;
    location: number; // or string, depending on your data
    points: number;
    overwrittenPoints: number;
}

interface Ranking {
    place: number; // Assuming 'place' is a number, change the type if it's different
    year: number;
    points: number;
    pointsForNext: number;
    location: number | null;
}

interface Resource {
  typ: string;
  mnr: string;
  data: string;
  // other properties...
}
interface FutureShift {
  date: string;
  from: string;
  to: string;
  resources: { [key: string]: Resource };
  // other properties...
}


const loadingGreeting = ref("loading");


const store = useStore();

const jwt = computed(() => store.state.jwt);
const user = computed(() => store.state.user);

const loading = ref(false);
const year = ref(2024);
const lowestYear = ref(2023);
const highestYear = ref(2024);

const greeting = ref("");
const shifts = ref<Shift[]>([]);
const rankings = ref<Ranking[]>([]);
const selfShifts = ref<FutureShift[]>([]);

const showCategoryLocation = ref('combined');

const monthFiles = ref({});

const resetMonthFiles = () => {
    monthFiles.value = {
        '01': null,
        '02': null,
        '03': null,
        '04': null,
        '05': null,
        '06': null,
        '07': null,
        '08': null,
        '09': null,
        '10': null,
        '11': null,
        '12': null,
    };
};

const monthNames = [
    'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];
const fileLinks = ref({}); // Object to store the links
const getGreeting = async () => {
  loadingGreeting.value = "loading";
  greeting.value = "";
  try {
    const response = await axios.get('../api/greeting', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    greeting.value = response.data.text;
    loadingGreeting.value = "done";
  } catch (error) {
    loadingGreeting.value = "error";
    console.error(error);
  }
};
const greetingLines = computed(() => {
  return greeting.value ? greeting.value.split('\n') : [''];
});

const hasGreetingLines = computed(() => {
  return greetingLines.value.some(line => line.trim() !== '');
});

const getShifts = async () => {
  shifts.value = [];
  try {
    const response = await axios.get('../api/self/latestShifts', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    shifts.value = response.data.data;
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

const getRanking = async () => {
  rankings.value = [];
  try {
    const response = await axios.get('../api/self/ranking', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    rankings.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const getFutureShifts = async () => {
  selfShifts.value = [];
  try {
    const response = await axios.get('../api/self/futureShifts', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    selfShifts.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const filteredRankings = computed(() => {
    if (showCategoryLocation.value === 'combined') {
        return rankings.value.filter(ranking => ranking.location === null);
    } else if (showCategoryLocation.value === 'hollabrunn') {
        return rankings.value.filter(ranking => ranking.location === 38);
    } else if (showCategoryLocation.value === 'haugsdorf') {
        return rankings.value.filter(ranking => ranking.location === 39);
    }
    return rankings.value;
});


const shiftsIncludingSelf = computed(() => {
  const shifts = Object.values(selfShifts.value || {});
  return shifts
    .filter(shift => isSelfInShift(shift.resources))
    .map(shift => {
      const resourceKey = getResourceKey(shift.resources, user.value.remoteId);
      return {
        date: shift.date,
        from: shift.from,
        to: shift.to,
        kfz: getKfzResource(shift.resources),
        colleagues: getColleagueNames(shift.resources),
        resourceKey: resourceKey // This is the new part
      };
    })
    .sort((a, b) => {
      // Compare by date first
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) {
        return dateA - dateB; // Sort dates in ascending order
      }

      // If dates are equal, compare by 'from' time
      const fromTimeA = a.from;
      const fromTimeB = b.from;

      return fromTimeA.localeCompare(fromTimeB); // Sort 'from' times in ascending order
    });
});

// Check if the user is part of the shift
const isSelfInShift = (resources: { [key: string]: Resource }) => {
  return Object.values(resources).some(resource => resource.typ === 'MA' && resource.mnr === user.value.remoteId);
};

// Extract KFZ resource data
const getKfzResource = (resources: { [key: string]: Resource }) => {
  const kfzResource = Object.values(resources).find(resource => resource.typ === 'KFZ');
  return kfzResource ? kfzResource.data : '';
};

// Function to get the key of the resource matching the given ID
const getResourceKey = (resources: { [key: string]: Resource }, id) => {
  for (const [key, resource] of Object.entries(resources)) {
    if (resource.typ === 'MA' && resource.mnr === id) {
      return key;
    }
  }
  return 'N/A';
};

const getColleagueNames = (resources: { [key: string]: Resource }) => {
  return Object.values(resources)
    .filter(resource => resource.typ === 'MA' && resource.mnr !== user.value.remoteId)
    .map(resource => {
      // Remove content within parentheses and trim whitespaces
      return resource.data.replace(/\(.*?\)/, '').trim();
    });
};

onMounted(() => {
  resetMonthFiles();
  getGreeting();
  getShifts();
  getRanking();
  getFutureShifts();
  getInfoblaetter();
});


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

const formatPoints = (points) => {
  const numericPoints = parseFloat(points);
  return Number.isInteger(numericPoints) ? numericPoints.toString() : points;
};

async function changeYear(direction) {
  if ((direction === -1 && year.value > lowestYear.value) || (direction === 1 && year.value < highestYear.value)) {
    year.value += direction;
    //loading.value = true;
    getInfoblaetter();
  }
}

const computedMonths = computed(() => {
  return Array.from({ length: 12 }, (_, k) => {
    const monthNumber = (k + 1).toString().padStart(2, '0');
    return {
      name: monthNames[k],
      isAvailable: monthFiles.value[monthNumber] != null,
      monthNumber,
    };
  });
});


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
async function downloadFile(monthIndex) {
  const monthKey = ('0' + monthIndex.monthNumber).slice(-2);
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

</script>

<template>
  <div class="bg-gray-200 pt-4">
    
    <div class="flex justify-center mb-6" v-if="loadingGreeting == 'done' ">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 pt-4" :class="{ 'pb-6': hasGreetingLines }">
          <div class="font-bold text-base md:text-xl mb-2 border-b border-b-gray-400 pb-1">Hallo {{ user.firstname }} {{ user.lastname }}</div>
          <div class="text-left text-sm md:text-base" :class="{ 'border-b border-b-gray-400 mb-4 pb-2': hasGreetingLines }">
            <strong>Deine verfügbaren Punkte: {{ Math.floor(user.points).toLocaleString() }}</strong>
          </div>
          <p v-for="(line, index) in greetingLines" :key="index" class="text-sm md:text-base">
            <!-- Use a non-breaking space for empty lines -->
            <span v-if="line === ''">&nbsp;</span>
            <span v-else>{{ line }}</span>
          </p>   
        </div>
      </div>
    </div>

    <div class="flex justify-center mb-6" v-if="loadingGreeting == 'error' || loadingGreeting == 'loading'">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 p-4 text-center font-bold">
          <div class="text-red-700" v-if="loadingGreeting == 'error'">
            Fehler : Infomeldung konnte nicht geladen werden
          </div>
          <div class="text-gray-600" v-if="loadingGreeting == 'loading'">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Begrüßung wird geladen...
          </div>
        </div>
      </div>
    </div>
    
    <!-- Umfragen -->
    <div class="flex justify-center mb-6">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 pt-4 pb-2">
          <div class="font-bold text-base md:text-xl mb-2 border-b border-b-gray-400 pb-1">Aktuelle Umfrage</div>
          <div class="bg-red-800 text-white px-2 py-1 font-bold mb-1.5">
            Was soll als nächstes in den Automaten?
          </div>
          <div class="py-2 font-semibold border-gray-400 border-b mx-2">
            <button class="py-0.5 px-1.5 text-sm bg-gray-300 border border-gray-400 rounded-lg transition duration-300 ease-in-out hover:bg-gray-500 cursor-pointer mr-2 font-normal">Abstimmen</button> Mehr Süßigkeiten
          </div>
          <div class="py-2 font-semibold mx-2">
            <button class="py-0.5 px-1.5 text-sm bg-gray-300 border border-gray-400 rounded-lg transition duration-300 ease-in-out hover:bg-gray-500 cursor-pointer mr-2 font-normal">Abstimmen</button> Mehr Süßigkeiten
          </div>
        </div>
      </div>
    </div>



    <div class="flex justify-center mb-6">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">
          <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
            <div class="font-bold text-base md:text-xl">Infoblätter</div>    
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
          <div class="overflow-x-auto">
            <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base my-2">
              <tbody>
                <tr v-for="i in [0, 6]" :key="i" class="grid grid-cols-3 sm:grid-cols-6">
                  <td v-for="month in computedMonths.slice(i, i + 6)" :key="month.monthNumber" @click="downloadFile(month)"
                      class="px-2 py-1 text-center border border-gray-300"
                      :class="{ 'text-gray-300': !month.isAvailable, 'cursor-not-allowed': !month.isAvailable, 'hover:bg-blue-300': month.isAvailable, 'cursor-pointer': month.isAvailable }">
                    {{ month.name }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>


    <div class="flex justify-center mb-6">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-2 border-b border-b-gray-400 pb-1">Rangliste</div>


          <div class="flex flex-col sm:flex-row mb-2 justify-between">
            <div class="flex items-center justify-center mb-2 py-1 space-x-2 text-sm sm:text-base">
              <div 
                class="py-1 px-3 bg-gray-300 border border-gray-400 rounded-l-lg transition duration-300 ease-in-out hover:bg-gray-500 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategoryLocation === 'combined' }" 
                @click="showCategoryLocation='combined'">
                Kombiniert
              </div>
              <div
                class="py-1 px-3 bg-gray-300 border border-gray-400 transition duration-300 ease-in-out hover:bg-gray-500 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategoryLocation === 'hollabrunn' }" 
                @click="showCategoryLocation='hollabrunn'">
                Hollabrunn
              </div>
              <div
                class="py-1 px-3 bg-gray-300 border border-gray-400 rounded-r-lg transition duration-300 ease-in-out hover:bg-gray-500 cursor-pointer" 
                :class="{ 'bg-gray-500 text-white': showCategoryLocation === 'haugsdorf' }" 
                @click="showCategoryLocation='haugsdorf'">
                Haugsdorf
              </div>
            </div>  


            <div class="flex items-center justify-center mb-2 py-1 space-x-2 text-sm sm:text-base">

              <a href="https://portal.n.roteskreuz.at/index.php?modul=rps&seite=dienstplan" target="_blank" class="py-1 px-3 bg-gray-300 border rounded-lg border-gray-400 transition duration-300 ease-in-out hover:text-white hover:bg-gray-500 cursor-pointer" >
                Hol dir gleich hier mehr Punkte
              </a>
            </div>

          </div>





          <div class="overflow-x-auto">
            <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
              <thead>
                <tr class="bg-red-800 text-white">
                  <th class="px-2 py-1 text-center">Jahr</th>
                  <th class="px-2 py-1 text-center">Platzierung</th>
                  <th class="px-2 py-1 text-center">Punkte</th>
                  <th class="px-2 py-1 text-center">Punkteabstand zum nächsten Platz</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ranking, index) in filteredRankings" :key="ranking.year + '-' + ranking.location" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                  <td class="px-2 py-1 text-center">{{ ranking.year }}</td>
                  <td class="px-2 py-1 text-center">{{ ranking.place }}</td>
                  <td class="px-2 py-1 text-center">{{ ranking.points.toLocaleString() }}</td>
                  <td class="px-2 py-1 text-center">{{ ranking.pointsForNext.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>

    
    <div class="flex justify-center mb-6">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-2 border-b border-b-gray-400 pb-1">Deine zukünftigen Dienste</div>
          <div class="overflow-x-auto">
            <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
              <thead>
                <tr class="bg-red-800 text-white">
                  <th class="px-2 py-1 text-left">Datum</th>
                  <th class="px-2 py-1 text-left">Beginn</th>
                  <th class="px-2 py-1 text-left">Ende</th>
                  <th class="px-2 py-1 text-left">Klasse</th>
                  <th class="px-2 py-1 text-left">Fahrzeug</th>
                  <th class="px-2 py-1 text-left">Kollegen</th>
                </tr>
              </thead>
              <tbody v-if="shiftsIncludingSelf && shiftsIncludingSelf.length > 0">
                <tr v-for="(shift, index) in shiftsIncludingSelf" :key="shift.date" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                  <td class="px-2 py-1">{{ shift.date }}</td>
                  <td class="px-2 py-1">{{ shift.from }}</td>
                  <td class="px-2 py-1">{{ shift.to }}</td>
                  <td class="px-2 py-1">{{ shift.resourceKey }}</td>
                  <td class="px-2 py-1">{{ shift.kfz }}</td>
                  <td class="px-2 py-1">{{ shift.colleagues.join(', ') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    
    


    <div class="flex justify-center mb-10">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">
          <div class="font-bold text-base md:text-xl mb-2 border-b border-b-gray-400 pb-1">Deine {{ shifts.length }} zuletzt gemachten Dienste</div>

          <div class="overflow-x-auto">
            <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
              <thead>
                <tr class="bg-red-800 text-white">
                  <th class="px-2 py-1 text-left">Datum</th>
                  <th class="px-2 py-1 text-left">Beginn</th>
                  <th class="px-2 py-1 text-left">Ende</th>
                  <th class="px-2 py-1 text-left">Klasse</th>
                  <th class="px-2 py-1 text-left hidden sm:table-cell">Dienststelle</th>
                  <th class="px-2 py-1 text-left">Punkte</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(shift, index) in shifts" :key="shift.employeeId + shift.start" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                  <td class="px-2 py-1">{{ formatDate(shift.start) }}</td>
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
