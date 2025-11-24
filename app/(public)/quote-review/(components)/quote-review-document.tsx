'use client';

import { useMemo, useState } from 'react';
import { QuoteNavbar } from './quote-navbar';
import { CustomerInformation } from './customer-information';
import { ProjectDetails } from './project-details';
import { ProductsServices } from './products-services';
import { SummaryPayment } from './summary-payment';
import { ProceedActions } from './proceed-actions';
import { QuoteFooter } from './quote-footer';
import { ActionDialog } from '@/components/action-dialog';
import { CircleX, CircleCheckBig } from 'lucide-react';
import { mockQuotationData } from './mock-data';
import { Separator } from '@/components/ui/separator';
import { QuoteStatusBanner } from './quote-status-banner';
import { QUOTE_STATUS as QuoteStatus } from '@/lib/types/quotation-enums';
import { downloadQuotePdf } from '@/lib/utils/pdf-download';
import { notifyError } from '@/lib/toast';

type QuoteReviewDocumentProps = {
  quoteId: string;
};

export default function QuoteReviewDocument({
  quoteId,
}: QuoteReviewDocumentProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>(QuoteStatus.PENDING);

  const quotationData = mockQuotationData;

  // State for navbar status (will be updated when user approves/declines)
  const [navbarStatus, setNavbarStatus] = useState<QuoteStatus>(quotationData.navbar.status);

  const handleDownloadPDF = async () => {
    console.log('Download PDF clicked for quote:', quoteId);
    try {
      await downloadQuotePdf(
        quotationData,
        quoteId,
        `QuarryLink-Quote-${quotationData.navbar.quoteNumber}`
      );
    } catch (error) {
      notifyError(
        error instanceof Error
          ? error.message
          : 'Failed to download PDF. Please try again.'
      );
    }
  };


  const handleApprove = async () => {
    console.log('Approve quotation:', quoteId);
    setQuoteStatus(QuoteStatus.APPROVED);
    setNavbarStatus(QuoteStatus.APPROVED);

    setApproveDialogOpen(false);
  };

  const handleDecline = async () => {
    console.log('Decline quotation:', quoteId);
    setQuoteStatus(QuoteStatus.DECLINED);
    setNavbarStatus(QuoteStatus.DECLINED);
    setDeclineDialogOpen(false);
  };

  const approveDialogDescription = useMemo(() => {
    const { project, navbar, customer, summary } = quotationData;
    const approvalNotes = [
      'Quote status changes from Pending to Approved',
      'Your account manager is notified of approval',
      'Pricing and terms are locked',
    ];

    const currencyFormatter = new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    });

    return (
      <div className="space-y-6 text-[#0F172A]">
        <div className="p-1">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-full bg-[#F0FDF4] text-[#008236] flex items-center justify-center">
              <CircleCheckBig className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">{project.projectName}</p>
              <div className="text-base text-[#6A7282] flex flex-wrap items-center gap-2">
                <span>{navbar.quoteNumber}</span>
                <span>•</span>
                <span>{customer.customerName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-base text-[#364153]">
            Are you sure you want to approve this quote?
          </p>
          <div className="rounded-2xl border border-[#B9F8CF] bg-[#F0FDF4] p-4">
            <div className="flex gap-3">
              <div className="text-[#008236] h-7 w-7 flex items-center justify-center">
                <CircleCheckBig className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-medium text-[#008236]">
                  Quote Approval
                </p>
                <p className="text-sm text-[#008236]">
                  Your approval will be recorded and your account manager will
                  be notified. They will contact you shortly to proceed with the
                  next steps.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-medium text-base text-[#101828]">
            What happens when quote is approved:
          </p>
          <ul className="space-y-2 text-sm text-[#6A7282]">
            {approvalNotes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="mt-[7px] h-[4px] w-[4px] rounded-full bg-[#6A7282]"></span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-100 bg-[#E5E5E5] p-3 space-y-2">
          <div className="flex items-center justify-between text-sm text-[#6A7282]">
            <span>Quote Total (incl. GST):</span>
            <span className="text-base font-medium text-[#101828]">
              {currencyFormatter.format(summary.total)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-[#6A7282]">
            <span>Customer:</span>
            <span className="text-base text-[#364153]">
              {customer.customerName}
            </span>
          </div>
        </div>
      </div>
    );
  }, [quotationData]);
  const declineDialogDescription = useMemo(() => {
    const { project, navbar, customer } = quotationData;
    const declineNotes = [
      'Quote status changes from Pending to Declined',
      'Your account manager is notified of declined status',
    ];

    return (
      <div className="space-y-4 text-[#0F172A]">
        <div>
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-full bg-[#FFE2E2] text-[#E7000B] flex items-center justify-center">
              <CircleX className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">{project.projectName}</p>
              <div className="text-base text-[#6A7282] flex flex-wrap items-center gap-2">
                <span>{navbar.quoteNumber}</span>
                <span>•</span>
                <span>{customer.customerName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-base text-[#364153]">
            Are you sure you want to decline this quote?
          </p>
          <div className="rounded-2xl border border-[#E7000B] bg-[#FFE2E2] p-4">
            <div className="flex gap-3">
              <div className="rounded-full text-[#E7000B] h-7 w-7 flex items-center justify-center">
                <CircleX className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-medium text-[#E7000B]">
                  Quote Declined
                </p>
                <p className="text-sm text-[#E7000B]">
                  This quote will be declined and your account manager will be
                  notified. Please contact them for further discussion, or they
                  will be in touch with you shortly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-medium text-base text-[#101828]">
            What happens when quote is declined:
          </p>
          <ul className=" text-sm text-[#6A7282]">
            {declineNotes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="mt-[8px] h-[4px] w-[4px] rounded-full bg-[#6A7282]"></span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }, [quotationData]);

  return (
    <>
      {/* Approve Dialog */}
      <ActionDialog
        open={approveDialogOpen}
        onOpenChangeAction={setApproveDialogOpen}
        title="Approve Quote"
        description={approveDialogDescription}
        confirmText="Approve Quote"
        confirmVariant="default"
        confirmCustomColor="#008236"
        onConfirmAction={handleApprove}
      />

      {/* Decline Dialog */}
      <ActionDialog
        open={declineDialogOpen}
        onOpenChangeAction={setDeclineDialogOpen}
        title="Decline Quote"
        description={declineDialogDescription}
        confirmText="Decline Quote"
        confirmVariant="destructive"
        onConfirmAction={handleDecline}
      />

      {/* Main Document */}
      <div className="min-h-screen bg-gray-100 p-4 print:px-0 print:py-0">
        <div className="max-w-[960px] mx-auto bg-white">
          {/* Navbar */}
          <QuoteNavbar
            {...quotationData.navbar}
            status={navbarStatus}
            onDownloadPDF={handleDownloadPDF}
          />

          {/* Status Banner */}
          <QuoteStatusBanner
            status={quoteStatus}
            accountManagerName={quotationData.navbar.accountManager}
          />

          {/* Customer Information */}
          <CustomerInformation {...quotationData.customer} />
          <Separator />
          {/* Project Details */}
          <ProjectDetails {...quotationData.project} />
          <Separator />

          {/* Products & Services */}
          <ProductsServices products={quotationData.products} />
          <Separator className="mb-8" />
          {/* Summary & Payment */}
          <SummaryPayment {...quotationData.summary} />
          <div className="border-t-[3.75px] border-[rgba(142,81,255,1)] mt-8"></div>
          {/* Proceed Actions */}
          <ProceedActions
            {...quotationData.proceedActions}
            status={quoteStatus || QuoteStatus.PENDING}
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
