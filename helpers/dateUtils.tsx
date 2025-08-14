import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

/**
 * Converts a Date object to midnight UTC on the same calendar day.
 * This is useful for storing dates from a date picker without timezone shifts.
 * It takes the year, month, and day from the local date and creates a new Date object at UTC midnight.
 * @param d The input Date object, assumed to be from a user's local timezone.
 * @returns A new Date object representing 00:00:00 UTC on the same calendar day.
 */
export function toUtcStartOfDay(d: Date): Date {
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    // Handle invalid date input gracefully.
    // Depending on requirements, could throw an error or return a default.
    // For now, returning a new Date to avoid downstream errors, though it will be 'Invalid Date'.
    console.error("toUtcStartOfDay received an invalid date:", d);
    return new Date(NaN);
  }
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/**
 * Parses a UTC date string (or a Date object) into a Date object at UTC midnight.
 * This function is the counterpart to `toUtcStartOfDay` and is useful for
 * converting dates retrieved from the database back into Date objects for UI components.
 * It ensures that the time part is ignored and the date is treated as UTC.
 * @param iso A date string in ISO 8601 format (e.g., "2023-10-27T00:00:00.000Z"), a Date object, or null.
 * @returns A new Date object representing 00:00:00 UTC, or null if the input is null or invalid.
 */
export function parseUtcDateString(iso: string | Date | null): Date | null {
  if (!iso) {
    return null;
  }

  try {
    const date = typeof iso === 'string' ? parseISO(iso) : iso;
    
    if (isNaN(date.getTime())) {
      console.error("parseUtcDateString received an invalid date string:", iso);
      return null;
    }

    // Create a new Date object at UTC midnight to strip any time information
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to parse date string "${iso}":`, error.message);
    } else {
      console.error(`An unknown error occurred while parsing date string "${iso}"`);
    }
    return null;
  }
}

/**
 * Formats a Date object for display in a user-friendly format (e.g., "October 27, 2023").
 * The date is treated as UTC to avoid timezone shifts during formatting.
 * @param d The Date object to format, or null.
 * @returns A formatted date string, or an empty string if the input is null or invalid.
 */
export function formatUtcDate(d: Date | null): string {
  if (!d || isNaN(d.getTime())) {
    return '';
  }

  // Use UTC getters to format the date, ensuring consistency across timezones.
  // The format string 'MMMM d, yyyy' produces output like "October 27, 2023".
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  
  const utcDate = new Date(Date.UTC(year, month, day));

  return format(utcDate, 'MMMM d, yyyy', {
    locale: enUS,
  });
}