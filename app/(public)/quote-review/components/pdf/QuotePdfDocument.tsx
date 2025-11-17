import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { QuoteNavbarPdf } from './QuoteNavbarPdf';
import { QuoteFooterPdf } from './QuoteFooterPdf';
import { CustomerInfoPdf } from './CustomerInfoPdf';
import { ProjectDetailsPdf } from './ProjectDetailsPdf';
import { ProductsTablePdf } from './ProductsTablePdf';
import { SummaryPaymentPdf } from './SummaryPaymentPdf';

// Type matching the mockQuotationData structure
export interface QuotationData {
  navbar: {
    quoteNumber: string;
    dateIssued: string;
    validUntil: string;
    accountManager: string;
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'DRAFT';
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
    type: 'DELIVERY' | 'COLLECTION';
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
    contactInfo: {
      company: string;
      phone: string;
      email: string;
    };
    officeAddress: {
      address: string;
      city: string;
      abn: string;
    };
    website: {
      url: string;
      portalInfo: string;
      support: string;
    };
  };
}

export interface QuotePdfDocumentProps {
  data: QuotationData;
}

export const QuotePdfDocument: React.FC<QuotePdfDocumentProps> = ({
  data,
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
          <SummaryPaymentPdf {...data.summary} />

          {/* Note: ProceedActions (Approve/Decline buttons) are not included
              in the PDF as they are interactive elements only relevant in the web view */}
        </View>

        {/* Fixed Footer */}
        <QuoteFooterPdf {...data.footer} />
      </Page>
    </Document>
  );
};
