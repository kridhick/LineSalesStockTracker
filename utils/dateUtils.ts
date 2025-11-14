// utils/dateUtils.ts

/**
 * Formats a Date object into a YYYY-MM-DD string.
 * @param date The date object to format.
 * @returns A string in YYYY-MM-DD format.
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string into a Date object, setting the time to midnight UTC to avoid timezone issues.
 * @param dateString The date string in YYYY-MM-DD format.
 * @returns A Date object representing the date at midnight UTC.
 */
export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Using UTC to avoid timezone shifts when comparing dates.
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Returns a new Date object representing the previous day.
 * @param date The starting date.
 * @returns A new Date object for the previous day.
 */
export const getPreviousDay = (date: Date): Date => {
  const previousDay = new Date(date);
  previousDay.setUTCDate(date.getUTCDate() - 1);
  return previousDay;
};

/**
 * Checks if two dates (YYYY-MM-DD strings) are the same.
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};
