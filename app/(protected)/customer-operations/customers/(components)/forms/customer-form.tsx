'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { Tab } from '@/components/ui/tabs';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FormDialog, useFormDialogFooter } from '@/components/form-dialog';
import { NewCustomerFormSchema } from './schemas/customer-form-schema';
import { Loader2 } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { CustomerFormBlockBanner } from './customer-form-blocker';
import { useAddressSync } from '@/lib/utils/address-helper';
import {
  useCustomerFormState,
  EMPTY_CUSTOMER_FORM_VALUES,
  PAYMENT_TERMS_OPTIONS,
} from '@/hooks/customer/use-customer-form-state';
import { useAccountingSoftwareLabel } from '@/lib/utils/tenant-config-helper';
import NotesTab from './tabs/notes/notes-tab';
import DetailsTab from './tabs/details/details-tab';

type CustomerFormValues = z.infer<typeof NewCustomerFormSchema>;

function getSubmitButtonLabel(isSubmitting: boolean, isEditing: boolean): string {
  if (isSubmitting) {
    return isEditing ? 'Saving Changes...' : 'Adding Customer...';
  }
  return isEditing ? 'Save Changes' : 'Add Customer';
}

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
}

export default function CustomerForm({
  id,
  onCancel,
  onSaved,
  onDirtyChange,
  className,
  onSuccess,
}: Readonly<FormProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);
  const customerId = id ?? 0;
  const accSoftware = useAccountingSoftwareLabel();

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(NewCustomerFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY_CUSTOMER_FORM_VALUES,
  });

  const {
    selectedCustomer,
    isCustomerLoading,
    attachmentTableData,
    isAttachmentsLoading,
    additionalContactTableData,
    additionalContactsPage,
    isAdditionalContactsFetching,
    additionalContactsPageIndex,
    additionalContactsPageSize,
    handleAdditionalContactsPaginationChange,
    accountManagerOptions,
    blockState,
    isFormBlocked,
    accSoftwareSyncError,
    notLinkedWarning,
    isSubmitting,
    addAttachmentOpen,
    setAddAttachmentOpen,
    selectedCustomerType,
    selectedPaymentType,
    address,
    setAddress,
    searchInput,
    setSearchInput,
    handleFormFieldChange,
    onSubmit,
    onError,
    handleRetrySync,
  } = useCustomerFormState({
    customerId,
    isEditing,
    customerForm,
    onDirtyChange,
    onSuccess,
    onSaved,
  });

  const handleAddressChange = useAddressSync(
    customerForm,
    'billing_address',
    address,
    setAddress,
    setSearchInput,
  );

  const [notesCount, setNotesCount] = React.useState(0);

  useFormDialogFooter(
    isDesktop ? (
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          {isEditing ? 'Close' : 'Cancel'}
        </Button>
        <Button
          form="add-new-customer-form"
          className="cursor-pointer"
          type="submit"
          disabled={isSubmitting || isFormBlocked}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getSubmitButtonLabel(isSubmitting, isEditing)}
        </Button>
      </div>
    ) : null,
  );

  if (isEditing && isCustomerLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8">
        <Spinner size="medium" />
        <p className="text-muted-foreground">Loading customer...</p>
      </div>
    );
  }

  const detailsTabContent = (
    <DetailsTab
      form={customerForm}
      isEditing={isEditing}
      isDesktop={isDesktop}
      isSubmitting={isSubmitting}
      accSoftware={accSoftware}
      accSoftwareSyncError={accSoftwareSyncError}
      notLinkedWarning={notLinkedWarning}
      onRetrySync={handleRetrySync}
      selectedCustomer={selectedCustomer}
      selectedCustomerType={selectedCustomerType}
      selectedPaymentType={selectedPaymentType}
      onFormFieldChange={handleFormFieldChange}
      accountManagerOptions={accountManagerOptions}
      paymentTermsOptions={PAYMENT_TERMS_OPTIONS}
      address={address}
      onAddressChange={handleAddressChange}
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      customerId={customerId}
      additionalContactTableData={additionalContactTableData}
      additionalContactsPage={additionalContactsPage}
      isAdditionalContactsFetching={isAdditionalContactsFetching}
      additionalContactsPageIndex={additionalContactsPageIndex}
      additionalContactsPageSize={additionalContactsPageSize}
      handleAdditionalContactsPaginationChange={handleAdditionalContactsPaginationChange}
      attachmentTableData={attachmentTableData}
      isAttachmentsLoading={isAttachmentsLoading}
      addAttachmentOpen={addAttachmentOpen}
      setAddAttachmentOpen={setAddAttachmentOpen}
    />
  );

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10',
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isEditing ? 'Updating Customer...' : 'Adding Customer...'}
            </p>
          </div>
        </div>
      )}

      {/* Block banner — rendered outside the inert zone so it stays interactive */}
      {isEditing && blockState && (
        <CustomerFormBlockBanner
          blockState={blockState}
          customer={selectedCustomer}
        />
      )}

      {/* Form — inert when a block state is active; all fields and buttons become non-interactive */}
      <div inert={isFormBlocked || undefined} className="relative">
        {isFormBlocked && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-10 rounded-md pointer-events-none" />
        )}
        <Form {...customerForm}>
          <form
            id="add-new-customer-form"
            className={cn(
              'p-1 gap-1 w-full',
              className,
              isSubmitting && 'pointer-events-none',
            )}
            onSubmit={customerForm.handleSubmit(onSubmit, onError)}
          >
            {isEditing ? (
              <Tab
                tabsClassName="w-fit mb-4"
                tabsTriggerClassName="w-auto px-4"
                tabs={[
                  { name: 'Details', content: detailsTabContent },
                  {
                    name: 'Notes',
                    rightElement: (
                      <span className="text-muted-foreground">
                        {notesCount}
                      </span>
                    ),
                    content: (
                      <NotesTab
                        customerId={customerId}
                        onCountChange={setNotesCount}
                      />
                    ),
                  },
                ]}
              />
            ) : (
              detailsTabContent
            )}

            {!isDesktop && (
              <div className="flex flex-col gap-3 mb-6">
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={isSubmitting || isFormBlocked}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {getSubmitButtonLabel(isSubmitting, isEditing)}
                </Button>
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
