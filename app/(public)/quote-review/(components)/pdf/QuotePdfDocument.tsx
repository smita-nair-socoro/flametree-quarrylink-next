import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { QuoteNavbarPdf } from './QuoteNavbarPdf';
import { QuoteFooterPdf } from './QuoteFooterPdf';
import { CustomerInfoPdf } from './CustomerInfoPdf';
import { ProjectDetailsPdf } from './ProjectDetailsPdf';
import { ProductsTablePdf } from './ProductsTablePdf';
import { SummaryPaymentPdf } from './SummaryPaymentPdf';
import { TermsAndConditionsPdf } from './TermsAndConditionsPdf';
import {
  QUOTE_STATUS,
  LOGO_SIZE as LogoSize,
} from '@/lib/types/quotation-enums';
import {
  QuoteCurrencyTax,
  StripeTenantDetailsSnapshot,
} from '@/lib/types/quotation';
import type { QuoteDocument, QuoteTermItem } from '../terms-and-conditions';

// Type matching the mockQuotationData structure
export interface QuotationData {
  navbar: {
    quoteNumber: string;
    dateIssued: string;
    validUntil: string;
    status: QUOTE_STATUS;
    logoUrl?: string;
    logoError?: boolean;
    logoSize?: LogoSize;
  };
  customer: {
    customerName: string;
    email: string;
    phone: string;
    billingAddress: {
      line1: string;
      line2: string;
      line3: string;
    };
  };
  project: {
    projectName: string;
    deliveryDate?: string;
    deliveryWindow?: string;
  };
  products: Array<{
    name: string;
    type?: string;
    deliveryAddress: string;
    truckType: string;
    capacity: string;
    unit: string;
    quantity: string;
    rawQty: number;
    unitPrice: number;
    totalPrice: number;
    deliveryPrice?: number;
  }>;
  summary: {
    totalProducts: number;
    estimatedDelivery: string;
    subtotal: number;
    gst: number;
    total: number;
    productSubtotal?: number;
    deliverySubtotal?: number;
    showDigitalPlatformFee?: boolean;
    digitalPlatformFeeLabel?: string;
    digitalPlatformFeeAmount?: number;
  };
  inclDeliveryCost?: boolean;
  currencyTax: QuoteCurrencyTax;
  notes?: string[];
  terms?: QuoteTermItem[];
  documents?: QuoteDocument[];
  footer: {
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    website: string;
    businessName: string;
    abn: string;
  };
}

export interface QuotePdfDocumentProps {
  data: QuotationData;
  quoteId: string;
  baseUrl?: string;
  tenantDetails?: StripeTenantDetailsSnapshot;
}

export const QuotePdfDocument: React.FC<QuotePdfDocumentProps> = ({
  data,
  quoteId,
  baseUrl,
  tenantDetails,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Fixed Header */}
        <QuoteNavbarPdf {...data.navbar} tenantDetails={tenantDetails} logoError={data.navbar.logoError} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Customer Information */}
          <CustomerInfoPdf {...data.customer} />

          {/* Project Details */}
          <ProjectDetailsPdf {...data.project} />

          {/* Products & Services Table */}
          <ProductsTablePdf
            products={data.products}
            currencyTax={data.currencyTax}
            includeDeliveryPrices={data.inclDeliveryCost}
          />

          {/* Summary & Payment */}
          <SummaryPaymentPdf
            {...data.summary}
            currencyTax={data.currencyTax}
            validUntil={data.navbar.validUntil}
            quoteId={quoteId}
            baseUrl={baseUrl}
            includeDeliveryPrices={data.inclDeliveryCost}
          />

          {/* Notes & Terms */}
          <TermsAndConditionsPdf
            notes={data.notes}
            terms={data.terms}
            documents={data.documents}
          />
        </View>

        {/* Fixed Footer */}
        <QuoteFooterPdf {...data.footer} />
      </Page>
    </Document>
  );
};
