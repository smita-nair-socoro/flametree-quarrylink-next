import {
  QUOTE_STATUS as QuoteStatus,
  QUOTE_TYPE as QuoteType,
} from '@/lib/types/quotation-enums';

export const mockQuotationData = {
  // Navbar data
  navbar: {
    quoteNumber: 'QPO001',
    dateIssued: '15th July, 2026',
    validUntil: '15th August, 2026',
    accountManager: 'Sarah Wilson',
    status: QuoteStatus.PENDING,
    tenantDetails: undefined,
  },

  // Customer information
  customer: {
    customerName: 'ABC Construction Ltd',
    email: 'john.smith@abcconstruction.com',
    phone: '+61 2 9876 5432',
    billingAddress: {
      line1: 'Level 12, 456 George Street',
      line2: 'SYDNEY NSW 2000',
      line3: 'AUSTRALIA',
    },
  },

  // Project details
  project: {
    type: QuoteType.DELIVERY,
    projectName: 'Westfield Shopping Centre Extension',
    deliveryAddress: '543 Construction Access Road, Parramatta NSW 2150',
    deliveryDate: '23rd August, 2026',
    deliveryWindow: '10:30 AM - 12:30 PM',
  },

  // Products and services
  products: [
    {
      name: 'Slate Stone E3',
      code: 'P-1224446',
      truckType: 'Semi + Trailer',
      capacity: '18.7 tonnes per delivery',
      quantity: '120 T',
      totalPrice: 5544000.0, // Product price only (70%)
      deliveryPrice: 2376000.0, // Delivery price (30%)
    },
    {
      name: 'Slate Stone E5',
      code: 'P-1224445',
      truckType: 'Tandem',
      capacity: '85 T per delivery',
      quantity: '120 T',
      totalPrice: 3648750.0, // Product price only
      deliveryPrice: 1563750.0, // Delivery price
    },
    {
      name: 'Marble Slab B2',
      code: 'ABC-34332',
      truckType: 'Semi + Trailer',
      capacity: '75 T per delivery',
      quantity: '120 T',
      totalPrice: 3360000.0, // Product price only
      deliveryPrice: 1440000.0, // Delivery price
    },
    {
      name: 'Sandstone Panel D4',
      code: 'GH-232323',
      truckType: 'B-Double',
      capacity: '95 T per delivery',
      quantity: '120 T',
      totalPrice: 4795000.0, // Product price only
      deliveryPrice: 2055000.0, // Delivery price
    },
    {
      name: 'Granite Block A1',
      code: 'FF-443994',
      truckType: 'Tandem',
      capacity: '60 T per delivery',
      quantity: '120 T',
      totalPrice: 2555000.0, // Product price only
      deliveryPrice: 1095000.0, // Delivery price
    },
    {
      name: 'Slate Stone E3',
      code: 'P-1224446',
      truckType: 'Semi + Trailer',
      capacity: '18.7 tonnes per delivery',
      quantity: '120 T',
      totalPrice: 5544000.0, // Product price only
      deliveryPrice: 2376000.0, // Delivery price
    },
    {
      name: 'Slate Stone E5',
      code: 'P-1224445',
      truckType: 'Tandem',
      capacity: '85 T per delivery',
      quantity: '120 T',
      totalPrice: 3648750.0, // Product price only
      deliveryPrice: 1563750.0, // Delivery price
    },
    {
      name: 'Marble Slab B2',
      code: 'ABC-34332',
      truckType: 'Semi + Trailer',
      capacity: '75 T per delivery',
      quantity: '120 T',
      totalPrice: 3360000.0, // Product price only
      deliveryPrice: 1440000.0, // Delivery price
    },
    {
      name: 'Sandstone Panel D4',
      code: 'GH-232323',
      truckType: 'B-Double',
      capacity: '95 T per delivery',
      quantity: '120 T',
      totalPrice: 4795000.0, // Product price only
      deliveryPrice: 2055000.0, // Delivery price
    },
    {
      name: 'Granite Block A1',
      code: 'FF-443994',
      truckType: 'Tandem',
      capacity: '60 T per delivery',
      quantity: '120 T',
      totalPrice: 2555000.0, // Product price only
      deliveryPrice: 1095000.0, // Delivery price
    },
  ],

  // Summary and payment
  summary: {
    totalProducts: 5,
    totalQuantity: '600 tonnes, 45 m³',
    estimatedDelivery: '23rd August, 2026',
    termsAndConditions: [
      'Delivery subject to weather conditions',
      'Quote valid for 14 days from issue date',
    ],
    subtotal: 27010000.0,
    gst: 2843250.0,
    total: 31275750.0,
    productSubtotal: 18907000.0, // 70% of subtotal
    deliverySubtotal: 8103000.0, // 30% of subtotal
  },

  // Proceed actions
  proceedActions: {
    validUntil: '29th July, 2026',
    accountManager: 'Sarah Wilson',
  },

  // Footer
  footer: {
    email: 'support@quarrylink.com.au',
    phone: '(02) 7229 1427',
    addressLine1: 'Suite 1102/132 Arthur St',
    addressLine2: 'NORTH SYDNEY NSW 2060',
    addressLine3: 'AUSTRALIA',
    website: 'www.quarrylink.com.au',
    businessName: 'QuarryLink',
    abn: '12 345 678 901',
  },
};
