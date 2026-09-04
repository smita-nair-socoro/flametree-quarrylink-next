'use client';

import { useEffect, useMemo, useState } from 'react';
import { QuoteNavbar } from './quote-navbar';
import { CustomerInformation } from './customer-information';
import { ProjectDetails } from './project-details';
import { ProductsServices } from './products-services';
import { SummaryPayment } from './summary-payment';
import { TermsAndConditions } from './terms-and-conditions';
import { ProceedActions } from './proceed-actions';
import { QuoteFooter } from './quote-footer';
import { ActionDialog } from '@/components/action-dialog';
import { CircleX, CircleCheckBig, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { QuoteStatusBanner } from './quote-status-banner';
import { QUOTE_STATUS as QuoteStatus } from '@/lib/types/quotation-enums';
import { downloadQuotePdf } from '@/lib/utils/pdf-download';
import { notifyError, notifySuccess } from '@/lib/toast';
import QuoteExpired from './quote-expired';
import { PublicQuoteLinkResponse } from '@/lib/types/quotation';
import { transformQuoteData } from './types/quote-transformer';
import { useUpdatePublicQuoteStatus } from '@/lib/api/quotation';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { centsToDollars } from '@/lib/utils/currency';

type QuoteReviewDocumentProps = {
  quoteId: string;
  quoteData: PublicQuoteLinkResponse;
  token: string; // Empty string for preview mode, actual token for public access
};

export default function QuoteReviewDocument({
  quoteId,
  quoteData,
  token,
}: Readonly<QuoteReviewDocumentProps>) {
  const [logoError, setLogoError] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [approveFullName, setApproveFullName] = useState('');
  const [declineFullName, setDeclineFullName] = useState('');
  const [declineReason, setDeclineReason] = useState<string>('');
  const [declineNotes, setDeclineNotes] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState(false);
  const [approvePoNumber, setApprovePoNumber] = useState('');
  const [showApproveValidationError, setShowApproveValidationError] =
    useState(false);

  const decisionMakerName = quoteData.quoteDto?.decisionMakerName || '';
  const existingPoNumber = quoteData.quoteDto?.poNumber || '';

  // Check if we're in preview mode (no token means authenticated preview)
  const isPreviewMode = !token;

  // Mutation hook for updating quote status
  const { mutate: updateQuoteStatus, isPending: isUpdatingStatus } =
    useUpdatePublicQuoteStatus();

  const quotationData = useMemo(
    () => transformQuoteData(quoteData),
    [quoteData],
  );

  // Get status directly from the transformed quotation data
  const currentQuoteStatus = quotationData.navbar.status;

  // State for quote status (will be updated when user approves/declines)
  const [quoteStatus, setQuoteStatus] =
    useState<QuoteStatus>(currentQuoteStatus);

  // State for navbar status (will be updated when user approves/declines)
  const [navbarStatus, setNavbarStatus] =
    useState<QuoteStatus>(currentQuoteStatus);

  useEffect(() => {
    if (!decisionMakerName) return;
    setApproveFullName(decisionMakerName);
    setDeclineFullName(decisionMakerName);
  }, [decisionMakerName]);

  useEffect(() => {
    if (!existingPoNumber) return;
    setApprovePoNumber(existingPoNumber);
  }, [existingPoNumber]);

  // Validation: Check if decline form is valid
  const isDeclineFormValid = useMemo(() => {
    // Must have a reason selected
    if (!declineReason) return false;

    // If reason is "other", must have notes
    if (declineReason === 'other' && !String(declineNotes).trim()) return false;

    return true;
  }, [declineReason, declineNotes]);

  const approveDialogDescription = useMemo(() => {
    const { project, navbar, customer, summary, currencyTax } = quotationData;
    const approvalNotes = [
      'Quote status changes from Pending to Approved',
      'Your account manager is notified of approval',
      'Pricing and terms are locked',
    ];

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
            <span>Quote Total (Incl. {currencyTax.taxLabel}):</span>
            <span className="text-base font-medium text-[#101828]">
              {currencyTax.currencySymbol}
              {centsToDollars(summary.total)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-[#6A7282]">
            <span>Customer:</span>
            <span className="text-base text-[#364153]">
              {customer.customerName}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="approve-full-name"
            className="text-base font-medium text-[#101828]"
          >
            Full Name*
          </label>
          <Input
            id="approve-full-name"
            value={approveFullName}
            onChange={(e) => setApproveFullName(e.target.value)}
            placeholder="Please type in your full name to approve"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="approve-po-number"
              className="text-base font-medium text-[#101828]"
            >
              Purchase Order Number*
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="max-w-62.5"
                backgroundClassName="bg-gray-900 text-white"
                arrowClassName="bg-gray-900 fill-gray-900"
              >
                <p className="text-xs">
                  Don&apos;t have a PO number? Enter N/A.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="approve-po-number"
            value={approvePoNumber}
            maxLength={20}
            onChange={(e) => {
              setApprovePoNumber(e.target.value);
              setShowApproveValidationError(false);
            }}
            placeholder="Enter Purchase Order Number"
          />
          {showApproveValidationError && !approvePoNumber.trim() && (
            <p className="text-xs text-[#E7000B]">
              Purchase Order Number is required
            </p>
          )}
        </div>
      </div>
    );
  }, [
    quotationData,
    approveFullName,
    approvePoNumber,
    showApproveValidationError,
  ]);

  const declineDialogDescription = useMemo(() => {
    const { project, navbar, customer } = quotationData;
    const declineNotesInfo = [
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

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="decline-reason"
              className="text-sm font-normal text-[#364153]"
            >
              Reason for declining <span className="text-[#E7000B]">*</span>
            </label>
            <Select
              value={declineReason}
              onValueChange={(value) => {
                setDeclineReason(value);
                setShowValidationError(false);
              }}
            >
              <SelectTrigger id="decline-reason" className="w-full">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="competitor_selected">
                  Competitor selected
                </SelectItem>
                <SelectItem value="customer_unresponsive">
                  Customer unresponsive
                </SelectItem>
                <SelectItem value="price_too_high">Price too high</SelectItem>
                <SelectItem value="project_cancelled">
                  Project cancelled
                </SelectItem>
                <SelectItem value="scope_changed">Scope changed</SelectItem>
                <SelectItem value="timeline_conflict">
                  Timeline conflict
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {showValidationError && !declineReason && (
              <p className="text-xs text-[#E7000B]">Please select a reason</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-normal text-[#6A7282]">
              Additional notes{' '}
              {declineReason === 'other' && (
                <span className="text-[#E7000B]">*</span>
              )}
            </label>
            <Textarea
              value={declineNotes}
              onChange={(e) => {
                setDeclineNotes(e.target.value);
                setShowValidationError(false);
              }}
              placeholder="Add any additional details about declining this quote..."
              className="min-h-[80px] resize-none"
            />
            {showValidationError &&
              declineReason === 'other' &&
              !String(declineNotes).trim() && (
                <p className="text-xs text-[#E7000B]">
                  Please provide additional notes when selecting
                  &quot;Other&quot;
                </p>
              )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-medium text-base text-[#101828]">
            What happens when quote is declined:
          </p>
          <ul className=" text-sm text-[#6A7282]">
            {declineNotesInfo.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="mt-[8px] h-[4px] w-[4px] rounded-full bg-[#6A7282]"></span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="decline-full-name"
            className="text-base font-medium text-[#101828]"
          >
            Full Name*
          </label>
          <Input
            id="decline-full-name"
            value={declineFullName}
            onChange={(e) => setDeclineFullName(e.target.value)}
            placeholder="Please type in your full name to decline"
          />
        </div>
      </div>
    );
  }, [
    quotationData,
    declineReason,
    showValidationError,
    declineNotes,
    declineFullName,
  ]);

  // Check if quote is expired - show expired page (only for public access, not preview mode)
  if (!isPreviewMode && currentQuoteStatus === QuoteStatus.EXPIRED) {
    // Get email information from API data or footer fallback
    const accountManagerEmail = undefined; // Account manager email not available in current API
    const businessEmail = quotationData.footer.email;
    return (
      <QuoteExpired
        accountManagerEmail={accountManagerEmail}
        businessEmail={businessEmail}
      />
    );
  }

  const handleDownloadPDF = async () => {
    setIsPdfDownloading(true);
    try {
      await downloadQuotePdf(
        { ...quotationData, navbar: { ...quotationData.navbar, logoError } },
        quoteId,
        `QuarryLink-Quote-${quotationData.navbar.quoteNumber}`,
        undefined,
        quotationData.navbar.tenantDetails,
      );
    } catch (error) {
      notifyError(
        error instanceof Error
          ? error.message
          : 'Failed to download PDF. Please try again.',
      );
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleApprove = async () => {
    // PO Number is mandatory when a customer approves a quote.
    if (!approvePoNumber.trim()) {
      setShowApproveValidationError(true);
      return;
    }

    const composedDecisionMakerName = `customer-${approveFullName.trim()}`;
    updateQuoteStatus(
      {
        status: 'APPROVED',
        token,
        decisionMakerName: composedDecisionMakerName,
        poNumber: approvePoNumber.trim(),
      },
      {
        onSuccess: () => {
          setQuoteStatus(QuoteStatus.APPROVED);
          setNavbarStatus(QuoteStatus.APPROVED);
          setApproveDialogOpen(false);
          notifySuccess('Quote approved successfully');
        },
        onError: (error) => {
          console.error('Failed to approve quote:', error);
          notifyError(extractErrorMessage(error));
        },
      },
    );
  };

  const handleDecline = async () => {
    // Validate form before submitting
    if (!isDeclineFormValid) {
      setShowValidationError(true);
      return;
    }

    // Map reason keys to human-readable labels for the backend
    const reasonLabels: Record<string, string> = {
      price_too_high: 'Price too high',
      timeline_conflict: 'Timeline conflict',
      scope_changed: 'Scope changed',
      customer_unresponsive: 'Customer unresponsive',
      competitor_selected: 'Competitor selected',
      project_cancelled: 'Project cancelled',
      other: 'Other',
    };
    const reasonLabel = reasonLabels[declineReason] || declineReason;

    // Compose decline reason: "{reasonLabel}-{declineNote}" or "{reasonLabel}"
    const composedDeclineReason = declineNotes.trim()
      ? `${reasonLabel}-${declineNotes.trim()}`
      : reasonLabel;

    const composedDecisionMakerName = `customer-${declineFullName.trim()}`;
    updateQuoteStatus(
      {
        status: 'DECLINED',
        token,
        declineReason: composedDeclineReason,
        decisionMakerName: composedDecisionMakerName,
      },
      {
        onSuccess: () => {
          setQuoteStatus(QuoteStatus.DECLINED);
          setNavbarStatus(QuoteStatus.DECLINED);
          setDeclineDialogOpen(false);
          notifySuccess('Quote declined successfully');
          // Reset form after successful decline
          setDeclineReason('');
          setDeclineNotes('');
          setShowValidationError(false);
        },
        onError: (error) => {
          console.error('Failed to decline quote:', error);
          notifyError(extractErrorMessage(error));
        },
      },
    );
  };

  return (
    <>
      {/* Approve Dialog */}
      <ActionDialog
        open={approveDialogOpen}
        onOpenChangeAction={(open) => {
          setApproveDialogOpen(open);
          if (!open) {
            setApproveFullName('');
            setApprovePoNumber('');
            setShowApproveValidationError(false);
          }
        }}
        title="Approve Quote"
        description={approveDialogDescription}
        confirmText={isUpdatingStatus ? 'Approving...' : 'Approve Quote'}
        confirmVariant="default"
        confirmCustomColor="#008236"
        confirmDisabled={isUpdatingStatus || !approvePoNumber.trim()}
        onConfirmAction={handleApprove}
      />

      {/* Decline Dialog */}
      <ActionDialog
        open={declineDialogOpen}
        onOpenChangeAction={(open) => {
          setDeclineDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setDeclineFullName('');
            setDeclineReason('');
            setDeclineNotes('');
            setShowValidationError(false);
          }
        }}
        title="Decline Quote"
        description={declineDialogDescription}
        confirmText={isUpdatingStatus ? 'Declining...' : 'Decline Quote'}
        confirmVariant="destructive"
        confirmDisabled={isUpdatingStatus || !isDeclineFormValid}
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
            isPdfDownloading={isPdfDownloading}
            logoError={logoError}
            onLogoError={() => setLogoError(true)}
          />

          {/* Status Banner */}
          <QuoteStatusBanner status={quoteStatus} />

          {/* Customer Information */}
          <CustomerInformation {...quotationData.customer} />
          <Separator />
          {/* Project Details */}
          <ProjectDetails {...quotationData.project} />
          <Separator />

          {/* Products & Services */}
          <ProductsServices
            products={quotationData.products}
            currencyTax={quotationData.currencyTax}
            includeDeliveryPrices={quotationData.inclDeliveryCost}
          />
          <Separator className="mb-8" />
          {/* Summary & Payment */}
          <SummaryPayment
            {...quotationData.summary}
            currencyTax={quotationData.currencyTax}
            includeDeliveryPrices={quotationData.inclDeliveryCost}
          />
          {(quotationData.notes?.length > 0 ||
            quotationData.terms?.length > 0 ||
            quotationData.documents?.length > 0) && <Separator />}
          {/* Notes & Terms */}
          <TermsAndConditions
            notes={quotationData.notes}
            terms={quotationData.terms}
            documents={quotationData.documents}
          />
          <div className="border-t-[3.75px] border-[rgba(142,81,255,1)] mt-8"></div>
          {/* Proceed Actions - only show if not in preview mode */}
          {!isPreviewMode && (
            <ProceedActions
              {...quotationData.proceedActions}
              status={quoteStatus || QuoteStatus.PENDING}
              onApprove={() => setApproveDialogOpen(true)}
              onDecline={() => setDeclineDialogOpen(true)}
            />
          )}

          {/* Footer */}
          <QuoteFooter {...quotationData.footer} />
        </div>
      </div>
    </>
  );
}
