export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "HH:MM" 24h time format */
export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function timeToMinutes(t: string): number {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

export function normaliseEmail(email: string): string{
  return email.trim().toLowerCase();
}

export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}