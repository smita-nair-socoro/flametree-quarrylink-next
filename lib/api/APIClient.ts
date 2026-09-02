import { baseUrl, getTenantId, getUser } from '../utils';
// import { handleLogout } from '../auth/authManager';
import {
  Product,
  ProductDetails,
  ProductListItem,
  ProductReporting,
  ProductsListResponse,
  ProductsPage,
  PullFromAccSoftwareResponse,
} from '../types/product';
import {
  CustomerDTO,
  CustomerReporting,
  CustomersListResponse,
  CustomersPage,
  ArchiveCustomerResponseDTO,
  UnarchiveCustomerResponseDTO,
  CustomerAttachmentDTO,
  AdditionalContactApiDTO,
  AdditionalContactsPage,
  CustomerNoteDTO,
  CustomerNotesPage,
  CreateCustomerNoteRequest,
  UpdateCustomerNoteRequest,
  SyncAllFromAccSoftwareResponse,
} from '../types/customer';
import { SyncStatusResponse } from '../types/sync';
import {
  Quarry,
  QuarryReporting,
  QuarrySupplierProduct,
} from '../types/quarry';
import {
  PublicQuoteLinkResponse,
  PublicQuoteDecisionResponse,
  QuotationDTO,
  QuotationLineItem,
  QuotationReporting,
} from '../types/quotation';
import { PostEligibilityCheckResponse } from '../types/eligibility-check';
import { toLocalDateTime } from '../utils/date';
import { convertKeysToCamelCase } from '../utils/case-conversion';
import { normalizeObjectPhoneNumbers } from '../utils/phone-helper';
import { Material } from '../types/material';
import {
  User,
  AccountManager,
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
  TenantInternalDetails,
  TenantLogoUploadResponse,
  TenantLogoResponse,
} from '../types/client';
import { CustomerDeliveryAddress } from '../types/address';
import {
  DocketAssignRequest,
  DocketDTO,
  DocketOperationalUpdateRequest,
  DocketOperationalUpdateResponse,
  DispatchDocketDTO,
  DriverAppAssignedDTO,
  BlockedOperationResponse,
  UnassignOperationResponse,
  ConflictCheckRequest,
  ConflictCheckResponse,
  DocketStatistics,
  DuplicateDocketRequest,
  DuplicateDocketResponse,
  DocketsListResponse,
  DocketsPage,
  DocketsTableResponse,
  UnassignedDocketsPage,
} from '../types/docket';
import {
  JobDTO,
  JobDetails,
  JobItem,
  InvoicesPage,
  CompleteJobResponse,
  SettleJobResponse,
  InvoiceDetails,
  RetrySyncResponse,
  InvoiceUrlResponse,
  JobStatistics,
  CreateInvoiceResponseDTO,
  JobsListResponse,
  DeleteJobItemResponse,
  JobAttachmentDTO,
} from '../types/job';
import type {
  CashSaleDetail,
  PaymentsCashSale,
  PaymentsInternalTransfer,
  PaymentsInvoice,
  PaymentsInvoiceStatistics,
  PaymentsPage,
} from '../types/payments';
import {
  HaulierCreateDTO,
  HaulierDTO,
  HaulierDeleteResponse,
  HaulierStatistics,
  HauliersPage,
} from '../types/haulier';
import { TruckDTO, TruckStatistics } from '../types/truck';
import { ChecklistItemsPage } from '../types/checklist';
import {
  DriverDTO,
  DriverStatistics,
  PatchDriverInfoDTO,
  PatchDriverTypeDTO,
  PatchDriverTrucksDTO,
  PatchDriverHaulierDTO,
  PutDriverDTO,
} from '../types/driver';
import {
  TrackingCategory,
  TrackingCategoryDefinition,
  AccountCode,
  createUpdateTrackingCategory,
  StatusResponseDTO,
  ConnectResponseDTO,
} from '../types/accounting';
import { Department } from '../types/department';
import { ChecklistTemplate } from '../types/checklist-template';
import { ChecklistSubmission } from '../types/checklist-submission';
import {
  FeeRecoverySettingsDto,
  CustomerFeeRecoverySettingsDto,
  FeeRecoveryScreenResponseDto,
  CustomerEffectiveFeeRecoveryDto,
} from '../types/fee-recovery';
import { EFFECTIVE_SOURCE, RECOVERY_MODE } from '../types/fee-recovery-enums';
import {
  PolicyDocumentItem,
  PolicyDocumentMetadata,
  PolicyDocumentViewDTO,
  QuoteTextTemplateResponseDto,
  QuoteTextTemplateRequestDto,
  QuoteExternalLinkResponseDto,
  QuoteExternalLinkRequestDto,
  QuoteEditorContentResponseDto,
  QuoteContentSelectionRequestDto,
  QuoteContentLibraryResponseDto,
} from '../types/terms-conditions';

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
   * @deprecated Unused. Backend datetimes are tenant-local wall-clock strings;
   * the frontend does not normalize them to UTC.
   */
  normalizeUtc?: boolean;

  /**
   * If true, omits the `X-Tenant-ID` and `x-requested-with` headers.
   * Tenant-fusion service does not allow them, so requests to it must
   * opt out while still getting this client's auth + error handling.
   * Default: false.
   */
  omitTenantHeaders?: boolean;

  /**
   * If true, the request is sent without an Authorization header and
   * without requiring a logged-in user. Use for public endpoints that
   * must work for unauthenticated visitors (e.g. token-based quote links).
   * Default: false.
   */
  skipAuth?: boolean;
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
      // x-requested-with is non-simple and triggers a CORS preflight; skip it for services that don't allow it (see omitTenantHeaders).
      ...(config.omitTenantHeaders
        ? {}
        : { 'x-requested-with': 'XMLHttpRequest' }),
    },
  };

  // Public endpoints (e.g. token-based quote links) must work for unauthenticated visitors, so skip the token requirement entirely.
  if (!config.skipAuth) {
    // With the NextAuth proxy approach, the browser sends cookies automatically.
    // The proxy route (app/socoro/quarrylink/api/[...path] or
    // app/quarrylink/tenant-fusion/api/[...path]) extracts the NextAuth session,
    // creates a signed JWT, and forwards the request to the upstream service
    // with the Authorization and X-Tenant-ID headers.
    //
    // We still call getUser()/getTenantId() for backward compatibility, but
    // they are no-ops — the proxy handles auth server-side.
    await getUser();
    const tenantId = await getTenantId();

    // Set a placeholder Authorization header so the APIClient's internal
    // checks pass. The proxy will replace this with the real JWT.
    init.headers = {
      ...init.headers,
      Authorization: 'Bearer proxy-managed',
      // X-Tenant-ID is non-simple and triggers a CORS preflight; omit it for tenant-fusion whose CORS policy rejects it.
      ...(config.omitTenantHeaders ? {} : { 'X-Tenant-ID': tenantId || '' }),
    };
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
      case 403:
        break;
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
    pullFromAccSoftware: () =>
      appClient.Put<PullFromAccSoftwareResponse>(
        `/socoro/quarrylink/api/product/pull-from-acc-software`,
      ),
    getSyncStatus: () =>
      appClient.Get<SyncStatusResponse>(
        `/socoro/quarrylink/api/product/sync-status`,
      ),
    reporting: () =>
      appClient.Get<ProductReporting>(
        `/socoro/quarrylink/api/product/reporting`,
      ),
    getAll: async (params?: {
      materialIds?: number[];
      isActive?: boolean[];
      ids?: number[];
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const isPaginated =
        params?.page !== undefined || params?.pageSize !== undefined;

      const response = await appClient.Get<
        ProductListItem[] | ProductsListResponse | ProductsPage
      >(`/socoro/quarrylink/api/product/material`, {
        queryString: {
          materialIds: params?.materialIds?.map(String),
          isActive: params?.isActive?.map(String),
          ids: params?.ids?.map(String),
          page: params?.page?.toString(),
          pageSize: isPaginated
            ? (params?.pageSize?.toString() ?? '10')
            : (params?.pageSize?.toString() ?? '1000'),
          search: params?.search?.trim() || undefined,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      });
      return response;
    },
    getByIdWithMaterial: (productId: number) =>
      appClient.Get<ProductDetails>(
        `/socoro/quarrylink/api/product/${productId}/material`,
      ),
    getByIdWithQuarrySupplierProduct: (productId: number) =>
      appClient.Get<ProductDetails>(
        `/socoro/quarrylink/api/product/${productId}/quarry-supplier`,
      ),
    getByIdWithQuarrySupplierProductForCustomer: (
      productId: number,
      customerId: number,
    ) =>
      appClient.Get<ProductDetails>(
        `/socoro/quarrylink/api/product/${productId}/${customerId}/quarry-supplier`,
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
      appClient.Delete<PostEligibilityCheckResponse>(
        `/socoro/quarrylink/api/product/${id}/post-eligibility-check`,
      ),
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
    delete: (id: number) =>
      appClient.Delete<PostEligibilityCheckResponse>(
        `/socoro/quarrylink/api/quarries/${id}/post-eligibility-check`,
      ),
    getSuburbs: () =>
      appClient.Get<string[]>(`/socoro/quarrylink/api/quarries/suburbs`),
    deleteProductFromQuarry: (quarryProductPriceId: number) =>
      appClient.Delete(
        `/api/v1/quarries/quarry-product/${quarryProductPriceId}`,
      ),
    linkedProducts: (
      quarryId: number,
      params?: {
        materialIds?: number[];
        isActive?: boolean[];
        page?: number;
        pageSize?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
      },
    ) => {
      const isPaginated =
        params?.page !== undefined || params?.pageSize !== undefined;

      return appClient.Get<ProductsListResponse>(
        `/socoro/quarrylink/api/quarries/${quarryId}/linked-products`,
        {
          queryString: {
            materialIds: params?.materialIds?.map(String),
            isActive: params?.isActive?.map(String),
            page: params?.page?.toString(),
            pageSize: isPaginated
              ? (params?.pageSize?.toString() ?? '10')
              : (params?.pageSize?.toString() ?? '1000'),
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
          },
        },
      );
    },
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
    delete: (quarrySupplierId: number, productId: number) =>
      appClient.Delete<PostEligibilityCheckResponse>(
        `/socoro/quarrylink/api/quarry-products/${quarrySupplierId}/${productId}/post-eligibility-check`,
      ),
  },

  customers: {
    syncAllFromAccSoftware: () =>
      appClient.Put<SyncAllFromAccSoftwareResponse>(
        `/socoro/quarrylink/api/customer/sync-all-from-acc-software`,
      ),
    getSyncStatus: () =>
      appClient.Get<SyncStatusResponse>(
        `/socoro/quarrylink/api/customer/sync-status`,
      ),
    reporting: () =>
      appClient.Get<CustomerReporting>(
        `/socoro/quarrylink/api/customer/reporting`,
      ),
    getAll: async (params?: {
      page?: number;
      pageSize?: number;
      size?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      statuses?: string[];
      types?: string[];
      accountManagerSubs?: string[];
      ids?: number[];
    }) => {
      const isPaginated =
        params?.page !== undefined || params?.pageSize !== undefined;
      const pageSize = params?.pageSize ?? params?.size;

      const response = await appClient.Get<
        CustomerDTO[] | CustomersListResponse | CustomersPage
      >(`/socoro/quarrylink/api/customer`, {
        queryString: {
          page: params?.page?.toString(),
          pageSize: pageSize?.toString(),
          size: isPaginated
            ? (pageSize?.toString() ?? '10')
            : (params?.size?.toString() ?? '1000'),
          search: params?.search?.trim() || undefined,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          statuses: params?.statuses,
          types: params?.types,
          accountManagerSubs: params?.accountManagerSubs,
          ids: params?.ids?.map(String),
        },
      });
      return response;
    },
    getById: (customerId: number) =>
      appClient.Get<CustomerDTO>(
        `/socoro/quarrylink/api/customer/${customerId}`,
      ),
    create: (data: Partial<CustomerDTO>) =>
      appClient.Post<CustomerDTO>('/socoro/quarrylink/api/customer', {
        body: data,
      }),
    update: (data: Partial<CustomerDTO>) =>
      appClient.Post<CustomerDTO>('/socoro/quarrylink/api/customer', {
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
    getAttachments: (customerId: number) =>
      appClient.Get<CustomerAttachmentDTO[]>(
        `/socoro/quarrylink/api/customer/${customerId}/attachments`,
      ),
    uploadAttachment: (
      customerId: number,
      params: { category: string; fileName: string; file: File },
    ) => {
      const formData = new FormData();
      formData.append('file', params.file);
      return appClient.Post<CustomerAttachmentDTO>(
        `/socoro/quarrylink/api/customer/${customerId}/attachments`,
        {
          body: formData,
          queryString: {
            category: params.category,
            fileName: params.fileName,
          },
        },
      );
    },
    getAttachment: async (customerId: number, attachmentId: number) => {
      const response = await appClient.Get<Response>(
        `/socoro/quarrylink/api/customer/${customerId}/attachments/${attachmentId}`,
      );
      return response.blob();
    },
    deleteAttachment: (customerId: number, attachmentId: number) =>
      appClient.Delete(
        `/socoro/quarrylink/api/customer/${customerId}/attachments/${attachmentId}`,
      ),
    getAdditionalContacts: (
      customerId: number,
      params?: { page?: number; pageSize?: number },
    ) =>
      appClient.Get<AdditionalContactsPage>(
        `/socoro/quarrylink/api/customer/${customerId}/additional-contacts`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
          },
        },
      ),
    getAdditionalContact: (customerId: number, contactId: number) =>
      appClient.Get<AdditionalContactApiDTO>(
        `/socoro/quarrylink/api/customer/${customerId}/additional-contacts/${contactId}`,
      ),
    createAdditionalContact: (
      customerId: number,
      data: Omit<AdditionalContactApiDTO, 'id'>,
    ) =>
      appClient.Post<AdditionalContactApiDTO>(
        `/socoro/quarrylink/api/customer/${customerId}/additional-contacts`,
        { body: data },
      ),
    updateAdditionalContact: (
      customerId: number,
      contactId: number,
      data: Omit<AdditionalContactApiDTO, 'id'>,
    ) =>
      appClient.Put<AdditionalContactApiDTO>(
        `/socoro/quarrylink/api/customer/${customerId}/additional-contacts/${contactId}`,
        { body: data },
      ),
    deleteAdditionalContact: (customerId: number, contactId: number) =>
      appClient.Delete(
        `/socoro/quarrylink/api/customer/${customerId}/additional-contacts/${contactId}`,
      ),
    getNotes: (
      customerId: number,
      params?: { page?: number; pageSize?: number },
    ) =>
      appClient.Get<CustomerNotesPage>(
        `/socoro/quarrylink/api/customer/${customerId}/notes`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
          },
        },
      ),
    createNote: (customerId: number, data: CreateCustomerNoteRequest) =>
      appClient.Post<CustomerNoteDTO>(
        `/socoro/quarrylink/api/customer/${customerId}/notes`,
        { body: data },
      ),
    updateNote: (
      customerId: number,
      noteId: number,
      data: UpdateCustomerNoteRequest,
    ) =>
      appClient.Put<CustomerNoteDTO>(
        `/socoro/quarrylink/api/customer/${customerId}/notes/${noteId}`,
        { body: data },
      ),
    deleteNote: (customerId: number, noteId: number) =>
      appClient.Delete(
        `/socoro/quarrylink/api/customer/${customerId}/notes/${noteId}`,
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
    getByPublicLinkToken: (token: string) =>
      appClient.Get<PublicQuoteLinkResponse>(
        `/socoro/quarrylink/api/quote/public/link`,
        { queryString: { token }, skipAuth: true },
      ),
    updatePublicQuoteStatus: (
      status: 'APPROVED' | 'DECLINED',
      token: string,
      declineReason?: string,
      decisionMakerName?: string,
      poNumber?: string,
    ) => {
      // PO Number is mandatory when a customer approves via this public endpoint (QLINK-3356).
      if (status === 'APPROVED' && !poNumber?.trim()) {
        throw new Error('Purchase Order Number is required to approve this quote.');
      }

      const body: {
        status: string;
        declineReason?: string;
        decisionMakerName?: string;
        poNumber?: string;
      } = { status };
      if (status === 'DECLINED' && declineReason) {
        body.declineReason = declineReason;
      }
      if (decisionMakerName !== undefined) {
        body.decisionMakerName = decisionMakerName;
      }
      if (status === 'APPROVED' && poNumber !== undefined) {
        body.poNumber = poNumber;
      }

      return appClient.Put<PublicQuoteDecisionResponse>(
        `/socoro/quarrylink/api/quote/public/link/decision`,
        { body, queryString: { token }, skipAuth: true },
      );
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
          pageSize: params?.pageSize?.toString() || '1000',
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
        body: data,
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
      poNumber?: string,
    ) => {
      const body: {
        status: string;
        declineReason?: string;
        decisionMakerName?: string;
        poNumber?: string;
      } = { status };
      if (status === 'DECLINED' && declineReason) {
        body.declineReason = declineReason;
      }
      if (decisionMakerName !== undefined) {
        body.decisionMakerName = decisionMakerName;
      }
      if (status === 'APPROVED' && poNumber !== undefined) {
        body.poNumber = poNumber;
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
      size?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      statuses?: string[];
      types?: string[];
      customerIds?: number[];
      productIds?: number[];
      ids?: number[];
    }) => {
      const isPaginated =
        params?.page !== undefined || params?.pageSize !== undefined;
      const pageSize = params?.pageSize ?? params?.size;

      const response = await appClient.Get<DocketsListResponse>(
        `/socoro/quarrylink/api/dockets`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: pageSize?.toString(),
            size: isPaginated
              ? (pageSize?.toString() ?? '10')
              : (params?.size?.toString() ?? '1000'),
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            statuses: params?.statuses,
            types: params?.types,
            customerIds: params?.customerIds?.map(String),
            productIds: params?.productIds?.map(String),
            ids: params?.ids?.map(String),
          },
        },
      );
      return response;
    },
    /** Flat table projection for the customer-operations dockets page. */
    getTable: async (params?: {
      page?: number;
      pageSize?: number;
      size?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      statuses?: string[];
      types?: string[];
      customerIds?: number[];
      productIds?: number[];
      ids?: number[];
    }) => {
      const isPaginated =
        params?.page !== undefined || params?.pageSize !== undefined;
      const pageSize = params?.pageSize ?? params?.size;

      const response = await appClient.Get<DocketsTableResponse>(
        `/socoro/quarrylink/api/dockets/table`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: pageSize?.toString(),
            size: isPaginated
              ? (pageSize?.toString() ?? '10')
              : (params?.size?.toString() ?? '1000'),
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            statuses: params?.statuses,
            types: params?.types,
            customerIds: params?.customerIds?.map(String),
            productIds: params?.productIds?.map(String),
            ids: params?.ids?.map(String),
          },
        },
      );
      return response;
    },
    /** Paginated unassigned dockets for dispatch all-dates queue. */
    getUnassignedAll: async (params?: {
      page?: number;
      pageSize?: number;
      size?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      sort?: string[];
    }) => {
      const pageSize = params?.pageSize ?? params?.size;

      return appClient.Get<UnassignedDocketsPage>(
        `/socoro/quarrylink/api/dockets/unassigned-dockets`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: pageSize?.toString(),
            size: pageSize?.toString(),
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            sort: params?.sort,
          },
        },
      );
    },
    getByJobId: async (
      jobId: number,
      params?: {
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        page?: number;
        pageSize?: number;
        size?: number;
        customerIds?: number[];
        productIds?: number[];
        statuses?: string[];
        types?: string[];
      },
    ) => {
      const isPaginated =
        params?.page !== undefined || params?.pageSize !== undefined;
      const pageSize = params?.pageSize ?? params?.size;
      const response = await appClient.Get<DocketsListResponse>(
        `/socoro/quarrylink/api/dockets/job/${jobId}`,
        {
          queryString: {
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            page: params?.page?.toString(),
            pageSize: pageSize?.toString(),
            size: isPaginated
              ? (pageSize?.toString() ?? '10')
              : (params?.size?.toString() ?? '1000'),
            customerIds: params?.customerIds?.map(String),
            productIds: params?.productIds?.map(String),
            statuses: params?.statuses,
            types: params?.types,
          },
        },
      );
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
    conflictCheck: (id: number, data: ConflictCheckRequest) =>
      appClient.Post<ConflictCheckResponse>(
        `/socoro/quarrylink/api/dockets/${id}/conflict-check`,
        { body: data },
      ),
    statistics: (date: string) =>
      appClient.Get<DocketStatistics>(
        `/socoro/quarrylink/api/dockets/statistics`,
        {
          queryString: { date },
        },
      ),
    duplicate: (id: number, data: DuplicateDocketRequest) =>
      appClient.Post<DuplicateDocketResponse>(
        `/socoro/quarrylink/api/dockets/${id}/duplicate`,
        { body: data },
      ),
    getDocketsByTruckId: async (
      truckId: number,
      params?: {
        page?: number;
        pageSize?: number;
        size?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        statuses?: string[];
        types?: string[];
        customerIds?: number[];
        productIds?: number[];
        ids?: number[];
      },
    ) => {
      const isPaginated =
        params?.page !== undefined || params?.pageSize !== undefined;
      const pageSize = params?.pageSize ?? params?.size;

      return appClient.Get<DocketDTO[] | DocketsListResponse | DocketsPage>(
        `/socoro/quarrylink/api/dockets/truck/${truckId}`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: pageSize?.toString(),
            size: isPaginated
              ? (pageSize?.toString() ?? '10')
              : (params?.size?.toString() ?? '1000'),
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            statuses: params?.statuses,
            types: params?.types,
            customerIds: params?.customerIds?.map(String),
            productIds: params?.productIds?.map(String),
            ids: params?.ids?.map(String),
          },
        },
      );
    },
    getDocketsByDriverId: async (
      driverId: number,
      params?: {
        page?: number;
        pageSize?: number;
        size?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        statuses?: string[];
        types?: string[];
        customerIds?: number[];
        productIds?: number[];
        ids?: number[];
      },
    ) => {
      const isPaginated =
        params?.page !== undefined || params?.pageSize !== undefined;
      const pageSize = params?.pageSize ?? params?.size;

      return appClient.Get<DocketDTO[] | DocketsListResponse | DocketsPage>(
        `/socoro/quarrylink/api/dockets/driver/${driverId}`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: pageSize?.toString(),
            size: isPaginated
              ? (pageSize?.toString() ?? '10')
              : (params?.size?.toString() ?? '1000'),
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            statuses: params?.statuses,
            types: params?.types,
            customerIds: params?.customerIds?.map(String),
            productIds: params?.productIds?.map(String),
            ids: params?.ids?.map(String),
          },
        },
      );
    },
  },

  checklists: {
    getTruckTemplate: (truckType?: string) =>
      appClient.Get<ChecklistTemplate>(
        `/socoro/quarrylink/api/checklists/truck/template`,
        { queryString: truckType ? { truckType } : undefined },
      ),
    getDriverTemplate: () =>
      appClient.Get<ChecklistTemplate>(
        `/socoro/quarrylink/api/checklists/driver/template`,
      ),
    getTruckSubmission: (submissionId: number) =>
      appClient.Get<ChecklistSubmission>(
        `/socoro/quarrylink/api/checklists/truck-submissions/${submissionId}`,
      ),
    getDriverSubmission: (submissionId: number) =>
      appClient.Get<ChecklistSubmission>(
        `/socoro/quarrylink/api/checklists/driver-submissions/${submissionId}`,
      ),
    submit: (formData: FormData) =>
      appClient.Post<ChecklistSubmission>(`/socoro/quarrylink/api/checklists`, {
        body: formData,
      }),
  },

  users: {
    getAll: () => appClient.Get<User[]>(`/socoro/quarrylink/api/users`),
    getAccountManagers: () =>
      appClient.Get<AccountManager[]>(
        `/socoro/quarrylink/api/users/account-managers`,
      ),
    getOperations: () =>
      appClient.Get<AccountManager[]>(
        `/socoro/quarrylink/api/users/operations`,
      ),
    addToOperations: (id: string) =>
      appClient.Post(
        `/socoro/quarrylink/api/users/${id}/notification-groups/operations`,
      ),
    removeFromOperations: (id: string) =>
      appClient.Delete(
        `/socoro/quarrylink/api/users/${id}/notification-groups/operations`,
      ),
    getVoidTransactions: () =>
      appClient.Get<AccountManager[]>(
        `/socoro/quarrylink/api/users/void-transactions`,
      ),
    addToVoidTransactions: (id: string) =>
      appClient.Post(
        `/socoro/quarrylink/api/users/${id}/permission-groups/void-transactions`,
      ),
    removeFromVoidTransactions: (id: string) =>
      appClient.Delete(
        `/socoro/quarrylink/api/users/${id}/permission-groups/void-transactions`,
      ),
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
      statuses?: string[];
      customerIds?: number[];
      accountManagerSubs?: string[];
      quarrySupplierIds?: number[];
      poNumbers?: string[];
      ids?: number[];
    }) => {
      const response = await appClient.Get<JobsListResponse>(
        `/socoro/quarrylink/api/job`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            statuses: params?.statuses,
            customerIds: params?.customerIds?.map(String),
            accountManagerSubs: params?.accountManagerSubs,
            quarrySupplierIds: params?.quarrySupplierIds?.map(String),
            poNumbers: params?.poNumbers,
            ids: params?.ids?.map(String),
          },
        },
      );
      return response;
    },
    searchPurchaseOrders: async (search?: string, limit = 50) => {
      const response = await appClient.Get<string[]>(
        `/socoro/quarrylink/api/job/purchase-orders`,
        {
          queryString: {
            search: search?.trim() || undefined,
            limit: String(limit),
          },
        },
      );
      return response;
    },
    getJobItems: async (
      jobId: number,
      params?: {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortOrder?: string;
      },
    ) => {
      const response = await appClient.Get<JobDetails>(
        `/socoro/quarrylink/api/job/${jobId}/job-items`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
          },
        },
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
      return appClient.Delete<DeleteJobItemResponse>(
        `/socoro/quarrylink/api/job-items/${id}`,
      );
    },
    pause: (
      id: number,
      deliveryPauseStrategy:
        | 'STOP_ALL_DELIVERY_DOCKETS'
        | 'ALLOW_DRIVERS_TO_COMPLETE',
      collectionPauseStrategy:
        | 'STOP_ACTIVE_COLLECTION_DOCKETS'
        | 'ALLOW_ACTIVE_COLLECTIONS_TO_COMPLETE',
    ) =>
      appClient.Put<JobDTO>(`/socoro/quarrylink/api/job/${id}/pause`, {
        body: { deliveryPauseStrategy, collectionPauseStrategy },
      }),
    resume: (id: number) =>
      appClient.Put<JobDTO>(`/socoro/quarrylink/api/job/${id}/resume`, {
        body: { id },
      }),
    settle: (id: number) =>
      appClient.Put<SettleJobResponse>(
        `/socoro/quarrylink/api/job/${id}/settle`,
      ),
    complete: (id: number) =>
      appClient.Put<CompleteJobResponse>(
        `/socoro/quarrylink/api/job/${id}/complete`,
      ),
    statistics: () =>
      appClient.Get<JobStatistics>(`/socoro/quarrylink/api/job/statistics`),
    getInternalTransfers: async (params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      statuses?: string[];
    }) => {
      return appClient.Get<JobsListResponse>(
        `/socoro/quarrylink/api/job/internal-transfers`,
        {
          queryString: {
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
            search: params?.search?.trim() || undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            statuses: params?.statuses,
          },
        },
      );
    },
    createInternalTransfer: (data: {
      fromSiteId: number;
      toSiteId: number;
      notes?: string;
    }) =>
      appClient.Post<JobDTO>(`/socoro/quarrylink/api/job/internal-transfers`, {
        body: data,
      }),
    updateInternalTransfer: (
      id: number,
      data: {
        version: number;
        fromSiteId?: number;
        toSiteId?: number;
        notes?: string;
      },
    ) =>
      appClient.Put<JobDTO>(
        `/socoro/quarrylink/api/job/internal-transfers/${id}`,
        { body: data },
      ),
    createInternalTransferJobItem: (
      jobId: number,
      data: { productId: number; quantity: number },
    ) =>
      appClient.Post<JobItem>(
        `/socoro/quarrylink/api/job/internal-transfers/${jobId}/items`,
        { body: data },
      ),
    getAttachments: (jobId: number) =>
      appClient.Get<JobAttachmentDTO[]>(
        `/socoro/quarrylink/api/job/${jobId}/attachments`,
      ),
    uploadAttachment: (
      jobId: number,
      params: { category: string; fileName: string; file: File },
    ) => {
      const formData = new FormData();
      formData.append('file', params.file);
      return appClient.Post<JobAttachmentDTO>(
        `/socoro/quarrylink/api/job/${jobId}/attachments`,
        {
          body: formData,
          queryString: {
            category: params.category,
            fileName: params.fileName,
          },
        },
      );
    },
    getAttachment: async (jobId: number, attachmentId: number) => {
      const response = await appClient.Get<Response>(
        `/socoro/quarrylink/api/job/${jobId}/attachments/${attachmentId}`,
      );
      return response.blob();
    },
    deleteAttachment: (jobId: number, attachmentId: number) =>
      appClient.Delete(
        `/socoro/quarrylink/api/job/${jobId}/attachments/${attachmentId}`,
      ),
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
      appClient.Delete<UnassignOperationResponse>(
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
      appClient.Delete<BlockedOperationResponse>(
        `/socoro/quarrylink/api/driver/${id}`,
      ),
    deactivate: (id: number) =>
      appClient.Patch<BlockedOperationResponse>(
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
    statistics: () =>
      appClient.Get<DriverStatistics>(
        `/socoro/quarrylink/api/driver/statistics`,
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
      appClient.Delete<BlockedOperationResponse>(
        `/socoro/quarrylink/api/truck/${id}`,
      ),
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
      appClient.Delete<UnassignOperationResponse>(
        `/socoro/quarrylink/api/truck/${truckId}/driver`,
        {
          body: data,
        },
      ),
    deactivate: (id: number) =>
      appClient.Patch<BlockedOperationResponse>(
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
    getDockets: (id: number) =>
      appClient.Get<TruckDTO>(`/socoro/quarrylink/api/truck/${id}/docket`),
    statistics: () =>
      appClient.Get<TruckStatistics>(`/socoro/quarrylink/api/truck/statistics`),
  },

  hauliers: {
    create: (data: HaulierCreateDTO) =>
      appClient.Post<HaulierDTO>('/socoro/quarrylink/api/haulier', {
        body: data,
      }),
    getAll: (params?: {
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      pageSize?: number;
    }) =>
      appClient.Get<HauliersPage>('/socoro/quarrylink/api/haulier', {
        queryString: {
          search: params?.search?.trim() || undefined,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          page: params?.page?.toString(),
          pageSize: params?.pageSize?.toString(),
        },
      }),
    getById: (id: number) =>
      appClient.Get<HaulierDTO>(`/socoro/quarrylink/api/haulier/${id}`),
    update: (id: number, data: HaulierCreateDTO) =>
      appClient.Patch<HaulierDTO>(`/socoro/quarrylink/api/haulier/${id}`, {
        body: data,
      }),
    getStatistics: () =>
      appClient.Get<HaulierStatistics>(
        '/socoro/quarrylink/api/haulier/statistics',
      ),
    delete: (id: number) =>
      appClient.Delete<HaulierDeleteResponse>(
        `/socoro/quarrylink/api/haulier/${id}`,
      ),
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
    getTenantInternalDetails: async () => {
      const tenantId = await getTenantId();
      return appClient.Get<TenantInternalDetails>(
        `/quarrylink/tenant-fusion/api/tenants/internal/${tenantId}`,
        { omitTenantHeaders: true },
      );
    },
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
      const tenantId = await getTenantId();
      return appClient.Post<ConnectResponseDTO>(
        `/quarrylink/tenant-fusion/api/xero/internal/connect`,
        {
          body: { tenantId, userEmail },
          omitTenantHeaders: true,
        },
      );
    },
    getStatus: async () => {
      const tenantId = await getTenantId();
      return appClient.Get<StatusResponseDTO>(
        `/quarrylink/tenant-fusion/api/xero/internal/${tenantId}/status`,
        { omitTenantHeaders: true },
      );
    },
  },

  myobBusiness: {
    connect: async (userEmail: string) => {
      const tenantId = await getTenantId();
      return appClient.Post<ConnectResponseDTO>(
        `/quarrylink/tenant-fusion/api/myob-business/internal/connect`,
        {
          body: { tenantId, userEmail },
          omitTenantHeaders: true,
        },
      );
    },
    getStatus: async () => {
      const tenantId = await getTenantId();
      return appClient.Get<StatusResponseDTO>(
        `/quarrylink/tenant-fusion/api/myob-business/internal/${tenantId}/status`,
        { omitTenantHeaders: true },
      );
    },
  },

  myobAcumatica: {
    connect: async (userEmail: string) => {
      const tenantId = await getTenantId();
      return appClient.Post<ConnectResponseDTO>(
        `/quarrylink/tenant-fusion/api/myob-acumatica/internal/connect`,
        { body: { tenantId, userEmail }, omitTenantHeaders: true },
      );
    },
    getStatus: async () => {
      const tenantId = await getTenantId();
      return appClient.Get<StatusResponseDTO>(
        `/quarrylink/tenant-fusion/api/myob-acumatica/internal/${tenantId}/status`,
        { omitTenantHeaders: true },
      );
    },
    disconnect: async () => {
      const tenantId = await getTenantId();
      return appClient.Post<void>(
        `/quarrylink/tenant-fusion/api/myob-acumatica/internal/${tenantId}/disconnect`,
        { body: {}, omitTenantHeaders: true },
      );
    },
  },

  payments: {
    cashSales: (params?: {
      search?: string;
      fromDate?: string;
      toDate?: string;
      failedOnly?: boolean;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      pageSize?: number;
    }) =>
      appClient.Get<PaymentsPage<PaymentsCashSale>>(
        `/socoro/quarrylink/api/payments/cash-sales`,
        {
          queryString: {
            search: params?.search?.trim() || undefined,
            fromDate: params?.fromDate,
            toDate: params?.toDate,
            failedOnly: params?.failedOnly ? 'true' : undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
          },
        },
      ),
    internalTransfers: (params?: {
      search?: string;
      fromDate?: string;
      toDate?: string;
      failedOnly?: boolean;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      pageSize?: number;
    }) =>
      appClient.Get<PaymentsPage<PaymentsInternalTransfer>>(
        `/socoro/quarrylink/api/payments/internal-transfers`,
        {
          queryString: {
            search: params?.search?.trim() || undefined,
            fromDate: params?.fromDate,
            toDate: params?.toDate,
            failedOnly: params?.failedOnly ? 'true' : undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
          },
        },
      ),
    failedCount: () =>
      appClient.Get<{ failedCount: number }>(
        `/socoro/quarrylink/api/payments/failed-count`,
      ),
    retryInternalTransferJournal: (journalId: number) =>
      appClient.Put<void>(
        `/socoro/quarrylink/api/payments/internal-transfers/journals/${journalId}/retry`,
      ),
    cashSalesByJob: (jobId: number) =>
      appClient.Get<PaymentsCashSale[]>(
        `/socoro/quarrylink/api/payments/jobs/${jobId}/cash-sales`,
      ),
    cashSale: (id: number) =>
      appClient.Get<CashSaleDetail>(
        `/socoro/quarrylink/api/payments/cash-sales/${id}`,
      ),
    createCashSale: (data: { docketIds: number[]; paymentType: string }) =>
      appClient.Post<CashSaleDetail>(
        `/socoro/quarrylink/api/payments/cash-sales`,
        { body: data },
      ),
    amendCashSalePaymentType: (id: number, paymentType: string) =>
      appClient.Put<CashSaleDetail>(
        `/socoro/quarrylink/api/payments/cash-sales/${id}/payment-type`,
        { body: { paymentType } },
      ),
    voidCashSale: (
      id: number,
      data: { reason: string; reasonDetail?: string },
    ) =>
      appClient.Post<CashSaleDetail>(
        `/socoro/quarrylink/api/payments/cash-sales/${id}/void`,
        { body: data },
      ),
    retryCashSale: (id: number) =>
      appClient.Put<void>(
        `/socoro/quarrylink/api/payments/cash-sales/${id}/retry`,
      ),
    cashSaleByDocket: (docketId: number) =>
      appClient.Get<CashSaleDetail>(
        `/socoro/quarrylink/api/payments/dockets/${docketId}/cash-sale`,
      ),
  },

  invoices: {
    pullFromAccSoftware: () =>
      appClient.Put<PullFromAccSoftwareResponse>(
        `/socoro/quarrylink/api/invoices/pull-from-acc-software`,
      ),
    getAll: (
      jobId: number,
      params?: {
        sortBy?: string;
        sortOrder?: string;
        page?: number;
        pageSize?: number;
      },
    ) =>
      appClient.Get<InvoicesPage>(
        `/socoro/quarrylink/api/invoices/jobs/${jobId}`,
        {
          queryString: {
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
          },
        },
      ),
    getById: (invoiceId: number) =>
      appClient.Get<InvoiceDetails>(
        `/socoro/quarrylink/api/invoices/${invoiceId}`,
      ),
    create: (data: {
      mode: 'INDIVIDUAL' | 'BULK';
      docketIds: number[];
      inclDeliveryCost: boolean;
    }) =>
      appClient.Post<CreateInvoiceResponseDTO>(
        `/socoro/quarrylink/api/invoices`,
        { body: data },
      ),
    listPayments: (params?: {
      search?: string;
      fromDate?: string;
      toDate?: string;
      failedOnly?: boolean;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      pageSize?: number;
    }) =>
      appClient.Get<PaymentsPage<PaymentsInvoice>>(
        `/socoro/quarrylink/api/invoices`,
        {
          queryString: {
            search: params?.search?.trim() || undefined,
            fromDate: params?.fromDate,
            toDate: params?.toDate,
            failedOnly: params?.failedOnly ? 'true' : undefined,
            sortBy: params?.sortBy,
            sortOrder: params?.sortOrder,
            page: params?.page?.toString(),
            pageSize: params?.pageSize?.toString(),
          },
        },
      ),
    statistics: () =>
      appClient.Get<PaymentsInvoiceStatistics>(
        `/socoro/quarrylink/api/invoices/statistics`,
      ),
    retryOne: (invoiceId: number) =>
      appClient.Put<RetrySyncResponse>(
        `/socoro/quarrylink/api/invoices/${invoiceId}/retry`,
      ),
    retrySync: (jobId: number) =>
      appClient.Put<RetrySyncResponse>(
        `/socoro/quarrylink/api/invoices/retry/jobs/${jobId}`,
      ),
    getUrl: (invoiceId: number) =>
      appClient.Get<InvoiceUrlResponse>(
        `/socoro/quarrylink/api/invoices/${invoiceId}/url`,
      ),
    getPdf: async (invoiceId: number) => {
      const response = await appClient.Get<Response>(
        `/socoro/quarrylink/api/invoices/${invoiceId}/pdf`,
      );
      return response.blob();
    },
  },

  driverApp: {
    getAssignedDockets: () =>
      appClient.Get<DriverAppAssignedDTO>(
        `/socoro/quarrylink/api/driver-app/assigned`,
      ),
    getAssignedDocketById: (docketId: number) =>
      appClient.Get<DocketDTO>(`/socoro/quarrylink/api/driver-app/${docketId}`),
    operationalUpdate: (id: number, data: DocketOperationalUpdateRequest) =>
      appClient.Put<DocketOperationalUpdateResponse>(
        `/socoro/quarrylink/api/driver-app/${id}/operational-update`,
        { body: data },
      ),
    updateDocketStatus: (id: number, formData: FormData) =>
      appClient.Put<DocketDTO>(
        `/socoro/quarrylink/api/driver-app/${id}/status`,
        { body: formData },
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

  accounting: {
    getTrackingCategories: () =>
      appClient.Get<TrackingCategory[]>(
        `/socoro/quarrylink/api/accounting/tracking-categories`,
      ),
    getTrackingCategoriesDefinitions: () =>
      appClient.Get<TrackingCategoryDefinition[]>(
        `/socoro/quarrylink/api/accounting/tracking-categories/definitions`,
      ),
    createTrackingCategory: (data: createUpdateTrackingCategory) =>
      appClient.Post<TrackingCategory>(
        `/socoro/quarrylink/api/accounting/tracking-categories`,
        { body: data },
      ),
    updateTrackingCategory: (id: number, data: createUpdateTrackingCategory) =>
      appClient.Put<TrackingCategory>(
        `/socoro/quarrylink/api/accounting/tracking-categories/${id}`,
        { body: data },
      ),
    deleteTrackingCategory: (id: number) =>
      appClient.Delete<TrackingCategory>(
        `/socoro/quarrylink/api/accounting/tracking-categories/${id}`,
      ),
    getAccountCodes: () =>
      appClient.Get<AccountCode[]>(
        `/socoro/quarrylink/api/accounting/account-codes`,
      ),
    getAccountCodeById: (id: number) =>
      appClient.Get<AccountCode>(
        `/socoro/quarrylink/api/accounting/account-codes/${id}`,
      ),
    createAccountCode: (data: AccountCode) =>
      appClient.Post<AccountCode>(
        `/socoro/quarrylink/api/accounting/account-codes`,
        { body: data },
      ),
    updateAccountCode: (id: number, data: AccountCode) =>
      appClient.Put<AccountCode>(
        `/socoro/quarrylink/api/accounting/account-codes/${id}`,
        { body: data },
      ),
    deleteAccountCode: (id: number) =>
      appClient.Delete<AccountCode>(
        `/socoro/quarrylink/api/accounting/account-codes/${id}`,
      ),
  },
  departments: {
    getDepartments: () =>
      appClient.Get<Department[]>(`/socoro/quarrylink/api/departments`),
    createDepartment: (data: Department) =>
      appClient.Post<Department>(`/socoro/quarrylink/api/departments`, {
        body: data,
      }),
    updateDepartment: (id: number, data: Department) =>
      appClient.Put<Department>(`/socoro/quarrylink/api/departments/${id}`, {
        body: data,
      }),
    deleteDepartment: (id: number) =>
      appClient.Delete<Department>(`/socoro/quarrylink/api/departments/${id}`),
  },

  policyDocuments: {
    getAll: () =>
      appClient.Get<PolicyDocumentItem[]>(
        `/socoro/quarrylink/api/quote-content-library/policy-document`,
      ),
    create: (metadata: PolicyDocumentMetadata, file: File) => {
      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
      );
      formData.append('file', file);
      return appClient.Post<PolicyDocumentItem>(
        `/socoro/quarrylink/api/quote-content-library/policy-document`,
        { body: formData },
      );
    },
    update: (id: number, metadata: PolicyDocumentMetadata, file: File) => {
      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
      );
      formData.append('file', file);
      return appClient.Put<PolicyDocumentItem>(
        `/socoro/quarrylink/api/quote-content-library/policy-document/${id}`,
        { body: formData },
      );
    },
    delete: (id: number) =>
      appClient.Delete(
        `/socoro/quarrylink/api/quote-content-library/policy-document/${id}`,
      ),
    view: (id: number) =>
      appClient.Get<PolicyDocumentViewDTO>(
        `/socoro/quarrylink/api/quote-content-library/policy-document/${id}/view`,
      ),
  },

  textTemplates: {
    getAll: () =>
      appClient.Get<QuoteTextTemplateResponseDto[]>(
        `/socoro/quarrylink/api/quote-content-library/text-template`,
      ),
    getById: (id: number) =>
      appClient.Get<QuoteTextTemplateResponseDto>(
        `/socoro/quarrylink/api/quote-content-library/text-template/${id}`,
      ),
    create: (data: QuoteTextTemplateRequestDto) =>
      appClient.Post<QuoteTextTemplateResponseDto>(
        `/socoro/quarrylink/api/quote-content-library/text-template`,
        { body: data },
      ),
    update: (id: number, data: QuoteTextTemplateRequestDto) =>
      appClient.Put<QuoteTextTemplateResponseDto>(
        `/socoro/quarrylink/api/quote-content-library/text-template/${id}`,
        { body: data },
      ),
    delete: (id: number) =>
      appClient.Delete(
        `/socoro/quarrylink/api/quote-content-library/text-template/${id}`,
      ),
  },

  externalLinks: {
    getAll: () =>
      appClient.Get<QuoteExternalLinkResponseDto[]>(
        `/socoro/quarrylink/api/quote-content-library/external-link`,
      ),
    getById: (id: number) =>
      appClient.Get<QuoteExternalLinkResponseDto>(
        `/socoro/quarrylink/api/quote-content-library/external-link/${id}`,
      ),
    create: (data: QuoteExternalLinkRequestDto) =>
      appClient.Post<QuoteExternalLinkResponseDto>(
        `/socoro/quarrylink/api/quote-content-library/external-link`,
        { body: data },
      ),
    update: (id: number, data: QuoteExternalLinkRequestDto) =>
      appClient.Put<QuoteExternalLinkResponseDto>(
        `/socoro/quarrylink/api/quote-content-library/external-link/${id}`,
        { body: data },
      ),
    delete: (id: number) =>
      appClient.Delete(
        `/socoro/quarrylink/api/quote-content-library/external-link/${id}`,
      ),
  },

  quoteEditorContent: {
    get: (quoteId: number) =>
      appClient.Get<QuoteEditorContentResponseDto>(
        `/socoro/quarrylink/api/quote/${quoteId}/content`,
      ),
    update: (quoteId: number, data: QuoteContentSelectionRequestDto) =>
      appClient.Put<QuoteEditorContentResponseDto>(
        `/socoro/quarrylink/api/quote/${quoteId}/content`,
        { body: data },
      ),
  },

  quoteContentLibrary: {
    getAll: (params?: { sortBy?: string; direction?: string }) =>
      appClient.Get<QuoteContentLibraryResponseDto>(
        `/socoro/quarrylink/api/quote-content-library`,
        {
          queryString: {
            sortBy: params?.sortBy,
            direction: params?.direction,
          },
        },
      ),
  },
  feeRecovery: {
    getScreen: (params?: {
      page?: number;
      size?: number;
      sort?: string[];
      search?: string;
      effectiveSource?: EFFECTIVE_SOURCE;
      recoveryMode?: RECOVERY_MODE;
    }) =>
      appClient.Get<FeeRecoveryScreenResponseDto>(
        `/socoro/quarrylink/api/fee-recovery`,
        {
          queryString: {
            page: params?.page?.toString(),
            size: params?.size?.toString(),
            sort: params?.sort?.join(','),
            search: params?.search?.trim() || undefined,
            effectiveSource: params?.effectiveSource,
            recoveryMode: params?.recoveryMode,
          },
        },
      ),
    getSettings: () =>
      appClient.Get<FeeRecoverySettingsDto>(
        `/socoro/quarrylink/api/fee-recovery/settings`,
      ),
    updateSettings: (
      data: Pick<
        FeeRecoverySettingsDto,
        'recoveryMode' | 'feeAmount' | 'invoiceLineDescription'
      >,
    ) =>
      appClient.Put<FeeRecoverySettingsDto>(
        `/socoro/quarrylink/api/fee-recovery/settings`,
        { body: data },
      ),
    getCustomerOverride: (customerId: number) =>
      appClient.Get<CustomerFeeRecoverySettingsDto>(
        `/socoro/quarrylink/api/fee-recovery/customer-overrides/${customerId}`,
      ),
    updateCustomerOverride: (
      customerId: number,
      data: Pick<
        FeeRecoverySettingsDto,
        'recoveryMode' | 'feeAmount' | 'invoiceLineDescription'
      >,
    ) =>
      appClient.Put<CustomerFeeRecoverySettingsDto>(
        `/socoro/quarrylink/api/fee-recovery/customer-overrides/${customerId}`,
        { body: data },
      ),
    deleteCustomerOverride: (customerId: number) =>
      appClient.Delete(
        `/socoro/quarrylink/api/fee-recovery/customer-overrides/${customerId}`,
      ),
    getCustomerEffective: (customerId: number) =>
      appClient.Get<CustomerEffectiveFeeRecoveryDto>(
        `/socoro/quarrylink/api/fee-recovery/customers/${customerId}/effective`,
      ),
  },
};
