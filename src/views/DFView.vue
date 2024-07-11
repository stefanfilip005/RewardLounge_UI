<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import dayjs from 'dayjs'; // for handling date calculations
import 'dayjs/locale/de'; // import the German locale
import relativeTime from 'dayjs/plugin/relativeTime';

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

}

const store = useStore();
const jwt = computed(() => store.state.jwt);

const employees = ref<Employee[]>([]);
  const filteredGroups = ref<{
  future: Employee[],
  lastMonth: Employee[],
  last2Months: Employee[],
  last6Months: Employee[],
  lastYear: Employee[],
  beyondYear: Employee[]
}>({
  future: [],
  lastMonth: [],
  last2Months: [],
  last6Months: [],
  lastYear: [],
  beyondYear: []
});
const toggleStates = ref({
  future: false,
  lastMonth: false,
      last2Months: true,
      last6Months: true,
      lastYear: true,
      beyondYear: false
});
const groupDescriptions = {
  future: 'Haben einen zukünftigen Dienst eingetragen',
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
    const filteredEmployees = response.data.data.filter((emp: Employee) => emp.employeeType === "EA-RKT" && emp.firstname && emp.lastname);

    // Mapping the filtered list
    employees.value = filteredEmployees.map((emp: Employee) => ({
      ...emp,
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
            if (!emp.next_shift_date) return false;
            return true;
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

    filteredGroups.value.lastMonth = employees.value
        .filter(emp => {
            if (emp.next_shift_date) return false;
            if (!emp.last_shift_date) return false;
            const empDate = dayjs(emp.last_shift_date);
            return now.diff(empDate, 'day') <= 30;
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
                  <th class="px-2 py-1 text-left" colspan="2">{{ key === 'future' ? 'Nächster Dienst' : 'Letzter Dienst' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(employee, index) in group" :key="employee.remoteId"
                :class="{
                    'bg-gray-200': index % 2 === 0,
                    'hover:bg-blue-300': true
                }">
                  <td class="border px-2 py-1">{{ employee.remoteId }}</td>
                  <td class="border px-2 py-1">{{ employee.firstname }} <strong>{{ employee.lastname }}</strong></td>
                  <td class="border px-2 py-1">{{ employee.shift_formatted }}</td>
                  <td class="border px-2 py-1 text-gray-500">{{ employee.shift_relative }}</td>
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
