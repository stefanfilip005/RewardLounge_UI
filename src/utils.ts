const currentYear = new Date().getFullYear();

export const year = currentYear;
export const lowestYear = 2023;
export const highestYear = currentYear;

export const monthNames: string[] = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export const convertMinutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  return hours.toLocaleString();
};

export const formatPoints = (points: string | number): string => {
  const numericPoints = parseFloat(typeof points === "string" ? points : points.toString());
  return Number.isInteger(numericPoints) ? numericPoints.toString() : points.toString();
};

export const formatDate = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleDateString();
};

export const formatTime = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const getLocationName = (locationId) => {
  switch (locationId) {
    case 39:
    case 82:
      return "Haugsdorf";
    case 38:
    case 3316:
      return "Hollabrunn";
    default:
      return locationId;
  }
};

export const calculateDuration = (start: string, end: string) => {
  const startTime = new Date(start).getTime(); // Convert to timestamp
  const endTime = new Date(end).getTime(); // Convert to timestamp
  let diff = endTime - startTime; // This will give difference in milliseconds
  const hours = Math.floor(diff / 3600000); // Convert milliseconds to hours
  diff = diff % 3600000;
  const minutes = Math.floor(diff / 60000); // Convert remaining milliseconds to minutes

  return { hours, minutes };
};
