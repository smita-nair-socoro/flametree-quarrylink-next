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
  },

  // Customer information
  customer: {
    customerName: 'ABC Construction Ltd',
    email: 'john.smith@abcconstruction.com',
    phone: '+61 2 9876 5432',
    billingAddress: {
      line1: 'Level 12, 456 George Street',
      line2: 'Sydney NSW 2000',
      country: 'Australia',
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
      totalPrice: 7920000.0,
    },
    {
      name: 'Slate Stone E5',
      code: 'P-1224445',
      truckType: 'Tandem',
      capacity: '85 T per delivery',
      quantity: '120 T',
      totalPrice: 5212500.0,
    },
    {
      name: 'Marble Slab B2',
      code: 'ABC-34332',
      truckType: 'Semi + Trailer',
      capacity: '75 T per delivery',
      quantity: '120 T',
      totalPrice: 4800000.0,
    },
    {
      name: 'Sandstone Panel D4',
      code: 'GH-232323',
      truckType: 'B-Double',
      capacity: '95 T per delivery',
      quantity: '120 T',
      totalPrice: 6850000.0,
    },
    {
      name: 'Granite Block A1',
      code: 'FF-443994',
      truckType: 'Tandem',
      capacity: '60 T per delivery',
      quantity: '120 T',
      totalPrice: 3650000.0,
    },
    {
      name: 'Slate Stone E3',
      code: 'P-1224446',
      truckType: 'Semi + Trailer',
      capacity: '18.7 tonnes per delivery',
      quantity: '120 T',
      totalPrice: 7920000.0,
    },
    {
      name: 'Slate Stone E5',
      code: 'P-1224445',
      truckType: 'Tandem',
      capacity: '85 T per delivery',
      quantity: '120 T',
      totalPrice: 5212500.0,
    },
    {
      name: 'Marble Slab B2',
      code: 'ABC-34332',
      truckType: 'Semi + Trailer',
      capacity: '75 T per delivery',
      quantity: '120 T',
      totalPrice: 4800000.0,
    },
    {
      name: 'Sandstone Panel D4',
      code: 'GH-232323',
      truckType: 'B-Double',
      capacity: '95 T per delivery',
      quantity: '120 T',
      totalPrice: 6850000.0,
    },
    {
      name: 'Granite Block A1',
      code: 'FF-443994',
      truckType: 'Tandem',
      capacity: '60 T per delivery',
      quantity: '120 T',
      totalPrice: 3650000.0,
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
  },

  // Proceed actions
  proceedActions: {
    validUntil: '29th July, 2026',
    accountManager: 'Sarah Wilson',
  },

  // Footer
  footer: {
    contactInfo: {
      company: 'QuarryLink Australia Pty Ltd',
      phone: '1300 QUARRY (1300 782 779)',
      email: 'quotes@quarrylink.com.au',
    },
    officeAddress: {
      address: 'Level 8, 123 Business Street',
      city: 'Sydney NSW 2000',
      abn: '12 345 678 901',
    },
    website: {
      url: 'www.quarrylink.com.au',
      portalInfo: 'Customer Portal Available',
      support: '24/7 Support',
    },
  },
};
