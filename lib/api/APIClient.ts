import { baseUrl, getUser } from '../utils';
import { handleLogout } from '../auth/authManager';
import { ProductDetails } from '../types/product';
import { Category } from '../types/category';
import { Customer } from '../types/customer';
import { Quarry } from '../types/quarry';
import { QuotationDTO } from '../types/quotation';

type RequestBody = BodyInit | object | Record<string, unknown> | null;
type Primitive = string | number | boolean | symbol | undefined;

export interface HttpConfig {
  /**
   * One of "GET", "POST", "PUT", "PATCH", "DELETE", etc.
   * See https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
   */
  method?: string;
  /**
   * JSON body for this request. Once this is set to an object,
   * then `Content-Type` for this request is set to `application/json`
   * automatically.
   */
  body?: RequestBody;
  /**
   * Helper to work with a query string/search param of a URL.
   * E.g. ?a=1&b=2&c=3
   *
   * Using this interface will automatically convert
   * the object values into RFC-3986-compliant strings.
   *
   * Keys will *NOT* be sanitized, and any whitespace and
   * invalid characters will remain.
   *
   * The only supported value types are:
   * numbers, booleans, strings and flat 1-D arrays.
   *
   * Objects as values are not supported.
   *
   * The supported values are serialized as follows:
   *  - undefined values are ignored
   *  - empty strings are ignored
   *  - empty strings inside arrays are ignored
   *  - empty arrays are ignored
   *  - arrays append each time with the key and for each child
   *    e.g. `{ arr: [1, 2, 3] }` will yield `?arr=1&arr=2&arr=3`
   *  - array items with an undefined value (or which serialize to an empty string) are ignored,
   *    e.g. `{ arr: [1, undefined, undefined] }` will yield `?arr=1`
   *    (NaN, +Inf, -Inf, etc. will remain since they are valid serializations)
   */
  queryString?: Record<string, Primitive | Primitive[]>;

  /**
   * Optionally include a JWT access token. If provided, it will be set as
   * an Authorization header using the Bearer scheme.
   */
  access_token?: string;

  /**
   * Optionally include a JWT id token. If provided, it will be sent in the header.
   */
  id_token?: string;

  /**
   * If you pass this, we will use it instead of window.fetch
   */
  fetch?: typeof fetch;
}

/**
 * Encodes a string into a RFC-3986-compliant string.
 *
 * By default, encodeURIComponent will not encode
 * any of the following characters: !'()*
 *
 * So a simple regex replace is done which will replace
 * these characters with their hex-value representation.
 *
 * @param str Input string (dictionary value).
 * @returns A RFC-3986-compliant string variation of the input string.
 * @note See https://stackoverflow.com/a/62969380
 */
function encodeRFC3986URIComponent(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/**
 * Makes a request on the network and returns a promise.
 *
 * This function serves as both a request builder and a response interceptor.
 *
 * @param endpoint The endpoint path relative to the backend instance.
 * @param config A dictionary which specifies what information this network
 * request must relay during transport. See @ref HttpClient.
 * @returns A promise for the *sent* network request which must *  be await'ed or .then()-chained before it can be used.
 *
 * If the status code returned by the server is in the [200, 300) range, then this is considered a success.
 *    - This function resolves with an empty dictionary object, i.e. {}, if the status code is 204 No data
 *    - The parsed JSON body is returned by this method if the server returns `Content-Type: application/json`.
 *    - In all other scenarios, the raw Response object from window.fetch() is returned,
 *      which must be handled manually by awaiting on one of its methods.
 *
 * The following is done if the status code that the server returns is NOT successful,
 * that is, if it falls outside of the [200, 300] range:
 *  - A unique Error object is returned if the user is logged in and the status code is 403 Forbidden.
 *    This Error object *should* be consumed by the @tanstack/query code, which indirectly calls HttpClient.
 *    The current user is then prompted to log in again after being logged out.
 *  - The `ErrorPage` screen appears in all other scenarios.
 */
export async function HttpClient<T = unknown>(
  endpoint: string,
  config: HttpConfig = {}
): Promise<T> {
  const fetcher =
    config.fetch ??
    (typeof window !== 'undefined'
      ? window.fetch.bind(window)
      : fetch.bind(globalThis));

  const init: RequestInit = {
    method: config.method,
    headers: {
      Accept: '*/*',
      'x-requested-with': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    },
  };

  const authUser = await getUser(); // ✅ Properly awaited
  // const tenantId = await getTenantId(); // ✅ Properly awaited

  if (authUser?.access_token && authUser.id_token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${authUser.access_token}`,
      // 'access-token': authUser.access_token,
      // 'id-token': authUser.id_token,
      // 'tenant-id': tenantId || '',
    };
  } else {
    return Promise.reject(new Error('Token expired or invalid.'));
  }

  if (config.body) {
    init.body = JSON.stringify(config.body);

    if (typeof config.body === 'object') {
      init.headers = {
        ...init.headers,
        'Content-Type': 'application/json',
      };
    }

    // Log the request body for debugging
    console.log('🌐 API Request Body:', init.body);
  }

  if (config.queryString) {
    const params: string[] = [];

    for (const [key, value] of Object.entries(config.queryString)) {
      const serializedKey = encodeRFC3986URIComponent(key);

      if (typeof value === 'undefined') {
        // Skip case when the value is undefined.
        // The solution in this case is to use the request body instead with JSON
        continue;
      } else if (Array.isArray(value)) {
        // Append (don't set) each array member as a query parameter
        // e.g. ?a=1&a=2&a=3
        value.forEach((child) => {
          // Skip undefined member values
          const v = typeof child !== 'undefined' ? String(child) : '';
          if (v.length) {
            params.push(`${serializedKey}=${encodeRFC3986URIComponent(v)}`);
          }
        });
      } else {
        // This is a primitive value, just add as string
        // e.g. ?a=1
        const v = String(value);
        if (v.length) {
          params.push(`${serializedKey}=${encodeRFC3986URIComponent(v)}`);
        }
      }
    }

    if (params.length) {
      endpoint += `?${params.join('&')}`;
    }
  }

  const url = `${baseUrl()}${endpoint}`;

  console.log(`API Request: ${url}`);

  const response = await fetcher(url, init);

  // Enhanced logging for debugging
  if (response.status >= 400) {
    console.log(
      `API Request Failed: ${response.status} ${response.statusText}`
    );
    console.log(`URL: ${url}`);
    console.log(`Method: ${init.method || 'GET'}`);
    console.log(`Headers:`, init.headers);

    // Try to get the response body for debugging
    const responseClone = response.clone();
    try {
      const responseText = await responseClone.text();
      console.log(`Response Body:`, responseText);

      // Try to parse as JSON if it looks like JSON
      if (
        responseText.trim().startsWith('{') ||
        responseText.trim().startsWith('[')
      ) {
        try {
          const responseJson = JSON.parse(responseText);
          console.log(`Parsed Response JSON:`, responseJson);
        } catch (e) {
          console.log(`Could not parse response as JSON:`, e);
        }
      }
    } catch (e) {
      console.log(`Could not read response body:`, e);
    }

    // Log response headers
    console.log(`Response Headers:`);
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  const isJson = response.headers
    .get('Content-Type')
    ?.includes('application/json');

  if (response.status >= 200 && response.status < 300) {
    // We received a successful response
    if (response.status === 204) {
      // 204 contains no data, but indicates success
      return Promise.resolve<T>({} as T);
    }

    // If Content-Type is application/json, then parse response as JSON
    // otherwise, just resolve the Response object returned by window.fetch
    // and the consumer can call await response.text() if needed.
    if (isJson) {
      return Promise.resolve<T>((await response.json()) as T);
    } else {
      return Promise.resolve<T>(response as T);
    }
  } else {
    // This is not a successful response.
    // It is most likely an error.
    switch (response.status) {
      case 403: {
        await handleLogout();
        return Promise.reject(new Error('Cookie/Token expired or invalid.'));
      }
      case 500: {
        return Promise.reject(new Error(`Internal server error`));
      }
      case 503: {
        // Show an error toast to notify the user what occurred
        return Promise.reject(
          new Error(`[503] Service unavailable: "${endpoint}"`)
        );
      }
      default:
        break;
    }

    const isJson = response.headers
      .get('Content-Type')
      ?.includes('application/json');

    // Try to parse the JSON (but don’t blow up if it fails)
    let parsedJson: unknown = null;
    if (isJson) {
      try {
        parsedJson = await response.json();
      } catch {
        // ignore parse errors — we’ll fall back to statusText below
      }
    }

    // Safely pull out a `.message` if it exists
    let apiMessage: string | undefined;
    if (
      parsedJson !== null &&
      typeof parsedJson === 'object' &&
      'message' in parsedJson &&
      typeof (parsedJson as { message?: unknown }).message === 'string'
    ) {
      apiMessage = (parsedJson as { message: string }).message;
    }

    const errorMessage =
      apiMessage ||
      response.statusText ||
      `HTTP request failed with status ${response.status}`;

    return Promise.reject(new Error(errorMessage));
  }
}

const appClient = {
  Get: <T>(endpoint: string, config: HttpConfig = {}) =>
    HttpClient<T>(endpoint, {
      ...config,
      method: 'GET',
    }),
  Post: <T = void>(endpoint: string, config: HttpConfig = {}) =>
    HttpClient<T>(endpoint, {
      ...config,
      method: 'POST',
    }),
  Put: <T = void>(endpoint: string, config: HttpConfig = {}) =>
    HttpClient<T>(endpoint, {
      ...config,
      method: 'PUT',
    }),
  Patch: (endpoint: string, config: HttpConfig = {}) =>
    HttpClient<void>(endpoint, {
      ...config,
      method: 'PATCH',
    }),
  Delete: (endpoint: string, config: HttpConfig = {}) =>
    HttpClient<void>(endpoint, {
      ...config,
      method: 'DELETE',
    }),
};

export const APIClient = {
  products: {
    list: () => appClient.Get<ProductDetails[]>('/api/v1/products/all'),
  },
  quarries: {
    getAll: () => appClient.Get<Quarry[]>(`/api/v1/quarries`),

    deleteProductFromQuarry: (quarryProductPriceId: number) =>
      appClient.Delete(
        `/api/v1/quarries/quarry-product/${quarryProductPriceId}`
      ),
    deletePrice: (priceId: number) =>
      appClient.Delete(`/api/v1/quarries/quarry-product-prices/${priceId}`),
  },

  categories: {
    getAll: () => appClient.Get<Category[]>(`/api/v1/categories`),
    new: (name: string) =>
      appClient.Post<Category>('/api/v1/categories/new', {
        body: {
          name,
        },
      }),
  },

  customers: {
    getAll: () => appClient.Get<Customer[]>(`/socoro/quarrylink/api/customer`),
    getById: (customerId: number) =>
      appClient.Get<Customer>(`/socoro/quarrylink/api/customer/${customerId}`),
  },

  quotations: {
    getAll: () =>
      appClient.Get<
        | QuotationDTO[]
        | {
            content: QuotationDTO[];
            totalElements: number;
            totalPages: number;
          }
      >(`/socoro/quarrylink/api/quote`),
    getById: (quotationId: number) =>
      appClient.Get<QuotationDTO>(
        `/socoro/quarrylink/api/quote/${quotationId}`
      ),
    create: (data: Partial<QuotationDTO>) =>
      appClient.Post<QuotationDTO>('/socoro/quarrylink/api/quote', {
        body: data,
      }),
  },
};
