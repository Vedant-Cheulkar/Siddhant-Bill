export function ok<T>(data: T, message?: string) {
  return {
    data,
    ...(message ? { message } : {}),
    timestamp: new Date().toISOString(),
  };
}

export function fail(message: string, status = 400) {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}
