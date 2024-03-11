import { ref } from "vue";

export function dataFetch(fetchFunction) {
  const data = ref([]);
  const isLoading = ref(false);
  const fetchError = ref(null);

  const fetchData = async () => {
    if (data.value.length > 0 || isLoading.value) {
      // Data already fetched or fetching in progress
      return;
    }
    isLoading.value = true;
    try {
      const fetchedData = await fetchFunction();
      data.value = fetchedData;
    } catch (err) {
      //fetchError.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  return { data, isLoading, fetchError, fetchData };
}
