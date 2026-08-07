'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FormDialog } from '@/components/form-dialog';
import { Quotation, QuotationDTO } from '@/lib/types/quotation';
import QuotationForm from '@/app/(protected)/customer-operations/quotation/(components)/forms/quotation-form';
import { QuotationActionButtons } from '@/app/(protected)/customer-operations/quotation/(components)/forms/quotation-action-buttons';
import { ActionDialog } from '@/components/action-dialog';
import { useQuotationStore } from '@/app/stores/quotation-store';
import {
  Archive,
  ArrowRight,
  Calendar,
  CircleCheckBig,
  CircleX,
  RotateCcw,
  Send,
  Eye,
  Briefcase,
} from 'lucide-react';
import { centsToDollars } from '@/lib/utils/currency';
import { parseCalendarDate, GetTodaysDate } from '@/lib/utils/date';
import { DatePicker } from '@/components/date-picker';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  // QuotationWithLineItemsQueryOptions,
  useConvertToDraft,
  useConvertToJob,
  useExtendExpiryDate,
  useUpdateQuotation,
  useSendToCustomer,
  useUpdateQuoteDecision,
} from '@/lib/api/quotation';
import { APIClient } from '@/lib/api/APIClient';
import { notifySuccess, notifyError } from '@/lib/toast';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { QUOTE_STATUS as QuoteStatus } from '@/lib/types/quotation-enums';
import { useTenantStore } from '@/app/stores/tenant-store';
import { MultipleInput } from '@/components/ui/multiple-input';
import { useQuery } from '@tanstack/react-query';
import { CustomerDetailQueryOptions } from '@/lib/api/customer';
import { startOfDay } from 'date-fns';

interface DialogConfig {
  title?: string;
  description?: React.ReactNode;
  content?: React.ReactNode;
  confirmText?: string;
  confirmVariant?:
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost';
  confirmCustomColor?: string;
  confirmCustomClass?: string;
  confirmIcon?: React.ReactNode;
  confirmActionNeeded?: boolean;
  confirmDisabled?: boolean;
}

interface SelectedAction {
  key: string;
}

const getDialogConfigs = (
  quotationData?: Quotation | null,
  selectedAction?: SelectedAction,
  newExpiryDate?: Date,
  setNewExpiryDate?: (date: Date) => void,
  includeDeliveryPrices?: boolean,
  setIncludeDeliveryPrices?: (value: boolean) => void,
  onPreviewClick?: () => void,
  declineReason?: string,
  setDeclineReason?: (reason: string) => void,
  declineNotes?: string,
  setDeclineNotes?: (notes: string) => void,
  showDeclineValidationError?: boolean,
  setShowDeclineValidationError?: (show: boolean) => void,
  isDeclineFormValid?: boolean,
  additionalRecipientEmails?: string[],
  setAdditionalRecipientEmails?: (emails: string[]) => void,
  fixedCustomerEmail?: string,
): Record<string, DialogConfig> => {
  const quotationNumber = quotationData?.quoteNumber;
  const projectName = quotationData?.projectName;
  const customerName = quotationData?.customerName;
  const customerEmail =
    fixedCustomerEmail ||
    quotationData?.email ||
    quotationData?.customerWithAddressResponseDto?.email;
  const totalSellPriceExGST = quotationData?.totalSellPrice || 0;
  const gst = totalSellPriceExGST * 0.1;
  const totalSellPrice = centsToDollars(totalSellPriceExGST + gst);
  const lineItemsCount = quotationData?.lineItemsCount;
  const expiryDate = quotationData?.expiryDate;
  const today = startOfDay(new Date());

  if (selectedAction?.key === 'sendToCustomer') {
    return {
      sendToCustomer: {
        title: 'Send Quote',
        description: (
          <div className="flex justify-start items-center gap-3">
            <div className="flex w-[40px] h-[40px] justify-center items-center bg-[#FFF7ED] rounded-full flex-shrink-0">
              <Send className="h-[20px] w-[20px] text-[#F54900]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[16px] text-[#101828]">
                {projectName}
              </span>
              <div className="flex justify-start items-center gap-1.5">
                <span className="text-[14px] text-[#6A7282]">
                  {quotationNumber}
                </span>
                <span className="text-[14px] text-[#6A7282]">•</span>
                <span className="text-[14px] text-[#6A7282]">
                  {customerName}
                </span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to send this quote to the customer?
            </span>

            {
              <div className="border border-[#E5E7EB] rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="font-base text-[16px] text-[#101828] mb-1">
                      Include Delivery Prices
                    </div>
                    <p className="text-[13px] text-[#6A7282]">
                      {includeDeliveryPrices
                        ? 'Delivery prices will be shown as separate line items in the customer quote.'
                        : 'Only the total price will be shown. Delivery costs are included but not itemised separately.'}
                    </p>
                  </div>
                  {/* Desktop: Switch */}
                  <Switch
                    checked={includeDeliveryPrices}
                    onCheckedChange={setIncludeDeliveryPrices}
                    className="hidden md:flex data-[state=checked]:bg-[#F54900]"
                  />
                  {/* Mobile: Single Radio as toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setIncludeDeliveryPrices?.(!includeDeliveryPrices)
                    }
                    className="flex md:hidden items-center justify-center w-5 h-5 rounded-full border-2 border-input transition-colors data-[checked=true]:border-[#F54900]"
                    data-checked={includeDeliveryPrices}
                  >
                    {includeDeliveryPrices && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F54900]" />
                    )}
                  </button>
                </div>

                {/* Preview Quote Button */}
                <Button
                  variant="default"
                  size="lg"
                  onClick={onPreviewClick}
                  className="mt-3 text-orange-600 border-base-input hover:bg-orange-200 bg-orange-100"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Preview Quote
                </Button>
              </div>
            }

            {/* Quote Delivery Section */}
            <div className="border border-[#FFD6A7] rounded-lg p-4 bg-[#FFF7ED]">
              <div className="flex justify-start gap-3 self-stretch">
                <Send className="h-[20px] w-[20px] text-[#F54900] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#F54900] font-semibold">
                    Quote Delivery
                  </span>
                  <span className="text-[14px] font-normal text-[#F54900]">
                    The quote will be sent via email to the recipient(s) below
                    and the status will change to Pending.
                  </span>
                </div>
              </div>
            </div>

            {/* What happens when quote is sent */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                What happens when quote is sent:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-1 list-disc list-outside pl-5">
                <li>Quote status changes from Draft to Pending</li>
                <li>Customer receives email with PDF quote</li>
                <li>Approval process begins</li>
                <li>Quote can no longer be edited</li>
              </ul>
            </div>

            {/* Recipient Emails */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                Recipient Emails*
              </span>
              <MultipleInput
                value={additionalRecipientEmails?.join(', ')}
                onChange={(val) => {
                  const emails = val
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setAdditionalRecipientEmails?.(emails);
                }}
                fixedValues={customerEmail ? [customerEmail] : []}
                label="Press Enter or comma to add email addresses for delivery receipts."
                placeholder="Add email..."
              />
            </div>
          </div>
        ),
        confirmText: 'Send Quote',
        confirmVariant: 'default',
        confirmCustomColor: '#F54900',
      },
    };
  } else if (selectedAction?.key === 'previewQuote') {
    // For COLLECTION type, this dialog won't be shown (handled in action handler)
    return {
      previewQuote: {
        title: 'Preview Quote',
        description: (
          <div className="flex justify-start items-center gap-3">
            <div className="flex w-[40px] h-[40px] justify-center items-center bg-[#FFF7ED] rounded-full flex-shrink-0">
              <Send className="h-[20px] w-[20px] text-[#F54900]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[16px] text-[#101828]">
                {projectName}
              </span>
              <div className="flex justify-start items-center gap-1.5">
                <span className="text-[14px] text-[#6A7282]">
                  {quotationNumber}
                </span>
                <span className="text-[14px] text-[#6A7282]">•</span>
                <span className="text-[14px] text-[#6A7282]">
                  {customerName}
                </span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            {' '}
            {
              <div className="border border-[#E5E5E5] rounded-lg p-4 bg-[#FFFFFF]">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="font-base text-[16px] text-[#101828] mb-2">
                      Include Delivery Prices
                    </div>
                    <p className="text-[14px] text-[#6B7280] leading-relaxed">
                      {includeDeliveryPrices
                        ? 'Delivery prices will be shown as separate line items in the customer quote.'
                        : 'Only the total price will be shown. Delivery costs are included but not itemised separately.'}
                    </p>
                  </div>
                  {/* Desktop: Switch */}
                  <Switch
                    checked={includeDeliveryPrices}
                    onCheckedChange={setIncludeDeliveryPrices}
                    className="hidden md:flex data-[state=checked]:bg-[#F54900]"
                  />
                  {/* Mobile: Single Radio as toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setIncludeDeliveryPrices?.(!includeDeliveryPrices)
                    }
                    className="flex md:hidden items-center justify-center w-5 h-5 rounded-full border-2 border-input transition-colors data-[checked=true]:border-[#F54900]"
                    data-checked={includeDeliveryPrices}
                  >
                    {includeDeliveryPrices && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F54900]" />
                    )}
                  </button>
                </div>
              </div>
            }
          </div>
        ),
        confirmText: 'Preview Quote',
        confirmVariant: 'default',
        confirmCustomColor: '#F54900',
      },
    };
  } else if (selectedAction?.key === 'approve') {
    return {
      approve: {
        title: 'Approve Quote',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#F0FDF4] rounded-full">
              <span className="flex items-center justify-center">
                <CircleCheckBig className="h-[20px] w-[20px] text-[#008236]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{projectName}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">
                  {quotationNumber}
                </span>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{projectName}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to approve this quote?
            </span>
            <div className="border-1 border-[#B9F8CF] rounded-md p-[16.625px] bg-[#F0FDF4]">
              <div className="flex justify-start gap-2 self-stretch">
                <CircleCheckBig className="h-[20px] w-[20px] text-[#008236] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#008236] font-medium">
                    Quote Approval
                  </span>
                  <span className="text-[14px] font-normal text-[#008236]">
                    This quote will be approved and can proceed to job
                    conversion. Customer will be notified.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when Quote is approved:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> Quote status changes from Pending to Approved</li>
                <li> Customer is notified of approval</li>
                <li> Quote becomes ready for job conversion</li>
                <li> Pricing and terms are locked</li>
              </ul>
            </div>

            <div className="rounded-md p-1 bg-[#E5E5E5]">
              <div className="flex flex-col gap-1 px-4 py-2">
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Quote Total (Incl. GST):
                  </span>
                  <span className="text-[16px] font-medium text-[#101828]">
                    ${totalSellPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Customer:
                  </span>
                  <span className="text-[16px] font-normal text-[#364153]">
                    {customerName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Approve Quote',
        confirmVariant: 'default',
        confirmCustomColor: '#008236',
      },
    };
  } else if (selectedAction?.key === 'decline') {
    return {
      decline: {
        title: 'Decline Quote',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFE2E2] rounded-full">
              <span className="flex items-center justify-center">
                <CircleX className="h-[20px] w-[20px] text-[#E7000B]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{projectName}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">
                  {quotationNumber}
                </span>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{projectName}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to decline this quote?
            </span>
            <div className="border-1 border-[#E7000B] rounded-md p-[16.625px] bg-[#FFE2E2]">
              <div className="flex justify-start gap-2 self-stretch">
                <CircleX className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#E7000B] font-medium">
                    Quote Declined
                  </span>
                  <span className="text-[14px] font-normal text-[#E7000B]">
                    This quote will be declined and the customer will be
                    notified. The quote cannot be converted to a job.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-normal text-[#364153]">
                Reason for declining <span className="text-[#111827]">*</span>
              </label>
              <Select
                value={declineReason}
                onValueChange={(value) => {
                  if (setDeclineReason) {
                    setDeclineReason(value);
                  }
                  if (setShowDeclineValidationError) {
                    setShowDeclineValidationError(false);
                  }
                }}
              >
                <SelectTrigger className="w-full">
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
              {showDeclineValidationError && !declineReason && (
                <p className="text-xs text-[#E7000B]">Please select a reason</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-normal text-[#6A7282]">
                Additional notes{declineReason === 'other' && <>{' '}<span className="text-[#111827]">*</span></>}
              </label>
              <Textarea
                value={declineNotes}
                onChange={(e) => {
                  if (setDeclineNotes) {
                    setDeclineNotes(e.target.value);
                  }
                  if (setShowDeclineValidationError) {
                    setShowDeclineValidationError(false);
                  }
                }}
                placeholder="Add any additional details about declining this quote..."
                className="min-h-[80px] resize-none"
              />
              {showDeclineValidationError &&
                declineReason === 'other' &&
                !String(declineNotes).trim() && (
                  <p className="text-xs text-[#E7000B]">
                    Please provide additional notes when selecting
                    &quot;Other&quot;
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when quote is declined:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li>Quote status changes from Pending to Declined</li>
                <li>Customer is notified of declined status</li>
                <li>
                  Quote can be edited and resent to customer later if needed
                </li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Decline Quote',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
        confirmDisabled: !isDeclineFormValid,
      },
    };
  } else if (selectedAction?.key === 'convertToDraft') {
    return {
      convertToDraft: {
        title: 'Convert Quote to Draft',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-gray-300 rounded-full">
              <span className="flex items-center justify-center">
                <RotateCcw className="h-[20px] w-[20px]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{projectName}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">
                  {quotationNumber}
                </span>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{projectName}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to convert this quote to Draft?
            </span>
            <div className="rounded-md p-[16.625px] bg-gray-300">
              <div className="flex justify-start gap-2 self-stretch">
                <ArrowRight className="h-[20px] w-[20px] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] font-medium">
                    Convert to Draft
                  </span>
                  <span className="text-[14px] font-normal">
                    This quote will be converted to Draft and the quote will be
                    editable.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Convert to Draft',
        confirmVariant: 'default',
        confirmCustomColor: '#9CA3AF',
      },
    };
  } else if (selectedAction?.key === 'convertToJob') {
    return {
      convertToJob: {
        title: 'Convert Quote to Job',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#1E3A8A] rounded-full">
              <span className="flex items-center justify-center">
                <ArrowRight className="h-[20px] w-[20px] text-[#ffffff]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{projectName}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">
                  {quotationNumber}
                </span>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{customerName}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to approve this quote?
            </span>
            <div className="rounded-md p-[16.625px] bg-[#1E3A8A]">
              <div className="flex justify-start gap-2 self-stretch">
                <ArrowRight className="h-[20px] w-[20px] text-[#ffffff] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#ffffff] font-medium">
                    Job Creation
                  </span>
                  <span className="text-[14px] font-normal text-[#ffffff]">
                    A new job will be created from this quote with all line
                    items and pricing. This action cannot be undone.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when converted to job:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> Creates a new job (JOB###) from this quote</li>
                <li> Copies all line items to the new job</li>
                <li> Changes quote status to "Converted to Job"</li>
                <li> This action cannot be undone</li>
              </ul>
            </div>

            <div className="rounded-md p-1 bg-[#E5E7EB]">
              <div className="flex flex-col gap-1 px-4 py-2">
                <div className="flex justify-between gap-2">
                  <span className="text-[14px] font-normal text-[#6A7282] shrink-0">
                    Project Name
                  </span>
                  <span className="text-[16px] font-medium text-[#364153] text-right">
                    {projectName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[14px] font-normal text-[#6A7282] shrink-0">
                    Customer
                  </span>
                  <span className="text-[16px] font-medium text-[#364153] text-right">
                    {customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Total Value (Incl. GST):
                  </span>
                  <span className="text-[16px] font-medium text-[#101828]">
                    ${totalSellPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Line Items
                  </span>
                  <span className="text-[16px] font-normal text-[#364153]">
                    {lineItemsCount === 1
                      ? '1 product'
                      : `${lineItemsCount} products`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Convert to Job',
        confirmVariant: 'default',
        confirmCustomColor: '#1E3A8A',
        confirmIcon: <Briefcase className="h-4 w-4" />,
      },
    };
  } else if (selectedAction?.key === 'extendExpiry') {
    return {
      extendExpiry: {
        title: 'Extend Expiry Date',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFF7ED] rounded-full">
              <span className="flex items-center justify-center">
                <Calendar className="h-[20px] w-[20px] text-[#F54900]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{projectName}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">
                  {quotationNumber}
                </span>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{projectName}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to extend the expiry date for this quote?
            </span>
            <div className="border-1 border-[#FFD6A7] rounded-md p-[16.625px] bg-[#FFF7ED]">
              <div className="flex justify-start gap-2 self-stretch">
                <Calendar className="h-[20px] w-[20px] text-[#F54900] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#F54900] font-medium">
                    Expiry Extension
                  </span>
                  <span className="text-[14px] font-normal text-[#F54900]">
                    The quote expiry date will be extended, changing status to
                    Pending and allowing customer sending.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                Current Expiry Date
              </span>
              <div className="rounded-md p-1 bg-[#E5E5E5]">
                <span className="text-[14px] font-normal text-[#6A7282] pl-2">
                  {new Date(expiryDate ?? '').toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                New Expiry Date
              </span>
              <DatePicker
                value={newExpiryDate}
                onChangeAction={(date) => {
                  if (date && setNewExpiryDate) {
                    setNewExpiryDate(date);
                  }
                }}
                disabledDates={{ before: today }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when expiry is extended:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> Quote status changes to Pending</li>
                <li> New expiry date is set</li>
                <li> Quote can be sent to customer again</li>
                <li> Customer can approve / decline again</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Extend Expiry Date',
        confirmVariant: 'default',
        confirmCustomColor: '#F54900',
      },
    };
  } else if (selectedAction?.key === 'archive') {
    return {
      archive: {
        title: 'Archive Quote',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#F3F4F6] rounded-full">
              <span className="flex items-center justify-center">
                <Archive className="h-[20px] w-[20px] text-[#6B7280]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{projectName}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">
                  {quotationNumber}
                </span>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{projectName}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to archive this quote?
            </span>
            <div className="border-1 border-[#D1D5DB] rounded-md p-[16.625px] bg-[#F9FAFB]">
              <div className="flex justify-start gap-2 self-stretch">
                <Archive className="h-[20px] w-[20px] text-[#6B7280] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#374151] font-medium">
                    Quote Archived
                  </span>
                  <span className="text-[14px] font-normal text-[#6B7280]">
                    This quote will be moved to archived status and removed from
                    active quote lists for better organization.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when Quote is archived:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> Quote status changes to Archived</li>
                <li> Quote is removed from active quote lists section</li>
                <li> Quote becomes read-only for reference</li>
                <li> Historical data is preserved permanently</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What continues to work:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> Quote remains accessible in archived section</li>
                <li> All quote data and attachments preserved</li>
                <li> Customer relationship history maintained</li>
                <li> Reporting and analytics include archived data</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Archive Quote',
        confirmVariant: 'default',
        confirmCustomColor: '#6B7280',
      },
    };
  }
  return {};
};

export function useQuotationActions(quotationData?: Quotation | null) {
  const selectedQuotation = useQuotationStore(
    (state) => state.selectedQuotation,
  );
  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation,
  );
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [isFormDirty, setIsFormDirty] = React.useState(false);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const quotationId = selectedQuotation?.id ?? quotationData?.id;
  const [newExpiryDate, setNewExpiryDate] = React.useState<Date>(() => {
    const weekFromToday = new Date();
    weekFromToday.setDate(weekFromToday.getDate() + 7);
    return weekFromToday;
  });

  // Decline form state
  const [declineReason, setDeclineReason] = React.useState<string>('');
  const [declineNotes, setDeclineNotes] = React.useState<string>('');
  const [showDeclineValidationError, setShowDeclineValidationError] =
    React.useState(false);
  const [additionalRecipientEmails, setAdditionalRecipientEmails] =
    React.useState<string[]>([]);

  const { data: sendDialogCustomer } = useQuery({
    ...CustomerDetailQueryOptions(quotationData?.customerId ?? 0),
    enabled:
      !!quotationData?.customerId &&
      selectedAction?.key === 'sendToCustomer',
  });
  const sendDialogCustomerEmail = sendDialogCustomer?.contactPersonEmail || '';

  const user = useTenantStore((state) => state.user);
  const router = useRouter();

  // Decline form validation
  const isDeclineFormValid = React.useMemo(() => {
    if (!declineReason) return false;
    if (declineReason === 'other' && !declineNotes.trim()) return false;
    return true;
  }, [declineReason, declineNotes]);
  const [includeDeliveryPrices, setIncludeDeliveryPrices] = React.useState(
    quotationData?.inclDeliveryCost ?? false,
  );

  const extendExpiryMutation = useExtendExpiryDate();
  const updateQuotationMutation = useUpdateQuotation();
  const sendToCustomerMutation = useSendToCustomer();
  const convertToDraftMutation = useConvertToDraft();
  const convertToJobMutation = useConvertToJob();
  const updateQuoteDecisionMutation = useUpdateQuoteDecision();

  // Reset the new expiry date to 7 days from now when the extend expiry dialog opens
  React.useEffect(() => {
    if (selectedAction?.key === 'extendExpiry') {
      const weekFromToday = new Date();
      weekFromToday.setDate(weekFromToday.getDate() + 7);
      setNewExpiryDate(weekFromToday);
    }
  }, [selectedAction?.key]);

  // Reset decline form when decline dialog opens or closes
  React.useEffect(() => {
    if (selectedAction?.key === 'decline') {
      // Reset form to initial state when opening
      setDeclineReason('');
      setDeclineNotes('');
      setShowDeclineValidationError(false);
    }
  }, [selectedAction?.key]);

  // Reset recipient emails when send-to-customer dialog opens
  React.useEffect(() => {
    if (selectedAction?.key === 'sendToCustomer') {
      const existing = quotationData?.emailRecipients ?? [];
      const emails = sendDialogCustomerEmail
        ? [
          sendDialogCustomerEmail,
          ...existing.filter((e) => e !== sendDialogCustomerEmail),
        ]
        : existing;
      setAdditionalRecipientEmails(emails);
    }
  }, [selectedAction?.key, quotationData?.emailRecipients, sendDialogCustomerEmail]);

  // Sync includeDeliveryPrices with backend value when quotation data changes
  React.useEffect(() => {
    if (quotationData?.inclDeliveryCost !== undefined) {
      setIncludeDeliveryPrices(quotationData.inclDeliveryCost);
    }
  }, [quotationData?.inclDeliveryCost]);

  // Sync quotationData to store when view is open, to ensure FormDialog (which reads from store) has fresh data
  React.useEffect(() => {
    if (viewOpen && quotationData) {
      setSelectedQuotation(quotationData);
    }
  }, [viewOpen, quotationData, setSelectedQuotation]);

  const handlePreviewFromDialog = () => {
    if (!quotationId) {
      notifyError('Unable to preview quotation');
      return;
    }

    // Open preview in new tab with inclDeliveryCost as URL parameter
    // The preview page will fetch data from API and override inclDeliveryCost with this value
    const previewUrl = `/quote-review/?quoteId=${quotationId}&inclDeliveryCost=${includeDeliveryPrices}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const dialogConfigs = getDialogConfigs(
    quotationData,
    selectedAction || undefined,
    newExpiryDate,
    setNewExpiryDate,
    includeDeliveryPrices,
    setIncludeDeliveryPrices,
    handlePreviewFromDialog,
    declineReason,
    setDeclineReason,
    declineNotes,
    setDeclineNotes,
    showDeclineValidationError,
    setShowDeclineValidationError,
    isDeclineFormValid,
    additionalRecipientEmails,
    setAdditionalRecipientEmails,
    sendDialogCustomerEmail,
  );

  const createDialogAction = (actionKey: string) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const handleSendToCustomerClick = () => {
    // Guard: don't open the dialog if the quote is already expired
    if (quotationData?.expiryDate) {
      try {
        const expiry = parseCalendarDate(quotationData.expiryDate);
        if (expiry < GetTodaysDate()) {
          notifyError(
            `Quote expired on ${expiry.toLocaleDateString(
              'en-AU',
            )}. Please extend the expiry date.`,
          );
          return;
        }
      } catch {
        // Ignore unparsable expiry dates and allow the dialog to open
      }
    }

    setSelectedAction({ key: 'sendToCustomer' });
    setActiveDialog('sendToCustomer');
  };

  // Build a safe payload for update actions (keeps status)
  const buildUpdatePayload = (
    overrides: Partial<QuotationDTO>,
  ): Partial<QuotationDTO> | null => {
    if (!quotationData) return null;

    const { quoteStatus, ...rest } = quotationData;
    return {
      ...rest,
      quoteStatus: overrides.quoteStatus ?? quoteStatus,
      ...overrides,
    };
  };

  // Extracted action handlers
  const handleSendToCustomer = async () => {
    if (!quotationId) {
      notifyError(extractErrorMessage('Unable to send quotation to customer'));
      return;
    }

    try {
      await sendToCustomerMutation.mutateAsync({
        id: quotationId,
        inclDeliveryCost: includeDeliveryPrices,
        emailRecipients: additionalRecipientEmails,
      });

      notifySuccess('Quotation sent to customer');
      setActiveDialog(null);
      setSelectedAction(null);
    } catch (error) {
      const err = extractErrorResponse(error);
      const expiryDateErrorPhrase = 'Quote expired on';
      const isExpiryDateError = err?.message?.includes(expiryDateErrorPhrase);
      if (isExpiryDateError) {
        notifyError(
          extractErrorMessage(
            'Quote Expired Date is the past. Please extend the expiry date.',
          ),
        );
        return;
      }
      notifyError(extractErrorMessage(error));
    }
  };

  const handleApprove = async () => {
    if (!quotationId || !quotationData) {
      notifyError(extractErrorMessage('Unable to approve quotation'));
      return;
    }
    try {
      const decisionMakerName = `tenant-${user}`;
      await updateQuoteDecisionMutation.mutateAsync({
        id: quotationId,
        status: 'APPROVED',
        decisionMakerName,
      });
      notifySuccess('Quotation Approved');
      setActiveDialog(null);
      setSelectedAction(null);
    } catch (error) {
      console.error('Failed to approve quotation:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handleDecline = async () => {
    // Validate form before submitting
    if (!isDeclineFormValid) {
      setShowDeclineValidationError(true);
      return;
    }

    if (!quotationId) {
      notifyError(extractErrorMessage('Unable to decline quotation'));
      return;
    }

    try {
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

      const decisionMakerName = `tenant-${user}`;
      await updateQuoteDecisionMutation.mutateAsync({
        id: quotationId,
        status: 'DECLINED',
        declineReason: composedDeclineReason,
        decisionMakerName,
      });
      notifySuccess('Quotation Declined');
      setActiveDialog(null);
      setSelectedAction(null);
      // Reset form after successful decline
      setDeclineReason('');
      setDeclineNotes('');
      setShowDeclineValidationError(false);
    } catch (error) {
      console.error('Failed to decline quotation:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handleConvertToJob = async () => {
    if (!quotationId) {
      notifyError(extractErrorMessage('Unable to convert quotation to job'));
      return;
    }

    try {
      const job = await convertToJobMutation.mutateAsync(quotationId);
      notifySuccess('Quotation converted to job');
      setActiveDialog(null);
      setSelectedAction(null);
      router.push(`/customer-operations/jobs?ids=${job.id}`);
    } catch (error) {
      console.error('Failed to convert quotation to job:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handleConvertToDraft = async () => {
    if (!quotationId) {
      notifyError(extractErrorMessage('Unable to convert quotation to draft'));
      return;
    }

    try {
      await convertToDraftMutation.mutateAsync(quotationId);
      notifySuccess('Quotation converted to draft');
      setActiveDialog(null);
      setSelectedAction(null);
    } catch (error) {
      console.error('Failed to convert quotation to draft:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handleExtendExpiry = async () => {
    if (!quotationId) return;

    try {
      await extendExpiryMutation.mutateAsync({
        id: quotationId,
        expiryDate: newExpiryDate,
      });
      notifySuccess('Expiry Date Extended');
      setActiveDialog(null);
      setSelectedAction(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
      console.log('Failed to extend expiry date:', error);
    }
  };

  const handleArchive = async () => {
    if (!quotationId || !quotationData) {
      notifyError(extractErrorMessage('Unable to archive quotation'));
      return;
    }

    try {
      const accountManagerSub =
        quotationData.accountManagerSub ||
        (await APIClient.quotations.getWithQuoteItems(quotationId)).accountManagerSub;

      const quotationDTO = buildUpdatePayload({
        quoteStatus: QuoteStatus.ARCHIVED,
        accountManagerSub,
      });

      if (!quotationDTO) {
        notifyError(extractErrorMessage('Missing quotation data for update'));
        return;
      }

      await updateQuotationMutation.mutateAsync({
        ...quotationDTO,
        id: quotationId,
      });
      notifySuccess('Quotation Archived');
      setActiveDialog(null);
      setSelectedAction(null);
    } catch (error) {
      console.error('Failed to archive quotation:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handlePreviewQuote = async () => {
    if (!quotationId) {
      notifyError('Unable to preview quotation');
      return;
    }

    // Open preview in new tab with inclDeliveryCost as URL parameter
    // The preview page will fetch data from API and override inclDeliveryCost with this value
    const previewUrl = `/quote-review/?quoteId=${quotationId}&inclDeliveryCost=${includeDeliveryPrices}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');

    // Close the modal after opening preview
    setActiveDialog(null);
    setSelectedAction(null);
  };

  // Map action keys to their handlers
  const actionHandlers: Record<string, () => Promise<void>> = {
    sendToCustomer: handleSendToCustomer,
    previewQuote: handlePreviewQuote,
    approve: handleApprove,
    decline: handleDecline,
    convertToDraft: handleConvertToDraft,
    convertToJob: handleConvertToJob,
    extendExpiry: handleExtendExpiry,
    archive: handleArchive,
  };

  const actions = {
    duplicate: (quotation?: Quotation | null) => {
      useQuotationStore.getState().setIsDuplicate(true);
      const toSelect = quotation ?? quotationData;
      if (toSelect) {
        setSelectedQuotation(toSelect);
      }
      setDuplicateOpen(true);
    },

    sendToCustomer: handleSendToCustomerClick,

    approve: createDialogAction('approve'),

    decline: createDialogAction('decline'),

    convertToJob: createDialogAction('convertToJob'),

    convertToDraft: createDialogAction('convertToDraft'),

    extendExpiry: createDialogAction('extendExpiry'),

    view: (quotation?: Quotation | null) => {
      useQuotationStore.getState().setIsDuplicate(false);
      const toSelect = quotation ?? quotationData;
      if (toSelect) {
        setSelectedQuotation(toSelect);
      }
      setViewOpen(true);
    },

    preview: () => {
      // For DELIVERY type, show the modal with delivery toggle
      setSelectedAction({ key: 'previewQuote' });
      setActiveDialog('previewQuote');
    },

    download: () => {
      console.log('Download quotation:', quotationId);
      // TODO: implement download logic
    },

    print: () => {
      console.log('Print quotation:', quotationId);
      // TODO: implement print logic
    },

    archive: createDialogAction('archive'),
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <ActionDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) {
            setActiveDialog(null);
            setSelectedAction(null);
          }
        }}
        title={config.title ?? ''}
        description={config.description}
        content={config.content}
        confirmText={config.confirmText ?? ''}
        confirmVariant={config.confirmVariant}
        confirmCustomColor={config.confirmCustomColor}
        confirmCustomClass={config.confirmCustomClass}
        confirmIcon={config.confirmIcon}
        confirmActionNeeded={config.confirmActionNeeded}
        confirmDisabled={config.confirmDisabled}
        onConfirmAction={async () => {
          const handler = actionHandlers[key];
          if (handler) {
            await handler();
          }
        }}
      />
    );
  });

  const canEdit = quotationData?.quoteStatus === 'DRAFT';
  const viewDialog = viewOpen ? (
    <FormDialog
      id={quotationId}
      dialogTitle="View / Edit Quotation"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        // Ensure dropdown menu state is reset when dialog closes
        if (!open) {
          setIsFormDirty(false);
          // Small delay to ensure proper cleanup
          setTimeout(() => {
            setViewOpen(false);
          }, 100);
        }
      }}
      onUnsavedChangesChange={setIsFormDirty}
      headerButtons={
        <QuotationActionButtons
          quotation={quotationData}
          hasUnsavedChanges={isFormDirty}
        />
      }
      hideTrigger
      headerInfo={{
        useSelectedQuotation: true,
      }}
    >
      <QuotationForm canEdit={canEdit} />
    </FormDialog>
  ) : null;

  const duplicateDialog = duplicateOpen ? (
    <FormDialog
      id={quotationId}
      customTitle={
        <span>
          Duplicating Quote{' '}
          <span className="text-purple-600">
            {quotationData?.quoteNumber || ''}
          </span>
        </span>
      }
      open={duplicateOpen}
      onOpenChangeAction={(open) => {
        setDuplicateOpen(open);
        if (!open) {
          setTimeout(() => {
            setDuplicateOpen(false);
          }, 100);
        }
      }}
      hideTrigger
    >
      <QuotationForm canEdit={true} isDuplicate={true} />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
    duplicateDialog,
  };
}
