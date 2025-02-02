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
}

const store = useStore();

const jwt = computed(() => store.state.jwt);
const loading = ref(true);

const currentYear = new Date().getFullYear();
const year = ref(currentYear);
const lowestYear = ref(2023);
const highestYear = ref(currentYear);
const shifts = ref<Shift[]>([]);

const groups = ref({
  'sum' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'ha' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'ea' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'fsj' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'zd' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'unknown' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
});
const groupsHollabrunn = ref({
  'sum' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'ha' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'ea' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'fsj' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'zd' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'unknown' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
});
const groupsHaugsdorf = ref({
  'sum' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'ha' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'ea' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'fsj' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'zd' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
  'unknown' : {
    'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
    'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
  }, 
});


const showCategorySelector = ref('counters');
const showCategoryLocation = ref('combined');

const getShifts = async () => {
  shifts.value = [];
  try {
    const response = await axios.get('../api/shiftStatistics?year=' + year.value, {
      headers: {
        Accepts: "application:json",
        Authorization: `Bearer ${jwt.value}`
      }
    });
    shifts.value = response.data.data;
    groups.value = {
      'sum' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'ha' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'ea' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'fsj' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'zd' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      },  
      'unknown' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
    };
    groupsHollabrunn.value = {
      'sum' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'ha' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'ea' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'fsj' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'zd' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      },  
      'unknown' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
    };
    groupsHaugsdorf.value = {
      'sum' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'ha' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'ea' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'fsj' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
      'zd' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      },  
      'unknown' : {
        'categoryCount' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryMinutes' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
        'categoryPoints' : {'nef' : 0, 'rtw' : 0, 'ktw' : 0, 'bktw' : 0, 'df' : 0, 'misc' : 0},
      }, 
    };

    for (let i = 0; i < shifts.value.length; i++) {
      const currentItem = shifts.value[i];
      if (["FBB","FBKTW"].includes(currentItem.demandType)) {
        fillInPoints('bktw',currentItem);
      }else if (["FNB_NEF", "NEFAZUBI", "ANA", "PNEF", "PLNEF", "FNEF", "NFS", "PNAW", "FNAW", "FSNAW", "LSRTW"].includes(currentItem.demandType)) {
        fillInPoints('nef',currentItem);
      }else if (["FRB", "FRC", "SR1", "SR2", "FRTW", "FRTWC", "LRTWC", "PRS", "PNFS"].includes(currentItem.demandType)) {
        fillInPoints('rtw',currentItem);
      }else if (["FKB", "FKB-B", "FKC", "SK1", "SK2", "FKTW", "PKTW", "FKTWB", "BKTWB"].includes(currentItem.demandType)) {
        fillInPoints('ktw',currentItem);
      }else if (["DF1", "DF2", "DF", "RUFDF"].includes(currentItem.demandType)) {
        fillInPoints('df',currentItem);
      }else{
        fillInPoints('misc',currentItem);
      }
    }

    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
};

onMounted(() => {
  getShifts();
});
async function changeYear(direction) {
  if ((direction === -1 && year.value > lowestYear.value) || (direction === 1 && year.value < highestYear.value)) {
    year.value += direction;
    loading.value = true;
    await getShifts();
  }
}

const fillInPoints = (type,currentItem) => {
  const startTime = new Date(currentItem.start).getTime();
  const endTime = new Date(currentItem.end).getTime();

  groups.value['sum']['categoryCount'][type]++;
    groups.value['sum']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
    groups.value['sum']['categoryPoints'][type] += parseInt(currentItem.points,10);
  if(currentItem.location == 38 || currentItem.location == 3316){
      //Hollabrunn
      groupsHollabrunn.value['sum']['categoryCount'][type]++;
      groupsHollabrunn.value['sum']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHollabrunn.value['sum']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }else if(currentItem.location == 39 || currentItem.location == 82){
      //Haugsdorf
      groupsHaugsdorf.value['sum']['categoryCount'][type]++;
      groupsHaugsdorf.value['sum']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHaugsdorf.value['sum']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }


  if (currentItem.shiftType.startsWith("HA") || currentItem.shiftType.startsWith("HB") || currentItem.shiftType.startsWith("DV")) {
    // Hauptamtlich
    groups.value['ha']['categoryCount'][type]++;
    groups.value['ha']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
    groups.value['ha']['categoryPoints'][type] += parseInt(currentItem.points,10);
    if(currentItem.location == 38 || currentItem.location == 3316){
      //Hollabrunn
      groupsHollabrunn.value['ha']['categoryCount'][type]++;
      groupsHollabrunn.value['ha']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHollabrunn.value['ha']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }else if(currentItem.location == 39 || currentItem.location == 82){
      //Haugsdorf
      groupsHaugsdorf.value['ha']['categoryCount'][type]++;
      groupsHaugsdorf.value['ha']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHaugsdorf.value['ha']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }
  }else if (currentItem.shiftType.startsWith("EA")) {
    // Ehrenamtlich
    groups.value['ea']['categoryCount'][type]++;
    groups.value['ea']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
    groups.value['ea']['categoryPoints'][type] += parseInt(currentItem.points,10);
    if(currentItem.location == 38 || currentItem.location == 3316){
      //Hollabrunn
      groupsHollabrunn.value['ea']['categoryCount'][type]++;
      groupsHollabrunn.value['ea']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHollabrunn.value['ea']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }else if(currentItem.location == 39 || currentItem.location == 82){
      //Haugsdorf
      groupsHaugsdorf.value['ea']['categoryCount'][type]++;
      groupsHaugsdorf.value['ea']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHaugsdorf.value['ea']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }
  }else if (currentItem.shiftType.startsWith("FSJ")) {
    // FSJ
    groups.value['fsj']['categoryCount'][type]++;
    groups.value['fsj']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
    groups.value['fsj']['categoryPoints'][type] += parseInt(currentItem.points,10);
    if(currentItem.location == 38 || currentItem.location == 3316){
      //Hollabrunn
      groupsHollabrunn.value['fsj']['categoryCount'][type]++;
      groupsHollabrunn.value['fsj']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHollabrunn.value['fsj']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }else if(currentItem.location == 39 || currentItem.location == 82){
      //Haugsdorf
      groupsHaugsdorf.value['fsj']['categoryCount'][type]++;
      groupsHaugsdorf.value['fsj']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHaugsdorf.value['fsj']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }
  }else if (currentItem.shiftType.startsWith("ZD")) {
    // Zivildiener
    groups.value['zd']['categoryCount'][type]++;
    groups.value['zd']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
    groups.value['zd']['categoryPoints'][type] += parseInt(currentItem.points,10);
    if(currentItem.location == 38 || currentItem.location == 3316){
      //Hollabrunn
      groupsHollabrunn.value['zd']['categoryCount'][type]++;
      groupsHollabrunn.value['zd']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHollabrunn.value['zd']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }else if(currentItem.location == 39 || currentItem.location == 82){
      //Haugsdorf
      groupsHaugsdorf.value['zd']['categoryCount'][type]++;
      groupsHaugsdorf.value['zd']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHaugsdorf.value['zd']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }
  }else{
    groups.value['unknown']['categoryCount'][type]++;
    groups.value['unknown']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
    groups.value['unknown']['categoryPoints'][type] += parseInt(currentItem.points,10);
    if(currentItem.location == 38 || currentItem.location == 3316){
      //Hollabrunn
      groupsHollabrunn.value['unknown']['categoryCount'][type]++;
      groupsHollabrunn.value['unknown']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHollabrunn.value['unknown']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }else if(currentItem.location == 39 || currentItem.location == 82){
      //Haugsdorf
      groupsHaugsdorf.value['unknown']['categoryCount'][type]++;
      groupsHaugsdorf.value['unknown']['categoryMinutes'][type] += (endTime - startTime) / (1000 * 60);
      groupsHaugsdorf.value['unknown']['categoryPoints'][type] += parseInt(currentItem.points,10);
    }
  }
};

const convertMinutesToHours = (minutes) => {
  const hours = Math.floor(minutes / 60);
  return hours.toLocaleString();
};

</script>

<template>
  <div class="bg-gray-200 pt-4">
    
    
    <div class="flex justify-center mb-10">
      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2">
        <div class="px-6 py-4">
          <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
            <div class="font-bold text-base md:text-xl">Statistik</div>
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







          <div class="grid grid-cols-3 md:grid-cols-6 gap-4 p-2 place-items-center text-sm sm:text-base" v-if="!loading">
            <!-- NEF -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-stethoscope fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">NEF</div>
              <hr class="w-full"/>
            </div>

            <!-- RTW -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-truck-medical fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">RTW</div>
              <hr class="w-full"/>
            </div>

            <!-- KTW -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-stretcher fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">KTW</div>
              <hr class="w-full"/>
            </div>

            <!-- BKTW -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-car-mirrors fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">BKTW</div>
              <hr class="w-full"/>
            </div>

            <!-- Dienstführer -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-phone fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">Dienstführer</div>
              <hr class="w-full"/>
            </div>

            <!-- Sonstiges -->
            <div class="flex flex-col items-center p-2 w-32">
              <i class="fa-sharp fa-solid fa-ellipsis-h fa-2x text-gray-400"></i>
              <div class="text-center font-semibold py-2 text-gray-500">Sonstiges</div>
              <hr class="w-full"/>
            </div>
          </div>


          <div class="text-sm sm:text-base">


            <div class="flex justify-center items-center flex-col" v-if="!loading">
              <p class="text-base sm:text-lg font-semibold mt-3 text-slate-600">Gesamtsumme</p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 pt-1 mb-3 border-b border-b-gray-200 place-items-center" v-if="!loading">
              <!-- NEF -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.sum.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.sum.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.sum.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.sum.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.sum.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryPoints.nef.toLocaleString() }}</span>
                </div>
              </div>

              <!-- RTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.sum.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.sum.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.sum.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.sum.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.sum.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryPoints.rtw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- KTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.sum.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.sum.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.sum.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.sum.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.sum.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryPoints.ktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- BKTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.sum.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.sum.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.sum.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.sum.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.sum.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryPoints.bktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Dienstführer -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.sum.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.sum.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.sum.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.sum.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.sum.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryPoints.df.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Sonstiges -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.sum.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.sum.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.sum.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.sum.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.sum.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.sum.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.sum.categoryPoints.misc.toLocaleString() }}</span>
                </div>
              </div>
            </div>




            <div class="flex justify-center items-center flex-col" v-if="!loading">
              <p class="text-base sm:text-lg font-semibold mt-3 text-slate-600">Hauptberuflich</p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 pt-1 mb-3 border-b border-b-gray-200 place-items-center" v-if="!loading">
              <!-- NEF -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ha.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ha.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ha.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ha.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ha.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryPoints.nef.toLocaleString() }}</span>
                </div>
              </div>

              <!-- RTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ha.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ha.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ha.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ha.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ha.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryPoints.rtw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- KTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ha.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ha.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ha.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ha.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ha.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryPoints.ktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- BKTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ha.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ha.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ha.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ha.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ha.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryPoints.bktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Dienstführer -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ha.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ha.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ha.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ha.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ha.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryPoints.df.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Sonstiges -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ha.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ha.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ha.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ha.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ha.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ha.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ha.categoryPoints.misc.toLocaleString() }}</span>
                </div>
              </div>
            </div>








            <div class="flex justify-center items-center flex-col" v-if="!loading">
              <p class="text-base sm:text-lg font-semibold mt-3 text-slate-600">Zivildienst</p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 pt-1 mb-3 border-b border-b-gray-200 place-items-center" v-if="!loading">
              <!-- NEF -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.zd.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.zd.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.zd.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.zd.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.zd.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryPoints.nef.toLocaleString() }}</span>
                </div>
              </div>

              <!-- RTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.zd.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.zd.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.zd.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.zd.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.zd.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryPoints.rtw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- KTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.zd.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.zd.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.zd.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.zd.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.zd.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryPoints.ktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- BKTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.zd.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.zd.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.zd.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.zd.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.zd.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryPoints.bktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Dienstführer -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.zd.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.zd.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.zd.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.zd.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.zd.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryPoints.df.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Sonstiges -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.zd.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.zd.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.zd.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.zd.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.zd.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.zd.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.zd.categoryPoints.misc.toLocaleString() }}</span>
                </div>
              </div>
            </div>






            <div class="flex justify-center items-center flex-col" v-if="!loading">
              <p class="text-base sm:text-lg font-semibold mt-3 text-slate-600">Ehrenamtlich</p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 pt-1 mb-3 border-b border-b-gray-200 place-items-center" v-if="!loading">
              <!-- NEF -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ea.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ea.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ea.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ea.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ea.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryPoints.nef.toLocaleString() }}</span>
                </div>
              </div>

              <!-- RTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ea.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ea.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ea.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ea.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ea.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryPoints.rtw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- KTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ea.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ea.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ea.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ea.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ea.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryPoints.ktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- BKTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ea.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ea.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ea.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ea.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ea.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryPoints.bktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Dienstführer -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ea.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ea.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ea.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ea.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ea.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryPoints.df.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Sonstiges -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.ea.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.ea.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.ea.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.ea.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.ea.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.ea.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.ea.categoryPoints.misc.toLocaleString() }}</span>
                </div>
              </div>
            </div>
















            <div class="flex justify-center items-center flex-col" v-if="!loading">
              <p class="text-base sm:text-lg font-semibold mt-3 text-slate-600">Freiwilliges soziales Jahr</p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 pt-1 mb-3 border-b border-b-gray-200 place-items-center" v-if="!loading">
              <!-- NEF -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.fsj.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.fsj.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.fsj.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.fsj.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.fsj.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryPoints.nef.toLocaleString() }}</span>
                </div>
              </div>

              <!-- RTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.fsj.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.fsj.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.fsj.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.fsj.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.fsj.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryPoints.rtw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- KTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.fsj.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.fsj.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.fsj.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.fsj.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.fsj.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryPoints.ktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- BKTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.fsj.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.fsj.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.fsj.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.fsj.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.fsj.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryPoints.bktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Dienstführer -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.fsj.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.fsj.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.fsj.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.fsj.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.fsj.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryPoints.df.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Sonstiges -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.fsj.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.fsj.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.fsj.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.fsj.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.fsj.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.fsj.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.fsj.categoryPoints.misc.toLocaleString() }}</span>
                </div>
              </div>
            </div>







            <div class="flex justify-center items-center flex-col" v-if="!loading">
              <p class="text-base sm:text-lg font-semibold mt-3 text-slate-600 place-items-center">Keine Zuordnung</p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 pt-1 mb-3" v-if="!loading">
              <!-- NEF -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.unknown.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.unknown.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.unknown.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.unknown.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryPoints.nef.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryCount.nef.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.unknown.categoryMinutes.nef) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryPoints.nef.toLocaleString() }}</span>
                </div>
              </div>

              <!-- RTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.unknown.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.unknown.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.unknown.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.unknown.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryPoints.rtw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryCount.rtw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.unknown.categoryMinutes.rtw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryPoints.rtw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- KTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.unknown.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.unknown.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.unknown.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.unknown.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryPoints.ktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryCount.ktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.unknown.categoryMinutes.ktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryPoints.ktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- BKTW -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.unknown.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.unknown.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.unknown.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.unknown.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryPoints.bktw.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryCount.bktw.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.unknown.categoryMinutes.bktw) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryPoints.bktw.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Dienstführer -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.unknown.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.unknown.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.unknown.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.unknown.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryPoints.df.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryCount.df.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.unknown.categoryMinutes.df) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryPoints.df.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Sonstiges -->
              <div class="flex flex-col items-center p-2 w-32">
                <div class="text-center font-semibold py-1 text-gray-500">
                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='combined'">{{ groups.unknown.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='combined'">{{ convertMinutesToHours(groups.unknown.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='combined'">{{ groups.unknown.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='hollabrunn'">{{ convertMinutesToHours(groupsHollabrunn.unknown.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='hollabrunn'">{{ groupsHollabrunn.unknown.categoryPoints.misc.toLocaleString() }}</span>

                  <span v-if="showCategorySelector=='counters' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryCount.misc.toLocaleString() }}</span>
                  <span v-if="showCategorySelector=='minutes' && showCategoryLocation =='haugsdorf'">{{ convertMinutesToHours(groupsHaugsdorf.unknown.categoryMinutes.misc) }}</span>
                  <span v-if="showCategorySelector=='points' && showCategoryLocation =='haugsdorf'">{{ groupsHaugsdorf.unknown.categoryPoints.misc.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>








        </div>
      </div>
    </div>
    

  </div>
</template>




<style>

</style>
