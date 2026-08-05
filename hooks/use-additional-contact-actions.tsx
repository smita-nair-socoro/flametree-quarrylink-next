'use client';

import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { FormDialog } from '@/components/form-dialog';
import { AdditionalContactDTO } from '@/lib/types/customer';
import AdditionalContactForm from '@/app/(protected)/customer-operations/customers/(components)/forms/additional-contact-form';
import { Trash2 } from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import {
  getPrimaryContactMethodValue,
} from '@/lib/utils/additional-contact-helper';
import {
  ADDITIONAL_CONTACT_METHOD_TYPE,
  ADDITIONAL_CONTACT_METHOD_TYPE_LABELS,
} from '@/lib/types/customer-enums';
import { useDeleteAdditionalContact } from '@/lib/api/customer';

const getContactDisplayName = (contact?: AdditionalContactDTO | null) =>
  [contact?.firstName, contact?.lastName].filter(Boolean).join(' ') ||
  'Unknown Contact';

function RemoveAdditionalContactDescription({
  contact,
}: {
  contact?: AdditionalContactDTO | null;
}) {
  const email = getPrimaryContactMethodValue(
    contact,
    ADDITIONAL_CONTACT_METHOD_TYPE.EMAIL,
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FFE2E2]">
        <Trash2 className="h-5 w-5 text-[#E7000B]" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[16px] font-medium text-[#101828]">
          {getContactDisplayName(contact)}
        </span>
        {email ? (
          <span className="text-[14px] text-[#6A7282]">{email}</span>
        ) : null}
      </div>
    </div>
  );
}

function RemoveAdditionalContactContent({
  contact,
}: {
  contact?: AdditionalContactDTO | null;
}) {
  const methods = contact?.contactMethods ?? [];

  return (
    <div className="flex flex-col gap-5">
      <span className="text-[15px] font-normal">
        Are you sure you want to remove this contact from the customer?
      </span>

      <div className="rounded-md border border-[#E7000B] bg-[#FFE2E2] p-4">
        <div className="flex gap-2">
          <Trash2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E7000B]" />
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium text-[#E7000B]">
              Contact Removal
            </span>
            <span className="text-sm font-normal text-[#E7000B]">
              This contact will be removed from the customer. This action cannot
              be undone.
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-[#E5E5E5] p-1">
        <div className="flex flex-col gap-1 px-4 py-2">
          {methods.length > 0 ? (
            methods.map((method, index) => (
              <div key={`${method.type}-${index}`} className="flex justify-between gap-4">
                <span className="text-md font-normal text-[#6A7282]">
                  {ADDITIONAL_CONTACT_METHOD_TYPE_LABELS[
                    method.type as ADDITIONAL_CONTACT_METHOD_TYPE
                  ] ?? method.type}
                  :
                </span>
                <span className="text-md font-normal text-[#364153]">
                  {method.value || '—'}
                </span>
              </div>
            ))
          ) : (
            <div className="flex justify-between gap-4">
              <span className="text-md font-normal text-[#6A7282]">
                Contact methods:
              </span>
              <span className="text-md font-normal text-[#364153]">—</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-md font-normal text-[#6A7282]">
              Position / Role:
            </span>
            <span className="text-md font-normal text-[#364153]">
              {contact?.positionRole || '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#101828]">
          What happens when contact is removed:
        </span>
        <ul className="list-outside list-disc space-y-0.5 pl-5 text-sm font-normal text-[#6A7282]">
          <li>Contact is removed from this customer&apos;s contact list</li>
          <li>Action cannot be undone once confirmed</li>
        </ul>
      </div>
    </div>
  );
}

export function useAdditionalContactActions(
  customerId: number,
  initialData?: AdditionalContactDTO | null,
  { onDeleteSuccess }: { onDeleteSuccess?: () => void } = {},
) {
  const deleteAdditionalContact = useDeleteAdditionalContact();
  const [viewOpen, setViewOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [contactData, setContactData] = React.useState<
    AdditionalContactDTO | null | undefined
  >(initialData);

  React.useEffect(() => {
    setContactData(initialData);
  }, [initialData]);

  const handleConfirmDelete = async () => {
    if (!customerId || !contactData?.id) return;

    try {
      await deleteAdditionalContact.mutateAsync({
        customerId,
        contactId: contactData.id,
      });
      setDeleteOpen(false);
      notifySuccess('Contact removed successfully');
      onDeleteSuccess?.();
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to remove contact');
      setDeleteOpen(false);
    }
  };

  const actions = {
    view: (contact?: AdditionalContactDTO | null) => {
      if (contact) setContactData(contact);
      setViewOpen(true);
    },
    delete: () => setDeleteOpen(true),
  };

  const confirmDialogs = (
    <ActionDialog
      open={deleteOpen}
      onOpenChangeAction={(open) => {
        if (!open) setDeleteOpen(false);
      }}
      title="Remove Contact"
      description={
        <RemoveAdditionalContactDescription contact={contactData} />
      }
      content={<RemoveAdditionalContactContent contact={contactData} />}
      confirmText={
        deleteAdditionalContact.isPending ? 'Removing...' : 'Remove Contact'
      }
      confirmVariant="destructive"
      confirmCustomColor="#E7000B"
      confirmDisabled={deleteAdditionalContact.isPending}
      cancelText="Cancel"
      onConfirmAction={() => void handleConfirmDelete()}
    />
  );

  const viewDialog = viewOpen ? (
    <FormDialog
      id={contactData?.id}
      dialogDescription="Review or update the contact information below."
      open={viewOpen}
      onOpenChangeAction={(open) => setViewOpen(open)}
      hideTrigger
      customTitle={
        <span>
          {contactData?.firstName} {contactData?.lastName}
        </span>
      }
      dialogWidth="600px"
      contentClass="-mt-5"
      preventAutoFocus
    >
      <AdditionalContactForm
        customerId={customerId}
        contactId={contactData?.id}
        onCancel={() => setViewOpen(false)}
        onSuccess={() => setViewOpen(false)}
      />
    </FormDialog>
  ) : null;

  return { actions, confirmDialogs, viewDialog };
}
