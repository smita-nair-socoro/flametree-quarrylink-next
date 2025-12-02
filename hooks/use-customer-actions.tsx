'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { Customer } from '@/lib/types/customer';
import CustomerForm from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-form';
import { CustomerActionButtons } from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-action-buttons';
import { Archive, TriangleAlert, CircleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DialogConfig {
  title?: string;
  titleIcon?: React.ReactNode;
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

// Placeholder data for demonstration
const PLACEHOLDER_CUSTOMER_DATA = {
  accNumber: 'ACC-8891',
  email: 'accounts@buildcorp.com.au',
};

const PLACEHOLDER_PENDING_QUOTES = [
  {
    id: 1,
    quote_number: 'QT-2024-456',
    project_name: 'Sydney Harbor Bridge Repair',
    status: 'PENDING',
  },
  {
    id: 2,
    quote_number: 'QT-2024-923',
    project_name: 'Barangaroo Tower Construction',
    status: 'PENDING',
  },
];

const getDialogConfigs = (
  customerData?: Customer | null,
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  const customerName = customerData?.business_name;

  if (selectedAction?.key === 'archive') {
    return {
      archive: {
        title: `Archive ${customerName}?`,
        description: '',
        confirmText: 'Archive Customer',
        confirmCustomClass: 'bg-[#475569] hover:bg-[#64748b] text-white',
        titleIcon: (
          <div className="flex w-[41.99px] h-[41.99px] items-center justify-center bg-[#FFEDD4] rounded-full">
            <span className="flex items-center justify-center">
              <TriangleAlert className="h-5 w-5 text-[#F54900]" />
            </span>
          </div>
        ),
        confirmIcon: <Archive className="h-4 w-4" />,
      },
    };
  } else if (selectedAction?.key === 'unarchive') {
    return {
      unarchive: {
        title: `Unarchive ${customerName}?`,
        description: '',
        confirmText: 'Unarchive Customer',
        confirmCustomClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        titleIcon: (
          <div className="flex w-[41.99px] h-[41.99px] items-center justify-center bg-blue-100 rounded-full">
            <span className="flex items-center justify-center">
              <Archive className="h-5 w-5 text-blue-600" />
            </span>
          </div>
        ),
        confirmIcon: <Archive className="h-4 w-4" />,
      },
    };
  } else if (selectedAction?.key === 'cannotArchive') {
    return {
      cannotArchive: {
        title: 'Cannot Archive Customer',
        description: (
          <div className="flex flex-col gap-2">
            {/* Customer name with ACC number and email */}
            <div className="flex items-center gap-2">
              <div className="flex w-[48px] h-[48px] justify-center items-center bg-[#FFEDD4] rounded-full">
                <TriangleAlert className="h-[21px] w-[21px] text-[#F54900]" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[17.4px]">{customerName}</span>
                <span className="text-[13px] text-[#6B7280]">
                  {PLACEHOLDER_CUSTOMER_DATA.accNumber} • {PLACEHOLDER_CUSTOMER_DATA.email}
                </span>
              </div>
            </div>

            {/* Main message */}
            <span className="text-[16px] text-[#364153] mt-3">
              This customer cannot be archived due to active quotes:
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            {/* Active Quotes Warning Box */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CircleAlert className="h-[16px] w-[16px] text-[#FFFFFF] fill-[#F59E0B]" />
                <span className="font-semibold text-[14px] text-[#101828]">
                  Active Quotes Found
                </span>
              </div>

              {/* Orange warning box with quote details */}
              <div className="bg-[#FEFCEB] border border-[#FDE68A] rounded-md p-4 flex flex-col gap-3">
                {PLACEHOLDER_PENDING_QUOTES.map((quote, index) => (
                  <React.Fragment key={quote.id}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[14px] text-[#101828]">
                          {quote.project_name}
                        </span>
                        <Badge
                          className="bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] text-[11px] font-semibold px-2 py-0.5"
                        >
                          PENDING
                        </Badge>
                      </div>
                      <span className="text-[13px] text-[#6B7280]">
                        {quote.quote_number}
                      </span>
                    </div>
                    {index < PLACEHOLDER_PENDING_QUOTES.length - 1 && (
                      <div className="border-t border-[#FDE68A]"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                To archive this customer:
              </span>
              <ul className="text-[13px] text-[#4A5565] space-y-1.5 list-disc list-outside pl-5">
                <li>Decline or archive all pending quotes</li>
                <li>Then customer can be archived</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Close',
        confirmVariant: 'outline',
        confirmActionNeeded: false,
      },
    };
  }

  // Return empty object if no action selected
  return {};
};

export function useCustomerActions(
  customerId: number | undefined,
  customerData?: Customer | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const dialogConfigs = getDialogConfigs(
    customerData,
    selectedAction || undefined
  );

  const createDialogAction = (actionKey: string) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const actions = {
    view: () => {
      setViewOpen(true);
    },

    viewJobs: () => {
      console.log('View jobs:', customerId);
      // TODO: implement view jobs logic
    },
    viewDockets: () => {
      console.log('View dockets:', customerId);
      // TODO: implement view dockets logic
    },
    viewQuotations: () => {
      console.log('View quotations:', customerId);
      // TODO: implement view quotations logic
    },

    archive: () => {
      // Hardcoded: ALL customers cannot be archived for now
      setSelectedAction({ key: 'cannotArchive' });
      setActiveDialog('cannotArchive');
    },

    unarchive: createDialogAction('unarchive'),
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
        titleIcon={config.titleIcon}
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
            case 'archive':
              console.log('Archive customer:', customerId, customerData);
              // TODO: implement archive logic
              break;
            case 'unarchive':
              console.log('Unarchive customer:', customerId, customerData);
              // TODO: implement unarchive logic
              break;
            case 'cannotArchive':
              // No action needed, just close the dialog
              break;
          }
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={customerId}
      dialogTitle="View / Edit Customer"
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
      headerButtons={<CustomerActionButtons customer={customerData} />}
      hideTrigger
      headerInfo={{
        useSelectedCustomer: true,
      }}
    >
      <CustomerForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
