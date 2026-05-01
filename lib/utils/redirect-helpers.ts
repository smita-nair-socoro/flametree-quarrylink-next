/**
 * Utility function for handling redirect URLs safely
 */

/**
 * Safely validates and returns a redirect URL from various sources
 * @param searchParams - URLSearchParams, string, or undefined (will use window.location.search)
 * @param defaultUrl - Default URL to return if no valid redirect is found (default: '/' so role-based routing can send drivers to /drivers-app before any staff-only page renders)
 * @returns A safe redirect URL
 */
export function getSafeRedirectUrl(
  searchParams?: URLSearchParams | string,
  defaultUrl: string = '/'
): string {
  let urlParams: URLSearchParams;

  // Handle different input types
  if (!searchParams) {
    // No params provided, use window location if available
    if (typeof window === 'undefined') {
      return defaultUrl;
    }
    urlParams = new URLSearchParams(window.location.search);
  } else if (typeof searchParams === 'string') {
    urlParams = new URLSearchParams(searchParams);
  } else {
    urlParams = searchParams;
  }

  const redirectParam = urlParams.get('redirect') || urlParams.get('returnTo');

  if (redirectParam) {
    try {
      // Decode the parameter first to catch malformed URLs
      const decodedParam = decodeURIComponent(redirectParam);

      // Security: Only allow relative paths
      if (
        decodedParam.startsWith('/') &&
        !decodedParam.startsWith('//') && // Prevents //evil.com
        !decodedParam.includes('\\') // Prevents backslash tricks
      ) {
        // Validate it's a proper URL
        const url = new URL(decodedParam, window.location.origin);
        if (url.origin === window.location.origin) {
          return decodedParam;
        }
      }
    } catch (error) {
      console.error('Invalid redirect URL:', redirectParam, error);
    }
  }

  return defaultUrl;
}
