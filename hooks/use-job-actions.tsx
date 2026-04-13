'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JobDTO, JobDetails } from '@/lib/types/job';
import JobForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-form';
import DocketForm from '@/app/(protected)/customer-operations/dockets/(components)/forms/docket-form';
import { JobActionButtons } from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-action-buttons';
import { useJobStore } from '@/app/stores/job-store';
import { DocketsByJobIdQueryOptions } from '@/lib/api/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { Docket } from '@/lib/types/docket';
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
  activeDeliveryCount?: number;
  deliveredDocketCount?: number;
  collectedDocketCount?: number;
}

export function useJobActions(jobData?: JobDetails | null) {
  const jobId = jobData?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedJob = useJobStore((s) => s.selectedJob);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [addDocketOpen, setAddDocketOpen] = React.useState(false);
  const [pauseDocketAction, setPauseDocketAction] = React.useState<
    'stop' | 'allow'
  >('stop');
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelNotes, setCancelNotes] = React.useState('');
  const [cannotCancelBlocker, setCannotCancelBlocker] =
    React.useState<CancelBlockerState | null>(null);

  const cancelJobMutation = useCancelJob();
  const pauseJobMutation = usePauseJob();
  const resumeJobMutation = useResumeJob();

  // TODO: replace with real active dockets from API
  const activeDockets: Docket[] = [
    {
      id: 1,
      docketNumber: 'DOC-2026-011',
      status: DOCKET_STATUS.ASSIGNED,
      contactName: 'John Doe',
    },
    {
      id: 2,
      docketNumber: 'DOC-2026-021',
      status: DOCKET_STATUS.IN_TRANSIT,
      contactName: 'Jane Smith',
    },
    {
      id: 3,
      docketNumber: 'DOC-2026-031',
      status: DOCKET_STATUS.ARRIVED,
      contactName: 'Bob Johnson',
    },
  ] as Docket[];

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
            activeDeliveryCount={cannotCancelBlocker.activeDeliveryCount}
            deliveredDocketCount={cannotCancelBlocker.deliveredDocketCount}
            collectedDocketCount={cannotCancelBlocker.collectedDocketCount}
          />
        ) : null,
        confirmActionNeeded: false,
        cancelText: 'Close',
      },
      settle: {
        title: 'Settlement Blocked',
        description: <SettleJobDescription job={jobData} />,
        content: <SettleJobContent job={jobData} />,
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
      cannotCancelBlocker,
    ],
  );

  const createDialogAction = (actionKey: string) => () =>
    setActiveDialog(actionKey);

  const handleResumeJob = async () => {
    if (jobId == null) return;
    try {
      await resumeJobMutation.mutateAsync({ id: jobId });
      notifySuccess('Job resumed successfully.');
      setActiveDialog(null);
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
      await pauseJobMutation.mutateAsync({ id: jobId, pauseStrategy });
      notifySuccess('Job paused successfully.');
      setActiveDialog(null);
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
      await cancelJobMutation.mutateAsync({
        id: jobId,
        cancelReason,
        additionalNotes: cancelNotes.trim(),
      });
      notifySuccess('Job cancelled successfully.');
      setActiveDialog(null);
      setCannotCancelBlocker(null);
    } catch (error: unknown) {
      const data = extractErrorData(
        error,
      ) as Partial<CancelBlockerState> | null;
      const activeDeliveryCount = data?.activeDeliveryCount ?? 0;
      const deliveredDocketCount = data?.deliveredDocketCount ?? 0;
      const collectedDocketCount = data?.collectedDocketCount ?? 0;

      const hasBlockers =
        activeDeliveryCount > 0 ||
        deliveredDocketCount > 0 ||
        collectedDocketCount > 0;

      if (hasBlockers) {
        const blockerType: CannotCancelBlockerType =
          activeDeliveryCount > 0 &&
          (deliveredDocketCount > 0 || collectedDocketCount > 0)
            ? 'multiple_blockers'
            : activeDeliveryCount > 0
              ? 'active_drivers'
              : 'unfinalised_dockets';

        setCannotCancelBlocker({
          type: blockerType,
          activeDeliveryCount,
          deliveredDocketCount,
          collectedDocketCount,
        });
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
    settle: async () => {
      console.log('Settle job:', jobId, jobData);
      // TODO: implement settle logic
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

    pause: () => {
      setPauseDocketAction('stop');
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

    settle: createDialogAction('settle'),
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

  return {
    actions,
    confirmDialogs,
    viewDialog,
    addDocketDialog,
  };
}
