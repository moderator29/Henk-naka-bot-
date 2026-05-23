/**
 * Age verification — RPD §9.1. The platform is strictly 18+.
 *
 * DOB is captured at signup, stored on the user record, and checked on every
 * sensitive action via requireAdult() in the server layer.
 */

export const MIN_AGE = 18;

/** Whole years between dob and `now` (defaults to today). */
export function calculateAge(dob: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function isAdult(dob: Date, now: Date = new Date()): boolean {
  return calculateAge(dob, now) >= MIN_AGE;
}

/**
 * Parses a YYYY-MM-DD string (HTML date input value) into a Date in UTC,
 * returning null for invalid input. Avoids timezone drift around midnight.
 */
export function parseDateOfBirth(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Guard against rollover (e.g. 2024-02-31 → Mar 2).
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** The latest DOB that still qualifies as 18+, for an input `max` attribute. */
export function maxDateOfBirthInput(now: Date = new Date()): string {
  const d = new Date(
    Date.UTC(now.getUTCFullYear() - MIN_AGE, now.getUTCMonth(), now.getUTCDate())
  );
  return d.toISOString().slice(0, 10);
}
