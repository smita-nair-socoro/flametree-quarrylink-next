'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';

import { cn, scrollToFirstError } from '@/lib/utils';
import { sortByLabel } from '@/lib/utils/sort-options';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';
import { QuarrySupplierFormSchema } from './schemas/quarry-supplier-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import {
  useCreateQuarry,
  useUpdateQuarry,
  QuarryDetailQueryOptions,
} from '@/lib/api/quarries';
import { notifySuccess, notifyError } from '@/lib/toast';
import { Quarry } from '@/lib/types/quarry';
import { QuarryType } from '@/lib/types/quarry-enums';
import { formatPhoneNumber } from '@/lib/utils/phone-helper';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { addNewRecord } from '@/lib/utils/pinned-records';
import { toAddressPayload, useAddressSync } from '@/lib/utils/address-helper';
import { AuditInformation } from '@/components/audit-information';

import {
  useQuarrySupplierFormState,
  EMPTY_QUARRY_SUPPLIER_FORM_VALUES,
} from '@/hooks/quarry-supplier/use-quarry-supplier-form-state';
import { useGetAccountCodes } from '@/lib/api/accounting';
import { useAccountingIntegrationConnection } from '@/hooks/use-accounting-integration-connection';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  className?: string;
  onCancel?: () => void;
  onTypeChange?: (type: QuarryType) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function QuarrySupplierForm({
  id,
  onCancel,
  onSuccess,
  onSaved,
  className,
  onTypeChange,
  onDirtyChange,
}: Readonly<FormProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);
  const quarryId = id ?? 0;

  const { accountingSoftwareLabel, showAccountingMapping } =
    useAccountingIntegrationConnection();
  const accountCodesQuery = useGetAccountCodes({
    enabled: showAccountingMapping,
  });
  const accountCodes = React.useMemo(
    () => accountCodesQuery.data ?? [],
    [accountCodesQuery.data],
  );

  const createQuarryMutation = useCreateQuarry();
  const updateQuarryMutation = useUpdateQuarry();

  const { data: selectedQuarrySupplier } = useQuery({
    ...QuarryDetailQueryOptions(quarryId),
    enabled: isEditing && quarryId > 0,
  });

  const accountCodeOptions = React.useMemo<FormSelectOption[]>(
    () =>
      sortByLabel(
        accountCodes
          .filter((accountCode) => accountCode.id !== undefined)
          .map((accountCode) => ({
            value: accountCode.id as number,
            label: `${accountCode.code} - ${accountCode.name}`,
          })),
        (option) => option.label,
      ),
    [accountCodes],
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const quarrySupplierForm = useForm<z.infer<typeof QuarrySupplierFormSchema>>({
    resolver: zodResolver(QuarrySupplierFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY_QUARRY_SUPPLIER_FORM_VALUES,
  });

  const {
    selectedType,
    setSelectedType,
    address,
    setAddress,
    searchInput,
    setSearchInput,
  } = useQuarrySupplierFormState(
    selectedQuarrySupplier ?? null,
    isEditing,
    quarrySupplierForm,
  );

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(quarrySupplierForm.formState.isDirty);
  }, [quarrySupplierForm.formState.isDirty, onDirtyChange]);

  const handleTypeChange = (value: string) => {
    const quarryType = value as QuarryType;
    setSelectedType(quarryType);
    quarrySupplierForm.setValue('quarrySupplierType', quarryType);
    // Clear all form errors when switching types
    quarrySupplierForm.clearErrors();
    // Notify parent component of type change
    onTypeChange?.(quarryType);
  };

  // Effect to handle address changes
  const handleAddressChange = useAddressSync(
    quarrySupplierForm,
    'address',
    address,
    setAddress,
    setSearchInput,
  );

  async function onSubmit(values: z.infer<typeof QuarrySupplierFormSchema>) {
    try {
      setIsSubmitting(true);

      const addressData = toAddressPayload(
        address,
        isEditing ? (selectedQuarrySupplier?.address ?? null) : null,
      )!;

      const websiteValue =
        values.website && values.website.trim() !== ''
          ? values.website.trim().startsWith('http')
            ? values.website.trim()
            : `https://${values.website.trim()}`
          : undefined;

      const quarrySupplierData = {
        name: values.name ?? '',
        quarrySupplierType: values.quarrySupplierType as QuarryType,
        email: values.email ?? '',
        phone: formatPhoneNumber(values.phone),
        isActive: true,
        openingClosingInfo: values.openingClosingInfo || '',
        notes: values.notes || '',
        weighbridgeInfo: values.weighbridgeInfo || '',
        contactPersonName: values.contactPersonName || '',
        contactPersonPhone: formatPhoneNumber(values.contactPersonPhone),
        contactPersonEmail: values.contactPersonEmail || '',
        ...(showAccountingMapping && values.accountCodeId != null
          ? { accountingSoftwareAccountingCodeId: values.accountCodeId }
          : {}),
        ...(websiteValue ? { website: websiteValue } : {}),
        address: addressData,
        version:
          isEditing && selectedQuarrySupplier?.version !== undefined
            ? selectedQuarrySupplier.version
            : 0,
      } as unknown as Quarry;

      if (isEditing && id) {
        await updateQuarryMutation.mutateAsync({
          id,
          data: quarrySupplierData,
        });
        notifySuccess(
          `${values.quarrySupplierType === 'QUARRY' ? 'Quarry' : 'Supplier'} updated successfully!`,
        );
        quarrySupplierForm.reset(values);
      } else {
        const newQuarrySupplier =
          await createQuarryMutation.mutateAsync(quarrySupplierData);
        if (newQuarrySupplier && typeof newQuarrySupplier.id === 'number') {
          addNewRecord('quarry_suppliers_table', newQuarrySupplier);
        }
        notifySuccess(
          `${values.quarrySupplierType === 'QUARRY' ? 'Quarry' : 'Supplier'} created successfully!`,
        );
        onSuccess?.();
      }
      onSaved?.();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} ${values.quarrySupplierType === 'QUARRY' ? 'quarry' : 'supplier'}:`,
        error,
      );

      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;

      const duplicateNamePhrase = `Key (name)=(${values.name}) already exists`;
      const isDuplicateName =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateNamePhrase);

      if (isDuplicateName) {
        const msg = `${values.quarrySupplierType === 'QUARRY' ? 'Quarry' : 'Supplier'} with name "${values.name}" already exists.`;
        notifyError(msg);
        quarrySupplierForm.setError('name', { type: 'manual', message: msg });
        return;
      }

      const duplicateEmailPhrase = `Key (email)`;
      const isDuplicateEmail =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateEmailPhrase);

      if (isDuplicateEmail) {
        const msg = 'Email already exists.';
        notifyError(msg);
        quarrySupplierForm.setError('email', {
          type: 'manual',
          message: msg,
        });
        return;
      }

      notifyError(
        messageFromErr ||
          `Failed to ${isEditing ? 'update' : 'create'} ${values.quarrySupplierType === 'QUARRY' ? 'quarry' : 'supplier'}. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  useFormDialogFooter(
    isDesktop ? (
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          {isEditing ? 'Close' : 'Cancel'}
        </Button>
        <Button
          form="add-quarry-supplier-form"
          className="cursor-pointer"
          type="submit"
          disabled={isSubmitting}
        >
          {isEditing
            ? 'Save Changes'
            : `Add ${selectedType === QuarryType.QUARRY ? 'Quarry' : 'Supplier'}`}
        </Button>
      </div>
    ) : null,
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
              Adding{' '}
              {selectedType === QuarryType.QUARRY ? 'Quarry' : 'Supplier'}...
            </p>
          </div>
        </div>
      )}

      <Form {...quarrySupplierForm}>
        <form
          id="add-quarry-supplier-form"
          className={cn(
            'py-1 gap-1 w-full',
            isDesktop ? 'grid grid-cols-2 gap-x-8' : 'grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none',
          )}
          onSubmit={quarrySupplierForm.handleSubmit(
            onSubmit,
            scrollToFirstError,
          )}
        >
          {/* Type Selection */}
          <FormField
            control={quarrySupplierForm.control}
            name="quarrySupplierType"
            render={({ field }) => (
              <FormItem className="col-span-1 col-start-1">
                <FormLabel className="mb-3">Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTypeChange(value);
                    }}
                    className="grid grid-flow-col auto-cols-max gap-4"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="QUARRY" />
                      </FormControl>
                      <FormLabel className="font-normal">Quarry</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="SUPPLIER" />
                      </FormControl>
                      <FormLabel className="font-normal">Supplier</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-full my-2 mb-5" />

          {/* Section: Basic Information */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
          </div>

          {/* Basic Information Fields with reduced spacing */}
          <div
            className={
              isDesktop
                ? 'col-span-full grid grid-cols-2 gap-x-5'
                : 'col-span-full'
            }
          >
            {/* Name */}
            <FormField
              control={quarrySupplierForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedType === QuarryType.QUARRY
                      ? 'Quarry Name*'
                      : 'Supplier Name*'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder={
                        selectedType === QuarryType.QUARRY
                          ? 'Enter quarry name'
                          : 'Enter supplier name'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={quarrySupplierForm.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter website URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={quarrySupplierForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={quarrySupplierForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone*</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="(61) 456 789"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="col-span-full my-2 mb-5" />
          {/* Section: Location Information */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold mb-3">Location Information</h2>
          </div>

          {/* Address */}
          <FormField
            control={quarrySupplierForm.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Address*</FormLabel>
                <FormControl>
                  <AddressAutoComplete
                    address={address}
                    setAddress={handleAddressChange}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    dialogTitle="Search for Delivery Address"
                    placeholder="Search for Delivery Address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="col-span-full my-2 mb-5" />
          {/* Section: Contact Person */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold mb-3">Contact Person</h2>
          </div>

          {/* Contact Person Fields */}
          <div
            className={
              isDesktop
                ? 'col-span-full grid grid-cols-3 gap-4'
                : 'col-span-full'
            }
          >
            {/* Contact Person Name */}
            <FormField
              control={quarrySupplierForm.control}
              name="contactPersonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter contact person name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Person Phone */}
            <FormField
              control={quarrySupplierForm.control}
              name="contactPersonPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="Enter contact phone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Person Email */}
            <FormField
              control={quarrySupplierForm.control}
              name="contactPersonEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter contact email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="col-span-full my-2 mb-5" />

          {/* Section: Operational Information */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold mb-3">
              Operational Information
            </h2>
          </div>

          {/* Opening & Closing Times */}
          <FormField
            control={quarrySupplierForm.control}
            name="openingClosingInfo"
            render={({ field }) => (
              <FormItem
                className={isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'}
              >
                <FormLabel>Opening & Closing Times</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full min-h-20"
                    placeholder="Enter opening and closing information"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Weighbridge Info */}
          <FormField
            control={quarrySupplierForm.control}
            name="weighbridgeInfo"
            render={({ field }) => (
              <FormItem
                className={isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'}
              >
                <FormLabel>Weighbridge Info</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full min-h-20"
                    placeholder="Enter weighbridge details"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={quarrySupplierForm.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full min-h-20"
                    placeholder="Enter important FYI notes"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {showAccountingMapping && (
            <>
              <Separator className="col-span-full my-2 mb-5" />

              <div className="flex flex-col mb-3">
                <h2 className="text-sm font-semibold mb-1">
                  {accountingSoftwareLabel} Mapping
                </h2>
                <p className="text-xs text-muted-foreground">
                  Optional{' '}
                  {accountingSoftwareLabel === 'MYOB Acumatica'
                    ? 'Warehouse Id'
                    : 'Account Code'}{' '}
                  pushed to {accountingSoftwareLabel} on invoice creation.
                </p>
              </div>
              <FormSelect
                control={quarrySupplierForm.control}
                name="accountCodeId"
                label={
                  accountingSoftwareLabel === 'MYOB Acumatica'
                    ? 'Warehouse Id'
                    : 'Account Code'
                }
                options={accountCodeOptions}
                placeholder={`Select ${accountingSoftwareLabel === 'MYOB Acumatica' ? 'Warehouse Id' : 'Account Code'} (optional)`}
                searchLabel={
                  accountingSoftwareLabel === 'MYOB Acumatica'
                    ? 'warehouse ids'
                    : 'account codes'
                }
                popoverWidthClass="w-[var(--radix-popover-trigger-width)]"
                formItemClassName="col-span-full"
                className="w-full"
                disabled={accountCodesQuery.isLoading}
              />
            </>
          )}
          <Separator className="col-span-full my-2 mb-5" />
          {isEditing && (
            <AuditInformation
              createdBy={selectedQuarrySupplier?.createdBy}
              lastModifiedBy={selectedQuarrySupplier?.lastModifiedBy}
              createdAt={selectedQuarrySupplier?.createdAt}
              updatedAt={selectedQuarrySupplier?.updatedAt}
            />
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-full gap-3 mb-6">
              <Button
                form="add-quarry-supplier-form"
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isEditing
                  ? 'Save Changes'
                  : `Add ${selectedType === QuarryType.QUARRY ? 'Quarry' : 'Supplier'}`}
              </Button>
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
