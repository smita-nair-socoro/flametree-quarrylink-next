import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { QuoteNavbarPdf } from './QuoteNavbarPdf';
import { QuoteFooterPdf } from './QuoteFooterPdf';
import { CustomerInfoPdf } from './CustomerInfoPdf';
import { ProjectDetailsPdf } from './ProjectDetailsPdf';
import { ProductsTablePdf } from './ProductsTablePdf';
import { SummaryPaymentPdf } from './SummaryPaymentPdf';
import { QUOTE_STATUS, QUOTE_TYPE } from '@/lib/types/quotation-enums';

// Type matching the mockQuotationData structure
export interface QuotationData {
  navbar: {
    quoteNumber: string;
    dateIssued: string;
    validUntil: string;
    accountManager: string;
    status: QUOTE_STATUS;
  };
  customer: {
    customerName: string;
    email: string;
    phone: string;
    billingAddress: {
      line1: string;
      line2: string;
      country: string;
    };
  };
  project: {
    type: QUOTE_TYPE;
    projectName: string;
    deliveryAddress: string;
    deliveryDate: string;
    deliveryWindow: string;
  };
  products: Array<{
    name: string;
    code: string;
    truckType: string;
    capacity: string;
    quantity: string;
    totalPrice: number;
  }>;
  summary: {
    totalProducts: number;
    totalQuantity: string;
    estimatedDelivery: string;
    termsAndConditions: string[];
    subtotal: number;
    gst: number;
    total: number;
  };
  footer: {
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    website: string;
    businessName: string;
  };
}

export interface QuotePdfDocumentProps {
  data: QuotationData;
  quoteId: string;
  baseUrl?: string;
}

export const QuotePdfDocument: React.FC<QuotePdfDocumentProps> = ({
  data,
  quoteId,
  baseUrl,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Fixed Header */}
        <QuoteNavbarPdf {...data.navbar} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Customer Information */}
          <CustomerInfoPdf {...data.customer} />

          {/* Project Details */}
          <ProjectDetailsPdf {...data.project} />

          {/* Products & Services Table */}
          <ProductsTablePdf products={data.products} />

          {/* Summary & Payment */}
          <SummaryPaymentPdf
            {...data.summary}
            validUntil={data.navbar.validUntil}
            accountManager={data.navbar.accountManager}
            quoteId={quoteId}
            baseUrl={baseUrl}
          />
        </View>

        {/* Fixed Footer */}
        <QuoteFooterPdf {...data.footer} />
      </Page>
    </Document>
  );
};
