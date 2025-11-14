'use client';

import { useState } from 'react';
import { QuoteNavbar } from './quote-navbar';
import { CustomerInformation } from './customer-information';
import { ProjectDetails } from './project-details';
import { ProductsServices } from './products-services';
import { SummaryPayment } from './summary-payment';
import { ProceedActions } from './proceed-actions';
import { QuoteFooter } from './quote-footer';
import { ActionDialog } from '@/components/action-dialog';
import { Check, X } from 'lucide-react';
import { mockQuotationData } from './mock-data';
import { Separator } from 'react-aria-components';

type QuoteReviewDocumentProps = {
  quoteId: string;
  payloadParam?: string;
};

export default function QuoteReviewDocument({
  quoteId,
  payloadParam, // eslint-disable-line @typescript-eslint/no-unused-vars
}: QuoteReviewDocumentProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);

  // TODO: Replace mock data with actual data from payloadParam or API
  const quotationData = mockQuotationData;

  const handleDownloadPDF = () => {
    console.log('Download PDF clicked for quote:', quoteId);
    window.print();
  };

  const handleApprove = () => {
    console.log('Approve quotation:', quoteId);
    // TODO: Implement backend API call
    setApproveDialogOpen(false);
  };

  const handleDecline = () => {
    console.log('Decline quotation:', quoteId);
    // TODO: Implement backend API call
    setDeclineDialogOpen(false);
  };

  return (
    <>
      {/* Approve Dialog */}
      <ActionDialog
        open={approveDialogOpen}
        onOpenChangeAction={setApproveDialogOpen}
        title="Approve Quote"
        description={
          <div>
            <p className="mb-4">
              Are you sure you want to approve quote{' '}
              <strong>{quotationData.navbar.quoteNumber}</strong>?
            </p>
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">
                Once approved, we'll begin processing your order and contact you
                with the next steps.
              </p>
            </div>
          </div>
        }
        confirmText="Approve Quote"
        confirmVariant="default"
        confirmCustomColor="#16A34A"
        confirmIcon={<Check className="h-4 w-4" />}
        onConfirmAction={handleApprove}
      />

      {/* Decline Dialog */}
      <ActionDialog
        open={declineDialogOpen}
        onOpenChangeAction={setDeclineDialogOpen}
        title="Decline Quote"
        description={
          <div>
            <p className="mb-4">
              Are you sure you want to decline quote{' '}
              <strong>{quotationData.navbar.quoteNumber}</strong>?
            </p>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">
                This quote will be marked as declined. You can contact us if you
                change your mind.
              </p>
            </div>
          </div>
        }
        confirmText="Decline Quote"
        confirmVariant="destructive"
        confirmIcon={<X className="h-4 w-4" />}
        onConfirmAction={handleDecline}
      />

      {/* Main Document */}
      <div className="min-h-screen bg-gray-100 p-4 print:px-0 print:py-0">
        <div className="max-w-[960px] mx-auto bg-white">
          {/* Navbar */}
          <QuoteNavbar
            {...quotationData.navbar}
            onDownloadPDF={handleDownloadPDF}
          />

          {/* Customer Information */}
          <CustomerInformation {...quotationData.customer} />
          <Separator />
          {/* Project Details */}
          <ProjectDetails {...quotationData.project} />
          <Separator />

          {/* Products & Services */}
          <ProductsServices products={quotationData.products} />
          <Separator className='mb-8' />
          {/* Summary & Payment */}
          <SummaryPayment {...quotationData.summary} />
          <div className="border-t-[3.75px] border-[rgba(142,81,255,1)] mt-8"></div>
          {/* Proceed Actions */}
          <ProceedActions
            {...quotationData.proceedActions}
            onApprove={() => setApproveDialogOpen(true)}
            onDecline={() => setDeclineDialogOpen(true)}
          />

          {/* Footer */}
          <QuoteFooter {...quotationData.footer} />
        </div>
      </div>
    </>
  );
}
