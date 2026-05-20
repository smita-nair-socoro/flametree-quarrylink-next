'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JobDTO, JobDetails } from '@/lib/types/job';
import JobForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-form';
import DocketForm from '@/app/(protected)/customer-operations/dockets/(components)/forms/docket-form';
import InvoiceForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/invoice-form';
import { JobActionButtons } from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-action-buttons';
import { useJobStore } from '@/app/stores/job-store';
import { DocketsByJobIdQueryOptions } from '@/lib/api/docket';
import { useSettleJob, JobItemsQueryOptions } from '@/lib/api/job';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { DocketDTO } from '@/lib/types/docket';
import { notifyError, notifySuccess } from '@/lib/toast';
import {
  ResumeJobDescription,
  ResumeJobContent,
} from '@/hooks/job/resume-job-content';
import {
  SettleJobDescription,
  SettleJobContent,
} from '@/hooks/job/settle-job-content';
import {
  PauseJobDescription,
  PauseJobContent,
} from '@/hooks/job/pause-job-content';
import {
  CancelJobDescription,
  CancelJobContent,
  CannotCancelJobDescription,
  CannotCancelJobContent,
  CannotCancelBlockerType,
  CANCEL_REASON_LABELS,
} from '@/hooks/job/cancel-job-content';
import { useCancelJob, usePauseJob, useResumeJob } from '@/lib/api/job';
import {
  extractErrorData,
  extractErrorMessage,
} from '@/lib/utils/error-message-helper';

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

interface CancelBlockerState {
  type: CannotCancelBlockerType;
  activeCount?: number;
  unfinalisedCount?: number;
}

export function useJobActions(jobData?: JobDetails | null) {
  const jobId = jobData?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedJob = useJobStore((s) => s.selectedJob);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [addDocketOpen, setAddDocketOpen] = React.useState(false);
  const [addInvoiceOpen, setAddInvoiceOpen] = React.useState(false);
  const [pauseDocketAction, setPauseDocketAction] = React.useState<
    'stop' | 'allow'
  >('stop');
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelNotes, setCancelNotes] = React.useState('');
  const [settleBlockedData, setSettleBlockedData] = React.useState<{
    unfinalisedDocketsCount: number;
    unfinalisedDocketsAmount: number;
  } | null>(null);

  const settleJobMutation = useSettleJob();
  const [cannotCancelBlocker, setCannotCancelBlocker] =
    React.useState<CancelBlockerState | null>(null);

  const cancelJobMutation = useCancelJob();
  const pauseJobMutation = usePauseJob();
  const resumeJobMutation = useResumeJob();

  const [activeDockets, setActiveDockets] = React.useState<DocketDTO[]>([]);

  const ACTIVE_STATUSES = new Set([
    DOCKET_STATUS.ASSIGNED,
    DOCKET_STATUS.IN_TRANSIT,
    DOCKET_STATUS.ARRIVED,
    DOCKET_STATUS.STOPPED,
    DOCKET_STATUS.PENDING,
    DOCKET_STATUS.PREPARING,
    DOCKET_STATUS.READY,
  ]);

  const isCancelFormValid = React.useMemo(() => {
    if (!cancelReason) return false;
    if (cancelReason === CANCEL_REASON_LABELS.other && !cancelNotes.trim())
      return false;
    return true;
  }, [cancelReason, cancelNotes]);

  const dialogConfigs = React.useMemo(
    (): Record<string, DialogConfig> => ({
      resume: {
        title: 'Resume Job',
        description: <ResumeJobDescription job={jobData} />,
        content: <ResumeJobContent />,
        confirmText: 'Resume Job',
        confirmCustomColor: '#008236',
        confirmActionNeeded: true,
      },
      cancel: {
        title: 'Cancel Job',
        description: <CancelJobDescription job={jobData} />,
        content: (
          <CancelJobContent
            cancelReason={cancelReason}
            onCancelReasonChange={setCancelReason}
            cancelNotes={cancelNotes}
            onCancelNotesChange={setCancelNotes}
          />
        ),
        confirmText: 'Cancel Job',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
        confirmDisabled: !isCancelFormValid,
        cancelText: 'Keep Job',
      },
      cannot_cancel: {
        title: 'Cannot Cancel Job',
        description: <CannotCancelJobDescription job={jobData} />,
        content: cannotCancelBlocker ? (
          <CannotCancelJobContent
            blockerType={cannotCancelBlocker.type}
            activeCount={cannotCancelBlocker.activeCount}
            unfinalisedCount={cannotCancelBlocker.unfinalisedCount}
          />
        ) : null,
        confirmActionNeeded: false,
        cancelText: 'Close',
      },
      settle_blocked: {
        title: 'Settlement Blocked',
        description: <SettleJobDescription job={jobData} />,
        content: (
          <SettleJobContent
            unfinalisedDocketsCount={settleBlockedData?.unfinalisedDocketsCount}
            unfinalisedDocketsAmount={
              settleBlockedData?.unfinalisedDocketsAmount
            }
          />
        ),
        confirmText: 'Resolve Dockets',
        confirmCustomColor: '#8E51FF',
        cancelText: 'Cancel',
      },
      pause: {
        title: 'Pause Job',
        description: <PauseJobDescription job={jobData} />,
        content: (
          <PauseJobContent
            activeDockets={activeDockets}
            docketAction={pauseDocketAction}
            onDocketActionChange={setPauseDocketAction}
          />
        ),
        confirmText: 'Pause Job',
        confirmCustomColor: '#CA8A04',
      },
    }),
    [
      jobData,
      activeDockets,
      pauseDocketAction,
      cancelReason,
      cancelNotes,
      isCancelFormValid,
      settleBlockedData,
      cannotCancelBlocker,
    ],
  );

  const createDialogAction = (actionKey: string) => () =>
    setActiveDialog(actionKey);

  const handleSettleJob = async () => {
    if (!jobId) return;

    try {
      await settleJobMutation.mutateAsync(jobId);
      notifySuccess('Job settled successfully.');
      setActiveDialog(null);
      setSettleBlockedData(null);
    } catch (error: unknown) {
      const errorData = extractErrorData(error) as {
        unfinalisedDocketsCount?: number;
        unfinalisedDocketsAmount?: number;
      } | null;

      if (
        errorData &&
        (errorData.unfinalisedDocketsCount !== undefined ||
          errorData.unfinalisedDocketsAmount !== undefined)
      ) {
        setSettleBlockedData({
          unfinalisedDocketsCount: errorData.unfinalisedDocketsCount ?? 0,
          unfinalisedDocketsAmount: errorData.unfinalisedDocketsAmount ?? 0,
        });
        setActiveDialog('settle_blocked');
      } else {
        notifyError('Failed to settle job. Please try again.');
        setActiveDialog(null);
      }
    }
  };

  const handleResumeJob = async () => {
    if (jobId == null) return;
    try {
      const updated = await resumeJobMutation.mutateAsync({ id: jobId });
      notifySuccess('Job resumed successfully.');
      setActiveDialog(null);
      useJobStore.getState().setSelectedJob(updated);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handlePauseJob = async () => {
    if (jobId == null) return;
    try {
      const pauseStrategy =
        pauseDocketAction === 'stop'
          ? 'STOP_ALL_DOCKETS'
          : 'ALLOW_DRIVERS_TO_COMPLETE';
      const updated = await pauseJobMutation.mutateAsync({
        id: jobId,
        pauseStrategy,
      });
      notifySuccess('Job paused successfully.');
      setActiveDialog(null);
      useJobStore.getState().setSelectedJob(updated);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleCancelJob = async () => {
    if (jobId == null) {
      console.error('Job ID is required');
      return;
    }
    try {
      const updated = await cancelJobMutation.mutateAsync({
        id: jobId,
        cancelReason,
        additionalNotes: cancelNotes.trim(),
      });
      notifySuccess('Job cancelled successfully.');
      setActiveDialog(null);
      setCannotCancelBlocker(null);
      useJobStore.getState().setSelectedJob(updated);
    } catch (error: unknown) {
      const data = extractErrorData(error) as {
        activeCount?: number;
        unfinalisedCount?: number;
      } | null;
      const activeCount = data?.activeCount ?? 0;
      const unfinalisedCount = data?.unfinalisedCount ?? 0;

      const hasBlockers = activeCount > 0 || unfinalisedCount > 0;

      if (hasBlockers) {
        const blockerType: CannotCancelBlockerType =
          activeCount > 0 && unfinalisedCount > 0
            ? 'multiple_blockers'
            : activeCount > 0
              ? 'active_drivers'
              : 'unfinalised_dockets';

        setCannotCancelBlocker({ type: blockerType, activeCount, unfinalisedCount });
        setActiveDialog('cannot_cancel');
      } else {
        setActiveDialog(null);
        setCannotCancelBlocker(null);
      }
    }
  };

  const actionHandlers: Record<string, () => Promise<void>> = {
    resume: () => handleResumeJob(),
    cancel: handleCancelJob,
    settle_blocked: async () => {
      setActiveDialog(null);
      setSettleBlockedData(null);
      setAddInvoiceOpen(true);
    },
    pause: () => handlePauseJob(),
  };

  const actions = {
    /** Pass job when opening from row click so the store updates before the dialog opens */
    view: (job?: JobDTO | null) => {
      const toSelect = job ?? jobData;
      if (toSelect != null) {
        useJobStore.getState().setSelectedJob(toSelect);
      }
      setViewOpen(true);
    },

    resume: createDialogAction('resume'),

    pause: async () => {
      if (!jobId) return;
      setPauseDocketAction('stop');
      try {
        const result = await queryClient.fetchQuery(
          DocketsByJobIdQueryOptions(jobId),
        );
        const docketList: DocketDTO[] = Array.isArray(result)
          ? result
          : (result?.content ?? []);
        setActiveDockets(
          docketList.filter((d) => ACTIVE_STATUSES.has(d.docketStatus)),
        );
      } catch {
        setActiveDockets([]);
      }
      setActiveDialog('pause');
    },

    cancel: () => {
      setCancelReason('');
      setCancelNotes('');
      setCannotCancelBlocker(null);
      setActiveDialog('cancel');
    },

    addDocket: () => {
      if (!jobId) return;
      setAddDocketOpen(true);
    },

    viewDockets: async () => {
      if (!jobId) return;

      try {
        const dockets = await queryClient.fetchQuery(
          DocketsByJobIdQueryOptions(jobId),
        );
        const docketList = Array.isArray(dockets)
          ? dockets
          : (dockets?.content ?? []);

        if (docketList.length === 0) {
          notifyError('No dockets found for this job.');
          return;
        }

        const jobNumber = (
          jobData?.jobNumber ??
          selectedJob?.jobNumber ??
          ''
        ).trim();
        const jobNumberParam = jobNumber
          ? `&linkedJobNumber=${encodeURIComponent(jobNumber)}`
          : '';

        router.push(
          `/customer-operations/dockets?linkedJobId=${jobId}${jobNumberParam}`,
        );
      } catch (error: unknown) {
        console.error('[useJobActions] viewDockets failed:', error);
        notifyError('Failed to load dockets for this job.');
      }
    },

    settle: () => { handleSettleJob(); },
  };

  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    return (
      <ActionDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) setActiveDialog(null);
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
        onConfirmAction={async () => {
          const handler = actionHandlers[key];
          if (handler) {
            await handler();
          }
        }}
      />
    );
  });

  // Customer field is only editable when the job is Active
  const canEdit = jobData?.jobStatus === JOB_STATUS.ACTIVE;

  const viewDialog = viewOpen ? (
    <FormDialog
      id={selectedJob?.id}
      dialogTitle="View / Edit Job"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) {
          setTimeout(() => {
            setViewOpen(false);
          }, 100);
        }
      }}
      headerButtons={<JobActionButtons job={selectedJob ?? null} />}
      hideTrigger
      headerInfo={{
        useSelectedJob: true,
      }}
    >
      <JobForm canEdit={canEdit} />
    </FormDialog>
  ) : null;

  const addDocketDialog = addDocketOpen ? (
    <FormDialog
      dialogTitle="Add New Docket"
      open={addDocketOpen}
      onOpenChangeAction={(open) => {
        setAddDocketOpen(open);
        if (!open) {
          setTimeout(() => {
            setAddDocketOpen(false);
          }, 100);
        }
      }}
      hideTrigger
    >
      <DocketForm isQuickDocket={false} jobId={jobId} />
    </FormDialog>
  ) : null;

  const addInvoiceDialog = addInvoiceOpen && jobId ? (
    <FormDialog
      dialogTitle="Create Invoice"
      open={addInvoiceOpen}
      onOpenChangeAction={(open) => {
        setAddInvoiceOpen(open);
        if (!open) {
          setTimeout(() => {
            setAddInvoiceOpen(false);
          }, 100);
        }
      }}
      hideTrigger
    >
      <InvoiceForm jobId={jobId} />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
    addDocketDialog,
    addInvoiceDialog,
  };
}
