const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const attempts = new Map<string, { count: number; windowStart: number }>();

function normalizeKey(email: string): string {
  return email.trim().toLowerCase();
}

export function checkLoginRateLimit(email: string): string | null {
  const key = normalizeKey(email);
  const entry = attempts.get(key);
  if (!entry) return null;

  if (Date.now() - entry.windowStart > WINDOW_MS) {
    attempts.delete(key);
    return null;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return 'Too many login attempts. Please try again in 15 minutes.';
  }

  return null;
}

export function recordFailedLogin(email: string): void {
  const key = normalizeKey(email);
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return;
  }

  entry.count += 1;
  attempts.set(key, entry);
}

export function clearLoginAttempts(email: string): void {
  attempts.delete(normalizeKey(email));
}
