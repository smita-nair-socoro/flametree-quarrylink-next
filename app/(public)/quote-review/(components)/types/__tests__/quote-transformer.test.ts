import { describe, expect, test } from 'vitest';
import {
  mapQuoteContent,
  buildQuoteCurrencyTax,
  transformQuoteData,
} from '../quote-transformer';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import { getCurrencySymbol } from '@/lib/utils/tenant-config-helper';
import { CUSTOMER_TYPE, CUSTOMER_STATUS } from '@/lib/types/customer-enums';
import {
  QUOTE_STATUS as QuoteStatus,
  QUOTE_ITEM_TYPE as QuoteItemType,
} from '@/lib/types/quotation-enums';
import type {
  QuoteContent,
  PublicQuoteLinkResponse,
  QuotePreviewDto,
  QuotePreviewCustomerDTO,
  QuotePreviewLineItem,
  TenantProfileSnapshot,
} from '@/lib/types/quotation';
import type { Address } from '@/lib/types/address';
import {
  RECOVERY_MODE,
  EFFECTIVE_SOURCE,
} from '@/lib/types/fee-recovery-enums';

// Mirrors the shape the backend returns from GET /quote/{id}/preview and
// /quote/public/link's `content.items`, used to debug why items selected
// in the quote editor weren't showing up on the public quote-review page.
const sampleContent: QuoteContent = {
  customerNotesHtml: 'Line one\nLine two',
  items: [
    {
      contentType: QuoteSettingItemType.POLICY_DOCUMENT,
      name: 'Standard Supply Policy',
      sortOrder: 0,
      originalFileName: 'standard-supply-policy.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 248320,
      viewUrl: 'https://example.com/policy.pdf',
    },
    {
      contentType: QuoteSettingItemType.EXTERNAL_LINK,
      name: 'Credit Policy (SharePoint)',
      sortOrder: 1,
      externalUrl: 'https://company.sharepoint.com/sites/policies/credit-policy',
      externalLinkText: 'Credit Policy (SharePoint)',
    },
    {
      contentType: QuoteSettingItemType.TEXT_TEMPLATE,
      name: 'Standard Supply Terms',
      sortOrder: 2,
      contentHtml: '<p><strong>Prices quoted</strong> are valid...</p>',
    },
  ],
};

describe('mapQuoteContent', () => {
  test('splits notes on newlines', () => {
    const { notes } = mapQuoteContent(sampleContent);
    expect(notes).toEqual(['Line one', 'Line two']);
  });

  test('routes TEXT_TEMPLATE items into terms', () => {
    const { terms } = mapQuoteContent(sampleContent);
    expect(terms).toEqual([
      {
        id: expect.any(String),
        name: 'Standard Supply Terms',
        content: '<p><strong>Prices quoted</strong> are valid...</p>',
      },
    ]);
  });

  test('routes EXTERNAL_LINK and POLICY_DOCUMENT items into documents', () => {
    const { documents } = mapQuoteContent(sampleContent);
    expect(documents).toHaveLength(2);
    expect(documents).toContainEqual(
      expect.objectContaining({ type: 'link', name: 'Credit Policy (SharePoint)' }),
    );
    expect(documents).toContainEqual(
      expect.objectContaining({ type: 'file', name: 'Standard Supply Policy' }),
    );
  });

  test('orders documents as external link then policy document, alphabetical within type', () => {
    const { terms, documents } = mapQuoteContent(sampleContent);
    expect(terms.map((t) => t.name)).toEqual(['Standard Supply Terms']);
    expect(documents.map((d) => d.name)).toEqual([
      'Credit Policy (SharePoint)',
      'Standard Supply Policy',
    ]);
  });

  test('returns empty arrays when content is undefined', () => {
    expect(mapQuoteContent(undefined)).toEqual({
      notes: [],
      terms: [],
      documents: [],
    });
  });

  test('returns empty arrays when items is an empty array', () => {
    expect(mapQuoteContent({ customerNotesHtml: '', items: [] })).toEqual({
      notes: [],
      terms: [],
      documents: [],
    });
  });

  test('silently drops an item whose contentType does not match a known enum value (e.g. wrong case from backend)', () => {
    const badContent = {
      customerNotesHtml: '',
      items: [
        {
          // Simulates a backend/casing mismatch, e.g. "text_template" instead of "TEXT_TEMPLATE"
          contentType: 'text_template' as QuoteSettingItemType,
          name: 'Mismatched Template',
          sortOrder: 0,
          contentHtml: '<p>Should have been a term but got dropped.</p>',
        },
      ],
    };
    const { terms, documents } = mapQuoteContent(badContent);
    expect(terms).toEqual([]);
    expect(documents).toEqual([]);
  });

  test('drops blank lines from customerNotesHtml (e.g. trailing/leading newlines)', () => {
    const { notes } = mapQuoteContent({
      customerNotesHtml: '\n  \nFirst note\n\n  Second note  \n\n',
      items: [],
    });
    expect(notes).toEqual(['First note', 'Second note']);
  });

  test('returns empty notes when customerNotesHtml is undefined', () => {
    const { notes } = mapQuoteContent({ items: [] });
    expect(notes).toEqual([]);
  });

  test('external link document falls back to "#" when externalUrl is missing', () => {
    const { documents } = mapQuoteContent({
      customerNotesHtml: '',
      items: [
        {
          contentType: QuoteSettingItemType.EXTERNAL_LINK,
          name: 'Broken Link',
          sortOrder: 0,
        },
      ],
    });
    expect(documents).toEqual([
      { id: expect.any(String), type: 'link', name: 'Broken Link', url: '#' },
    ]);
  });

  test('policy document falls back to defaults when mimeType, fileSizeBytes, originalFileName and viewUrl are missing', () => {
    const { documents } = mapQuoteContent({
      customerNotesHtml: '',
      items: [
        {
          contentType: QuoteSettingItemType.POLICY_DOCUMENT,
          name: 'Bare Policy',
          sortOrder: 0,
        },
      ],
    });
    expect(documents).toEqual([
      {
        id: expect.any(String),
        type: 'file',
        name: 'Bare Policy',
        fileType: 'FILE',
        fileName: 'Bare Policy',
        fileSizeLabel: '0.0 KB',
        url: '#',
      },
    ]);
  });

  test('derives fileType from mimeType subtype, uppercased', () => {
    const { documents } = mapQuoteContent({
      customerNotesHtml: '',
      items: [
        {
          contentType: QuoteSettingItemType.POLICY_DOCUMENT,
          name: 'Image Doc',
          sortOrder: 0,
          mimeType: 'image/png',
        },
      ],
    });
    expect(documents[0]).toMatchObject({ fileType: 'PNG' });
  });

  test('ids are assigned by post-sort position, not original array position', () => {
    // Original order is EXTERNAL_LINK then TEXT_TEMPLATE; sorted order flips them.
    const { terms, documents } = mapQuoteContent({
      customerNotesHtml: '',
      items: [
        {
          contentType: QuoteSettingItemType.EXTERNAL_LINK,
          name: 'Beta Link',
          sortOrder: 0,
          externalUrl: 'https://example.com/beta',
        },
        {
          contentType: QuoteSettingItemType.TEXT_TEMPLATE,
          name: 'Zeta Term',
          sortOrder: 1,
          contentHtml: '<p>Zeta</p>',
        },
      ],
    });
    expect(terms[0].id).toBe(`${QuoteSettingItemType.TEXT_TEMPLATE}-0`);
    expect(documents[0].id).toBe(`${QuoteSettingItemType.EXTERNAL_LINK}-1`);
  });

  test('sorts multiple TEXT_TEMPLATE items alphabetically by name', () => {
    const { terms } = mapQuoteContent({
      customerNotesHtml: '',
      items: [
        {
          contentType: QuoteSettingItemType.TEXT_TEMPLATE,
          name: 'Zeta Terms',
          sortOrder: 0,
          contentHtml: '<p>Zeta</p>',
        },
        {
          contentType: QuoteSettingItemType.TEXT_TEMPLATE,
          name: 'Alpha Terms',
          sortOrder: 1,
          contentHtml: '<p>Alpha</p>',
        },
      ],
    });
    expect(terms.map((t) => t.name)).toEqual(['Alpha Terms', 'Zeta Terms']);
  });
});

describe('buildQuoteCurrencyTax', () => {
  test('falls back to AUD/GST/10% when tenantProfile is undefined', () => {
    const result = buildQuoteCurrencyTax(undefined);
    expect(result).toEqual({
      currencySymbol: getCurrencySymbol('AUD'),
      taxLabel: 'GST',
      taxPercentage: 10,
      exTaxLabel: '(ex-GST)',
      taxRateLabel: 'GST (10%)',
    });
  });

  test('falls back to defaults when tenantProfile fields are missing', () => {
    const result = buildQuoteCurrencyTax({});
    expect(result).toEqual({
      currencySymbol: getCurrencySymbol('AUD'),
      taxLabel: 'GST',
      taxPercentage: 10,
      exTaxLabel: '(ex-GST)',
      taxRateLabel: 'GST (10%)',
    });
  });

  test('uses tenantProfile currency, tax label and tax percentage when provided', () => {
    const tenantProfile: TenantProfileSnapshot = {
      currency: 'nzd',
      taxType: 'VAT',
      taxAmount: '15',
    };
    const result = buildQuoteCurrencyTax(tenantProfile);
    expect(result).toEqual({
      currencySymbol: getCurrencySymbol('NZD'),
      taxLabel: 'VAT',
      taxPercentage: 15,
      exTaxLabel: '(ex-VAT)',
      taxRateLabel: 'VAT (15%)',
    });
  });

  test('uppercases a lowercase currency code', () => {
    const result = buildQuoteCurrencyTax({ currency: 'usd' });
    expect(result.currencySymbol).toBe(getCurrencySymbol('USD'));
  });

  test('falls back to default tax percentage when taxAmount is not a number', () => {
    const result = buildQuoteCurrencyTax({ taxAmount: 'not-a-number' });
    expect(result.taxPercentage).toBe(10);
  });

  test('accepts an explicit 0% tax percentage rather than falling back to the default', () => {
    const result = buildQuoteCurrencyTax({ taxAmount: '0' });
    expect(result.taxPercentage).toBe(0);
    expect(result.taxRateLabel).toBe('GST (0%)');
  });
});

function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    suburb: 'North Sydney',
    city: 'North Sydney',
    state: 'NSW',
    country: 'Australia',
    postcode: '2060',
    streetDetailsPrimary: '132 Arthur St',
    formattedAddress: '132 Arthur St, North Sydney NSW 2060, Australia',
    latitude: 0,
    longitude: 0,
    googlePlaceId: 'place-1',
    version: 0,
    ...overrides,
  };
}

function makeCustomer(
  overrides: Partial<QuotePreviewCustomerDTO> = {},
): QuotePreviewCustomerDTO {
  return {
    customerType: CUSTOMER_TYPE.BUSINESS,
    businessName: 'Acme Pty Ltd',
    contactPersonEmail: 'billing@acme.test',
    billingAddress: makeAddress(),
    creditLimit: 10000,
    accountManagerSub: 'sub-1',
    invoiceDueDateDayCount: 30,
    paymentTermType: 'NET_30',
    customerStatus: CUSTOMER_STATUS.ACTIVE,
    paymentType: 'CREDIT',
    version: 0,
    deleted: false,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
    lastModifiedBy: 'system',
    ...overrides,
  };
}

function makeQuoteItem(
  overrides: Partial<QuotePreviewLineItem> = {},
): QuotePreviewLineItem {
  return {
    quoteId: 1,
    productId: 1,
    quarrySupplierId: 1,
    quoteItemType: QuoteItemType.DELIVERY,
    productName: 'Blue Metal 20mm',
    quarryName: 'Quarry A',
    supplierProductName: 'Blue Metal 20mm',
    densityTonnagePerM3: 1.6,
    productCostUom: 'TN',
    productCostQty: 10,
    productCostPrice: 1000,
    totalProductCostPrice: 10000,
    productSellUom: 'TN',
    productSellQty: 12.5,
    productSellPrice: 1234,
    totalProductSellPrice: 30850,
    truckType: 'Tipper',
    truckCostUom: 'TN',
    truckCostQty: 10,
    truckCostPrice: 200,
    totalTruckCostPrice: 2000,
    truckSellUom: 'TN',
    truckSellQty: 10,
    truckSellPrice: 300,
    totalTruckSellPrice: 3000,
    grossProfit: 3000,
    totalQuantityRequired: 25,
    allocatedQuantity: 25,
    remainingQuantity: 0,
    requiredLoads: 1,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
    lastModifiedBy: 'system',
    version: 0,
    isDeleted: false,
    ...overrides,
  };
}

function makeQuoteDto(overrides: Partial<QuotePreviewDto> = {}): QuotePreviewDto {
  return {
    id: 1,
    quoteNumber: 'Q-1001',
    customerId: 1,
    customerName: 'Acme Pty Ltd',
    phone: '0400000000',
    customerWithAddressResponseDto: makeCustomer(),
    accountManagerSub: 'sub-1',
    accountManagerName: 'Jane Manager',
    projectName: 'Site A',
    quoteStatus: QuoteStatus.PENDING,
    jobId: 1,
    deliveryStartDate: '2026-08-01T09:00:00',
    expiryDate: '2026-08-15T00:00:00',
    deliveryWindowStart: '2026-08-01T09:00:00',
    deliveryWindowEnd: '2026-08-01T17:00:00',
    totalCostPrice: 0,
    totalSellPrice: 15000,
    lineItemsCount: 1,
    inclDeliveryCost: true,
    version: 0,
    isDeleted: false,
    createdBy: 'system',
    createdAt: '2026-07-01T00:00:00',
    updatedAt: '2026-07-01T00:00:00',
    lastModifiedBy: 'system',
    quoteItems: [makeQuoteItem()],
    ...overrides,
  };
}

function makeApiResponse(
  overrides: Partial<PublicQuoteLinkResponse> = {},
): PublicQuoteLinkResponse {
  return {
    quoteDto: makeQuoteDto(),
    stripeTenantDetailsSnapshot: {
      tenantName: 'QuarryLink',
      businessName: 'QuarryLink Pty Ltd',
      abn: '11 222 333 444',
      billingAddress:
        'Suite 1102/132 Arthur St, North Sydney NSW 2060, Australia',
      website: 'www.quarrylink.com.au',
      email: 'hello@quarrylink.com.au',
      contactNumber: '(02) 1111 2222',
    },
    tenantLogoDto: {
      logoPublicS3Url: 'https://cdn.test/logo.png',
      tenantBusinessName: 'QuarryLink',
    },
    tenantProfile: {
      currency: 'AUD',
      taxType: 'GST',
      taxAmount: '10',
      timeZoneId: 'Australia/Sydney',
    },
    ...overrides,
  };
}

describe('transformQuoteData', () => {
  test('maps navbar, customer, project, products, summary and footer for a fully populated response', () => {
    const result = transformQuoteData(makeApiResponse());

    expect(result.inclDeliveryCost).toBe(true);
    expect(result.navbar).toMatchObject({
      quoteNumber: 'Q-1001',
      status: QuoteStatus.PENDING,
      logoUrl: 'https://cdn.test/logo.png',
    });
    expect(result.navbar).not.toHaveProperty('accountManager');
    expect(result.proceedActions).toEqual({
      validUntil: expect.any(String),
    });
    expect(result.proceedActions).not.toHaveProperty('accountManager');
    expect(result.customer).toEqual({
      customerName: 'Acme Pty Ltd',
      email: 'billing@acme.test',
      phone: '0400000000',
      billingAddress: {
        line1: '132 Arthur St',
        line2: 'NORTH SYDNEY NSW 2060',
        line3: 'AUSTRALIA',
      },
    });
    expect(result.project).toMatchObject({
      type: QuoteItemType.DELIVERY,
      projectName: 'Site A',
      timeZone: 'Australia/Sydney',
    });
    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toMatchObject({
      name: 'Blue Metal 20mm',
      type: 'DELIVERY',
      truckType: 'Tipper',
      capacity: '25.00 TN per delivery',
      unit: 'TN',
      quantity: '12.50 TN',
      unitPrice: 1234,
      totalPrice: 30850,
      deliveryPrice: 3000,
    });
    expect(result.summary).toEqual({
      totalProducts: 1,
      estimatedDelivery: expect.any(String),
      subtotal: 15000,
      gst: 1500,
      total: 16500,
      productSubtotal: 30850,
      deliverySubtotal: 3000,
      showDigitalPlatformFee: false,
      digitalPlatformFeeLabel: 'digital platform fee',
      digitalPlatformFeeAmount: 0,
    });
    expect(result.footer).toEqual({
      email: 'hello@quarrylink.com.au',
      phone: '(02) 1111 2222',
      addressLine1: 'Suite 1102/132 Arthur St',
      addressLine2: 'NORTH SYDNEY NSW 2060',
      addressLine3: 'AUSTRALIA',
      website: 'www.quarrylink.com.au',
      businessName: 'QuarryLink Pty Ltd',
      abn: '11 222 333 444',
    });
  });

  test('feeRecoveryPreview with mode RECOVER shows the fee using its own label and amount', () => {
    const result = transformQuoteData(
      makeApiResponse({
        feeRecoveryPreview: {
          recoveredFromCustomer: true,
          feeAmount: 2.4,
          invoiceLineDescription: 'Platform Fee',
          customerFacingNote: 'A platform fee of $2.40 applies per docket.',
          mode: RECOVERY_MODE.RECOVER,
          source: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
        },
      }),
    );

    expect(result.summary.showDigitalPlatformFee).toBe(true);
    expect(result.summary.digitalPlatformFeeLabel).toBe('Platform Fee');
    expect(result.summary.digitalPlatformFeeAmount).toBe(2.4);
  });

  test('feeRecoveryPreview with mode ABSORB hides the fee', () => {
    const result = transformQuoteData(
      makeApiResponse({
        feeRecoveryPreview: {
          recoveredFromCustomer: false,
          feeAmount: 2.4,
          invoiceLineDescription: 'Platform Fee',
          customerFacingNote: '',
          mode: RECOVERY_MODE.ABSORB,
          source: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
        },
      }),
    );

    expect(result.summary.showDigitalPlatformFee).toBe(false);
  });

  test('falls back to the default label when feeRecoveryPreview is missing', () => {
    const result = transformQuoteData(makeApiResponse());

    expect(result.summary.showDigitalPlatformFee).toBe(false);
    expect(result.summary.digitalPlatformFeeLabel).toBe('digital platform fee');
    expect(result.summary.digitalPlatformFeeAmount).toBe(0);
  });

  test('rounds gst using the tenant tax percentage from tenantProfile', () => {
    const result = transformQuoteData(
      makeApiResponse({
        quoteDto: makeQuoteDto({ totalSellPrice: 999 }),
        tenantProfile: { currency: 'AUD', taxType: 'GST', taxAmount: '15' },
      }),
    );
    // 999 * 0.15 = 149.85 -> rounds to 150
    expect(result.summary.gst).toBe(150);
    expect(result.summary.total).toBe(1149);
  });

  test('applies default fallbacks when optional quote fields are missing', () => {
    const result = transformQuoteData(
      makeApiResponse({
        quoteDto: makeQuoteDto({
          quoteNumber: '',
          accountManagerName: '',
          projectName: '',
          quoteStatus: '' as QuoteStatus,
          deliveryStartDate: null,
          expiryDate: null,
          createdAt: null,
          inclDeliveryCost: undefined as unknown as boolean,
          quoteItems: [],
        }),
      }),
    );

    expect(result.navbar.quoteNumber).toBe('N/A');
    expect(result.navbar.status).toBe(QuoteStatus.PENDING);
    expect(result.navbar.dateIssued).toBe('N/A');
    expect(result.navbar.validUntil).toBe('N/A');
    expect(result.project.projectName).toBe('N/A');
    expect(result.project.type).toBeUndefined();
    expect(result.inclDeliveryCost).toBe(false);
    expect(result.products).toEqual([]);
    expect(result.summary).toMatchObject({
      totalProducts: 0,
      subtotal: 15000,
      productSubtotal: 0,
      deliverySubtotal: 0,
    });
  });

  test.each([
    ['BUSINESS with businessName', CUSTOMER_TYPE.BUSINESS, { businessName: 'Biz Co' }, 'Biz Co'],
    [
      'BUSINESS without businessName falls back to individualContactName',
      CUSTOMER_TYPE.BUSINESS,
      { businessName: undefined, individualContactName: 'Contact Person' },
      'Contact Person',
    ],
    [
      'BUSINESS without businessName or individualContactName falls back to top-level customerName',
      CUSTOMER_TYPE.BUSINESS,
      { businessName: undefined, individualContactName: undefined },
      'Acme Pty Ltd',
    ],
    [
      'INDIVIDUAL uses individualContactName',
      CUSTOMER_TYPE.INDIVIDUAL,
      { individualContactName: 'Jamie Individual' },
      'Jamie Individual',
    ],
    [
      'INDIVIDUAL without individualContactName falls back to top-level customerName',
      CUSTOMER_TYPE.INDIVIDUAL,
      { individualContactName: undefined },
      'Acme Pty Ltd',
    ],
  ])('customer display name: %s', (_label, customerType, customerOverrides, expected) => {
    const result = transformQuoteData(
      makeApiResponse({
        quoteDto: makeQuoteDto({
          customerName: 'Acme Pty Ltd',
          customerWithAddressResponseDto: makeCustomer({
            customerType,
            ...customerOverrides,
          }),
        }),
      }),
    );
    expect(result.customer.customerName).toBe(expected);
  });

  test('falls back to top-level customerName when customerWithAddressResponseDto is missing entirely', () => {
    const result = transformQuoteData(
      makeApiResponse({
        quoteDto: makeQuoteDto({
          customerName: 'Fallback Customer',
          customerWithAddressResponseDto:
            undefined as unknown as QuotePreviewCustomerDTO,
        }),
      }),
    );
    expect(result.customer.customerName).toBe('Fallback Customer');
    expect(result.customer.email).toBe('N/A');
  });

  test.each([
    ['all COLLECTION items', [QuoteItemType.COLLECTION, QuoteItemType.COLLECTION], QuoteItemType.COLLECTION],
    ['all DELIVERY items', [QuoteItemType.DELIVERY, QuoteItemType.DELIVERY], QuoteItemType.DELIVERY],
    ['a mix of COLLECTION and DELIVERY items', [QuoteItemType.COLLECTION, QuoteItemType.DELIVERY], undefined],
  ])('project.type is derived from quoteItems: %s', (_label, types, expected) => {
    const result = transformQuoteData(
      makeApiResponse({
        quoteDto: makeQuoteDto({
          quoteItems: types.map((quoteItemType) => makeQuoteItem({ quoteItemType })),
        }),
      }),
    );
    expect(result.project.type).toBe(expected);
  });

  test('project.type is undefined when there are no quoteItems', () => {
    const result = transformQuoteData(
      makeApiResponse({ quoteDto: makeQuoteDto({ quoteItems: [] }) }),
    );
    expect(result.project.type).toBeUndefined();
  });

  test('product falls back to legacy "type" field when quoteItemType is missing, and to "None" when both are missing', () => {
    const result = transformQuoteData(
      makeApiResponse({
        quoteDto: makeQuoteDto({
          quoteItems: [
            makeQuoteItem({
              quoteItemType: undefined as unknown as QuoteItemType,
              ...({ type: 'delivery' } as Partial<QuotePreviewLineItem>),
            }),
            makeQuoteItem({ quoteItemType: undefined as unknown as QuoteItemType }),
          ],
        }),
      }),
    );
    expect(result.products[0].type).toBe('DELIVERY');
    expect(result.products[1].type).toBe('NONE');
  });

  test('product defaults deliveryAddress, truckType and name when missing', () => {
    const result = transformQuoteData(
      makeApiResponse({
        quoteDto: makeQuoteDto({
          quoteItems: [
            makeQuoteItem({
              productName: undefined as unknown as string,
              truckType: undefined as unknown as string,
              customerDeliveryAddress: undefined,
            }),
          ],
        }),
      }),
    );
    expect(result.products[0]).toMatchObject({
      name: 'Unknown Product',
      truckType: 'N/A',
      deliveryAddress: 'N/A',
    });
  });

  test('sums productSubtotal and deliverySubtotal across multiple quoteItems', () => {
    const result = transformQuoteData(
      makeApiResponse({
        quoteDto: makeQuoteDto({
          quoteItems: [
            makeQuoteItem({ totalProductSellPrice: 1000, totalTruckSellPrice: 100 }),
            makeQuoteItem({ totalProductSellPrice: 2000, totalTruckSellPrice: 200 }),
          ],
        }),
      }),
    );
    expect(result.summary.productSubtotal).toBe(3000);
    expect(result.summary.deliverySubtotal).toBe(300);
  });

  test('falls back to default footer values when stripeTenantDetailsSnapshot is missing', () => {
    const result = transformQuoteData(
      makeApiResponse({ stripeTenantDetailsSnapshot: undefined }),
    );
    expect(result.footer).toEqual({
      email: 'support@quarrylink.com.au',
      phone: '(02) 7229 1427',
      addressLine1: 'Suite 1102/132 Arthur St',
      addressLine2: 'NORTH SYDNEY NSW 2060',
      addressLine3: 'AUSTRALIA',
      website: 'www.quarrylink.com.au',
      businessName: 'QuarryLink',
      abn: '12 345 678 901',
    });
  });

  test('footer businessName falls back to tenantName when businessName is missing', () => {
    const result = transformQuoteData(
      makeApiResponse({
        stripeTenantDetailsSnapshot: {
          tenantName: 'Tenant Only Name',
          businessName: '',
          abn: '',
          billingAddress: '',
          website: '',
          email: '',
          contactNumber: '',
        },
      }),
    );
    expect(result.footer.businessName).toBe('Tenant Only Name');
  });

  test('maps notes/terms/documents from content onto the result', () => {
    const result = transformQuoteData(makeApiResponse({ content: sampleContent }));
    expect(result.notes).toEqual(['Line one', 'Line two']);
    expect(result.terms.map((t) => t.name)).toEqual(['Standard Supply Terms']);
    expect(result.documents).toHaveLength(2);
  });

  test('returns empty notes/terms/documents when content is missing', () => {
    const result = transformQuoteData(makeApiResponse({ content: undefined }));
    expect(result.notes).toEqual([]);
    expect(result.terms).toEqual([]);
    expect(result.documents).toEqual([]);
  });
});
