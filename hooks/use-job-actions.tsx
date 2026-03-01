'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { Job } from '@/lib/types/job';
import JobForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-form';
import { JobActionButtons } from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-action-buttons';
import {
  Archive,
  TriangleAlert,
  FileText,
  RotateCcw,
  Play,
} from 'lucide-react';
import { TableBadges } from '@/components/table-badges';
import { useJobStore } from '@/app/stores/job-store';

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

const getDialogConfigs = (
  jobData?: Job | null,
  selectedAction?: SelectedAction,
): Record<string, DialogConfig> => {
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

  const dialogConfigs = React.useMemo(
    () => getDialogConfigs(jobData ?? null, selectedAction || undefined),
    [jobData, selectedAction],
  );

  const actions = {
    /** Pass customer when opening from row click so the store updates before the dialog opens */
    view: (job?: Job | null) => {
      const toSelect = job ?? jobData;
      if (toSelect != null) {
        useJobStore.getState().setSelectedJob(toSelect);
      }
      setViewOpen(true);
    },

    resume: () => {
      console.log('Resume job:', jobId, jobData);
      // TODO: implement resume logic
    },

    pause: () => {
      console.log('Pause job:', jobId, jobData);
      // TODO: implement pause logic
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

    settle: () => {
      console.log('Settle job:', jobId, jobData);
      // TODO: implement settle logic
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
            case 'resume':
              console.log('Resume job:', jobId, jobData);
              // TODO: implement resume logic
              break;
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
