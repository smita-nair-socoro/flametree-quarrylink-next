'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { Quotation } from '@/lib/types/quotation';
import QuotationForm from '@/app/(protected)/customer-operations/quotation/(components)/forms/quotation-form';
import { QuotationActionButtons } from '@/app/(protected)/customer-operations/quotation/(components)/forms/quotation-action-buttons';
import { ActionDialog } from '@/components/action-dialog';
import {
  ArrowRight,
  Calendar,
  CircleCheckBig,
  CircleX,
  Send,
} from 'lucide-react';
import { centsToDollars } from '@/lib/utils/currency';
import { DatePicker } from '@/components/date-picker';

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
}

interface SelectedAction {
  key: string;
}

const getDialogConfigs = (
  quotationData?: Quotation | null,
  selectedAction?: SelectedAction,
  newExpiryDate?: Date,
  setNewExpiryDate?: (date: Date) => void
): Record<string, DialogConfig> => {
  const quotationNumber = quotationData?.quote_number;
  const projectName = quotationData?.project_name;
  const customerName = quotationData?.customer_name;
  const customerEmail = quotationData?.customer_email;
  const totalSellPrice = quotationData?.total_sell_price
    ? centsToDollars(quotationData?.total_sell_price)
    : '0';
  const lineItemsCount = quotationData?.line_items_count;
  const expiryDate = quotationData?.expiry_date;

  if (selectedAction?.key === 'sendToCustomer') {
    return {
      sendToCustomer: {
        title: 'Send Quote',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFF7ED] rounded-full">
              <span className="flex items-center justify-center">
                <Send className="h-[20px] w-[20px] text-[#F54900]" />
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
              Are you sure you wnat to send this quote to the customer?
            </span>
            <div className="border-1 border-[#FFD6A7] rounded-md p-[16.625px] bg-[#FFF7ED]">
              <div className="flex justify-start gap-2 self-stretch">
                <Send className="h-[20px] w-[20px] text-[#F54900] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#F54900] font-medium">
                    Quote Delivery
                  </span>
                  <span className="text-[14px] font-normal text-[#F54900]">
                    This quote will be sent via email to {customerEmail} and the
                    status will change to Pending
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when Quote is sent:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> Quote status changes from Draft to Pending</li>
                <li> Customer receives email with PDF quote</li>
                <li> Approval process begins</li>
                <li> Quote can no longer be edited</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                Customer Email:
              </span>
              <div className="rounded-md p-1 bg-[#E5E5E5]">
                <span className="text-[14px] font-normal text-[#6A7282] p-2">
                  {customerEmail}
                </span>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Send Quote',
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
                <li> Quote becomes reqdy for job conversion</li>
                <li> Pricing and terms are locked</li>
              </ul>
            </div>

            <div className="rounded-md p-1 bg-[#E5E5E5]">
              <div className="flex flex-col gap-1 px-4 py-2">
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Quote Total:
                  </span>
                  <span className="text-[16px] font-medium text-[#101828]">
                    ${totalSellPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Customer:
                  </span>
                  <span className="text-[16px] font-medium text-[#101828]">
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
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when Quote is declined:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> Quote status changes from Pending to Declined</li>
                <li> Customer is notified or declined status</li>
                <li> Quote cannot be converted to a job</li>
                <li> Quote can be reactivated later if needed</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What continues to work:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> Quote remains accessible for reference</li>
                <li> Historical data is preserved</li>
                <li> Quote can be edited and resent</li>
                <li> Customer relationship management continues</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Decline Quote',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
      },
    };
  } else if (selectedAction?.key === 'convertToJob') {
    return {
      convertToJob: {
        title: 'Convert Quote to Job',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-blue-900 rounded-full">
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
            <div className="rounded-md p-[16.625px] bg-blue-900">
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

            <div className="rounded-md p-1 bg-[#E5E5E5]">
              <div className="flex flex-col gap-1 px-4 py-2">
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Project Name
                  </span>
                  <span className="text-[16px] font-medium text-[#364153]">
                    {projectName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Customer
                  </span>
                  <span className="text-[16px] font-medium text-[#364153]">
                    {customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] font-normal text-[#6A7282]">
                    Total Value
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
        confirmText: 'Approve Quote',
        confirmVariant: 'default',
        confirmCustomColor: '#1E3A8A',
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
                disabled={{ before: new Date(expiryDate ?? '') }}
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
  }
  return {};
};

export function useQuotationActions(
  quotationId: number | undefined,
  quotationData?: Quotation | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [newExpiryDate, setNewExpiryDate] = React.useState<Date>(() => {
    const weekFromToday = new Date();
    weekFromToday.setDate(weekFromToday.getDate() + 7);
    return weekFromToday;
  });

  // Reset the new expiry date to 7 days from now when the extend expiry dialog opens
  React.useEffect(() => {
    if (selectedAction?.key === 'extendExpiry') {
      const weekFromToday = new Date();
      weekFromToday.setDate(weekFromToday.getDate() + 7);
      setNewExpiryDate(weekFromToday);
    }
  }, [selectedAction?.key]);

  const dialogConfigs = getDialogConfigs(
    quotationData,
    selectedAction || undefined,
    newExpiryDate,
    setNewExpiryDate
  );

  const createDialogAction = (actionKey: string, action: () => void) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const actions = {
    duplicate: () => {
      console.log('Duplicate quotation:', quotationId);
      // TODO: implement duplicate logic
    },

    sendToCustomer: createDialogAction('sendToCustomer', () => {
      console.log('Send to customer:', quotationId);
      // TODO: implement send to customer mutation logic
    }),

    approve: createDialogAction('approve', () => {
      console.log('Approve quotation:', quotationId);
      // TODO: implement approve logic
    }),

    decline: createDialogAction('decline', () => {
      console.log('Decline quotation:', quotationId);
      // TODO: implement decline logic
    }),

    convertToJob: createDialogAction('convertToJob', () => {
      console.log('Convert to job:', quotationId);
      // TODO: implement convert to job logic
    }),

    extendExpiry: createDialogAction('extendExpiry', () => {
      console.log('Extend expiry:', quotationId);
      // TODO: implement extend expiry logic
    }),

    view: () => {
      setViewOpen(true);
    },

    download: () => {
      console.log('Download quotation:', quotationId);
      // TODO: implement download logic
    },

    print: () => {
      console.log('Print quotation:', quotationId);
      // TODO: implement print logic
    },

    archive: createDialogAction('archive', () => {
      console.log('Archive quotation:', quotationId);
      // TODO: implement delete logic
    }),
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
        onConfirmAction={() => {
          switch (key) {
            case 'sendToCustomer':
              console.log('Send to customer:', quotationId, quotationData);
              // TODO: implement send to customer mutation logic
              break;
            case 'approve':
              console.log('Approve quotation:', quotationId, quotationData);
              // TODO: implement approve logic
              break;
            case 'decline':
              console.log('Decline quotation:', quotationId, quotationData);
              // TODO: implement decline logic
              break;
            case 'convertToJob':
              console.log('Convert to job:', quotationId, quotationData);
              // TODO: implement convert to job logic
              break;
            case 'extendExpiry':
              console.log('Extend expiry:', quotationId, quotationData);
              // TODO: implement extend expiry logic
              break;
            case 'archive':
              console.log('Archive quotation:', quotationId, quotationData);
              // TODO: implement archive logic
              break;
          }
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={quotationId}
      dialogTitle="View / Edit Quotation"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        // Ensure dropdown menu state is reset when dialog closes
        if (!open) {
          // Small delay to ensure proper cleanup
          setTimeout(() => {
            setViewOpen(false);
          }, 100);
        }
      }}
      headerButtons={<QuotationActionButtons quotation={quotationData} />}
      hideTrigger
      headerInfo={{
        useSelectedQuotation: true,
      }}
    >
      <QuotationForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
