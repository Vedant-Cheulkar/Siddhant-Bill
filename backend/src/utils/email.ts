const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return null;
  if (trimmed.length > 254) return 'Email is too long';
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address';
  return null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
