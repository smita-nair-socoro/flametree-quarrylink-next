'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { CustomerDTO } from '@/lib/types/customer';
import CustomerForm from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-form';
import { CustomerActionButtons } from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-action-buttons';
import { Archive, TriangleAlert, FileText, RotateCcw } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';

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
  name: 'Sydney Quarry Supplies',
  accNumber: 'ACC-2024-045',
  email: 'contact@sydneyquarry.com.au',
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

// Placeholder for duplicate customer scenario
const PLACEHOLDER_DUPLICATE_CUSTOMER = {
  name: 'Melbourne Constructions',
  accNumber: 'ACC-2024-089',
};

const getDialogConfigs = (
  customerData?: CustomerDTO | null,
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  // TODO: Replace with actual customer data from API
  // Currently using hardcoded placeholder data for demonstration
  const customerName = PLACEHOLDER_CUSTOMER_DATA.name;
  const accountNumber = PLACEHOLDER_CUSTOMER_DATA.accNumber;
  const customerEmail = PLACEHOLDER_CUSTOMER_DATA.email;

  if (selectedAction?.key === 'archive') {
    return {
      archive: {
        title: 'Archive Customer',
        description: (
          <div className="flex flex-col gap-3">
            {/* Customer info with icon */}
            <div className="flex items-center gap-3">
              <div className="flex w-11 h-11 justify-center items-center bg-[#F3F4F6] rounded-full">
                <Archive className="h-6 w-6 text-[#6B7280]" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-base text-[#101828]">
                  {customerName}
                </span>
                <span className="text-base text-[#6A7282]">
                  {accountNumber} • {customerEmail}
                </span>
              </div>
            </div>

            <span className="text-base text-[#364153]">
              Are you sure you want to archive this customer?
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            {/* Gray info box */}
            <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Archive className="h-[18px] w-[18px] text-[#6B7280] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-base text-[#374151]">
                    Customer Archived
                  </span>
                  <p className="text-sm text-[#64748B]">
                    This customer will be moved to archived status and removed
                    from active customer lists. The customer will be marked as
                    archived in Xero automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* What happens when archived */}
            <div className="flex flex-col gap-2">
              <span className="font-medium text-base text-[#101828]">
                What happens when customer is archived:
              </span>
              <ul className="text-sm text-[#6A7282] space-y-1.5 list-disc list-outside pl-5">
                <li>Customer status changes to Archived</li>
                <li>Customer is removed from active customer lists</li>
                <li>Cannot create new quotes or jobs for this customer</li>
                <li>Customer is synced to Xero as archived</li>
                <li>Account number is reserved and cannot be reused</li>
              </ul>
            </div>

            {/* What continues to work */}
            <div className="flex flex-col gap-2">
              <span className="font-medium text-base text-[#101828]">
                What continues to work:
              </span>
              <ul className="text-sm text-[#6A7282] space-y-1.5 list-disc list-outside pl-5">
                <li>Customer remains accessible in archived section</li>
                <li>All customer data and history preserved</li>
                <li>Existing quotes and jobs remain accessible</li>
                <li>Reporting and analytics include archived data</li>
                <li>Customer can be unarchived if needed</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Archive Customer',
        confirmCustomClass: 'bg-[#6B7280] text-white',
      },
    };
  } else if (selectedAction?.key === 'unarchive') {
    return {
      unarchive: {
        title: 'Unarchive Customer',
        description: (
          <div className="flex flex-col gap-3">
            {/* Customer name with ACC and Archived badge */}
            <div className="flex items-center gap-2">
              <div className="flex w-[48px] h-[48px] justify-center items-center bg-[#F0FDF4] rounded-full">
                <RotateCcw className="h-[21px] w-[21px] text-[#16A34A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-base">{customerName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-base text-[#6A7282]">ACC-2024-001</span>
                  <TableBadges names="ARCHIVED" visibleCount={1} />
                </div>
              </div>
            </div>

            <span className="text-base text-[#364153]">
              Are you sure you want to unarchive this customer?
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            {/* Green info box */}
            <div className="bg-[#F0FDF4] border border-[#B9F8CF] rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="h-[16px] w-[16px] text-[#008236]" />
                <span className="font-medium text-base text-[#008236]">
                  Restore Customer Access
                </span>
              </div>
              <p className="text-sm text-[#166534]">
                This customer will be restored to active status and become
                available for normal business operations.
              </p>
            </div>

            {/* What happens when unarchived */}
            <div className="flex flex-col gap-2 mt-3">
              <span className="font-medium text-base text-[#101828]">
                What happens when unarchived:
              </span>
              <ul className="text-sm text-[#6A7282] space-y-1.5 list-disc list-outside pl-5">
                <li>Restored to active customer lists</li>
                <li>Available for new quotes and jobs</li>
                <li>Contact information becomes visible</li>
                <li>Synced with Xero as active contact</li>
              </ul>
            </div>

            {/* What remains unchanged */}
            <div className="flex flex-col gap-2 mt-3">
              <span className="font-medium text-base text-[#101828]">
                What remains unchanged:
              </span>
              <ul className="text-sm text-[#6A7282] space-y-1.5 list-disc list-outside pl-5">
                <li>All historical data preserved</li>
                <li>Previous quotes and jobs intact</li>
                <li>Financial records maintained</li>
                <li>Account number and details retained</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Unarchive Customer',
        confirmCustomClass: 'bg-[#008236] hover:bg-[#15803D] text-white',
      },
    };
  } else if (selectedAction?.key === 'cannotArchive') {
    return {
      cannotArchive: {
        title: 'Cannot Archive Customer',
        description: (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex w-12 h-12 justify-center items-center bg-[#FFEDD4] rounded-full">
                <TriangleAlert className="h-6 w-6 text-[#E7000B]" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-base text-[#101828]">
                  {customerName}
                </span>
                <span className="text-base text-[#6B7280]">
                  {PLACEHOLDER_CUSTOMER_DATA.accNumber} •{' '}
                  {PLACEHOLDER_CUSTOMER_DATA.email}
                </span>
              </div>
            </div>

            <span className="text-[16px] text-[#364153] mt-3">
              This customer cannot be archived due to active quotes:
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            {/* Active Quotes Found section */}
            <div className="flex items-start gap-2 p-4 bg-[#FFF7ED] border border-[#FFD6A7] rounded-md">
              <TriangleAlert className="h-[18px] w-[18px] text-[#F54900] mt-0.5 flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="font-medium text-base text-[#F54900]">
                  Active Quotes Found
                </span>
                <span className="text-sm text-[#CA3500]">
                  This customer has {PLACEHOLDER_PENDING_QUOTES.length} active
                  quotes in Pending status that must be resolved before
                  archiving.
                </span>
              </div>
            </div>
            <span>
              <FileText className="h-4 w-4 mr-2 text-[#D97706] inline-block" />
              <span className="font-medium text-base text-[#101828]">
                Pending Quotes ({PLACEHOLDER_PENDING_QUOTES.length}):
              </span>
            </span>
            {/* Each quote in its own orange box */}
            <div className="flex flex-col gap-3">
              {PLACEHOLDER_PENDING_QUOTES.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-[#FEFCEB] border border-yellow-900 rounded-md p-3 flex items-center justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[14px] text-yellow-900">
                      {quote.project_name}
                    </span>
                    <span className="text-xs text-yellow-600">
                      {quote.quote_number}
                    </span>
                  </div>
                  <TableBadges names={quote.status} visibleCount={1} />
                </div>
              ))}
            </div>

            {/* Instructions Section */}
            <div className="flex flex-col gap-2">
              <span className="font-medium text-base text-[#101828]">
                To archive this customer:
              </span>
              <ul className="text-sm text-[#6A7282] space-y-1.5 list-disc list-outside pl-5">
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
  } else if (selectedAction?.key === 'cannotUnarchive') {
    return {
      cannotUnarchive: {
        title: 'Cannot Unarchive Customer',
        description: (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex w-[48px] h-[48px] justify-center items-center bg-[#FEE2E2] rounded-full">
                <RotateCcw className="h-[21px] w-[21px] text-[#DC2626]" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-base">{customerName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-base text-[#6A7282]">ACC-2024-001</span>
                  <TableBadges names="ARCHIVED" visibleCount={1} />
                </div>
              </div>
            </div>

            {/* Main message */}
            <span className="text-base text-[#364153]">
              This customer cannot be unarchived because another active customer
              with the same name already exists.
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            {/* Orange warning box */}
            <div className="bg-[#FFF7ED] border border-[#FFD6A7] rounded-md p-4 flex items-start gap-3">
              <TriangleAlert className="h-[18px] w-[18px] text-[#F54900] flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-3">
                <span className="font-medium text-base text-[#F54900]">
                  Duplicate Customer Name Detected
                </span>

                <p className="text-sm text-[#CA3500]">
                  An active customer with the name &quot;
                  {PLACEHOLDER_DUPLICATE_CUSTOMER.name}&quot; already exists in
                  the system. To maintain data integrity and prevent conflicts
                  with Xero sync, duplicate active customer names are not
                  allowed.
                </p>

                <div className="bg-white border border-[#FDE68A] rounded p-3">
                  <div className="text-xs text-[#6A7282] mb-1">
                    Existing Active Customer:
                  </div>
                  <div className="font-medium text-base text-[#CA3500]">
                    {PLACEHOLDER_DUPLICATE_CUSTOMER.name}
                  </div>
                  <div className="text-sm text-[#6A7282]">
                    Account: {PLACEHOLDER_DUPLICATE_CUSTOMER.accNumber}
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution options */}
            <div className="flex flex-col gap-2">
              <span className="font-medium text-base text-[#101828]">
                Resolution options:
              </span>
              <ul className="text-sm text-[#6A7282] space-y-1.5 list-disc list-outside pl-5">
                <li>Archive the existing active customer first</li>
                <li>Rename the existing active customer</li>
                <li>Verify if they are the same entity</li>
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

  return {};
};

export function useCustomerActions(
  customerId: number | undefined,
  customerData?: CustomerDTO | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const dialogConfigs = React.useMemo(
    () => getDialogConfigs(customerData, selectedAction || undefined),
    [customerData, selectedAction]
  );

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
      // Hardcoded: For demo, show cannot archive modal (active quotes error)
      // In the future, add logic here to check for active quotes
      // if (hasActiveQuotes(customerData)) {
      //   setSelectedAction({ key: 'cannotArchive' });
      //   setActiveDialog('cannotArchive');
      // } else {
      //   setSelectedAction({ key: 'archive' });
      //   setActiveDialog('archive');
      // }
      setSelectedAction({ key: 'archive' });
      setActiveDialog('archive');
    },

    unarchive: () => {
      // Hardcoded: For demo, show cannot unarchive modal (duplicate name error)
      // In the future, add logic here to check for duplicate names
      // if (hasDuplicateActiveName(customerData)) {
      //   setSelectedAction({ key: 'cannotUnarchive' });
      //   setActiveDialog('cannotUnarchive');
      // } else {
      //   setSelectedAction({ key: 'unarchive' });
      //   setActiveDialog('unarchive');
      // }
      setSelectedAction({ key: 'unarchive' });
      setActiveDialog('unarchive');
    },

    // Test actions for UI/UX testing
    cannotArchive: () => {
      setSelectedAction({ key: 'cannotArchive' });
      setActiveDialog('cannotArchive');
    },

    cannotUnarchive: () => {
      setSelectedAction({ key: 'cannotUnarchive' });
      setActiveDialog('cannotUnarchive');
    },
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
            case 'cannotUnarchive':
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
