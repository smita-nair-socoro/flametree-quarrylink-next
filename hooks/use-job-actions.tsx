'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { Job, JobDetails } from '@/lib/types/job';
import JobForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-form';
import { JobActionButtons } from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-action-buttons';
import { useJobStore } from '@/app/stores/job-store';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { ResumeJobContent } from '@/hooks/job/resume-job-content';
import { SettleJobContent } from '@/hooks/job/settle-job-content';
import { PauseJobContent } from '@/hooks/job/pause-job-content';

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

export function useJobActions(jobData?: JobDetails | null) {
  const jobId = jobData?.id;
  const selectedJob = useJobStore((s) => s.selectedJob);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [pauseDocketAction, setPauseDocketAction] = React.useState<
    'stop' | 'allow'
  >('stop');

  const activeDockets = React.useMemo(
    () =>
      (jobData?.dockets ?? []).filter(
        (d) =>
          d.status === DOCKET_STATUS.ASSIGNED ||
          d.status === DOCKET_STATUS.IN_TRANSIT,
      ),
    [jobData],
  );

  const dialogConfigs = React.useMemo(
    (): Record<string, DialogConfig> => ({
      resume: {
        title: 'Resume Job',
        description: <ResumeJobContent />,
        confirmText: 'Resume',
        confirmVariant: 'default',
        confirmActionNeeded: true,
      },
      settle: {
        title: 'Settlement Blocked',
        content: <SettleJobContent job={jobData} />,
        confirmText: 'Settle Job',
        confirmCustomColor: '#8E51FF',
        cancelText: 'Cancel',
      },
      pause: {
        title: 'Pause Job',
        content: (
          <PauseJobContent
            job={jobData}
            activeDockets={activeDockets}
            docketAction={pauseDocketAction}
            onDocketActionChange={setPauseDocketAction}
          />
        ),
        confirmText: 'Pause Job',
        confirmCustomColor: '#D97706',
      },
    }),
    [jobData, activeDockets, pauseDocketAction],
  );

  const createDialogAction = (actionKey: string) => () =>
    setActiveDialog(actionKey);

  const actionHandlers: Record<string, () => void> = {
    resume: () => {
      console.log('Resume job:', jobId, jobData);
      // TODO: implement resume logic
    },
    settle: () => {
      console.log('Settle job:', jobId, jobData);
      // TODO: implement settle logic
    },
    pause: () => {
      console.log('Pause job:', jobId, 'docketAction:', pauseDocketAction);
      // TODO: implement pause logic
    },
  };

  const actions = {
    /** Pass job when opening from row click so the store updates before the dialog opens */
    view: (job?: Job | null) => {
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
      console.log('Cancel job:', jobId, jobData);
      // TODO: implement cancel logic
    },

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

  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

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
        onConfirmAction={() => actionHandlers[key]?.()}
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
