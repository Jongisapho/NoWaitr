import crypto from "crypto"

export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


export function buildSlugCandidates(initialSlug: string, max = 50): string[] {
  const candidates: string[] = [];
  const match = initialSlug.match(/-(\d{2})$/);

  if (match) {
    // initialSlug already has a 2-digit suffix
    const current = Number(match[1]);               // e.g. 1 for -01
    const base = initialSlug.replace(/-(\d{2})$/, ''); // "pta-branch"
    candidates.push(initialSlug);                   // try "pta-branch-01" first
    for (let n = current + 1; n <= Math.max(current + max, current + 1); n++) {
      candidates.push(`${base}-${String(n).padStart(2, '0')}`);
    }
  } else {
    // no suffix -> start with initial, then -    // no suffix -> start with initial, then -01..-50
    candidates.push(initialSlug);
    for (let n = 1; n <= max; n++) {
      candidates.push(`${initialSlug}-${String(n).padStart(2, '0')}`);
    }
  }

  return candidates;
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

export function generateToken(bytes: number = 48): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}