/**
 * Safely extract a human-readable message from unknown errors.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
  }

  // Handle backend error shape: { errors: [{ message: string }] }
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as { errors: unknown }).errors)
  ) {
    const firstError = (error as { errors: unknown[] }).errors[0];
    if (
      firstError &&
      typeof firstError === 'object' &&
      'message' in firstError
    ) {
      const maybeMessage = (firstError as { message?: unknown }).message;
      if (typeof maybeMessage === 'string') return maybeMessage;
    }
  }

  return 'Unknown error occurred';
}
