import { baseUrl, getTenantId, getUser } from '../utils';
// import { handleLogout } from '../auth/authManager';
import {
  LinkedProduct,
  Product,
  ProductDetails,
  ProductReporting,
} from '../types/product';
import {
  CustomerDTO,
  CustomerReporting,
  ArchiveCustomerResponseDTO,
  UnarchiveCustomerResponseDTO,
} from '../types/customer';
import {
  Quarry,
  QuarryReporting,
  QuarrySupplierProduct,
} from '../types/quarry';
import {
  PublicQuoteLinkResponse,
  QuotationDTO,
  QuotationLineItem,
  QuotationReporting,
} from '../types/quotation';
import { toLocalDateTime } from '../utils/date';
import { convertKeysToCamelCase } from '../utils/case-conversion';
import { normalizeObjectPhoneNumbers } from '../utils/phone-helper';
import { Material } from '../types/material';
import {
  User,
  UserCreateDTO,
  UserDelete,
  UserUpdateDTO,
  UserDependencies,
  ChangePasswordRequest,
  PasswordChangeResponse,
  PasswordResetResponse,
} from '../types/user';
import {
  SubscriptionsAndInvoices,
  TenantDetails,
  TenantCompleteDetails,
  TenantLogoUploadResponse,
  TenantLogoResponse,
} from '../types/client';
import { XeroConnectResponseDTO, XeroStatusResponseDTO } from '../types/xero';
import { CustomerDeliveryAddress } from '../types/address';
import {
  DocketAssignRequest,
  DocketDTO,
  DocketOperationalUpdateRequest,
  DocketOperationalUpdateResponse,
  DispatchDocketDTO,
} from '../types/docket';
import { JobDTO, JobDetails, JobItem, Invoice } from '../types/job';
import { HaulierCreateDTO, HaulierDTO } from '../types/haulier';
import { TruckDTO } from '../types/truck';
import { ChecklistItemsPage } from '../types/checklist';
import {
  DriverDTO,
  PatchDriverInfoDTO,
  PatchDriverTypeDTO,
  PatchDriverTrucksDTO,
  PatchDriverHaulierDTO,
  PutDriverDTO,
} from '../types/driver';
import { ChecklistTemplate } from '../types/checklist-template';
import {
  ChecklistSubmission,
  ChecklistSubmitRequest,
} from '../types/checklist-submission';

type RequestBody =
  | BodyInit
  | FormData
  | object
  | Record<string, unknown>
  | null;
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

  /**
   * If true, appends 'Z' to known date field strings that lack timezone info.
   * This treats backend datetimes as UTC. Default: true.
   */
  normalizeUtc?: boolean;

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
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
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
  config: HttpConfig = {},
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
    },
  };

  const authUser = await getUser(); // ✅ Properly awaited
  const tenantId = await getTenantId();

  if (authUser?.access_token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${authUser.access_token}`,
      // 'id-token': authUser.id_token,
      'X-Tenant-ID': tenantId || '',
    };
  } else {
    return Promise.reject(new Error('Token expired or invalid.'));
  }

  if (config.body) {
    // Handle FormData separately - don't stringify and let browser set Content-Type with boundary
    if (config.body instanceof FormData) {
      init.body = config.body;
    } else {
      init.body = JSON.stringify(config.body);
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
      `API Request Failed: ${response.status} ${response.statusText}`,
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
        // DEBUG: temporarily disabled logout to inspect 403 response — re-enable after debugging
        // await handleLogout();
        // console.error('[DEBUG][403] Endpoint:', endpoint);
        // console.error('[DEBUG][403] Response headers:', Object.fromEntries(response.headers.entries()));
        // return Promise.reject(new Error('Cookie/Token expired or invalid.'));
      }
      case 503: {
        // Show an error toast to notify the user what occurred
        return Promise.reject(
          new Error(`[503] Service unavailable: "${endpoint}"`),
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
    reporting: () =>
      appClient.Get<ProductReporting>(
        `/socoro/quarrylink/api/product/reporting`,
      ),
    getAll: () =>
      appClient.Get<ProductDetails[]>(
        `/socoro/quarrylink/api/product/material`,
      ),
    getByIdWithMaterial: (productId: number) =>
      appClient.Get<ProductDetails>(
        `/socoro/quarrylink/api/product/${productId}/material`,
      ),
    getByIdWithQuarrySupplierProduct: (productId: number) =>
      appClient.Get<ProductDetails>(
        `/socoro/quarrylink/api/product/${productId}/quarry-supplier`,
      ),
    createProduct: (data: Partial<Product>) =>
      appClient.Post<Product>('/socoro/quarrylink/api/product', {
        body: data,
      }),
    updateProduct: (id: number, data: Partial<Product>) =>
      appClient.Put<Product>(`/socoro/quarrylink/api/product/${id}`, {
        body: data,
      }),
    deleteProduct: (id: number) => {
      return appClient
        .Delete<{ blockingQuoteDtos?: unknown[] }>(
          `/socoro/quarrylink/api/product/${id}/post-eligibility-check`,
        )
        .then((res) => {
          console.log('[APIClient] products.delete response:', res);
          const len = Array.isArray(res?.blockingQuoteDtos)
            ? res!.blockingQuoteDtos!.length
            : 0;
          console.log('[APIClient] blockingQuoteDtos length from delete:', len);
          return res;
        })
        .catch((err) => {
          console.error('[APIClient] products.delete error:', err);
          throw err;
        });
    },
  },
  quarries: {
    reporting: () =>
      appClient.Get<QuarryReporting>(
        `/socoro/quarrylink/api/quarries/reporting`,
      ),
    getAll: async () => {
      const quarries = await appClient.Get<Quarry[]>(
        `/socoro/quarrylink/api/quarries`,
      );

      const normalizedQuarries = quarries.map(normalizeObjectPhoneNumbers);

      return normalizedQuarries;
    },
    getById: async (quarrySupplierId: number) => {
      const quarry = await appClient.Get<Quarry>(
        `/socoro/quarrylink/api/quarries/${quarrySupplierId}`,
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
          `/socoro/quarrylink/api/quarries/${id}/post-eligibility-check`,
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
        `/api/v1/quarries/quarry-product/${quarryProductPriceId}`,
      ),
    linkedProducts: (quarryId: number) =>
      appClient.Get<LinkedProduct>(
        `/socoro/quarrylink/api/quarries/${quarryId}/linked-products`,
      ),
  },

  materials: {
    getAll: () => appClient.Get<Material[]>(`/socoro/quarrylink/api/materials`),
  },

  quarrySupplierProducts: {
    getById: (quarrySupplierId: number, productId: number) =>
      appClient.Get<QuarrySupplierProduct>(
        `/socoro/quarrylink/api/quarry-products/${quarrySupplierId}/${productId}`,
      ),
    create: (data: Partial<QuarrySupplierProduct>) =>
      appClient.Post<QuarrySupplierProduct>(
        '/socoro/quarrylink/api/quarry-products',
        {
          body: data,
        },
      ),
    update: (
      quarrySupplierId: number,
      productId: number,
      data: Partial<QuarrySupplierProduct>,
    ) =>
      appClient.Put<QuarrySupplierProduct>(
        `/socoro/quarrylink/api/quarry-products/${quarrySupplierId}/${productId}`,
        {
          body: data,
        },
      ),
    delete: (quarrySupplierId: number, productId: number) => {
      return appClient
        .Delete<{ blockingQuoteDtos?: unknown[] }>(
          `/socoro/quarrylink/api/quarry-products/${quarrySupplierId}/${productId}/post-eligibility-check`,
        )
        .then((res) => {
          console.log(
            '[APIClient] quarrySupplierProducts.delete response:',
            res,
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
            err,
          );
          throw err;
        });
    },
  },

  customers: {
    reporting: () =>
      appClient.Get<CustomerReporting>(
        `/socoro/quarrylink/api/customer/reporting`,
      ),
    getAll: () =>
      appClient.Get<CustomerDTO[]>(`/socoro/quarrylink/api/customer`),
    getById: (customerId: number) =>
      appClient.Get<CustomerDTO>(
        `/socoro/quarrylink/api/customer/${customerId}`,
      ),
    create: (data: Partial<CustomerDTO>) =>
      appClient.Post<CustomerDTO>('/socoro/quarrylink/api/customer', {
        body: data,
      }),
    update: (data: Partial<CustomerDTO>) =>
      appClient.Put<CustomerDTO>(`/socoro/quarrylink/api/customer/${data.id}`, {
        body: data,
      }),
    getDeliveryAddresses: (customerId: number, limit?: number) =>
      appClient.Get<CustomerDeliveryAddress[]>(
        `/socoro/quarrylink/api/customer/${customerId}/delivery-addresses`,
        {
          queryString: {
            limit: limit?.toString(),
          },
        },
      ),
    updateDeliveryAddressUsage: (
      customerId: number,
      customerDeliveryAddressId: number,
      inUse: boolean,
    ) =>
      appClient.Put(
        `/socoro/quarrylink/api/customer/${customerId}/delivery-addresses/${customerDeliveryAddressId}/usage`,
        {
          queryString: {
            inUse,
          },
        },
      ),
    archive: (id: number) =>
      appClient.Put<ArchiveCustomerResponseDTO>(
        `/socoro/quarrylink/api/customer/${id}/archive`,
      ),
    unarchive: (id: number) =>
      appClient.Put<UnarchiveCustomerResponseDTO>(
        `/socoro/quarrylink/api/customer/${id}/unarchive`,
      ),
  },

  quotations: {
    reporting: () =>
      appClient.Get<QuotationReporting>(
        `/socoro/quarrylink/api/quote/reporting`,
      ),
    /**
     * Public quotation retrieval using token from quote email link.
     * This endpoint must remain unauthenticated because customers are not logged in.
     */
    getByPublicLinkToken: async (token: string) => {
      const apiBase = baseUrl();
      if (!apiBase) {
        throw new Error('Missing API base URL for public quote link request');
      }

      const url = `${apiBase}/socoro/quarrylink/api/quote/public/link?token=${encodeURIComponent(
        token,
      )}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: '*/*',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `Failed to fetch public quote link: ${response.status} ${response.statusText} ${errorText}`,
        );
      }

      const data = (await response.json()) as PublicQuoteLinkResponse;
      return data;
    },
    updatePublicQuoteStatus: async (
      status: 'APPROVED' | 'DECLINED',
      token: string,
      declineReason?: string,
      decisionMakerName?: string,
    ) => {
      const apiBase = baseUrl();
      if (!apiBase) {
        throw new Error(
          'Missing API base URL for public quote status update request',
        );
      }

      const url = `${apiBase}/socoro/quarrylink/api/quote/public/link/decision?token=${encodeURIComponent(
        token,
      )}`;

      const body: {
        status: string;
        declineReason?: string;
        decisionMakerName?: string;
      } = { status };
      if (status === 'DECLINED' && declineReason) {
        body.declineReason = declineReason;
      }
      if (decisionMakerName !== undefined) {
        body.decisionMakerName = decisionMakerName;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `Failed to update public quote status: ${response.status} ${response.statusText} ${errorText}`,
        );
      }

      if (response.status === 204) {
        return {};
      }

      const data = await response.json();
      return data;
    },
    getAll: async (params?: {
      page?: number;
      pageSize?: number;
      status?: string;
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
        `/socoro/quarrylink/api/quote/${quotationId}`,
      ),
    getWithQuoteItems: async (quotationId: number) => {
      const response = await appClient.Get<QuotationDTO>(
        `/socoro/quarrylink/api/quote/${quotationId}/quoteItem`,
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
        },
      ),
    duplicate: (id: number, data?: Partial<QuotationDTO>) =>
      appClient.Post<QuotationDTO>(
        `/socoro/quarrylink/api/quote/${id}/duplicate`,
        {
          body: data,
        },
      ),
    bulkArchive: (ids: number[]) =>
      appClient.Post<void>(`/socoro/quarrylink/api/quote/archive`, {
        body: { quoteIds: ids },
      }),
    sendToCustomer: (
      id: number,
      inclDeliveryCost: boolean,
      emailRecipients: string[],
    ) =>
      appClient.Post<QuotationDTO>(
        `/socoro/quarrylink/api/quote/${id}/send-to-customer`,
        {
          body: { inclDeliveryCost, emailRecipients },
        },
      ),
    preview: (id: number) =>
      appClient.Get<PublicQuoteLinkResponse>(
        `/socoro/quarrylink/api/quote/${id}/preview`,
      ),
    createQuoteItem: (data: Partial<QuotationLineItem>) =>
      appClient.Post<QuotationLineItem>('/socoro/quarrylink/api/quoteItem', {
        body: convertKeysToCamelCase(data),
      }),
    getQuoteItemById: (id: number) =>
      appClient.Get<QuotationLineItem>(
        `/socoro/quarrylink/api/quoteItem/${id}`,
      ),
    updateQuoteItem: (id: number, data: Partial<QuotationLineItem>) =>
      appClient.Put<QuotationLineItem>(
        `/socoro/quarrylink/api/quoteItem/${id}`,
        {
          body: convertKeysToCamelCase(data),
        },
      ),
    deleteQuoteItem: (id: number) =>
      appClient.Delete(`/socoro/quarrylink/api/quoteItem/${id}`),

    convertToDraft: (id: number) =>
      appClient.Put(`/socoro/quarrylink/api/quote/${id}/convert-to-draft`),
    convertToJob: (id: number) =>
      appClient.Post<JobDTO>(
        `/socoro/quarrylink/api/quote/${id}/convert-to-job`,
      ),
    updateQuoteDecision: (
      id: number,
      status: 'APPROVED' | 'DECLINED',
      declineReason?: string,
      decisionMakerName?: string,
    ) => {
      const body: {
        status: string;
        declineReason?: string;
        decisionMakerName?: string;
      } = { status };
      if (status === 'DECLINED' && declineReason) {
        body.declineReason = declineReason;
      }
      if (decisionMakerName !== undefined) {
        body.decisionMakerName = decisionMakerName;
      }
      return appClient.Put<QuotationDTO>(
        `/socoro/quarrylink/api/quote/${id}/decision`,
        { body },
      );
    },
  },

  dockets: {
    create: (data: Partial<DocketDTO>) =>
      appClient.Post<DocketDTO>('/socoro/quarrylink/api/dockets', {
        body: data,
      }),
    getAll: async (params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const response = await appClient.Get<
        | DocketDTO[]
        | {
            content: DocketDTO[];
            totalElements: number;
            totalPages: number;
          }
      >(`/socoro/quarrylink/api/dockets`, {
        queryString: {
          page: params?.page?.toString(),
          pageSize: params?.pageSize?.toString() || '1000', // Fetch large number for client-side pagination
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      });
      return response;
    },
    getByJobId: async (jobId: number) => {
      const response = await appClient.Get<
        | DocketDTO[]
        | {
            content: DocketDTO[];
            totalElements: number;
            totalPages: number;
          }
      >(`/socoro/quarrylink/api/dockets/job/${jobId}`, {
        queryString: {
          page: '0',
          size: '1000',
          sort: 'id',
        },
      });
      return response;
    },
    getById: (id: number) => {
      return appClient.Get<DocketDTO>(`/socoro/quarrylink/api/dockets/${id}`);
    },
    update: (id: number, data: Partial<DocketDTO>) =>
      appClient.Put<DocketDTO>(`/socoro/quarrylink/api/dockets/${id}`, {
        body: data,
      }),
    updateStatus: (docketId: number, formData: FormData) =>
      appClient.Put<DocketDTO>(
        `/socoro/quarrylink/api/dockets/${docketId}/status`,
        { body: formData },
      ),
    assign: (data: DocketAssignRequest) =>
      appClient.Put<DocketDTO>('/socoro/quarrylink/api/dockets/assign', {
        body: data,
      }),
    unassign: (data: { docketId: number }) =>
      appClient.Put<DocketDTO>('/socoro/quarrylink/api/dockets/unassign', {
        body: data,
      }),
    operationalUpdate: (id: number, data: DocketOperationalUpdateRequest) =>
      appClient.Put<DocketOperationalUpdateResponse>(
        `/socoro/quarrylink/api/dockets/${id}/operational-update`,
        { body: data },
      ),
    getTruckInspection: (docketId: number) =>
      appClient.Get<ChecklistSubmission>(
        `/socoro/quarrylink/api/dockets/${docketId}/truck-inspection`,
      ),
    getPreStartChecklist: (docketId: number) =>
      appClient.Get<ChecklistSubmission>(
        `/socoro/quarrylink/api/dockets/${docketId}/pre-start-checklist`,
      ),
  },

  checklists: {
    getTruckTemplate: () =>
      appClient.Get<ChecklistTemplate>(
        `/socoro/quarrylink/api/checklists/truck/template`,
      ),
    getDriverTemplate: () =>
      appClient.Get<ChecklistTemplate>(
        `/socoro/quarrylink/api/checklists/driver/template`,
      ),
    getTruckSubmission: (submissionId: number) =>
      appClient.Get<ChecklistSubmission>(
        `/socoro/quarrylink/api/checklists/submissions/truck/${submissionId}`,
      ),
    getDriverSubmission: (submissionId: number) =>
      appClient.Get<ChecklistSubmission>(
        `/socoro/quarrylink/api/checklists/submissions/driver/${submissionId}`,
      ),
    submit: (data: ChecklistSubmitRequest) =>
      appClient.Post<ChecklistSubmission>(`/socoro/quarrylink/api/checklists`, {
        body: data,
      }),
  },

  users: {
    getAll: () => appClient.Get<User[]>(`/socoro/quarrylink/api/users`),
    getById: (id: string) => {
      return appClient.Get<User>(`/socoro/quarrylink/api/users/${id}`);
    },
    create: (data: UserCreateDTO) =>
      appClient.Post<User>('/socoro/quarrylink/api/users', {
        body: data,
      }),
    delete: (id: string, data: UserDelete) =>
      appClient.Delete<User>(`/socoro/quarrylink/api/users/${id}`, {
        body: data,
      }),
    update: (id: string, data: UserUpdateDTO) => {
      return appClient.Put<User>(`/socoro/quarrylink/api/users/${id}`, {
        body: data,
      });
    },
    getDependencies: (id: string) =>
      appClient.Get<UserDependencies>(
        `/socoro/quarrylink/api/users/${id}/dependencies`,
      ),
    changePassword: (data: ChangePasswordRequest) =>
      appClient.Patch<PasswordChangeResponse>(
        '/socoro/quarrylink/api/users/password',
        {
          body: data,
        },
      ),
    resetPasswordBySuperAdmin: (id: string) =>
      appClient.Post<PasswordResetResponse>(
        `/socoro/quarrylink/api/users/${id}/reset-password`,
      ),
    resendInvitation: (sub: string) =>
      appClient.Post(`/socoro/quarrylink/api/users/${sub}/resend-invitation`),
  },

  jobs: {
    create: (data: Omit<JobDTO, 'id'>) =>
      appClient.Post<JobDTO>('/socoro/quarrylink/api/job', {
        body: data,
      }),
    getAll: async (params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const response = await appClient.Get<
        | JobDTO[]
        | {
            content: JobDTO[];
            totalElements: number;
            totalPages: number;
          }
      >(`/socoro/quarrylink/api/job`, {
        queryString: {
          page: params?.page?.toString(),
          pageSize: params?.pageSize?.toString() || '1000', // Fetch large number for client-side pagination
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      });
      return response;
    },
    getJobItems: async (jobId: number) => {
      const response = await appClient.Get<JobDetails>(
        `/socoro/quarrylink/api/job/${jobId}/job-items`,
      );
      return response;
    },
    getJobItemById: async (jobItemId: number) => {
      const response = await appClient.Get<JobItem>(
        `/socoro/quarrylink/api/job-items/${jobItemId}`,
      );
      return response;
    },
    createJobItem: (data: Partial<JobItem>) =>
      appClient.Post<JobItem>('/socoro/quarrylink/api/job-items', {
        body: data,
      }),
    cancelJob: (id: number, cancelReason: string, additionalNotes: string) =>
      appClient.Put<JobDTO>(`/socoro/quarrylink/api/job/${id}/cancel`, {
        body: { cancelReason, additionalNotes },
      }),
    updateJob: (id: number, data: JobDTO) => {
      return appClient.Put<JobDTO>(`/socoro/quarrylink/api/job/${id}`, {
        body: data,
      });
    },
    updateJobItem: (id: number, data: Partial<JobItem>) => {
      return appClient.Put<JobItem>(`/socoro/quarrylink/api/job-items/${id}`, {
        body: data,
      });
    },
    deleteJobItem: (id: number) => {
      return appClient.Delete<JobItem>(
        `/socoro/quarrylink/api/job-items/${id}`,
      );
    },
    pause: (
      id: number,
      pauseStrategy: 'STOP_ALL_DOCKETS' | 'ALLOW_DRIVERS_TO_COMPLETE',
    ) =>
      appClient.Put<JobDTO>(`/socoro/quarrylink/api/job/${id}/pause`, {
        body: { pauseStrategy },
      }),
    resume: (id: number) =>
      appClient.Put<JobDTO>(`/socoro/quarrylink/api/job/${id}/resume`, {
        body: { id },
      }),
    settle: (id: number) =>
      appClient.Put<JobDTO>(`/socoro/quarrylink/api/job/${id}/settle`),
  },

  drivers: {
    getAll: () => appClient.Get<DriverDTO[]>(`/socoro/quarrylink/api/driver`),
    getById: (id: number) =>
      appClient.Get<DriverDTO>(`/socoro/quarrylink/api/driver/${id}`),
    create: (data: DriverDTO) =>
      appClient.Post<DriverDTO>(`/socoro/quarrylink/api/driver`, {
        body: data,
      }),
    update: (id: number, data: PutDriverDTO) =>
      appClient.Put<DriverDTO>(`/socoro/quarrylink/api/driver/${id}`, {
        body: data,
      }),
    patchInfo: (id: number, data: PatchDriverInfoDTO) =>
      appClient.Patch<DriverDTO>(`/socoro/quarrylink/api/driver/${id}`, {
        body: data,
      }),
    patchType: (id: number, data: PatchDriverTypeDTO) =>
      appClient.Patch<DriverDTO>(`/socoro/quarrylink/api/driver/${id}/type`, {
        body: data,
      }),
    patchTrucks: (id: number, data: PatchDriverTrucksDTO) =>
      appClient.Patch<DriverDTO>(`/socoro/quarrylink/api/driver/${id}/trucks`, {
        body: data,
      }),
    unassignTruck: (
      driverId: number,
      data: { version: number; truckId: number },
    ) =>
      appClient.Delete<DriverDTO>(
        `/socoro/quarrylink/api/driver/${driverId}/truck`,
        {
          body: data,
        },
      ),
    patchHaulier: (id: number, data: PatchDriverHaulierDTO) =>
      appClient.Patch<DriverDTO>(
        `/socoro/quarrylink/api/driver/${id}/haulier`,
        { body: data },
      ),
    delete: (id: number) =>
      appClient.Delete<void>(`/socoro/quarrylink/api/driver/${id}`),
    deactivate: (id: number) =>
      appClient.Patch<DriverDTO>(
        `/socoro/quarrylink/api/driver/${id}/deactivate`,
        {},
      ),
    reactivate: (id: number) =>
      appClient.Patch<DriverDTO>(
        `/socoro/quarrylink/api/driver/${id}/reactivate`,
        {},
      ),
    getAssignments: (id: number) =>
      appClient.Get<Record<string, unknown>>(
        `/socoro/quarrylink/api/driver/${id}/assignments`,
      ),
    getPreStartChecklists: (
      driverId: number,
      params?: { page?: number; size?: number; sort?: string[] },
    ) =>
      appClient.Get<ChecklistItemsPage>(
        `/socoro/quarrylink/api/driver/${driverId}/pre-start-checklists`,
        {
          queryString: {
            page: params?.page?.toString(),
            size: params?.size?.toString(),
            sort: params?.sort?.join(','),
          },
        },
      ),
  },

  trucks: {
    getAll: () => appClient.Get<TruckDTO[]>(`/socoro/quarrylink/api/truck`),
    getById: (id: number) =>
      appClient.Get<TruckDTO>(`/socoro/quarrylink/api/truck/${id}`),
    getByIdWithDrivers: (id: number) =>
      appClient.Get<TruckDTO>(`/socoro/quarrylink/api/truck/${id}/driver`),
    create: (data: TruckDTO) =>
      appClient.Post<TruckDTO>(`/socoro/quarrylink/api/truck`, { body: data }),
    update: (id: number, data: TruckDTO) =>
      appClient.Put<TruckDTO>(`/socoro/quarrylink/api/truck/${id}`, {
        body: data,
      }),
    delete: (id: number) =>
      appClient.Delete<TruckDTO>(`/socoro/quarrylink/api/truck/${id}`),
    assignDrivers: (
      truckId: number,
      data: { version: number; driverIds: number[] },
    ) =>
      appClient.Patch<TruckDTO>(
        `/socoro/quarrylink/api/truck/${truckId}/drivers`,
        {
          body: data,
        },
      ),
    unassignDriver: (
      truckId: number,
      data: { version: number; driverId: number },
    ) =>
      appClient.Delete<TruckDTO>(
        `/socoro/quarrylink/api/truck/${truckId}/driver`,
        {
          body: data,
        },
      ),
    deactivate: (id: number) =>
      appClient.Patch<TruckDTO>(
        `/socoro/quarrylink/api/truck/${id}/deactivate`,
        {},
      ),
    reactivate: (id: number) =>
      appClient.Patch<TruckDTO>(
        `/socoro/quarrylink/api/truck/${id}/reactivate`,
        {},
      ),
    getInspections: (
      truckId: number,
      params?: { page?: number; size?: number; sort?: string[] },
    ) =>
      appClient.Get<ChecklistItemsPage>(
        `/socoro/quarrylink/api/truck/${truckId}/inspections`,
        {
          queryString: {
            page: params?.page?.toString(),
            size: params?.size?.toString(),
            sort: params?.sort?.join(','),
          },
        },
      ),
  },

  hauliers: {
    create: (data: HaulierCreateDTO) =>
      appClient.Post<HaulierDTO>('/socoro/quarrylink/api/haulier', {
        body: data,
      }),
    getAll: () => appClient.Get<HaulierDTO[]>('/socoro/quarrylink/api/haulier'),
    getById: (id: number) =>
      appClient.Get<HaulierDTO>(`/socoro/quarrylink/api/haulier/${id}`),
    update: (id: number, data: HaulierCreateDTO) =>
      appClient.Patch<HaulierDTO>(`/socoro/quarrylink/api/haulier/${id}`, {
        body: data,
      }),
    getDrivers: (haulierId: number) =>
      appClient.Get<{ drivers: DriverDTO[] }>(
        `/socoro/quarrylink/api/haulier/${haulierId}/drivers`,
      ),
    getTrucks: (haulierId: number) =>
      appClient.Get<{ trucks: TruckDTO[] }>(
        `/socoro/quarrylink/api/haulier/${haulierId}/trucks`,
      ),
  },

  tenants: {
    getTenantDetails: () =>
      appClient.Get<TenantDetails>(
        `/socoro/quarrylink/api/tenant/tenant-details`,
      ),
    getSubscriptionsAndInvoices: () =>
      appClient.Get<SubscriptionsAndInvoices>(
        `/socoro/quarrylink/api/tenant/subscriptions-and-invoices`,
      ),
    getTenantCompleteDetails: () =>
      appClient.Get<TenantCompleteDetails>(
        `/socoro/quarrylink/api/tenant/tenant-complete-details`,
      ),
    uploadLogo: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return appClient.Post<TenantLogoUploadResponse>(
        `/socoro/quarrylink/api/tenant/logo`,
        { body: formData },
      );
    },
    getLogo: () =>
      appClient.Get<TenantLogoResponse>(`/socoro/quarrylink/api/tenant/logo`),
    getStripeProfileLink: () =>
      appClient.Put<{ stripeProfileLink: string }>(
        `/socoro/quarrylink/api/tenant/stripe-profile`,
        {
          queryString: {
            returnUrl: 'https://app.dev.quarrylink.com.au/',
          },
        },
      ),
  },

  xero: {
    connect: async (userEmail: string) => {
      const [tenantId, authUser] = await Promise.all([getTenantId(), getUser()]);
      const response = await fetch(`${baseUrl()}/quarrylink/tenant-fusion/api/xero/internal/connect`, {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authUser?.access_token}`,
        },
        body: JSON.stringify({ tenantId, userEmail }),
      });
      if (!response.ok) throw new Error(`Xero connect failed: ${response.status}`);
      return response.json() as Promise<XeroConnectResponseDTO>;
    },
    getStatus: async () => {
      const [tenantId, authUser] = await Promise.all([getTenantId(), getUser()]);
      const response = await fetch(`${baseUrl()}/quarrylink/tenant-fusion/api/xero/internal/${tenantId}/status`, {
        method: 'GET',
        headers: {
          Accept: '*/*',
          Authorization: `Bearer ${authUser?.access_token}`,
        },
      });
      if (!response.ok) throw new Error(`Xero status failed: ${response.status}`);
      return response.json() as Promise<XeroStatusResponseDTO>;
    },
  },

  invoices: {
    getAll: (jobId: number) =>
      appClient.Get<Invoice[]>(`/socoro/quarrylink/api/invoices/jobs/${jobId}`),
    getById: (invoiceId: number) =>
      appClient.Get<Invoice>(`/socoro/quarrylink/api/invoices/${invoiceId}`),
  },

  driverApp: {
    getAssignedDockets: () =>
      appClient.Get<DocketDTO[]>(`/socoro/quarrylink/api/driver-app/assigned`),
    getAssignedDocketById: (docketId: number) =>
      appClient.Get<DocketDTO>(`/socoro/quarrylink/api/driver-app/${docketId}`),
    operationalUpdate: (id: number, actualLoadSize: number) =>
      appClient.Put<DocketOperationalUpdateResponse>(
        `/socoro/quarrylink/api/driver-app/${id}/operational-update`,
        { body: { actualLoadSize } },
      ),
  },

  scheduler: {
    getTrucks: (start: string, end: string) =>
      appClient.Get<DispatchDocketDTO>(
        `/socoro/quarrylink/api/scheduler/trucks`,
        {
          queryString: { start, end },
        },
      ),
    getDrivers: (start: string, end: string) =>
      appClient.Get<DispatchDocketDTO>(
        `/socoro/quarrylink/api/scheduler/drivers`,
        {
          queryString: { start, end },
        },
      ),
  },
};
