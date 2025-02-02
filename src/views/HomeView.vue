<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

interface RawShift {
  Datum: string
  Beginn: string
  Ende: string
  Ort: string
  'Typ id': string
  Fahrzeug: string
  Kollegen: string
}
// Interface für das Format, das wir in der Tabelle anzeigen wollen
interface ShiftDisplay {
  date: string
  from: string
  to: string
  location: string
  resourceKey: string
  kfz: string
  colleagues: string[]
}


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

interface Course {
  id: number;
  name: string;
  info?: string;
  date: string;
  sortableDate: string;  // Additional property for sorting
  start_time: string;
  end_time: string;
  registered: boolean; // default null or false, needs to be set to true if user is registered
}

const loadingGreeting = ref("loading");


const store = useStore();
const isPrivileged = computed(() => {
    const user = store.state.user; // Directly accessing user from the state
    if (!user) return false; // Check if user is null
    return user.isAdministrator || user.isModerator || user.isDeveloper;
});

const jwt = computed(() => store.state.jwt);
const user = computed(() => store.state.user);

//const loading = ref(false);
//const year = ref(2024);
//const lowestYear = ref(2023);
//const highestYear = ref(2024);

const greeting = ref("");
const shifts = ref<Shift[]>([]);
const courses = ref<Course[]>([]);
const myCourses = ref<any[]>([]);
const mergedCourses = ref<Course[]>([]); 
const rankings = ref<Ranking[]>([]);
const selfShifts = ref<RawShift[]>([])
const statistics = ref<PointsRow[]>([]);

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
/*
const monthNames = [
    'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];*/
//const fileLinks = ref({}); // Object to store the links
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

const getCourses = async () => {
  try {
    const response = await axios.get('../api/self/courses', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    courses.value = response.data.data;
    getMyCourses();
  } catch (error) {
    console.error(error);
  }
};
const getMyCourses = async () => {
  try {
    const response = await axios.get('../api/self/mycourses', {
      headers: {
        Accepts: "application/json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    // Check if 'status' key is present and indicates 'NODATA'
    if (response.data.status && response.data.status === "NODATA") {
      myCourses.value = []; // Handle cases where no data is available
    } else {
      // Map and format the date only if data is present
      myCourses.value = response.data.data.map(course => ({
        ...course,
        DATE: formatDateCourse(course.DATE)  // Continue to format date
      }));
    }
    mergeCourses();  // Continue to merge courses after setting myCourses
  } catch (error) {
    console.error(error);
    myCourses.value = []; // Reset on error to avoid inconsistencies
    mergeCourses();  // Ensure mergeCourses is called even if an error occurs
  }
};
const convertDate = (date: string) => {
  const parts = date.split('.');
  return `${parts[2]}${parts[1]}${parts[0]}`; // Concatenate as YYYYMMDD
};
const mergeCourses = () => {
  const courseMap = new Map();

  // Add all courses and convert id to string to ensure consistency
  courses.value.forEach(course => {
    const courseId = String(course.id);
    courseMap.set(courseId, { ...course, 
      sortableDate: convertDate(course.date), registered: false });
  });

  // Set 'registered' status for myCourses and ensure ID consistency
  myCourses.value.forEach(course => {
    const courseId = String(course.ID);
    if (courseMap.has(courseId)) {
      const existingCourse = courseMap.get(courseId);
      courseMap.set(courseId, { ...existingCourse, registered: true });
    } else {
      courseMap.set(courseId, {
        id: courseId,
        name: course.NAME,
        info: course.INFO || '',
        date: course.DATE,
        sortableDate: convertDate(course.DATE),
        start_time: course.VON,
        end_time: course.BIS,
        registered: true
      });
    }
  });

  // Update mergedCourses reactive reference
  const sortedCourses = Array.from(courseMap.values()).sort((a, b) => {
    // Compare by sortable date first
    if (a.sortableDate < b.sortableDate) return -1;
    if (a.sortableDate > b.sortableDate) return 1;
    // If sortable dates are the same, compare by start time
    if (a.start_time < b.start_time) return -1;
    if (a.start_time > b.start_time) return 1;
    return 0;
  });

  // Update mergedCourses reactive reference
  mergedCourses.value = sortedCourses;
};

/*
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
};*/

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
const getPointStatistic = async () => {
  statistics.value = [];
  try {
    const response = await axios.get('../api/pointStatistic', {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    statistics.value = response.data;
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
    selfShifts.value = response.data;
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

const formattedShifts = computed<ShiftDisplay[]>(() => {
  return selfShifts.value.map((shift) => {
    return {
      date: shift.Datum,
      from: shift.Beginn,
      to: shift.Ende,
      location: shift.Ort,
      resourceKey: shift['Typ id'],
      kfz: shift.Fahrzeug,
      // Kollegen als Array trennen (Kommas), falls vorhanden
      colleagues: shift.Kollegen
        ? shift.Kollegen.split(',').map((kollege) => kollege.trim())
        : [],
    }
  })
})

onMounted(() => {
  resetMonthFiles();
  getGreeting();
  getShifts();
  getRanking();
  getFutureShifts();
  //getInfoblaetter();

  getCourses();
  if(isPrivileged.value) {
    getPointStatistic();
  }

});


const formatDate = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleDateString();
};
const formatDateCourse = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
};

const formatTime = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getLocationName = (locationId) => {
  switch(locationId) {
    case 39: return 'Haugsdorf';
    case 82: return 'Haugsdorf';
    case 38: return 'Hollabrunn';
    case 3316: return 'Hollabrunn';
    default: return locationId;
  }
};

const formatPoints = (points) => {
  const numericPoints = parseFloat(points);
  return Number.isInteger(numericPoints) ? numericPoints.toString() : points;
};


// Computed property for total collected points
const totalCollectedPoints = computed(() => {
  let total = 0;
  for (const key in statistics.value) {
    const entry = statistics.value[key];
    total += parseFloat(entry.collectedPoints);
  }
  return total;
});

const totalUsedPoints = computed(() => {
  let total = 0;
  for (const key in statistics.value) {
    const entry = statistics.value[key];
    total += parseFloat(entry.usedPoints);
  }
  return total;
});
const totalUsedPointsWithArticle = computed(() => {
  let total = 0;
  for (const key in statistics.value) {
    const entry = statistics.value[key];
    total += parseFloat(entry.usedPointsWithArticle);
  }
  return total;
});

// Helper function to format points as a string with fixed decimal places
function formatPointsToFixed(points: string | number): string {
  const numericPoints = typeof points === 'string' ? parseFloat(points)/100 : points/100;
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0, useGrouping: true }).format(numericPoints);
}
interface PointsRow {
  year: number;
  collectedPoints: string;
  usedPoints: string;
  usedPointsWithArticle: string;
}



/*
async function changeYear(direction) {
  if ((direction === -1 && year.value > lowestYear.value) || (direction === 1 && year.value < highestYear.value)) {
    y1ear.value += direction;
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
*/

/*
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
};*/
/*
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
*/


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
     <!--
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
  -->



  

<!--
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
  -->



  <div class="flex justify-center mb-6" v-if="isPrivileged">
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center font-bold text-base md:text-xl mb-2 border-b border-b-gray-400 pb-1">
          <div>Punkte Übersicht</div>
          <div class="text-sm text-gray-400 pt-1.5">Noch verfügbare Punkte: {{ formatPointsToFixed(totalCollectedPoints - totalUsedPoints) }} &euro;</div>
        </div>
      

        <div class="overflow-x-auto">
          <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
            <thead>
              <tr class="bg-red-800 text-white">
                <th class="px-2 py-1 text-center">Jahr</th>
                <th class="px-2 py-1 text-center">Gesammelte Punkte</th>
                <th class="px-2 py-1 text-center">Ausgegebene Punkte <span class="text-xs">(davon im RK Shop)</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in statistics" :key="row.year" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                <td class="px-2 py-1 text-center">{{ row.year }}</td>
                <td class="px-2 py-1 text-center">{{ formatPointsToFixed(row.collectedPoints) }} &euro;</td>
                <td class="px-2 py-1 text-center">{{ formatPointsToFixed(row.usedPoints) }} &euro; <span class="text-gray-400">({{ formatPointsToFixed(row.usedPointsWithArticle) }} &euro;)</span></td>
              </tr>
        
              <tr class="bg-gray-300 hover:bg-blue-400">
                <td class="px-2 py-1 text-center font-bold">Gesamt</td>
                <td class="px-2 py-1 text-center font-bold">{{ formatPointsToFixed(totalCollectedPoints) }} &euro;</td>
                <td class="px-2 py-1 text-center font-bold">{{ formatPointsToFixed(totalUsedPoints) }} &euro; <span class="text-gray-400">({{ formatPointsToFixed(totalUsedPointsWithArticle) }} &euro;)</span></td>
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

              <a href="https://dienstplan.n.roteskreuz.at/" target="_blank" class="py-1 px-3 bg-gray-300 border rounded-lg border-gray-400 transition duration-300 ease-in-out hover:text-white hover:bg-gray-500 cursor-pointer" >
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
        <div class="font-bold text-base md:text-xl mb-2 border-b border-b-gray-400 pb-1">
          Deine zukünftigen Dienste
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
            <thead>
              <tr class="bg-red-800 text-white">
                <th class="px-2 py-1 text-left">Datum</th>
                <th class="px-2 py-1 text-left">Beginn</th>
                <th class="px-2 py-1 text-left">Ende</th>
                <th class="px-2 py-1 text-left">Ort</th>
                <th class="px-2 py-1 text-left">Typ</th>
                <th class="px-2 py-1 text-left">Fahrzeug</th>
                <th class="px-2 py-1 text-left">Kollegen</th>
              </tr>
            </thead>
            <tbody>
              <!-- Nur anzeigen, wenn es tatsächlich Daten gibt -->
              <tr
                v-for="(shift, index) in formattedShifts"
                :key="index"
                :class="{
                  'bg-gray-200': index % 2 === 0,
                  'hover:bg-blue-300': true
                }"
              >
                <td class="px-2 py-1">{{ shift.date }}</td>
                <td class="px-2 py-1">{{ shift.from }}</td>
                <td class="px-2 py-1">{{ shift.to }}</td>
                <td class="px-2 py-1">{{ shift.location }}</td>
                <td class="px-2 py-1">{{ shift.resourceKey }}</td>
                <td class="px-2 py-1">{{ shift.kfz }}</td>
                <td class="px-2 py-1">
                  <!-- Kollegen sind hier ein Array, daher join mit Komma -->
                  {{ shift.colleagues.join(', ') }}
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
        <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
          <div class="font-bold text-base md:text-xl">Zukünftige Kurse</div>  
          
          <div class="flex items-center justify-center mb-1 py-0 space-x-2 text-sm sm:text-base">

            <a href="https://portal.n.roteskreuz.at/index.php?ebene=A&stichwort=&kategorie=0&zeitraum=0&bezirksstelle=03070&modul=kursverwaltung&seite=fortbildungen&suche=1" target="_blank" 
            class="text-sm py-1 px-2 bg-gray-300 border rounded-lg border-gray-400 transition duration-300 ease-in-out hover:text-white hover:bg-gray-500 cursor-pointer" >
              Zu den Kursen im MIP
            </a>
          </div>  
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full table-auto bg-white text-xs sm:text-sm md:text-base">
            <thead>
              <tr class="bg-red-800 text-white">
                <th class="px-2 py-1 text-center">Ang.</th>
                <th class="px-2 py-1 text-left">Bezeichnung</th>
                <th class="px-2 py-1 text-center">Datum</th>
                <th class="px-2 py-1 text-center">Uhrzeit</th>
                <th class="px-2 py-1 text-center">Kurs ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(course, index) in mergedCourses" :key="course.id" :class="{'bg-gray-200': index % 2 === 0, 'hover:bg-blue-300': true}">
                <td class="px-2 py-1 text-center">
                  <i v-if="course.registered"
                      :key="`registered-${course.id}`"
                      class="fa fa-check-circle text-green-600"></i>
                  <i v-else
                      :key="`not-registered-${course.id}`"
                      class="fa fa-times text-gray-500"></i>
                </td>
                <td class="px-2 py-1 text-left">{{ course.name }}<br/><span class="text-xs text-gray-500">{{ course.info }}</span></td>
                <td class="px-2 py-1 text-center">{{ course.date }}</td>
                <td class="px-2 py-1 text-center">{{ course.start_time }} - {{ course.end_time }}</td>
                <td class="px-2 py-1 text-center text-gray-400">{{ course.id }}</td>
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
