'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { Job, JobDetails } from '@/lib/types/job';
import JobForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-form';
import { JobActionButtons } from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-action-buttons';
import {
  TriangleAlert,
  Pause,
  Truck,
  CircleX,
  CircleCheck,
} from 'lucide-react';
import { useJobStore } from '@/app/stores/job-store';
import { Docket } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { cn } from '@/lib/utils';

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
  _jobData?: Job | null,
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

function getDocketStatusStyle(status: DOCKET_STATUS): {
  label: string;
  className: string;
} {
  switch (status) {
    case DOCKET_STATUS.IN_TRANSIT:
      return { label: 'IN TRANSIT', className: 'bg-blue-100 text-blue-700' };
    case DOCKET_STATUS.ASSIGNED:
      return { label: 'ASSIGNED', className: 'bg-slate-100 text-slate-600' };
    default:
      return { label: status, className: 'bg-gray-100 text-gray-600' };
  }
}

function PauseJobContent({
  job,
  activeDockets,
  docketAction,
  onDocketActionChange,
}: {
  job?: JobDetails | null;
  activeDockets: Docket[];
  docketAction: 'stop' | 'allow';
  onDocketActionChange: (action: 'stop' | 'allow') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex-shrink-0 bg-amber-100 rounded-lg p-2">
          <Pause className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{job?.projectName}</p>
          <p className="text-sm text-gray-500">
            {job?.jobNumber}
            {job?.customerName ? ` • ${job.customerName}` : ''}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-700">Are you sure you want to pause this job?</p>

      {activeDockets.length > 0 && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TriangleAlert className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-amber-700">Active Dockets Found</span>
            </div>
            <p className="text-sm text-amber-600">
              This job has {activeDockets.length} assigned docket
              {activeDockets.length !== 1 ? 's' : ''} with drivers. Choose how to handle them:
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {activeDockets.map((docket) => {
              const statusStyle = getDocketStatusStyle(docket.status);
              return (
                <div key={docket.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{docket.docketNumber}</span>
                    {docket.contactName && (
                      <span className="text-gray-500">- {docket.contactName}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded',
                      statusStyle.className,
                    )}
                  >
                    {statusStyle.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              Select an action for assigned dockets:
            </p>

            <div
              className={cn(
                'border rounded-lg p-3 cursor-pointer transition-colors',
                docketAction === 'stop'
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 hover:bg-gray-50',
              )}
              onClick={() => onDocketActionChange('stop')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    docketAction === 'stop' ? 'border-red-500' : 'border-gray-300',
                  )}
                >
                  {docketAction === 'stop' && (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CircleX className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-semibold text-gray-900">Stop All Dockets</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Immediately stop all assigned dockets. Drivers will be notified that they have
                    been unassigned.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                'border rounded-lg p-3 cursor-pointer transition-colors',
                docketAction === 'allow'
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50',
              )}
              onClick={() => onDocketActionChange('allow')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    docketAction === 'allow' ? 'border-green-500' : 'border-gray-300',
                  )}
                >
                  {docketAction === 'allow' && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      Allow Drivers to Complete
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Let assigned drivers finish their current assigned deliveries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">When job is paused:</p>
        <ul className="space-y-1.5">
          {[
            'Job status changes to "Paused"',
            'All Assigned dockets will be Unassigned',
            'All In Transit dockets will be Stopped',
            'New docket creation is blocked',
            'Can be resumed at any time',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function useJobActions(jobData?: JobDetails | null) {
  const jobId = jobData?.id;
  const selectedJob = useJobStore((s) => s.selectedJob);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [pauseOpen, setPauseOpen] = React.useState(false);
  const [pauseDocketAction, setPauseDocketAction] = React.useState<'stop' | 'allow'>('stop');
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const dialogConfigs = React.useMemo(
    () => getDialogConfigs(jobData ?? null, selectedAction || undefined),
    [jobData, selectedAction],
  );

  const activeDockets = React.useMemo(
    () =>
      (jobData?.dockets ?? []).filter(
        (d) =>
          d.status === DOCKET_STATUS.ASSIGNED ||
          d.status === DOCKET_STATUS.IN_TRANSIT,
      ),
    [jobData],
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
      setPauseDocketAction('stop');
      setPauseOpen(true);
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

  const pauseDialog = (
    <ActionDialog
      key="pause-dialog"
      open={pauseOpen}
      onOpenChangeAction={(open) => {
        if (!open) setPauseOpen(false);
      }}
      title="Pause Job"
      content={
        <PauseJobContent
          job={jobData}
          activeDockets={activeDockets}
          docketAction={pauseDocketAction}
          onDocketActionChange={setPauseDocketAction}
        />
      }
      confirmText="Pause Job"
      confirmCustomColor="#D97706"
      onConfirmAction={() => {
        console.log('Pause job:', jobId, 'docketAction:', pauseDocketAction);
        // TODO: implement pause logic
      }}
    />
  );

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
    confirmDialogs: [...confirmDialogs, pauseDialog],
    viewDialog,
  };
}
