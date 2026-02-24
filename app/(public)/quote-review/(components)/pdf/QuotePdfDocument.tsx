import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { QuoteNavbarPdf } from './QuoteNavbarPdf';
import { QuoteFooterPdf } from './QuoteFooterPdf';
import { CustomerInfoPdf } from './CustomerInfoPdf';
import { ProjectDetailsPdf } from './ProjectDetailsPdf';
import { ProductsTablePdf } from './ProductsTablePdf';
import { SummaryPaymentPdf } from './SummaryPaymentPdf';
import { QUOTE_STATUS } from '@/lib/types/quotation-enums';
import { StripeTenantDetailsSnapshot } from '@/lib/types/quotation';

// Type matching the mockQuotationData structure
export interface QuotationData {
  navbar: {
    quoteNumber: string;
    dateIssued: string;
    validUntil: string;
    accountManager: string;
    status: QUOTE_STATUS;
    logoUrl?: string;
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
    deliveryDate: string;
    deliveryWindow: string;
  };
  products: Array<{
    name: string;
    type?: string;
    deliveryAddress: string;
    truckType: string;
    capacity: string;
    quantity: string;
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
  };
  inclDeliveryCost?: boolean;
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
        <QuoteNavbarPdf {...data.navbar} tenantDetails={tenantDetails} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Customer Information */}
          <CustomerInfoPdf {...data.customer} />

          {/* Project Details */}
          <ProjectDetailsPdf {...data.project} />

          {/* Products & Services Table */}
          <ProductsTablePdf
            products={data.products}
            includeDeliveryPrices={data.inclDeliveryCost}
          />

          {/* Summary & Payment */}
          <SummaryPaymentPdf
            {...data.summary}
            validUntil={data.navbar.validUntil}
            accountManager={data.navbar.accountManager}
            quoteId={quoteId}
            baseUrl={baseUrl}
            includeDeliveryPrices={data.inclDeliveryCost}
          />
        </View>

        {/* Fixed Footer */}
        <QuoteFooterPdf {...data.footer} />
      </Page>
    </Document>
  );
};
