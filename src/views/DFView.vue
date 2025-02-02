<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import dayjs from 'dayjs'; // for handling date calculations
import 'dayjs/locale/de'; // import the German locale
import relativeTime from 'dayjs/plugin/relativeTime';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

dayjs.extend(relativeTime);
dayjs.locale('de'); // use German locale globally

interface Employee {
  remoteId: number;
    last_shift_date: string; // ISO date string
    next_shift_date: string; // ISO date string
    last_sms_sent: string;
    sms_count: number;
    firstname: string;
    lastname: string;
    points: number;
    employeeType: string;
    shift_formatted: string; // Formatted date string
    shift_relative: string; // Relative date string
    haupt: string,
    Status: string,
    active: boolean,
    hidden: boolean,
    auszeit: boolean,
    phone: string,
    phoneInternational?: string

}
function formatPhoneNumber(phone: string | undefined, countryCode: CountryCode = 'DE'): string {
  if (typeof phone === 'string' && phone.trim() !== '') {
    const phoneNumber = parsePhoneNumberFromString(phone, { defaultCountry: countryCode });
    return phoneNumber ? phoneNumber.formatInternational() : '';
  }
  return '';  // Rückgabe eines leeren Strings, wenn kein gültiger Telefonnummer-String vorhanden ist.
}

const store = useStore();
const jwt = computed(() => store.state.jwt);

const isAdmin = computed(() => {
    const user = store.state.user; // Directly accessing user from the state
    if (!user) return false; // Check if user is null
    return user.isAdministrator || user.isDeveloper;
});

const employees = ref<Employee[]>([]);
  const filteredGroups = ref<{
  future: Employee[],
  futureWeek: Employee[],
  lastWeek: Employee[],
  last2Weeks: Employee[],
  lastMonth: Employee[],
  last2Months: Employee[],
  last6Months: Employee[],
  lastYear: Employee[],
  beyondYear: Employee[]
}>({
  future: [],
  futureWeek: [],
  lastWeek: [],
  last2Weeks: [],
  lastMonth: [],
  last2Months: [],
  last6Months: [],
  lastYear: [],
  beyondYear: []
});
const toggleStates = ref({
  future: false,
  futureWeek: false,
  lastWeek: false,
  last2Weeks: false,
  lastMonth: false,
  last2Months: true,
  last6Months: true,
  lastYear: true,
  beyondYear: false
});
const groupDescriptions = {
  future: 'Haben einen zukünftigen Dienst eingetragen',
  futureWeek: 'Haben in den nächsten 7 Tagen einen zukünftigen Dienst eingetragen',
  lastWeek: 'Hatte in den letzten 7 Tagen den letzten Dienst',
  last2Weeks: 'Hatte in den letzten 14 Tagen den letzten Dienst',
  lastMonth: 'Hatte in den letzten 30 Tagen den letzten Dienst',
  last2Months: 'Der letzte Dienst ist länger als 30 Tage her', // Updated description for clarity
  last6Months: 'Der letzte Dienst ist länger als 60 Tage her', // Assuming a progression in the descriptions
  lastYear: 'Der letzte Dienst ist länger als 180 Tage her', // Logical step in the sequence
  beyondYear: 'Der letzte Dienst ist länger als ein Jahr her' // Description for more than a year since the last service
};

const getEmployees = async () => {
  let url = '../api/employees';
  try {
    const response = await axios.get(url, {
      headers: {
        Accepts: "application/json", // Corrected the header to "application/json"
        Authorization: `Bearer ${jwt.value}`
      }
    });
    // Filter employees to include only those with employeeType "EA-RKT"
    const filteredEmployees = response.data.data.filter((emp: Employee) => emp.Status === "Ehrenamtlich" && emp.firstname && emp.lastname);

    // Mapping the filtered list
    employees.value = filteredEmployees.map((emp: Employee) => ({
      ...emp,
      phoneInternational: formatPhoneNumber(emp.phone),
      shift_relative: emp.next_shift_date ? dayjs(emp.next_shift_date).fromNow() : 
                        (emp.last_shift_date ? dayjs(emp.last_shift_date).fromNow() : 'Kein Datum'),
      shift_formatted: emp.next_shift_date ? dayjs(emp.next_shift_date).format('DD.MM.YYYY') : 
                        (emp.last_shift_date ? dayjs(emp.last_shift_date).format('DD.MM.YYYY') : 'Kein Datum')
    }));
    categorizeEmployees();
  } catch (error) {
    console.error(error);
  }
};
const categorizeEmployees = () => {
    const now = dayjs();

    filteredGroups.value.future = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
            if( emp.points == 0) return false;
            if (!emp.next_shift_date) return false;
            const empDate = dayjs(emp.next_shift_date);
            return now.diff(empDate, 'day') <= -7;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.next_shift_date).unix() - dayjs(a.next_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });
    filteredGroups.value.futureWeek = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
            if( emp.points == 0) return false;
            if (!emp.next_shift_date) return false;
            const empDate = dayjs(emp.next_shift_date);
            return now.diff(empDate, 'day') > -7;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.next_shift_date).unix() - dayjs(a.next_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });


    filteredGroups.value.lastWeek = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
          if( emp.points == 0) return false;
            if (emp.next_shift_date) return false;
            if (!emp.last_shift_date) return false;
            const empDate = dayjs(emp.last_shift_date);
            return now.diff(empDate, 'day') <= 7;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.last_shift_date).unix() - dayjs(a.last_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });
    filteredGroups.value.last2Weeks = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
          if( emp.points == 0) return false;
            if (emp.next_shift_date) return false;
            if (!emp.last_shift_date) return false;
            const empDate = dayjs(emp.last_shift_date);
            return now.diff(empDate, 'day') > 7 && now.diff(empDate, 'day') <= 14;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.last_shift_date).unix() - dayjs(a.last_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });

    filteredGroups.value.lastMonth = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
          if( emp.points == 0) return false;
            if (emp.next_shift_date) return false;
            if (!emp.last_shift_date) return false;
            const empDate = dayjs(emp.last_shift_date);
            return now.diff(empDate, 'day') > 14 && now.diff(empDate, 'day') <= 30;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.last_shift_date).unix() - dayjs(a.last_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });

    filteredGroups.value.last2Months = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
          if( emp.points == 0) return false;
          if (emp.next_shift_date) return false;
            if (!emp.last_shift_date) return false;
            const empDate = dayjs(emp.last_shift_date);
            return now.diff(empDate, 'day') > 30 && now.diff(empDate, 'day') <= 60;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.last_shift_date).unix() - dayjs(a.last_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });

    filteredGroups.value.last6Months = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
          if( emp.points == 0) return false;
          if (emp.next_shift_date) return false;
            if (!emp.last_shift_date) return false;
            const empDate = dayjs(emp.last_shift_date);
            return now.diff(empDate, 'day') > 60 && now.diff(empDate, 'day') <= 180;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.last_shift_date).unix() - dayjs(a.last_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });

    filteredGroups.value.lastYear = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
          if( emp.points == 0) return false;
          if (emp.next_shift_date) return false;
            if (!emp.last_shift_date) return false;
            const empDate = dayjs(emp.last_shift_date);
            return now.diff(empDate, 'day') > 180 && now.diff(empDate, 'day') <= 365;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.last_shift_date).unix() - dayjs(a.last_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });

    filteredGroups.value.beyondYear = employees.value
        .filter(emp => {
            if( !isAdmin.value ){
              if( emp.hidden) return false;
            }
          if( emp.points == 0) return false;
          if (emp.next_shift_date) return false;
            if (!emp.last_shift_date) return false;
            const empDate = dayjs(emp.last_shift_date);
            return now.diff(empDate, 'day') > 365;
        })
        .sort((a, b) => {
            const dateDiff = dayjs(b.last_shift_date).unix() - dayjs(a.last_shift_date).unix(); // Primary sort by date
            if (dateDiff !== 0) {
                return dateDiff; // Sort by most recent shift date first
            }
            // Secondary sort by lastname, and if those are equal, then by firstname
            const lastNameDiff = a.lastname.localeCompare(b.lastname);
            if (lastNameDiff !== 0) {
                return lastNameDiff;
            }
            return a.firstname.localeCompare(b.firstname); // Tertiary sort by firstname if lastnames are identical
        });
};


const showInfo = ref(true);
const toggleShowInfo = async () => {
  showInfo.value = !showInfo.value;
};


onMounted(() => {
  getEmployees();
});


const disableEmployee = async (employee: Employee) => {
  try {
    await axios.post(`../api/employees/disable/${employee.remoteId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employee.active = false;
  } catch (error) {
    console.error(error);
  }
};
const enableEmployee = async (employee: Employee) => {
  try {
    await axios.post(`../api/employees/enable/${employee.remoteId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employee.active = true;
  } catch (error) {
    console.error(error);
  }
};



const auszeitEmployee = async (employee: Employee) => {
  try {
    await axios.post(`../api/employees/auszeitTrue/${employee.remoteId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employee.auszeit = true;
  } catch (error) {
    console.error(error);
  }
};
const productiveEmployee = async (employee: Employee) => {
  try {
    await axios.post(`../api/employees/auszeitFalse/${employee.remoteId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
  employee.auszeit = false;
  } catch (error) {
    console.error(error);
  }
};

const hideEmployee = async (employee: Employee) => {
  try {
    await axios.post(`../api/employees/hide/${employee.remoteId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employee.hidden = true;
  } catch (error) {
    console.error(error);
  }
};
const unhideEmployee = async (employee: Employee) => {
  try {
    await axios.post(`../api/employees/unhide/${employee.remoteId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt.value}`
      }
    });
    employee.hidden = false;
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
            Sonstige Tools &bull; Übersicht
            <div v-if="showInfo" @click="toggleShowInfo()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-down"></i>
            </div>
            <div v-if="!showInfo" @click="toggleShowInfo()" class="cursor-pointer pr-2">
                <i class="fas fa-chevron-up"></i>
            </div>
          </div>

          <div class="flex w-full my-3 justify-center items-center" v-if="showInfo">
              <div class="bg-blue-100 border border-slate-500 px-4 py-2 rounded relative" role="alert">
                <span class="block sm:inline">Nachfolgend findest du eine Liste wann ein Mitarbeiter seinen letzten Dienst gemacht hat.</span>
              </div>
          </div>
        </div>
      </div>
    </div>


    <div v-for="(group, key) in filteredGroups" :key="key" class="flex flex-col justify-center items-center mb-6">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-2">
        <div class="px-6 py-4">
          <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
            <div class="font-bold text-base md:text-xl">
              {{ groupDescriptions[key] }}
            </div>
            <div v-if="!toggleStates[key]" @click="toggleStates[key] = !toggleStates[key]" class="cursor-pointer pr-2">
              <i class="fas fa-chevron-down"></i>
            </div>
            <div v-if="toggleStates[key]" @click="toggleStates[key] = !toggleStates[key]" class="cursor-pointer pr-2">
              <i class="fas fa-chevron-up"></i>
            </div>
          </div>
          <div v-if="toggleStates[key]" class="mx-auto bg-white overflow-hidden py-4">
            <table class="table-auto w-full text-xs sm:text-sm">
              <thead>
                <tr>
                  <th class="px-2 py-1 text-left">ID</th>
                  <th class="px-2 py-1 text-left">Name</th>
                  <th class="px-2 py-1 text-left">Telefon</th>
                  <th class="px-2 py-1 text-left" colspan="2">{{ key === 'future' ? 'Nächster Dienst' : 'Letzter Dienst' }}</th>
                  <th class="px-2 py-1 text-center" colspan="3" v-if="isAdmin">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(employee, index) in group" :key="employee.remoteId"
                :class="{
                    'bg-gray-200': index % 2 === 0,
                    'hover:bg-blue-300': true
                }">
                  <td class="border px-2 py-1" :class="{'text-gray-400': !employee.hidden && (!employee.active || employee.auszeit || (employee.haupt && employee.haupt != 'HAUPT'))}">
                    <router-link 
                          :to="'/dienste-' + employee.remoteId"
                          class="text-blue-500 underline hover:text-blue-700 cursor-pointer"  :class="{'text-gray-400': !employee.hidden && (!employee.active || employee.auszeit || (employee.haupt && employee.haupt != 'HAUPT'))}">
                          {{ employee.remoteId }}
                        </router-link>
                  </td>
                  <td class="border px-2 py-1">
                    <span class="text-red-600" v-if="!employee.active">(ABGEMELDET) </span>
                    <span class="text-blue-600" v-if="employee.auszeit">(AUSZEIT) </span>
                    <span class="text-red-400" v-if="employee.haupt && employee.haupt != 'HAUPT'">(GAST) </span>
                    <span v-if="employee.hidden" class="line-through text-gray-400">
                      {{ employee.firstname }} <strong>{{ employee.lastname }}</strong>
                    </span>
                    <span v-if="!employee.hidden" :class="{'text-gray-400': !employee.hidden && (!employee.active || employee.auszeit || (employee.haupt && employee.haupt != 'HAUPT'))}">
                      {{ employee.firstname }} <strong>{{ employee.lastname }}</strong>
                    </span>
                  </td>
                  <td class="border px-2 py-1">
                    <a :href="`tel:${employee.phoneInternational}`"
                       class="text-blue-500 underline hover:text-blue-700 cursor-pointer" :class="{'text-gray-400': !employee.hidden && (!employee.active || employee.auszeit || (employee.haupt && employee.haupt != 'HAUPT'))}">
                      {{ employee.phone }}
                    </a>
                  </td>
                  <td class="border px-2 py-1" :class="{'text-gray-400': !employee.hidden && (!employee.active || employee.auszeit || (employee.haupt && employee.haupt != 'HAUPT'))}">{{ employee.shift_formatted }}</td>
                  <td class="border px-2 py-1" :class="{'text-gray-400': !employee.hidden && (!employee.active || employee.auszeit || (employee.haupt && employee.haupt != 'HAUPT'))}">{{ employee.shift_relative }}</td>
                  <td class="px-2 py-1 text-center" v-if="isAdmin">
                    <div v-if="!employee.hidden">
                      <button @click="hideEmployee(employee)" class="text-xs bg-gray-300 hover:bg-gray-500 text-white px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-eye-slash"></i></button>
                    </div>
                    <div v-if="employee.hidden">
                      <button @click="unhideEmployee(employee)" class="text-xs bg-slate-400 hover:bg-slate-600 text-black px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-eye"></i></button>
                    </div>
                  </td>
                  <td class="px-2 py-1 text-center" v-if="isAdmin">
                    <div v-if="!employee.auszeit">
                      <button @click="auszeitEmployee(employee)" class="text-xs bg-blue-400 hover:bg-blue-600 text-white px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-umbrella-beach"></i></button>
                    </div>
                    <div v-if="employee.auszeit">
                      <button @click="productiveEmployee(employee)" class="text-xs bg-cyan-400 hover:bg-cyan-600 text-black px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-briefcase"></i></button>
                    </div>
                  </td>
                  <td class="px-2 py-1 text-center border-r border-r-gray-600" v-if="isAdmin">
                    <div v-if="employee.active">
                      <button @click="disableEmployee(employee)" class="text-xs bg-red-400 hover:bg-red-600 text-white px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-thumbs-down"></i></button>
                    </div>
                    <div v-if="!employee.active">
                      <button @click="enableEmployee(employee)" class="text-xs bg-green-400 hover:bg-green-600 text-black px-2 py-1 rounded cursor-pointer"><i class="fa-solid fa-thumbs-up"></i></button>
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
