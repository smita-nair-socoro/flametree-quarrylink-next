'use client';
import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { FormDialog } from '@/components/form-dialog';
import { TeamMember } from '@/lib/types/team-member';
import { AlertTriangle, Users, FileText, Briefcase, Trash2 } from 'lucide-react';
import { FormSelect } from '@/components/ui/form-select';
import { Form } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Mock data for team members
const MOCK_TEAM_MEMBERS = [
  { id: '1', name: 'Sarah Johnson' },
  { id: '2', name: 'Michael Chen' },
  { id: '3', name: 'Emily Rodriguez' },
  { id: '4', name: 'David Kim' },
  { id: '5', name: 'Jessica Williams' },
];

// Mock data for active jobs
const MOCK_ACTIVE_JOBS = [
  { id: '1', name: 'Construction Project Alpha', location: 'Downtown Site A' },
  { id: '2', name: 'Renovation Project Beta', location: 'Uptown Building B' },
  {
    id: '3',
    name: 'Infrastructure Project Gamma',
    location: 'Industrial Zone C',
  },
];

// Form schema
const deleteTeamMemberSchema = z.object({
  accountManagerReassignTo: z.string().min(1, 'Please select a team member'),
  jobReassignTo: z.string().min(1, 'Please select a job assignee'),
  keepHistoricalRecords: z.boolean(),
  deletionReason: z.string().min(1, 'Deletion reason is required'),
});

type DeleteTeamMemberFormValues = z.infer<typeof deleteTeamMemberSchema>;

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
  teamMemberData?: TeamMember | null,
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  const userName = teamMemberData?.user_name;

  if (selectedAction?.key === 'deleteSimple') {
    return {
      deleteSimple: {
        title: 'Delete User',
        titleIcon: <Trash2 className="h-5 w-5 text-red-600" />,
        description: (
          <div className="flex flex-col gap-2">
            <span className="font-medium">{userName}</span>
            <span className="text-sm text-muted-foreground">
              Are you sure you want to delete this user?
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                This action cannot be undone. The user will be permanently
                removed from the system.
              </p>
            </div>
            <div>
              <span className="font-semibold text-sm">What will happen:</span>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-outside pl-5 mt-2">
                <li>User account will be permanently deleted</li>
                <li>Access to the system will be revoked</li>
                <li>Historical data will be preserved</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Delete User',
        confirmVariant: 'destructive',
        confirmActionNeeded: true,
      },
    };
  }

  return {};
};

export function useTeamMemberActions(
  teamMemberId: number | undefined,
  teamMemberData?: TeamMember | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [deleteFormOpen, setDeleteFormOpen] = React.useState(false);
  const [keepHistoricalRecords, setKeepHistoricalRecords] =
    React.useState(true);

  const form = useForm<DeleteTeamMemberFormValues>({
    resolver: zodResolver(deleteTeamMemberSchema),
    defaultValues: {
      accountManagerReassignTo: '',
      jobReassignTo: '',
      keepHistoricalRecords: true,
      deletionReason: '',
    },
  });

  // Mock data - in real implementation, these would come from API
  const customerCount = 8;
  const quotationCount = 15;
  const activeJobsCount = 3;

  // Convert mock data to FormSelectOption format
  const teamMemberOptions = MOCK_TEAM_MEMBERS.map((member) => ({
    label: member.name,
    value: member.id,
  }));

  const jobOptions = MOCK_ACTIVE_JOBS.map((job) => ({
    label: `${job.name} - ${job.location}`,
    value: job.id,
  }));

  const formComponent = (
    <Form {...form}>
      <div className="space-y-3">
        {/* Account Manager Section */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-blue-600" />
            Account Manager for {customerCount} customers
          </div>
          <FormSelect
            control={form.control}
            name="accountManagerReassignTo"
            label="Reassign to:"
            searchLabel="team member"
            options={teamMemberOptions}
            placeholder="Select team member..."
            popoverWidthClass="w-[300px]"
          />
        </div>

        {/* Quotations Section */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-green-600" />
            Created {quotationCount} quotations
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keep-historical"
              checked={keepHistoricalRecords}
              onCheckedChange={(checked) =>
                setKeepHistoricalRecords(checked as boolean)
              }
            />
            <label
              htmlFor="keep-historical"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Keep as &quot;{teamMemberData?.user_name}&quot; (Historical
              records)
            </label>
          </div>
        </div>

        {/* Active Jobs Section */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Briefcase className="h-4 w-4 text-purple-600" />
            Assigned to {activeJobsCount} active jobs
          </div>
          <FormSelect
            control={form.control}
            name="jobReassignTo"
            label="Reassign to:"
            searchLabel="job"
            options={jobOptions}
            placeholder="Select job assignee..."
            popoverWidthClass="w-[400px]"
          />
        </div>

        {/* Deletion Reason */}
        <div className="space-y-2">
          <Label htmlFor="deletion-reason" className="text-red-600">
            Deletion Reason (required):
          </Label>
          <Textarea
            id="deletion-reason"
            placeholder="e.g., Employee left company"
            {...form.register('deletionReason')}
            className="min-h-[80px]"
          />
          {form.formState.errors.deletionReason && (
            <p className="text-sm text-red-600">
              {form.formState.errors.deletionReason.message}
            </p>
          )}
        </div>
      </div>
    </Form>
  );

  const dialogConfigs = getDialogConfigs(
    teamMemberData,
    selectedAction || undefined
  );

  const createDialogAction = (actionKey: string, action?: () => void) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const actions = {
    delete: createDialogAction('deleteSimple'),
    deleteWithDependencies: () => {
      setDeleteFormOpen(true);
    },
    deactivate: () => {
      // TODO: Implement deactivate functionality
      console.log('Deactivate user:', teamMemberData);
    },
    viewEdit: () => {
      // TODO: Implement view/edit functionality
      console.log('View/Edit user:', teamMemberData);
    },
    resetPassword: () => {
      // TODO: Implement reset password functionality
      console.log('Reset password for user:', teamMemberData);
    },
  };

  // Handle form submission
  const handleDeleteWithDependencies = form.handleSubmit((data) => {
    // TODO: Implement actual delete logic with reassignments
    console.log('Deleting user with dependencies:', {
      teamMember: teamMemberData,
      ...data,
    });
    setDeleteFormOpen(false);
    form.reset();
    setKeepHistoricalRecords(true);
  });

  // Render active dialog
  const deleteDialog = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <ActionDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) {
            setActiveDialog(null);
            setSelectedAction(null);
            form.reset();
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
            case 'deleteSimple':
              // TODO: Implement actual simple delete logic
              console.log('Deleting user:', teamMemberData);
              setActiveDialog(null);
              setSelectedAction(null);
              break;
          }
        }}
      />
    );
  });

  // Render FormDialog for complex delete with dependencies
  const deleteFormDialog = deleteFormOpen ? (
    <FormDialog
      key="deleteWithDependencies"
      id={teamMemberId}
      dialogTitle={`Delete User: ${teamMemberData?.user_name}`}
      open={deleteFormOpen}
      onOpenChangeAction={(open) => {
        setDeleteFormOpen(open);
        if (!open) {
          form.reset();
          setKeepHistoricalRecords(true);
        }
      }}
      hideTrigger
      dialogWidth="600px"
    >
      <div className="space-y-4 pb-4">
        <p className="text-sm text-muted-foreground">
          This user has dependencies that need to be reassigned before deletion
          can proceed.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <p className="text-sm text-orange-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            This user has data that needs reassignment:
          </p>
        </div>

        {formComponent}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDeleteFormOpen(false);
              form.reset();
              setKeepHistoricalRecords(true);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteWithDependencies}
            disabled={!form.formState.isValid}
          >
            Delete & Reassign
          </Button>
        </div>
      </div>
    </FormDialog>
  ) : null;

  return {
    actions,
    deleteDialog,
    deleteFormDialog,
  };
}
