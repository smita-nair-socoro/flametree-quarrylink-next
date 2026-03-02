'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { Job } from '@/lib/types/job';
import JobForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-form';
import { JobActionButtons } from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-action-buttons';
import { CircleX, TriangleAlert } from 'lucide-react';
import { useJobStore } from '@/app/stores/job-store';
import { useSubscriptionPlan } from '@/app/stores/client-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
  confirmDisabled?: boolean;
  cancelText?: string;
}

interface SelectedAction {
  key: string;
}

const getDialogConfigs = (
  jobData?: Job | null,
  selectedAction?: SelectedAction,
  cancelReason?: string,
  setCancelReason?: (reason: string) => void,
  cancelNotes?: string,
  setCancelNotes?: (notes: string) => void,
  isCancelFormValid?: boolean,
): Record<string, DialogConfig> => {
  const jobNumber = jobData?.jobNumber;
  const projectName = jobData?.projectName;
  const customerName = jobData?.customerName;
  const docketsNotFinalised = 1;
  const outstandingAmount = jobData?.uninvoicedDockets ?? 0 * 100;

  if (selectedAction?.key === 'resume') {
    return {
      resume: {
        title: 'Resume Job',
        description: 'Are you sure you want to resume this job?',
        confirmText: 'Resume',
        confirmVariant: 'default',
        confirmActionNeeded: true,
      },
    };
  } else if (selectedAction?.key === 'cancel') {
    return {
      cancel: {
        title: 'Cancel Job',
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
                <span className="text-sm text-[#6A7282]">{jobNumber}</span>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{customerName}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to cancel this job?
            </span>

            <div className="border border-[#FFD6A7] rounded-md p-4 bg-[#FFF3E6]">
              <div className="flex justify-start gap-2 self-stretch">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#CA3500] font-medium">
                    Business Impact
                  </span>
                  <span className="text-[14px] font-normal text-[#9F2D00]">
                    Cancelling stops deliveries, unassigned dockets are
                    auto-cancelled.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#E7000B]">
                Cancellation Reason (required):
              </label>
              <Select
                value={cancelReason}
                onValueChange={(value) => {
                  if (setCancelReason) {
                    setCancelReason(value);
                  }
                }}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent className="max-h-56 overflow-y-auto">
                  <SelectItem value="customer_requested">
                    Customer requested cancellation
                  </SelectItem>
                  <SelectItem value="project_cancelled_postponed">
                    Project cancelled or postponed
                  </SelectItem>
                  <SelectItem value="budget_payment_issues">
                    Budget or payment issues
                  </SelectItem>
                  <SelectItem value="scope_changed">
                    Scope of work changed
                  </SelectItem>
                  <SelectItem value="supplier_unavailable">
                    Supplier or materials unavailable
                  </SelectItem>
                  <SelectItem value="scheduling_conflict">
                    Scheduling conflict
                  </SelectItem>
                  <SelectItem value="weather_or_site_conditions">
                    Weather or site conditions
                  </SelectItem>
                  <SelectItem value="duplicate_job_entry">
                    Duplicate job entry
                  </SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-normal text-[#6A7282]">
                Additional notes{' '}
                {cancelReason === 'other' ? (
                  <span className="text-[#E7000B]">*</span>
                ) : (
                  '(Optional)'
                )}
              </label>
              <Textarea
                value={cancelNotes}
                onChange={(e) => {
                  if (setCancelNotes) {
                    setCancelNotes(e.target.value);
                  }
                }}
                placeholder="Add any additional details about cancelling this job..."
                className="min-h-[140px] resize-none placeholder:text-xs"
                rows={4}
              />
            </div>
          </div>
        ),
        confirmText: 'Cancel Job',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
        confirmDisabled: !isCancelFormValid,
        cancelText: 'Keep Job',
      },
    };
  } else if (selectedAction?.key === 'settle') {
    return {
      settle: {
        title: 'Settlement Blocked',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-md">
              <span className="flex items-center justify-center">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{projectName}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">{jobNumber}</span>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{customerName}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <div className="border border-[#FECACA] rounded-md p-4 bg-[#FFF1F2]">
              <div className="flex justify-start gap-2 self-stretch">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#B91C1C] font-medium">
                    Settlement Blocked
                  </span>
                  <span className="text-[14px] font-normal text-[#B91C1C]">
                    Outstanding balance of $
                    {outstandingAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    or dockets not in Invoiced / Cash Sale / Void status.
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-[#F3F4F6] py-2 px-4">
              <span className="text-[14px] font-medium text-[#111827]">
                Blocking Conditions
              </span>
              <div className="mt-2 divide-y divide-[#E5E7EB]">
                <div className="flex justify-between py-2 text-[14px] text-[#6B7280]">
                  <span>Dockets not finalised</span>
                  <span className="font-semibold text-[#E35700]">
                    {docketsNotFinalised}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-[14px] font-medium text-[#111827]">
                  <span>Outstanding Amount</span>
                  <span className="font-semibold text-[#E11D48]">
                    $
                    {outstandingAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-medium text-[#111827]">
                Resolve outstanding invoices or payments:
              </span>
              <ul className="text-[14px] font-normal text-[#6B7280] space-y-1 list-disc list-outside pl-5">
                <li>
                  All dockets must be in Paid, Cash Sale, or Voided status
                </li>
                <li>Outstanding balance must be $0</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Settle Job',
        confirmVariant: 'default',
        confirmCustomColor: '#8E51FF',
        cancelText: 'Cancel',
      },
    };
  }
  return {};
};

export function useJobActions(jobData?: Job | null) {
  const jobId = jobData?.id;
  const selectedJob = useJobStore((s) => s.selectedJob);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelNotes, setCancelNotes] = React.useState('');

  const isCancelFormValid = React.useMemo(() => {
    if (!cancelReason) return false;
    if (cancelReason === 'other' && !cancelNotes.trim()) return false;
    return true;
  }, [cancelReason, cancelNotes]);

  React.useEffect(() => {
    if (selectedAction?.key === 'cancel') {
      setCancelReason('');
      setCancelNotes('');
    }
  }, [selectedAction?.key]);

  const dialogConfigs = React.useMemo(
    () =>
      getDialogConfigs(
        jobData ?? null,
        selectedAction || undefined,
        cancelReason,
        setCancelReason,
        cancelNotes,
        setCancelNotes,
        isCancelFormValid,
      ),
    [
      jobData,
      selectedAction,
      cancelReason,
      cancelNotes,
      isCancelFormValid,
    ],
  );

  const createDialogAction = (actionKey: string) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const handleCancel = () => {
    if (!isCancelFormValid) {
      return;
    }
    console.log('Cancel job:', jobId, jobData, {
      cancelReason,
      cancelNotes,
    });
    // TODO: implement cancel logic
  };

  const handleSettle = () => {
    console.log('Settle job:', jobId, jobData);
    // TODO: implement settle logic
  };

  const actionHandlers: Record<string, () => void> = {
    resume: () => {
      console.log('Resume job:', jobId, jobData);
      // TODO: implement resume logic
    },
    cancel: handleCancel,
    settle: handleSettle,
  };

  const actions = {
    /** Pass customer when opening from row click so the store updates before the dialog opens */
    view: (job?: Job | null) => {
      const toSelect = job ?? jobData;
      if (toSelect != null) {
        useJobStore.getState().setSelectedJob(toSelect);
      }
      setViewOpen(true);
    },

    resume: createDialogAction('resume'),

    pause: () => {
      console.log('Pause job:', jobId, jobData);
      // TODO: implement pause logic
    },

    cancel: createDialogAction('cancel'),

    addDocket: () => {
      console.log('Add docket:', jobId, jobData);
      // TODO: implement add docket logic
    },

    viewDockets: () => {
      console.log('View dockets:', jobId, jobData);
      // TODO: implement view dockets logic
    },

    settle: createDialogAction('settle'),
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;
    console.log('confirmDialogs', key, config);

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
        confirmDisabled={config.confirmDisabled}
        cancelText={config.cancelText}
        onConfirmAction={() => {
          const handler = actionHandlers[key];
          if (handler) {
            handler();
          }
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={selectedJob?.id}
      dialogTitle="View / Edit Job"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
      }}
      headerButtons={<JobActionButtons job={selectedJob ?? undefined} />}
      hideTrigger
      headerInfo={{
        useSelectedJob: true,
      }}
    >
      <JobForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
