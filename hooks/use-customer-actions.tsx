'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import {
  CustomerDTO,
  ArchiveCustomerResponseDTO,
  UnarchiveCustomerResponseDTO,
} from '@/lib/types/customer';
import CustomerForm from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-form';
import { CustomerActionButtons } from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-action-buttons';
import { Archive, TriangleAlert, FileText, RotateCcw } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';
import { useCustomerStore } from '@/app/stores/customer-store';
import { useArchiveCustomer, useUnarchiveCustomer } from '@/lib/api/customer';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';

interface DialogConfig {
  title?: string;
  titleIcon?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  cancelText?: string;
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

const getCustomerDisplayName = (customerData?: CustomerDTO | null) =>
  customerData?.businessName ||
  [customerData?.contactPersonFirstName, customerData?.contactPersonLastName]
    .filter(Boolean)
    .join(' ') ||
  customerData?.individualContactName ||
  'Unknown Customer';

const getCustomerEmail = (customerData?: CustomerDTO | null) =>
  customerData?.businessEmail || customerData?.contactPersonEmail || '';

const getDialogConfigs = (
  customerData?: CustomerDTO | null,
  selectedAction?: SelectedAction,
  archiveResponse?: ArchiveCustomerResponseDTO | null,
  unarchiveResponse?: UnarchiveCustomerResponseDTO | null,
): Record<string, DialogConfig> => {
  const customerName = getCustomerDisplayName(customerData);
  const customerEmail = getCustomerEmail(customerData);
  const customerId = customerData?.id;
  const customerSubInfo = [customerId ? `#${customerId}` : '', customerEmail]
    .filter(Boolean)
    .join(' • ');

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
                  {customerSubInfo}
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
                  {customerId && (
                    <span className="text-base text-[#6A7282]">
                      #{customerId}
                    </span>
                  )}
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
    const blockingQuotes = archiveResponse?.blockingQuotes ?? [];
    const blockingDockets = archiveResponse?.blockingDockets ?? [];
    const blockingJobs = archiveResponse?.blockingJobs ?? [];
    const totalBlocking =
      blockingQuotes.length + blockingDockets.length + blockingJobs.length;

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
                  {customerSubInfo}
                </span>
              </div>
            </div>
            <span className="text-[16px] text-[#364153] mt-3">
              This customer cannot be archived due to active records:
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 p-4 bg-[#FFF7ED] border border-[#FFD6A7] rounded-md">
              <TriangleAlert className="h-[18px] w-[18px] text-[#F54900] mt-0.5 flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="font-medium text-base text-[#F54900]">
                  Active Records Found
                </span>
                <span className="text-sm text-[#CA3500]">
                  This customer has {totalBlocking} active record(s) that must
                  be resolved before archiving.
                </span>
              </div>
            </div>

            {blockingQuotes.length > 0 && (
              <>
                <span>
                  <FileText className="h-4 w-4 mr-2 text-[#D97706] inline-block" />
                  <span className="font-medium text-base text-[#101828]">
                    Pending Quotes ({blockingQuotes.length}):
                  </span>
                </span>
                <div className="flex flex-col gap-3">
                  {blockingQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="bg-[#FEFCEB] border border-yellow-900 rounded-md p-3 flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[14px] text-yellow-900">
                          {quote.projectName}
                        </span>
                        <span className="text-xs text-yellow-600">
                          {quote.quoteNumber}
                        </span>
                      </div>
                      <TableBadges names={quote.quoteStatus} visibleCount={1} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {blockingDockets.length > 0 && (
              <>
                <span>
                  <FileText className="h-4 w-4 mr-2 text-[#D97706] inline-block" />
                  <span className="font-medium text-base text-[#101828]">
                    Active Dockets ({blockingDockets.length}):
                  </span>
                </span>
                <div className="flex flex-col gap-3">
                  {blockingDockets.map((docket) => (
                    <div
                      key={docket.id}
                      className="bg-[#FEFCEB] border border-yellow-900 rounded-md p-3 flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[14px] text-yellow-900">
                          {docket.docketNumber}
                        </span>
                      </div>
                      <TableBadges
                        names={docket.docketStatus}
                        visibleCount={1}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {blockingJobs.length > 0 && (
              <>
                <span>
                  <FileText className="h-4 w-4 mr-2 text-[#D97706] inline-block" />
                  <span className="font-medium text-base text-[#101828]">
                    Active Jobs ({blockingJobs.length}):
                  </span>
                </span>
                <div className="flex flex-col gap-3">
                  {blockingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-[#FEFCEB] border border-yellow-900 rounded-md p-3 flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[14px] text-yellow-900">
                          {job.projectName}
                        </span>
                        <span className="text-xs text-yellow-600">
                          {job.jobNumber}
                        </span>
                      </div>
                      <TableBadges names={job.jobStatus} visibleCount={1} />
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <span className="font-medium text-base text-[#101828]">
                To archive this customer:
              </span>
              <ul className="text-sm text-[#6A7282] space-y-1.5 list-disc list-outside pl-5">
                <li>Decline or archive all pending quotes</li>
                <li>Complete or cancel all active dockets and jobs</li>
                <li>Then customer can be archived</li>
              </ul>
            </div>
          </div>
        ),
        cancelText: 'Close',
        confirmActionNeeded: false,
      },
    };
  } else if (selectedAction?.key === 'cannotUnarchive') {
    const duplicateName = unarchiveResponse?.duplicateCustomerName ?? '';
    const duplicateId = unarchiveResponse?.duplicateCustomerId;

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
                  {customerId && (
                    <span className="text-base text-[#6A7282]">
                      #{customerId}
                    </span>
                  )}
                  <TableBadges names="ARCHIVED" visibleCount={1} />
                </div>
              </div>
            </div>
            <span className="text-base text-[#364153]">
              This customer cannot be unarchived because another active customer
              with the same name already exists.
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFF7ED] border border-[#FFD6A7] rounded-md p-4 flex items-start gap-3">
              <TriangleAlert className="h-[18px] w-[18px] text-[#F54900] flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-3">
                <span className="font-medium text-base text-[#F54900]">
                  Duplicate Customer Name Detected
                </span>
                <p className="text-sm text-[#CA3500]">
                  An active customer with the name &quot;{duplicateName}&quot;
                  already exists in the system. To maintain data integrity and
                  prevent conflicts with Xero sync, duplicate active customer
                  names are not allowed.
                </p>
                {duplicateName && (
                  <div className="bg-white border border-[#FDE68A] rounded p-3">
                    <div className="text-xs text-[#6A7282] mb-1">
                      Existing Active Customer:
                    </div>
                    <div className="font-medium text-base text-[#CA3500]">
                      {duplicateName}
                    </div>
                    {duplicateId && (
                      <div className="text-sm text-[#6A7282]">
                        Account: #{duplicateId}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
        cancelText: 'Close',
        confirmActionNeeded: false,
      },
    };
  }

  return {};
};

export function useCustomerActions(customerData?: CustomerDTO | null) {
  const customerId = customerData?.id;
  const selectedCustomer = useCustomerStore((s) => s.selectedCustomer);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [archiveResponse, setArchiveResponse] =
    React.useState<ArchiveCustomerResponseDTO | null>(null);
  const [unarchiveResponse, setUnarchiveResponse] =
    React.useState<UnarchiveCustomerResponseDTO | null>(null);

  const archiveCustomer = useArchiveCustomer();
  const unarchiveCustomer = useUnarchiveCustomer();

  const dialogConfigs = React.useMemo(
    () =>
      getDialogConfigs(
        customerData ?? null,
        selectedAction || undefined,
        archiveResponse,
        unarchiveResponse,
      ),
    [customerData, selectedAction, archiveResponse, unarchiveResponse],
  );

  const handleArchive = async () => {
    if (!customerId) return;
    try {
      await archiveCustomer.mutateAsync(customerId);
      notifySuccess('Customer archived successfully');
      const current = useCustomerStore.getState().selectedCustomer;
      if (current) {
        useCustomerStore.getState().setSelectedCustomer({
          ...current,
          customerStatus: CUSTOMER_STATUS.ARCHIVED,
        });
      }
      setActiveDialog(null);
      setSelectedAction(null);
    } catch (error) {
      const err = error as Error & {
        response?: { status: number; data: unknown };
      };
      if (err.response?.status === 409) {
        const data = err.response.data as ArchiveCustomerResponseDTO;
        const parts: string[] = [];
        if (data.blockingQuotes?.length)
          parts.push(
            `${data.blockingQuotes.length} active ${data.blockingQuotes.length === 1 ? 'quote' : 'quotes'}`,
          );
        if (data.blockingDockets?.length)
          parts.push(
            `${data.blockingDockets.length} active ${data.blockingDockets.length === 1 ? 'docket' : 'dockets'}`,
          );
        if (data.blockingJobs?.length)
          parts.push(
            `${data.blockingJobs.length} active ${data.blockingJobs.length === 1 ? 'job' : 'jobs'}`,
          );
        notifyError(`Cannot archive customer: has ${parts.join(', ')}`);
        setArchiveResponse(data);
        setSelectedAction({ key: 'cannotArchive' });
        setActiveDialog('cannotArchive');
      } else {
        notifyError(extractErrorMessage(error));
      }
    }
  };

  const handleUnarchive = async () => {
    if (!customerId) return;
    try {
      await unarchiveCustomer.mutateAsync(customerId);
      notifySuccess('Customer unarchived successfully');
      const current = useCustomerStore.getState().selectedCustomer;
      if (current) {
        useCustomerStore.getState().setSelectedCustomer({
          ...current,
          customerStatus: CUSTOMER_STATUS.ACTIVE,
        });
      }
      setActiveDialog(null);
      setSelectedAction(null);
    } catch (error) {
      const err = error as Error & {
        response?: { status: number; data: unknown };
      };
      if (err.response?.status === 409) {
        const data = err.response.data as UnarchiveCustomerResponseDTO;
        notifyError(
          data.duplicateCustomerName
            ? `Cannot unarchive: "${data.duplicateCustomerName}" already exists as an active customer`
            : 'Cannot unarchive customer: duplicate name detected',
        );
        setUnarchiveResponse(data);
        setSelectedAction({ key: 'cannotUnarchive' });
        setActiveDialog('cannotUnarchive');
      } else {
        notifyError(extractErrorMessage(error));
      }
    }
  };

  const actionHandlers: Record<string, () => Promise<void>> = {
    archive: handleArchive,
    unarchive: handleUnarchive,
  };

  const createDialogAction = (actionKey: string) => () => {
    setSelectedAction({ key: actionKey });
    setActiveDialog(actionKey);
  };

  const actions = {
    /** Pass customer when opening from row click so the store updates before the dialog opens */
    view: (customer?: CustomerDTO | null) => {
      const toSelect = customer ?? customerData;
      if (toSelect != null) {
        useCustomerStore.getState().setSelectedCustomer(toSelect);
      }
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

    archive: createDialogAction('archive'),
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
            setArchiveResponse(null);
            setUnarchiveResponse(null);
          }
        }}
        title={config.title ?? ''}
        titleIcon={config.titleIcon}
        description={config.description}
        content={config.content}
        cancelText={config.cancelText}
        confirmText={config.confirmText ?? ''}
        confirmVariant={config.confirmVariant}
        confirmCustomColor={config.confirmCustomColor}
        confirmCustomClass={config.confirmCustomClass}
        confirmIcon={config.confirmIcon}
        confirmActionNeeded={config.confirmActionNeeded}
        onConfirmAction={async () => {
          const handler = actionHandlers[key];
          if (handler) {
            await handler();
          }
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={selectedCustomer?.id}
      dialogTitle="View / Edit Customer"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
      }}
      headerButtons={
        <CustomerActionButtons customer={selectedCustomer ?? undefined} />
      }
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
