'use client';
import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { FormDialog } from '@/components/form-dialog';
import { User } from '@/lib/types/user';
import { AlertTriangle, Users, Briefcase, Trash2 } from 'lucide-react';
import { SelectOptions } from '@/components/ui/select-options';
import { EditTeamMemberForm } from '@/app/(protected)/system/user-management/(components)/forms/team-member-form';
import { FormSelectOption } from '@/components/ui/form-select';
import { TeamMemberActionButtons } from '@/app/(protected)/system/user-management/(components)/forms/team-member-action-buttons';

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
}

export function useTeamMemberActions(
  teamMemberId: string | undefined, // Changed from number to string (sub is UUID)
  teamMemberData?: User | null,
  roles?: readonly FormSelectOption[],
  currentUserId?: number | string
) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);

  // State for delete with dependencies form
  const [accountManagerReassignTo, setAccountManagerReassignTo] =
    React.useState<string | number | undefined>(undefined);
  const [jobReassignTo, setJobReassignTo] = React.useState<
    string | number | undefined
  >(undefined);
  const [deletionReason, setDeletionReason] = React.useState('');
  // Not sure if we need this to be done manually or use zod?
  const [validationErrors, setValidationErrors] = React.useState<{
    accountManager?: string;
    job?: string;
    reason?: string;
  }>({});

  // TODO: Replace with real API data
  // For now, assume no dependencies until backend provides this data
  const customerCount = 0;
  const activeJobsCount = 0;

  // Check if user has dependencies that need reassignment
  const hasDependencies = customerCount > 0 || activeJobsCount > 0;

  // TODO: Fetch real team members from API for reassignment dropdowns
  const teamMemberOptions: { label: string; value: string }[] = [];

  const userName = teamMemberData?.name;

  // Check if delete button should be disabled
  const isDeleteButtonDisabled = React.useMemo(() => {
    if (!hasDependencies) return false;

    // If there are customers, must select account manager
    if (customerCount > 0 && !accountManagerReassignTo) return true;

    // If there are jobs, must select job assignee
    if (activeJobsCount > 0 && !jobReassignTo) return true;

    return false;
  }, [
    hasDependencies,
    customerCount,
    activeJobsCount,
    accountManagerReassignTo,
    jobReassignTo,
  ]);

  // Helper function to format role for display
  // groups is an array like ["super_admin", "admin"] containing role names
  const formatRole = (groups: string[] | undefined) => {
    if (!groups || !Array.isArray(groups) || groups.length === 0) {
      return 'User';
    }

    // Check for roles in priority order (highest to lowest)
    const groupsStr = groups.join(',').toLowerCase();

    if (groupsStr.includes('super_admin') || groupsStr.includes('superadmin')) {
      return 'Super Admin';
    }
    if (groupsStr.includes('admin')) {
      return 'Admin';
    }

    return 'User';
  };

  // Single delete dialog config - same structure for both cases
  const deleteDialogConfig: DialogConfig = {
    title: 'Delete User',
    description: (
      <div className="flex flex-col gap-3">
        {/* User Info Card */}
        <div className="flex items-center gap-3 rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base">{userName}</span>
            <span className="text-sm text-muted-foreground">
              {teamMemberData?.email}
              {teamMemberData?.groups && (
                <>
                  {' • '}
                  {formatRole(teamMemberData.groups)}
                </>
              )}
            </span>
          </div>
        </div>
        {/* Confirmation text */}
        <span className="text-sm">
          Are you sure you want to delete this user?
        </span>
        {/* Warning Box */}
        <div className="bg-[#FFE2E2] border border-[#E7000B] rounded-md p-3 flex gap-3 text-[#E7000B]">
          <Trash2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold mb-1">Permanent Deletion</p>
            <p className="text-sm">
              This action cannot be undone. The user will be permanently removed
              from the system and will lose access immediately.
            </p>
          </div>
        </div>
        {/* Dependency warning text - Only show when hasDependencies */}
        {hasDependencies && (
          <span className="text-sm text-muted-foreground">
            This user has dependencies that need to be reassigned before
            deletion can proceed.
          </span>
        )}
      </div>
    ),
    content: (
      <div className="flex flex-col gap-4">
        {/* Dependency reassignment warning - Only show when hasDependencies */}
        {hasDependencies && (
          <div className="bg-orange-50 border border-orange-400 rounded-md p-3 flex text-orange-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              This user has data that needs reassignment:
            </p>
          </div>
        )}
        {/* Conditional Dependency Sections - Only show when hasDependencies */}
        {hasDependencies && (
          <>
            {/* Account Manager Section */}
            {customerCount > 0 && (
              <div className="border border-border bg-white rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-blue-600" />
                  Account Manager for {customerCount} customers
                </div>
                <SelectOptions
                  label="Reassign to:"
                  searchLabel="team member"
                  options={teamMemberOptions}
                  value={accountManagerReassignTo}
                  onChange={setAccountManagerReassignTo}
                  placeholder="Select team member..."
                  popoverWidthClass="w-[300px]"
                  error={validationErrors.accountManager}
                  className="bg-white border-border text-foreground"
                />
              </div>
            )}

            {/* Active Jobs Section */}
            {activeJobsCount > 0 && (
              <div className="border border-border bg-white rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                  Assigned to {activeJobsCount} active jobs
                </div>
                <SelectOptions
                  label="Reassign to:"
                  searchLabel="team member"
                  options={teamMemberOptions}
                  value={jobReassignTo}
                  onChange={setJobReassignTo}
                  placeholder="Select team member..."
                  popoverWidthClass="w-[300px]"
                  error={validationErrors.job}
                  className="bg-white border-border text-foreground"
                />
              </div>
            )}
          </>
        )}

        {/* What happens section - Always shown */}
        <div>
          <span className="font-semibold text-sm">
            What happens when user is deleted:
          </span>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-outside pl-5 mt-2">
            <li>User account is permanently removed</li>
            <li>User loses access to the system immediately</li>
            <li>User cannot log in or access any data</li>
            <li>Historical records remain for audit purposes</li>
          </ul>
        </div>
      </div>
    ),
    confirmText: hasDependencies ? 'Delete & Reassign' : 'Delete User',
    confirmVariant: 'destructive',
    confirmActionNeeded: true,
    confirmDisabled: isDeleteButtonDisabled,
  };

  const resetDeleteForm = () => {
    setAccountManagerReassignTo(undefined);
    setJobReassignTo(undefined);
    setDeletionReason('');
    setValidationErrors({});
  };

  const validateDeleteForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Deletion reason is always required
    if (!deletionReason.trim()) {
      errors.reason = 'Deletion reason is required';
    }

    // Only validate reassignment fields if there are dependencies
    if (hasDependencies) {
      if (customerCount > 0 && !accountManagerReassignTo) {
        errors.accountManager = 'Please select a team member';
      }

      if (activeJobsCount > 0 && !jobReassignTo) {
        errors.job = 'Please select a job assignee';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const actions = {
    delete: () => {
      setIsDeleteDialogOpen(true);
    },
    deactivate: () => {
      // TODO: Implement deactivate functionality
      console.log('Deactivate user:', teamMemberData);
    },
    viewEdit: () => {
      setViewOpen(true);
    },
    resetPassword: () => {
      // TODO: Implement reset password functionality
      console.log('Reset password for user:', teamMemberData);
    },
    resendInvitation: () => {
      // TODO: Implement resend invitation functionality
      console.log('Resend invitation to:', teamMemberData);
    },
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!validateDeleteForm()) {
      return;
    }

    if (hasDependencies) {
      // TODO: Implement actual delete logic with reassignments
      // API call: DELETE /api/team-members/${teamMemberId} with reassignment data
      console.log('Deleting user with dependencies:', {
        teamMember: teamMemberData,
        accountManagerReassignTo,
        jobReassignTo,
        deletionReason,
      });
    } else {
      // TODO: Implement actual simple delete logic
      // API call: DELETE /api/team-members/${teamMemberId}
      console.log('Deleting user:', teamMemberData);
    }

    setIsDeleteDialogOpen(false);
    resetDeleteForm();
  };

  // Render delete dialog
  const deleteDialog = (
    <ActionDialog
      open={isDeleteDialogOpen}
      onOpenChangeAction={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          resetDeleteForm();
        }
      }}
      title={deleteDialogConfig.title ?? ''}
      titleIcon={deleteDialogConfig.titleIcon}
      description={deleteDialogConfig.description}
      content={deleteDialogConfig.content}
      confirmText={deleteDialogConfig.confirmText ?? ''}
      confirmVariant={deleteDialogConfig.confirmVariant}
      confirmCustomColor={deleteDialogConfig.confirmCustomColor}
      confirmCustomClass={deleteDialogConfig.confirmCustomClass}
      confirmIcon={deleteDialogConfig.confirmIcon}
      confirmActionNeeded={deleteDialogConfig.confirmActionNeeded}
      confirmDisabled={deleteDialogConfig.confirmDisabled}
      onConfirmAction={handleDeleteConfirm}
    />
  );

  // Render view/edit dialog
  const viewDialog = viewOpen ? (
    <FormDialog
      dialogTitle="Edit Team Member"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) {
          setViewOpen(false);
        }
      }}
      hideTrigger
      headerButtonsAlign="start"
      headerButtons={
        <TeamMemberActionButtons
          teamMember={teamMemberData}
          roles={roles}
          currentUserId={currentUserId}
        />
      }
      preserveEmptyBadgeSpace={false}
    >
      <EditTeamMemberForm roles={roles || []} currentUserId={currentUserId} />
    </FormDialog>
  ) : null;

  return {
    actions,
    deleteDialog,
    viewDialog,
  };
}
