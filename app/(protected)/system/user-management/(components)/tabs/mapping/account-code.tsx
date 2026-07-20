'use client';

import * as React from 'react';
import { AlertTriangle, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateAccountCode,
  useDeleteAccountCode,
  useGetAccountCodes,
  useUpdateAccountCode,
} from '@/lib/api/accounting';
import type { AccountCode } from '@/lib/types/accounting';
import { notifyError, notifySuccess } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

const EMPTY_ACCOUNT_CODE_DRAFT: AccountCode = {
  code: '',
  name: '',
};

function AccountCodeForm({
  draft,
  onDraftChange,
  onCancel,
  onSave,
  isSaving,
  submitText = 'Save',
}: Readonly<{
  draft: AccountCode;
  onDraftChange: (draft: AccountCode) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  submitText?: string;
}>) {
  const canSave = draft.code.trim().length > 0 && draft.name.trim().length > 0;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="account-code-code">Code</Label>
          <Input
            id="account-code-code"
            placeholder="e.g. 208"
            maxLength={10}
            value={draft.code}
            onChange={(event) =>
              onDraftChange({ ...draft, code: event.target.value })
            }
          />
          <p className="text-xs text-[#6A7282]">Xero max 10 characters.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="account-code-name">Name</Label>
          <Input
            id="account-code-name"
            placeholder="e.g. Quarry Sales Account"
            value={draft.name}
            onChange={(event) =>
              onDraftChange({ ...draft, name: event.target.value })
            }
          />
        </div>
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

function AccountCodeRow({
  accountCode,
  onEdit,
  onDelete,
  disabled,
}: {
  accountCode: AccountCode;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const isProtectedAccountCode = accountCode.code === '200';

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-5">
      <div className="flex min-w-0 items-center gap-3">
        <Badge className="bg-[#DBEAFE] text-[#155DFC] hover:bg-[#DBEAFE]">
          {accountCode.code}
        </Badge>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#101828]">
            {accountCode.name}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'ml-auto flex shrink-0 items-center gap-4',
          isProtectedAccountCode && 'invisible pointer-events-none',
        )}
        aria-hidden={isProtectedAccountCode}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Edit ${accountCode.name}`}
          disabled={disabled || isProtectedAccountCode}
          onClick={onEdit}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Delete ${accountCode.name}`}
          disabled={disabled || isProtectedAccountCode}
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function AccountCodeMapping() {
  const [accountCodesExpanded, setAccountCodesExpanded] = React.useState(false);
  const [isAddingAccountCode, setIsAddingAccountCode] = React.useState(false);
  const [accountCodeDraft, setAccountCodeDraft] = React.useState<AccountCode>(
    EMPTY_ACCOUNT_CODE_DRAFT,
  );
  const [editingAccountCodeId, setEditingAccountCodeId] = React.useState<
    number | null
  >(null);
  const [editAccountCodeDraft, setEditAccountCodeDraft] =
    React.useState<AccountCode>(EMPTY_ACCOUNT_CODE_DRAFT);
  const [deleteAccountCodeOpen, setDeleteAccountCodeOpen] =
    React.useState(false);
  const [deleteTargetAccountCode, setDeleteTargetAccountCode] =
    React.useState<AccountCode | null>(null);
  const accountCodesQuery = useGetAccountCodes({
    enabled: accountCodesExpanded,
  });
  const createAccountCode = useCreateAccountCode();
  const updateAccountCode = useUpdateAccountCode();
  const deleteAccountCode = useDeleteAccountCode();

  const accountCodes = accountCodesQuery.data ?? [];
  const isAccountCodeSaving =
    createAccountCode.isPending ||
    updateAccountCode.isPending ||
    deleteAccountCode.isPending;

  const handleStartAddAccountCode = () => {
    setAccountCodeDraft(EMPTY_ACCOUNT_CODE_DRAFT);
    setEditingAccountCodeId(null);
    setEditAccountCodeDraft(EMPTY_ACCOUNT_CODE_DRAFT);
    setIsAddingAccountCode(true);
  };

  const handleCancelAddAccountCode = () => {
    setAccountCodeDraft(EMPTY_ACCOUNT_CODE_DRAFT);
    setIsAddingAccountCode(false);
  };

  const handleSaveAccountCode = async () => {
    if (
      !isAddingAccountCode ||
      editingAccountCodeId !== null ||
      !accountCodeDraft.code.trim() ||
      !accountCodeDraft.name.trim()
    ) {
      return;
    }

    try {
      await createAccountCode.mutateAsync({
        code: accountCodeDraft.code.trim(),
        name: accountCodeDraft.name.trim(),
      });
      handleCancelAddAccountCode();
      notifySuccess('Account code created successfully');
    } catch (error) {
      console.error('Error creating account code:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handleStartEditAccountCode = (accountCode: AccountCode) => {
    setIsAddingAccountCode(false);
    setAccountCodeDraft(EMPTY_ACCOUNT_CODE_DRAFT);
    setEditingAccountCodeId(accountCode.id ?? null);
    setEditAccountCodeDraft({
      code: accountCode.code,
      name: accountCode.name,
    });
  };

  const handleCancelEditAccountCode = () => {
    setEditingAccountCodeId(null);
    setEditAccountCodeDraft(EMPTY_ACCOUNT_CODE_DRAFT);
  };

  const handleSaveEditAccountCode = async () => {
    if (
      isAddingAccountCode ||
      !editingAccountCodeId ||
      !editAccountCodeDraft.code.trim() ||
      !editAccountCodeDraft.name.trim()
    ) {
      return;
    }

    try {
      await updateAccountCode.mutateAsync({
        id: editingAccountCodeId,
        data: {
          code: editAccountCodeDraft.code.trim(),
          name: editAccountCodeDraft.name.trim(),
        },
      });
      handleCancelEditAccountCode();
      notifySuccess('Account code updated successfully');
    } catch (error) {
      console.error('Error updating account code:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  const handleOpenDeleteAccountCode = (accountCode: AccountCode) => {
    setDeleteTargetAccountCode(accountCode);
    setDeleteAccountCodeOpen(true);
  };

  const handleConfirmDeleteAccountCode = async () => {
    if (!deleteTargetAccountCode?.id) return;

    try {
      await deleteAccountCode.mutateAsync(deleteTargetAccountCode.id);
      setDeleteTargetAccountCode(null);
      notifySuccess('Account code deleted successfully');
    } catch (error) {
      console.error('Error deleting account code:', error);
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
          onClick={() => setAccountCodesExpanded((current) => !current)}
        >
          {accountCodesExpanded ? 'Hide account codes' : 'Manage account codes'}
          <ChevronDown
            className={cn(
              'ml-1 h-4 w-4 transition-transform',
              accountCodesExpanded && 'rotate-180',
            )}
          />
        </Button>
      </div>

      {accountCodesExpanded && (
        <div className="flex flex-col gap-4 border-t pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#101828]">
                Account Codes
              </p>
              <p className="text-sm text-[#6A7282]">
                Map QuarryLink Quarry / Supplier records to Xero account
                codes.
              </p>
            </div>
            {!isAddingAccountCode && editingAccountCodeId === null && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleStartAddAccountCode}
              >
                <Plus className="h-4 w-4" />
                Add account code
              </Button>
            )}
          </div>

          {isAddingAccountCode && (
            <AccountCodeForm
              draft={accountCodeDraft}
              onDraftChange={setAccountCodeDraft}
              onCancel={handleCancelAddAccountCode}
              onSave={handleSaveAccountCode}
              isSaving={isAccountCodeSaving}
              submitText="Create account code"
            />
          )}

          {!isAddingAccountCode &&
            !accountCodesQuery.isLoading &&
            accountCodes.length === 0 && (
              <button
                type="button"
                className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#D1D5DC] bg-[#FAFAFA] px-6 py-8 text-center transition-colors hover:border-[#9CA3AF]"
                onClick={handleStartAddAccountCode}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]">
                  <Plus className="h-5 w-5 text-[#9CA3AF]" />
                </div>
                <p className="text-sm font-medium text-[#101828]">
                  Add your first account code
                </p>
                <p className="text-sm text-[#6A7282]">
                  No account codes have been configured yet.
                </p>
              </button>
            )}

          {accountCodesQuery.isLoading && (
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-5 text-sm text-[#6A7282]">
              Loading account codes...
            </div>
          )}

          {accountCodes.length > 0 && (
            <div className="flex flex-col gap-3">
              {accountCodes.map((accountCode) =>
                editingAccountCodeId === accountCode.id ? (
                  <AccountCodeForm
                    key={accountCode.id}
                    draft={editAccountCodeDraft}
                    onDraftChange={setEditAccountCodeDraft}
                    onCancel={handleCancelEditAccountCode}
                    onSave={handleSaveEditAccountCode}
                    isSaving={isAccountCodeSaving}
                    submitText="Update account code"
                  />
                ) : (
                  <AccountCodeRow
                    key={accountCode.id}
                    accountCode={accountCode}
                    onEdit={() => handleStartEditAccountCode(accountCode)}
                    onDelete={() => handleOpenDeleteAccountCode(accountCode)}
                    disabled={
                      isAddingAccountCode ||
                      editingAccountCodeId !== null ||
                      isAccountCodeSaving
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      )}

      <ActionDialog
        open={deleteAccountCodeOpen}
        onOpenChangeAction={(open) => {
          setDeleteAccountCodeOpen(open);
          if (!open) {
            setDeleteTargetAccountCode(null);
          }
        }}
        title="Delete account code?"
        titleIcon={<AlertTriangle className="h-5 w-5 text-[#E7000B]" />}
        content={
          deleteTargetAccountCode ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#364153]">
                Are you sure you want to delete the account code{' '}
                <span className="font-medium">
                  {deleteTargetAccountCode.code} —{' '}
                  {deleteTargetAccountCode.name}
                </span>
                ?
              </p>
              <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4">
                <p className="text-sm font-semibold text-[#101828]">
                  What happens next:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#6A7282]">
                  <li>
                    This account code will be removed from the integration
                    mapping.
                  </li>
                  <li>
                    Invoices already pushed to Xero will keep their existing
                    account code.
                  </li>
                  <li>
                    New invoices will no longer use this account code for mapped
                    records.
                  </li>
                  <li>You can recreate it at any time from this page.</li>
                </ul>
              </div>
            </div>
          ) : null
        }
        confirmText={
          deleteAccountCode.isPending ? 'Deleting...' : 'Delete account code'
        }
        confirmVariant="destructive"
        confirmCustomColor="#E7000B"
        confirmDisabled={deleteAccountCode.isPending}
        cancelText="Cancel"
        onConfirmAction={() => void handleConfirmDeleteAccountCode()}
      />
    </>
  );
}
