/**
 * PDF Preview Layout Component
 * Hidden layout that reuses existing web UI components with data-pdf-* attributes
 * for html2canvas-based PDF export
 */

'use client';

import { QuoteNavbar } from '../quote-navbar';
import { CustomerInformation } from '../customer-information';
import { ProjectDetails } from '../project-details';
import { ProductsServices } from '../products-services';
import { SummaryPayment } from '../summary-payment';
import { QuoteFooter } from '../quote-footer';
import { ProceedActionsPdfPreview } from './ProceedActionsPdfPreview';
import { Separator } from '@/components/ui/separator';

export interface QuotePdfPreviewProps {
  quotationData: {
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
    proceedActions?: {
      quoteId: string;
      baseUrl?: string;
    };
  };
}

export function QuotePdfPreview({ quotationData }: QuotePdfPreviewProps) {
  return (
    <div
      data-pdf-root
      className="fixed left-[-9999px] top-0 w-[595px] bg-white pointer-events-none"
      style={{
        width: '595px', // A4 width in pixels at 72 DPI
        opacity: 0,
        zIndex: -9999,
      }}
    >
      {/* Header - appears on every page */}
      <div data-pdf-header>
        <QuoteNavbar
          {...quotationData.navbar}
          // Hide download button in PDF
          onDownloadPDF={undefined}
          forPdf={true}
        />
      </div>

      {/* Content - split across pages */}
      <div data-pdf-content className="bg-white">
        {/* Customer Information Block */}
        <div data-pdf-block>
          <CustomerInformation {...quotationData.customer} />
          <Separator />
        </div>

        {/* Project Details Block */}
        <div data-pdf-block>
          <ProjectDetails {...quotationData.project} />
          <Separator />
        </div>

        {/* Products & Services Block */}
        <div data-pdf-block>
          <ProductsServices products={quotationData.products} />
          <Separator className="mb-8" />
        </div>

        {/* Summary & Payment Block */}
        <div data-pdf-block>
          <SummaryPayment {...quotationData.summary} />
        </div>

        {/* Proceed Actions Block - Only shown for PENDING/DRAFT status */}
        {quotationData.proceedActions && (
          <div data-pdf-block>
            <ProceedActionsPdfPreview
              validUntil={quotationData.navbar.validUntil}
              accountManager={quotationData.navbar.accountManager}
              quoteId={quotationData.proceedActions.quoteId}
              baseUrl={quotationData.proceedActions.baseUrl}
              status={quotationData.navbar.status}
            />
          </div>
        )}
      </div>

      {/* Footer - appears on every page */}
      <div data-pdf-footer>
        <div className="border-t-[3.75px] border-[rgba(142,81,255,1)]"></div>
        <QuoteFooter {...quotationData.footer} forPdf={true} />
      </div>
    </div>
  );
}
