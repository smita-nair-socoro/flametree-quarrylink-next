'use client';

import * as React from 'react';
import { AlertTriangle, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateDepartment,
  useDeleteDepartment,
  useGetDepartments,
  useUpdateDepartment,
} from '@/lib/api/department';
import type { Department } from '@/lib/types/department';
import { notifyError, notifySuccess } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

type DepartmentDraft = Pick<Department, 'departmentName'>;

const EMPTY_DEPARTMENT_DRAFT: DepartmentDraft = {
  departmentName: '',
};

function DepartmentForm({
  draft,
  onDraftChange,
  onCancel,
  onSave,
  isSaving,
  submitText = 'Save',
}: {
  draft: DepartmentDraft;
  onDraftChange: (draft: DepartmentDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  submitText?: string;
}) {
  const canSave = draft.departmentName.trim().length > 0;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="department-name">Department Name</Label>
        <Input
          id="department-name"
          placeholder="e.g. Quarry or Batch Plant"
          value={draft.departmentName}
          onChange={(event) =>
            onDraftChange({ departmentName: event.target.value })
          }
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-[#C084FC] text-white hover:bg-[#A855F7]"
          disabled={!canSave || isSaving}
          onClick={onSave}
        >
          {isSaving ? 'Saving...' : submitText}
        </Button>
      </div>
    </div>
  );
}

function DepartmentRow({
  department,
  onEdit,
  onDelete,
  disabled,
}: {
  department: Department;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-5">
      <p className="truncate text-sm font-semibold text-[#101828]">
        {department.departmentName}
      </p>

      <div className="flex shrink-0 items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label={`Edit ${department.departmentName}`}
          disabled={disabled}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label={`Delete ${department.departmentName}`}
          disabled={disabled}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function DepartmentsMapping() {
  const [departmentsExpanded, setDepartmentsExpanded] = React.useState(false);
  const [isAddingDepartment, setIsAddingDepartment] = React.useState(false);
  const [departmentDraft, setDepartmentDraft] =
    React.useState<DepartmentDraft>(EMPTY_DEPARTMENT_DRAFT);
  const [editingDepartmentId, setEditingDepartmentId] = React.useState<
    number | null
  >(null);
  const [editDepartmentDraft, setEditDepartmentDraft] =
    React.useState<DepartmentDraft>(EMPTY_DEPARTMENT_DRAFT);
  const [deleteDepartmentOpen, setDeleteDepartmentOpen] = React.useState(false);
  const [deleteTargetDepartment, setDeleteTargetDepartment] =
    React.useState<Department | null>(null);

  const departmentsQuery = useGetDepartments({
    enabled: departmentsExpanded,
  });
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const departments = departmentsQuery.data ?? [];
  const isDepartmentSaving =
    createDepartment.isPending ||
    updateDepartment.isPending ||
    deleteDepartment.isPending;

  const handleStartAddDepartment = () => {
    setDepartmentDraft(EMPTY_DEPARTMENT_DRAFT);
    setEditingDepartmentId(null);
    setEditDepartmentDraft(EMPTY_DEPARTMENT_DRAFT);
    setIsAddingDepartment(true);
  };

  const handleCancelAddDepartment = () => {
    setDepartmentDraft(EMPTY_DEPARTMENT_DRAFT);
    setIsAddingDepartment(false);
  };

  const handleSaveDepartment = async () => {
    if (
      !isAddingDepartment ||
      editingDepartmentId !== null ||
      !departmentDraft.departmentName.trim()
    ) {
      return;
    }

    try {
      await createDepartment.mutateAsync({
        departmentName: departmentDraft.departmentName.trim(),
      });
      handleCancelAddDepartment();
      notifySuccess('Department created successfully');
    } catch (error) {
      console.error('Error creating department:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handleStartEditDepartment = (department: Department) => {
    setIsAddingDepartment(false);
    setDepartmentDraft(EMPTY_DEPARTMENT_DRAFT);
    setEditingDepartmentId(department.id ?? null);
    setEditDepartmentDraft({
      departmentName: department.departmentName,
    });
  };

  const handleCancelEditDepartment = () => {
    setEditingDepartmentId(null);
    setEditDepartmentDraft(EMPTY_DEPARTMENT_DRAFT);
  };

  const handleSaveEditDepartment = async () => {
    if (
      isAddingDepartment ||
      !editingDepartmentId ||
      !editDepartmentDraft.departmentName.trim()
    ) {
      return;
    }

    try {
      await updateDepartment.mutateAsync({
        id: editingDepartmentId,
        data: {
          departmentName: editDepartmentDraft.departmentName.trim(),
        },
      });
      handleCancelEditDepartment();
      notifySuccess('Department updated successfully');
    } catch (error) {
      console.error('Error updating department:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handleOpenDeleteDepartment = (department: Department) => {
    setDeleteTargetDepartment(department);
    setDeleteDepartmentOpen(true);
  };

  const handleConfirmDeleteDepartment = async () => {
    if (!deleteTargetDepartment?.id) return;

    try {
      await deleteDepartment.mutateAsync(deleteTargetDepartment.id);
      setDeleteDepartmentOpen(false);
      setDeleteTargetDepartment(null);
      notifySuccess('Department deleted successfully');
    } catch (error) {
      console.error('Error deleting department:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-[#364153]"
          onClick={() => setDepartmentsExpanded((current) => !current)}
        >
          {departmentsExpanded ? 'Hide departments' : 'Manage departments'}
          <ChevronDown
            className={cn(
              'ml-1 h-4 w-4 transition-transform',
              departmentsExpanded && 'rotate-180',
            )}
          />
        </Button>
      </div>

      {departmentsExpanded && (
        <div className="flex flex-col gap-4 border-t pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#101828]">Departments</p>
              <p className="text-sm text-[#6A7282]">
                Configure Departments that will be linked to Product
              </p>
            </div>
            {!isAddingDepartment && editingDepartmentId === null && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleStartAddDepartment}
              >
                <Plus className="h-4 w-4" />
                Add department
              </Button>
            )}
          </div>

          {isAddingDepartment && (
            <DepartmentForm
              draft={departmentDraft}
              onDraftChange={setDepartmentDraft}
              onCancel={handleCancelAddDepartment}
              onSave={handleSaveDepartment}
              isSaving={isDepartmentSaving}
              submitText="Create department"
            />
          )}

          {!isAddingDepartment &&
            !departmentsQuery.isLoading &&
            departments.length === 0 && (
              <button
                type="button"
                className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#D1D5DC] bg-[#FAFAFA] px-6 py-8 text-center transition-colors hover:border-[#9CA3AF]"
                onClick={handleStartAddDepartment}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]">
                  <Plus className="h-5 w-5 text-[#9CA3AF]" />
                </div>
                <p className="text-sm font-medium text-[#101828]">
                  Add your first department
                </p>
                <p className="text-sm text-[#6A7282]">
                  No departments have been configured yet.
                </p>
              </button>
            )}

          {departmentsQuery.isLoading && (
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-5 text-sm text-[#6A7282]">
              Loading departments...
            </div>
          )}

          {departments.length > 0 && (
            <div className="flex flex-col gap-3">
              {departments.map((department) =>
                editingDepartmentId === department.id ? (
                  <DepartmentForm
                    key={department.id}
                    draft={editDepartmentDraft}
                    onDraftChange={setEditDepartmentDraft}
                    onCancel={handleCancelEditDepartment}
                    onSave={handleSaveEditDepartment}
                    isSaving={isDepartmentSaving}
                    submitText="Update department"
                  />
                ) : (
                  <DepartmentRow
                    key={department.id}
                    department={department}
                    onEdit={() => handleStartEditDepartment(department)}
                    onDelete={() => handleOpenDeleteDepartment(department)}
                    disabled={
                      isAddingDepartment ||
                      editingDepartmentId !== null ||
                      isDepartmentSaving
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      )}

      <ActionDialog
        open={deleteDepartmentOpen}
        onOpenChangeAction={(open) => {
          setDeleteDepartmentOpen(open);
          if (!open) {
            setDeleteTargetDepartment(null);
          }
        }}
        title="Delete department?"
        titleIcon={<AlertTriangle className="h-5 w-5 text-[#E7000B]" />}
        content={
          deleteTargetDepartment ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#364153]">
                Are you sure you want to delete the department{' '}
                <span className="font-medium">
                  {deleteTargetDepartment.departmentName}
                </span>
                ?
              </p>
              <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4">
                <p className="text-sm font-semibold text-[#101828]">
                  What happens next:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#6A7282]">
                  <li>
                    This department will be removed from the integration
                    mapping.
                  </li>
                  <li>
                    Invoices already pushed to Xero will keep their existing
                    department.
                  </li>
                  <li>
                    New invoices will no longer use this department for mapped
                    records.
                  </li>
                  <li>You can recreate it at any time from this page.</li>
                </ul>
              </div>
            </div>
          ) : null
        }
        confirmText={
          deleteDepartment.isPending ? 'Deleting...' : 'Delete department'
        }
        confirmVariant="destructive"
        confirmCustomColor="#E7000B"
        confirmDisabled={deleteDepartment.isPending}
        cancelText="Cancel"
        onConfirmAction={() => void handleConfirmDeleteDepartment()}
      />
    </>
  );
}
