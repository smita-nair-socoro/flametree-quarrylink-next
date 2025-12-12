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

  // Handle fetch/HTTP client errors: Error with response.data.errors
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data
  ) {
    const responseData = (error as { response?: { data?: unknown } }).response
      ?.data;

    if (
      responseData &&
      typeof responseData === 'object' &&
      'errors' in responseData &&
      Array.isArray((responseData as { errors: unknown }).errors)
    ) {
      const firstError = (responseData as { errors: unknown[] }).errors[0];
      if (
        firstError &&
        typeof firstError === 'object' &&
        'message' in firstError
      ) {
        const maybeMessage = (firstError as { message?: unknown }).message;
        if (typeof maybeMessage === 'string') return maybeMessage;
      }
    }

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof (responseData as { message?: unknown }).message === 'string'
    ) {
      return (responseData as { message: string }).message;
    }
  }

  return 'Unknown error occurred';
}
