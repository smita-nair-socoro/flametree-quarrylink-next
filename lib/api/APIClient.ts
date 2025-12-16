import { baseUrl, getUser } from '../utils';
import { handleLogout } from '../auth/authManager';
import { Product, ProductDetails } from '../types/product';
import { CustomerDTO } from '../types/customer';
import { Quarry, QuarrySupplierProduct } from '../types/quarry';
import {
  QuotationDTO,
  QuotationLineItem,
} from '../types/quotation';
import { toLocalDateTime } from '../utils/date';
import { convertKeysToCamelCase } from '../utils/case-conversion';
import { normalizeObjectPhoneNumbers } from '../utils/phone-helper';
import { Material } from '../types/material';
import { User } from '../types/user';
import {
  SubscriptionsAndInvoices,
  TenantDetails,
  TenantCompleteDetails,
} from '../types/client';
// import { getTenantId } from '../utils';

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
      Authorization: `Bearer ${authUser.id_token}`,
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

  // console.log(`API Request: ${url}`);

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
      if ((init.method || 'GET') === 'DELETE') {
        console.log('[HttpClient] DELETE success (204 No Content):', {
          endpoint,
          status: response.status,
        });
      }
      return Promise.resolve<T>({} as T);
    }

    // If Content-Type is application/json, then parse response as JSON
    // otherwise, just resolve the Response object returned by window.fetch
    // and the consumer can call await response.text() if needed.
    if (isJson) {
      const json = (await response.json()) as T;
      if ((init.method || 'GET') === 'DELETE') {
        console.log('[HttpClient] DELETE success (JSON):', {
          endpoint,
          status: response.status,
          body: json,
        });
      }
      return Promise.resolve<T>(json);
    } else {
      if ((init.method || 'GET') === 'DELETE') {
        console.log('[HttpClient] DELETE success (non-JSON):', {
          endpoint,
          status: response.status,
        });
      }
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

    // Try to parse the JSON (but don't blow up if it fails)
    let parsedJson: unknown = null;
    if (isJson) {
      try {
        parsedJson = await response.json();
      } catch {
        // ignore parse errors — we'll fall back to statusText below
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

    // Create error with response data attached
    const error = new Error(errorMessage) as Error & {
      response?: {
        status: number;
        statusText: string;
        data: unknown;
      };
    };

    // Attach response information to the error object
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: parsedJson,
    };

    return Promise.reject(error);
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
  Patch: <T = void>(endpoint: string, config: HttpConfig = {}) =>
    HttpClient<T>(endpoint, {
      ...config,
      method: 'PATCH',
    }),
  Delete: <T = void>(endpoint: string, config: HttpConfig = {}) =>
    HttpClient<T>(endpoint, {
      ...config,
      method: 'DELETE',
    }),
};

export const APIClient = {
  products: {
    getAll: () =>
      appClient.Get<ProductDetails[]>(
        `/socoro/quarrylink/api/product/material`
      ),
    getByIdWithMaterial: (productId: number) =>
      appClient.Get<ProductDetails>(
        `/socoro/quarrylink/api/product/${productId}/material`
      ),
    getByIdWithQuarrySupplierProduct: (productId: number) =>
      appClient.Get<ProductDetails>(
        `/socoro/quarrylink/api/product/${productId}/quarry-supplier`
      ),
    createProduct: (data: Partial<Product>) =>
      appClient.Post<Product>('/socoro/quarrylink/api/product', {
        body: data,
      }),
    updateProduct: (id: number, data: Partial<Product>) =>
      appClient.Put<Product>(`/socoro/quarrylink/api/product/${id}`, {
        body: data,
      }),
    deleteProduct: (id: number) =>
      appClient.Delete<{
        quotes?: string[];
        jobs?: string[];
        dockets?: string[];
      }>(`/socoro/quarrylink/api/product/${id}`),
  },
  quarries: {
    getAll: async () => {
      const quarries = await appClient.Get<Quarry[]>(
        `/socoro/quarrylink/api/quarries`
      );

      const normalizedQuarries = quarries.map(normalizeObjectPhoneNumbers);

      return normalizedQuarries;
    },
    getById: async (quarrySupplierId: number) => {
      const quarry = await appClient.Get<Quarry>(
        `/socoro/quarrylink/api/quarries/${quarrySupplierId}`
      );

      // Step 2: Normalize phone numbers to E.164 format
      const normalizedQuarry = normalizeObjectPhoneNumbers(quarry);

      return normalizedQuarry;
    },
    create: (quarry: Quarry) =>
      appClient.Post<Quarry>('/socoro/quarrylink/api/quarries', {
        body: quarry,
      }),
    update: (id: number, quarry: Quarry) =>
      appClient.Put<Quarry>(`/socoro/quarrylink/api/quarries/${id}`, {
        body: quarry,
      }),
    unarchive: (id: number) =>
      appClient.Put<Quarry>(`/socoro/quarrylink/api/quarries/${id}/unarchive`),
    delete: (id: number) => {
      return appClient
        .Delete<{ blockingQuoteDtos?: unknown[] }>(
          `/socoro/quarrylink/api/quarries/${id}/post-eligibility-check`
        )
        .then((res) => {
          console.log('[APIClient] quarries.delete response:', res);
          const len = Array.isArray(res?.blockingQuoteDtos)
            ? res!.blockingQuoteDtos!.length
            : 0;
          console.log('[APIClient] blockingQuoteDtos length from delete:', len);
          return res;
        })
        .catch((err) => {
          console.error('[APIClient] quarries.delete error:', err);
          throw err;
        });
    },
    getSuburbs: () =>
      appClient.Get<string[]>(`/socoro/quarrylink/api/quarries/suburbs`),
    deleteProductFromQuarry: (quarryProductPriceId: number) =>
      appClient.Delete(
        `/api/v1/quarries/quarry-product/${quarryProductPriceId}`
      ),
  },

  materials: {
    getAll: () => appClient.Get<Material[]>(`/socoro/quarrylink/api/materials`),
  },

  quarrySupplierProducts: {
    getById: (quarrySupplierId: number, productId: number) =>
      appClient.Get<QuarrySupplierProduct>(
        `/socoro/quarrylink/api/quarry-products/${quarrySupplierId}/${productId}`
      ),
    create: (data: Partial<QuarrySupplierProduct>) =>
      appClient.Post<QuarrySupplierProduct>(
        '/socoro/quarrylink/api/quarry-products',
        {
          body: data,
        }
      ),
    update: (
      quarrySupplierId: number,
      productId: number,
      data: Partial<QuarrySupplierProduct>
    ) =>
      appClient.Put<QuarrySupplierProduct>(
        `/socoro/quarrylink/api/quarry-products/${quarrySupplierId}/${productId}`,
        {
          body: data,
        }
      ),
    delete: (quarrySupplierId: number, productId: number) => {
      return appClient
        .Delete<{ blockingQuoteDtos?: unknown[] }>(
          `/socoro/quarrylink/api/quarry-products/${quarrySupplierId}/${productId}/post-eligibility-check`
        )
        .then((res) => {
          console.log(
            '[APIClient] quarrySupplierProducts.delete response:',
            res
          );
          const len = Array.isArray(res?.blockingQuoteDtos)
            ? res!.blockingQuoteDtos!.length
            : 0;
          console.log('[APIClient] blockingQuoteDtos length from delete:', len);
          return res;
        })
        .catch((err) => {
          console.error(
            '[APIClient] quarrySupplierProducts.delete error:',
            err
          );
          throw err;
        });
    },
  },

  customers: {
    getAll: () =>
      appClient.Get<CustomerDTO[]>(`/socoro/quarrylink/api/customer`),
    getById: (customerId: number) =>
      appClient.Get<CustomerDTO>(
        `/socoro/quarrylink/api/customer/${customerId}`
      ),
  },

  quotations: {
    getAll: async (params?: {
      page?: number;
      pageSize?: number;
      status?: string;
      quoteType?: string;
      customerId?: number;
      accountManagerId?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const response = await appClient.Get<
        | QuotationDTO[]
        | {
            content: QuotationDTO[];
            totalElements: number;
            totalPages: number;
          }
      >(`/socoro/quarrylink/api/quote`, {
        queryString: {
          page: params?.page?.toString(),
          pageSize: params?.pageSize?.toString() || '1000', // Fetch large number for client-side pagination
          status: params?.status,
          quoteType: params?.quoteType,
          customerId: params?.customerId?.toString(),
          accountManagerId: params?.accountManagerId?.toString(),
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      });
      return response;
    },
    getById: (quotationId: number) =>
      appClient.Get<QuotationDTO>(
        `/socoro/quarrylink/api/quote/${quotationId}`
      ),
    getWithQuoteItems: async (quotationId: number) => {
      const response = await appClient.Get<QuotationDTO>(
        `/socoro/quarrylink/api/quote/${quotationId}/quoteItem`
      );
      return response;
    },
    create: (data: Partial<QuotationDTO>) =>
      appClient.Post<QuotationDTO>('/socoro/quarrylink/api/quote', {
        body: (() => {
          console.log('[Quotation][POST] Request payload:', data);
          return data;
        })(),
      }),
    update: (data: Partial<QuotationDTO>) =>
      appClient.Put<QuotationDTO>(`/socoro/quarrylink/api/quote/${data.id}`, {
        body: (() => {
          console.log('📡 [APIClient][PUT] Full Request Payload:', data);
          return data;
        })(),
      }),
    extendExpiryDate: (id: number, expiryDate: Date) =>
      appClient.Put<QuotationDTO>(
        `/socoro/quarrylink/api/quote/${id}/extend-expiry-date`,
        {
          body: {
            expiryDate: toLocalDateTime(expiryDate),
          },
        }
      ),
    createQuoteItem: (data: Partial<QuotationLineItem>) =>
      appClient.Post<QuotationLineItem>('/socoro/quarrylink/api/quoteItem', {
        body: convertKeysToCamelCase(data),
      }),
    updateQuoteItem: (id: number, data: Partial<QuotationLineItem>) =>
      appClient.Put<QuotationLineItem>(
        `/socoro/quarrylink/api/quoteItem/${id}`,
        {
          body: convertKeysToCamelCase(data),
        }
      ),
    deleteQuoteItem: (id: number) =>
      appClient.Delete(`/socoro/quarrylink/api/quoteItem/${id}`),
  },
  users: {
    getAll: () => appClient.Get<User[]>(`/socoro/quarrylink/api/user`),
  },

  tenants: {
    getTenantDetails: () =>
      appClient.Get<TenantDetails>(
        `/socoro/quarrylink/api/tenant/tenant-details`
      ),
    getSubscriptionsAndInvoices: () =>
      appClient.Get<SubscriptionsAndInvoices>(
        `/socoro/quarrylink/api/tenant/subscriptions-and-invoices`
      ),
    getTenantCompleteDetails: () =>
      appClient.Get<TenantCompleteDetails>(
        `/socoro/quarrylink/api/tenant/tenant-complete-details`
      ),
  },
};
