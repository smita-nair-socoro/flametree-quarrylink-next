'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn, splitReasonNote } from '@/lib/utils';
import { scrollToFirstError } from '@/lib/utils/scroll-to-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewQuotationFormSchema } from './schemas/quotation-form-schema';
import { getQuotationLineItemColumns } from '../../(components)/(data-tables)/line-item/columns';
import { DatePicker } from '@/components/date-picker';
import { GetTodaysDate, formatLocalDateTime } from '@/lib/utils/date';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedQuotation } from '@/app/stores/quotation-store';
import { FormDialog } from '@/components/form-dialog';
import QuotationLineItemForm from './quotation-line-item-form';
import { DataTableClient } from '@/components/ui/data-table-client';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  useCreateQuotation,
  useUpdateQuotation,
  useDuplicateQuotation,
} from '@/lib/api/quotation';
import { transformFormDataToQuoteDto } from '@/lib/utils/quote-helpers';
import { quotationToFormValues } from '@/lib/utils/quotation-form-helpers';
import { notifySuccess, notifyError } from '@/lib/toast';
import { Info, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuotationFormState } from '@/hooks/quotation/use-quotation-form-state';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';
import { UsersListQueryOptions } from '@/lib/api/user';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import { MultipleInput } from '@/components/ui/multiple-input';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { addNewRecordId } from '@/lib/utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { AuditInformation } from '@/components/audit-information';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
  canEdit?: boolean;
  isDuplicate?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  onSaved?: () => void;
}

export default function QuotationForm({
  id,
  onCancel,
  className,
  canEdit,
  isDuplicate,
  onDirtyChange,
  onSuccess,
  onSaved,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const selectedQuotation = useSelectedQuotation();

  const quotationForm = useForm<z.infer<typeof NewQuotationFormSchema>>({
    resolver: zodResolver(NewQuotationFormSchema),
    defaultValues: quotationToFormValues(
      isEditing ? selectedQuotation : null,
      isEditing,
    ),
  });

  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const duplicateQuotation = useDuplicateQuotation();

  // All form state management: data fetching, labels, pricing, customer auto-fill
  const {
    currentQuotation,
    isLoadingDetail,
    detailError,
    dateLabel,
    timeWindowLabel,
    pricingBreakdown,
  } = useQuotationFormState(selectedQuotation, isEditing, quotationForm);

  // Update form values when API data loads
  React.useEffect(() => {
    if (isEditing && currentQuotation) {
      quotationForm.reset(quotationToFormValues(currentQuotation, true));
    }
  }, [isEditing, currentQuotation, quotationForm]);

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(quotationForm.formState.isDirty);
  }, [quotationForm.formState.isDirty, onDirtyChange]);

  // Fetch customers from API
  const { data: customers = [] } = useQuery(CustomersListQueryOptions());

  const customerOptions: FormSelectOption[] = React.useMemo(() => {
    if (!customers) return [];
    return customers
      .filter((customer) => customer.id !== undefined && customer.customerStatus !== CUSTOMER_STATUS.ARCHIVED)
      .map((customer) => {
        if (customer.customerType === 'BUSINESS') {
          return {
            label: customer.businessName as string,
            value: customer.id!,
          };
        } else {
          return {
            label: customer.individualContactName ?? '',
            value: customer.id!,
          };
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [customers]);

  const getCustomerNameById = React.useCallback(
    (customerId: number) => {
      const customer = customers.find((c) => c.id === customerId);
      return customer?.customerType === 'BUSINESS'
        ? customer.businessName
        : customer?.individualContactName;
    },
    [customers],
  );

  const { data: users = [] } = useQuery(UsersListQueryOptions());
  const userOptions: FormSelectOption[] = React.useMemo(() => {
    if (!users) return [];
    return users.map((user) => ({
      label: user.name,
      value: user.sub,
    }));
  }, [users]);

  // Auto-fill phone/email (and preselect account manager on create) when customer is selected
  React.useEffect(() => {
    const subscription = quotationForm.watch((value, { name }) => {
      if (name === 'customerId' && value.customerId) {
        const selectedCustomer = customers.find(
          (c) => c.id === value.customerId,
        );

        if (selectedCustomer) {
          // Update phone and email fields whenever customer changes
          quotationForm.setValue(
            'phone',
            normalizePhoneNumber(selectedCustomer.contactPersonPhone || '') ||
              '',
          );
          quotationForm.setValue('receiptEmail', '');

          quotationForm.setValue(
            'accountManagerSub',
            selectedCustomer.accountManagerSub || '',
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [customers, quotationForm, isEditing]);

  async function onSubmit(values: z.infer<typeof NewQuotationFormSchema>) {
    const selectedCustomer = customers.find((c) => c.id === values.customerId);
    const customerEmail = selectedCustomer?.contactPersonEmail || '';
    const receiptEmails = [
      customerEmail,
      ...(values.receiptEmail
        ? values.receiptEmail
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean)
        : []),
    ].filter(Boolean);
    const submitCustomer = customers.find((c) => c.id === values.customerId);
    const customerName =
      submitCustomer?.customerType === 'BUSINESS'
        ? (submitCustomer.businessName ?? '')
        : (submitCustomer?.individualContactName ?? '');

    const accountManagerName =
      users.find((user) => user.sub === values.accountManagerSub)?.name || '';

    if (isDuplicate) {
      try {
        const transformed = {
          ...transformFormDataToQuoteDto(values, {
            customerName: customerName || '',
            accountManagerName,
            accountManagerSub:
              values.accountManagerSub ||
              'f92e0468-1091-70a9-fe7e-f7ad687c6252',
            lineItemsCount: currentQuotation?.lineItemsCount ?? 0,
          }),
          email: customerEmail,
          emailRecipients: receiptEmails,
        };

        // For duplicate, we pass the original ID and the new form data
        const newQuotation = await duplicateQuotation.mutateAsync({
          id: id!,
          data: transformed,
        });

        // Add the new record ID to sessionStorage for highlighting
        if (newQuotation && typeof newQuotation.id === 'number') {
          addNewRecordId('quotation_main_data_table', newQuotation.id);
        }

        notifySuccess('Quote duplicated successfully');
        onSaved?.();
        onSuccess?.();
      } catch (error) {
        console.error('Error duplicating quotation:', error);

        const err = extractErrorResponse(error);
        const extractedMessage = extractErrorMessage(error);
        const messageFromErr = err?.message || extractedMessage;

        notifyError(
          messageFromErr || 'Failed to duplicate quote. Please try again.',
        );
      }
    } else if (!isEditing) {
      try {
        const transformed = {
          ...transformFormDataToQuoteDto(values, {
            customerName: customerName || '',
            accountManagerName,
            accountManagerSub:
              values.accountManagerSub ||
              'f92e0468-1091-70a9-fe7e-f7ad687c6252',
            lineItemsCount: 0,
          }),
          email: customerEmail,
          emailRecipients: receiptEmails,
        };

        const newQuotation = await createQuotation.mutateAsync(transformed);

        // Add the new record ID to sessionStorage for highlighting
        if (newQuotation && typeof newQuotation.id === 'number') {
          addNewRecordId('quotation_main_data_table', newQuotation.id);
        }

        notifySuccess('Quote created successfully');
        onSaved?.();
        onSuccess?.();
      } catch (error) {
        console.error('Error creating quotation:', error);

        // Extract normalized error response and message
        const err = extractErrorResponse(error);
        const extractedMessage = extractErrorMessage(error);
        const messageFromErr = err?.message || extractedMessage;

        notifyError(
          messageFromErr || 'Failed to create quote. Please try again.',
        );
      }
    } else {
      // Update existing quotation - keep the original quote number
      const transformed = {
        ...transformFormDataToQuoteDto(values, {
          customerName: customerName || '',
          accountManagerName,
          accountManagerSub:
            values.accountManagerSub || 'f92e0468-1091-70a9-fe7e-f7ad687c6252',
          quoteNumber: currentQuotation?.quoteNumber || '',
          lineItemsCount: currentQuotation?.lineItemsCount ?? 0,
        }),
        email: customerEmail,
        emailRecipients: receiptEmails,
      };

      try {
        await updateQuotation.mutateAsync({
          id: id!,
          ...transformed,
        });
        notifySuccess('Quote updated successfully');
        onSaved?.();
        onSuccess?.();
      } catch (error) {
        console.error('Error updating quotation:', error);

        // Extract normalized error response and message
        const err = extractErrorResponse(error);
        const extractedMessage = extractErrorMessage(error);
        const messageFromErr = err?.message || extractedMessage;

        // Fallback error using extracted message
        notifyError(
          messageFromErr || 'Failed to update quote. Please try again.',
        );
      }
    }
  }

  const today = React.useMemo(() => {
    const d = GetTodaysDate();
    return d;
  }, []);

  // Show loading state while fetching quotation details
  if (isEditing && isLoadingDetail) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="medium" />
          <p className="text-lg text-muted-foreground font-bold">
            Loading quotation details...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if fetching failed
  if (isEditing && detailError) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold text-lg">
            Failed to load quotation details
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {detailError instanceof Error
              ? detailError.message
              : 'Unknown error occurred'}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {(createQuotation.isPending ||
        updateQuotation.isPending ||
        duplicateQuotation.isPending) && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10',
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isDuplicate
                ? 'Creating Duplicate Quote...'
                : createQuotation.isPending
                  ? 'Adding Quote...'
                  : 'Updating Quote...'}
            </p>
          </div>
        </div>
      )}

      <Form {...quotationForm}>
        <form
          id="add-new-quote-form"
          className={cn(
            'w-full flex flex-col',
            className,
            (createQuotation.isPending ||
              updateQuotation.isPending ||
              duplicateQuotation.isPending) &&
              'pointer-events-none',
          )}
          onSubmit={quotationForm.handleSubmit(onSubmit, scrollToFirstError)}
        >
          {isEditing && currentQuotation?.quoteStatus === 'PENDING' && (
            <div className="border border-yellow-600 bg-yellow-50 p-4 rounded-md mb-4 flex flex-col">
              <div className="flex items-center gap-2 text-yellow-900 font-medium text-sm">
                <Info className="h-4 w-4" />
                <span>To edit, decline the quote....</span>
              </div>
              <span className="text-muted-foreground ml-6 text-sm">
                Save your changes and it will return to Draft for sending
              </span>
            </div>
          )}

          {isEditing &&
            currentQuotation?.quoteStatus === 'DECLINED' &&
            (() => {
              const decisionMaker = currentQuotation?.decisionMakerName || '';
              const decisionMakerName = decisionMaker.split('-')[1];
              const { reason: reasonLabel, note: reasonNote } = splitReasonNote(
                currentQuotation?.declineReason,
              );
              const decisionDate = currentQuotation?.customerResponseAt
                ? formatLocalDateTime(currentQuotation.customerResponseAt)
                : '';
              return (
                <div className="border border-[#FB2C36] bg-[#FEF2F2] p-4 rounded-md mb-4 flex flex-col">
                  <div className="flex items-start gap-2 text-[#82181A] font-medium text-sm">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      This quote was declined by{' '}
                      {decisionMaker.startsWith('customer')
                        ? `${decisionMakerName}`
                        : `${decisionMakerName} on behalf of ${getCustomerNameById(currentQuotation?.customerId || 0)}`}{' '}
                      - Reason: {reasonLabel} ({decisionDate})
                      <span>
                        {' '}
                        {reasonNote && `Note: ${reasonNote}.`} Select
                        &quot;Convert to Draft&quot; to edit.{' '}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

          {isEditing &&
            currentQuotation?.quoteStatus === 'APPROVED' &&
            (() => {
              const decisionMaker = currentQuotation?.decisionMakerName || '';
              const decisionMakerName = decisionMaker.split('-')[1];
              return (
                <div className="border border-[#008236] bg-[#F0FDF4] p-4 rounded-md mb-4 flex flex-col">
                  <div className="flex items-start gap-2 text-[#166534] font-medium text-sm">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      This quote was approved by{' '}
                      {decisionMaker.startsWith('customer')
                        ? `${decisionMakerName}`
                        : `${decisionMakerName} on behalf of ${getCustomerNameById(currentQuotation?.customerId || 0)}`}{' '}
                    </div>
                  </div>
                </div>
              );
            })()}

          <div
            className={cn(
              'p-1 gap-1 w-full',
              isDesktop && isEditing
                ? 'grid grid-cols-2 gap-x-8'
                : 'grid grid-cols-1',
              className,
              (createQuotation.isPending || updateQuotation.isPending) &&
                'pointer-events-none',
            )}
          >
            {/* Duplicate Info Banner */}
            {isDuplicate && (
              <div className="col-span-full mb-4">
                <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] border border-[#0075FF33] rounded-lg">
                  <div className="flex-shrink-0 mt-0.5 text-[#0075FF]">
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-sm text-[#09090B]">
                    You can edit and adjust all information including customer
                    details and line items. Once you&apos;re happy with the
                    changes, create the duplicate and it will be marked as{' '}
                    <strong>DRAFT</strong>. You can then update it further or
                    send it to the customer.
                  </div>
                </div>
              </div>
            )}

            <FormSelect
              control={quotationForm.control}
              name="customerId"
              label="Customer*"
              searchLabel="Customer"
              options={customerOptions}
              placeholder="Select Customer"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
              }
              disabled={isEditing && !canEdit}
            />

            <FormSelect
              control={quotationForm.control}
              name="accountManagerSub"
              label="Account Manager*"
              searchLabel="Account Managers"
              options={userOptions}
              placeholder="Select Customer First"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
              }
              disabled={isEditing || !canEdit}
            />

            <FormField
              control={quotationForm.control}
              name="projectName"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop ? 'col-span-2' : 'col-span-2'
                  }
                >
                  <FormLabel>Project Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Project Name"
                      {...field}
                      disabled={isEditing && !canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={quotationForm.control}
                name="receiptEmail"
                render={({ field }) => {
                  const selectedCustomer = customers.find(
                    (c) => c.id === quotationForm.watch('customerId'),
                  );
                  const customerEmail = selectedCustomer?.contactPersonEmail;
                  const fixedValues = customerEmail ? [customerEmail] : [];

                  return (
                    <FormItem
                      className={
                        isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                      }
                    >
                      <FormLabel>Recipient Email *</FormLabel>
                      <FormControl>
                        <MultipleInput
                          className="w-full"
                          placeholder={
                            quotationForm.watch('customerId') === 0
                              ? 'Select Customer First'
                              : 'Enter Recipient Emails'
                          }
                          fixedValues={fixedValues}
                          validate={(s) =>
                            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
                              s,
                            )
                          }
                          label="Press Enter or comma to add email addresses"
                          {...field}
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            {isEditing && (
              <FormField
                control={quotationForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem
                    className={
                      isEditing && isDesktop
                        ? 'col-span-1 col-start-2'
                        : 'col-span-2'
                    }
                  >
                    <div className="flex items-center gap-2">
                      <FormLabel>Customer Phone*</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-[250px]"
                          backgroundClassName="bg-gray-900 text-white"
                          arrowClassName="bg-gray-900 fill-gray-900"
                        >
                          <p className="text-xs">
                            Contact phone number for this quote only.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <FormControl>
                      <PhoneInput
                        className="w-full"
                        placeholder="Enter Phone"
                        defaultCountry="AU"
                        {...field}
                        disabled={isEditing && !canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Delivery Time Window Section */}
            <div
              className={cn(
                'col-span-2',
                isEditing && isDesktop
                  ? 'grid grid-cols-4 gap-4'
                  : 'grid grid-cols-2 gap-2',
              )}
            >
              <h3 className="font-bold col-span-full mb-2">
                {timeWindowLabel}
              </h3>
              <FormField
                control={quotationForm.control}
                name="deliveryStartDate"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{dateLabel}*</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChangeAction={field.onChange}
                        placeholder="Pick a date"
                        disabled={{ before: today }}
                        readOnly={isEditing && !canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quotationForm.control}
                name="deliveryWindowStart"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Start Time Window*</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={isEditing && !canEdit}
                      >
                        <SelectTrigger className="w-full" aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>

                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quotationForm.control}
                name="deliveryWindowEnd"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>End Time Window*</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={isEditing && !canEdit}
                      >
                        <SelectTrigger className="w-full" aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>

                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Expiry Date Section */}
            <div
              className={cn(
                'col-span-2 mb-6',
                isEditing && isDesktop
                  ? 'grid grid-cols-2 gap-4'
                  : 'grid grid-cols-1 gap-2',
              )}
            >
              <FormField
                control={quotationForm.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date*</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChangeAction={field.onChange}
                        placeholder="Pick a date"
                        disabled={{ before: today }}
                        readOnly={isEditing && !canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground">
                  If the quote is not approved by the expiry date, it will
                  automatically expire and no longer be valid.
                </p>
              </div>
            </div>

            {isEditing && (
              <div
                className={cn(
                  isDesktop
                    ? 'flex justify-between items-center col-span-2 mb-5'
                    : 'flex flex-col gap-4 col-span-1',
                )}
              >
                <div>
                  <span className="text-[#374151] text-2xl font-semibold ">
                    Line Items
                  </span>
                </div>
                {canEdit && !isDuplicate && (
                  <div
                    className={cn(
                      'flex items-center gap-2',
                      !isDesktop && 'mt-2',
                    )}
                  >
                    <FormDialog
                      dialogTitle="Add Product"
                      buttonTitle="Add New Product"
                      dialogWidth="700px"
                      contentClass="-mt-5"
                      preventAutoFocus
                    >
                      <QuotationLineItemForm canEdit={canEdit} />
                    </FormDialog>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="col-span-full space-y-10">
                <div className="flex flex-col gap-8">
                  <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
                    {(() => {
                      const quoteItemsData = [...(currentQuotation?.quoteItems ?? [])].sort(
                        (a, b) => (a.productName ?? '').localeCompare(b.productName ?? ''),
                      );
                      return (
                        <DataTableClient
                          columns={getQuotationLineItemColumns()}
                          data={quoteItemsData}
                          simpleTable={true}
                          defaultSorting={[{ id: 'productName', desc: false }]}
                        />
                      );
                    })()}
                  </div>

                  {(currentQuotation?.lineItemsCount ?? 0) > 0 && (
                    <div className="flex flex-col gap-3">
                      {(() => {
                        const separatorBorder =
                          'border-t border-dashed border-[#8E51FF]';
                        return (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Cost Summary */}
                              <div className="md:col-span-1 md:col-start-2 rounded-lg border border-[#DDD] bg-gray-50 px-4 py-3 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">
                                  Cost Summary
                                </h3>
                                <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                                  <div>
                                    <span>Product Cost</span>
                                    <span>
                                      ${pricingBreakdown.totalProductCostPrice}
                                    </span>
                                  </div>
                                  <div>
                                    <span>Truck Cost</span>
                                    <span>
                                      ${pricingBreakdown.totalTruckCostPrice}
                                    </span>
                                  </div>
                                  <div className={`pt-2 ${separatorBorder}`}>
                                    <span>Subtotal (ex-GST)</span>
                                    <span>
                                      ${pricingBreakdown.costSubtotalExGST}
                                    </span>
                                  </div>
                                  <div>
                                    <span>GST (10%)</span>
                                    <span>${pricingBreakdown.costGst}</span>
                                  </div>
                                  <div className={`pt-2 ${separatorBorder}`}>
                                    <span className="font-bold text-lg">
                                      Total Cost
                                    </span>
                                    <span className="font-bold text-lg">
                                      ${pricingBreakdown.totalCost}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {/* Sale Summary */}
                              <div className="md:col-span-1 md:col-start-3 bg-purple-50 rounded-lg border border-[#DDD] px-4 py-3 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">
                                  Sale Summary
                                </h3>
                                <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                                  <div>
                                    <span>Product Sell</span>
                                    <span>
                                      ${pricingBreakdown.totalProductSellPrice}
                                    </span>
                                  </div>
                                  <div>
                                    <span>Truck Sell</span>
                                    <span>
                                      ${pricingBreakdown.totalTruckSellPrice}
                                    </span>
                                  </div>
                                  <div className={`pt-2 ${separatorBorder}`}>
                                    <span>Subtotal (ex-GST)</span>
                                    <span>
                                      ${pricingBreakdown.invoiceSubtotalExGST}
                                    </span>
                                  </div>
                                  <div>
                                    <span>GST (10%)</span>
                                    <span>${pricingBreakdown.invoiceGst}</span>
                                  </div>
                                  <div className={`pt-2 ${separatorBorder}`}>
                                    <span className="font-bold text-lg">
                                      Total Invoice
                                    </span>
                                    <span className="font-bold text-lg">
                                      ${pricingBreakdown.totalInvoice}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Gross Profit */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex justify-end items-center gap-2 py-3 px-4 bg-gray-50 border border-[#DDDDDD] rounded-lg md:col-span-2 md:col-start-2">
                                <span className="text-lg font-semibold">
                                  Gross Profit:
                                </span>
                                {pricingBreakdown.grossProfitPercentage >= 0 ? (
                                  <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                                ) : (
                                  <TrendingDown className="w-5 h-5 text-red-600 shrink-0" />
                                )}
                                <span
                                  className={cn(
                                    'text-lg font-bold',
                                    pricingBreakdown.grossProfitPercentage >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600',
                                  )}
                                >
                                  {pricingBreakdown.grossProfitPercentage?.toFixed(
                                    2,
                                  )}
                                  %
                                </span>
                                <span className="text-lg font-medium ml-5">
                                  {Number(
                                    String(
                                      pricingBreakdown.grossProfit,
                                    ).replace(/,/g, ''),
                                  ) >= 0
                                    ? ''
                                    : '-'}
                                  $
                                  {formatNumberThousandSeparator(
                                    Math.abs(
                                      Number(
                                        String(
                                          pricingBreakdown.grossProfit,
                                        ).replace(/,/g, ''),
                                      ),
                                    ),
                                  )}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {!isDuplicate && (
                  <AuditInformation
                    createdBy={currentQuotation?.createdBy}
                    lastModifiedBy={currentQuotation?.lastModifiedBy}
                    createdAt={currentQuotation?.createdAt}
                    updatedAt={currentQuotation?.updatedAt}
                  />
                )}
              </div>
            )}

            {isDesktop && (
              <div className="flex justify-end space-x-2 col-span-2 my-6">
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
                <Button
                  form="add-new-quote-form"
                  className="cursor-pointer"
                  type="submit"
                  disabled={
                    (isEditing && !isDuplicate && !canEdit) ||
                    createQuotation.isPending ||
                    updateQuotation.isPending ||
                    duplicateQuotation.isPending
                  }
                >
                  {isDuplicate
                    ? 'Create Duplicate'
                    : isEditing
                      ? 'Save Changes'
                      : 'Add Quote'}
                </Button>
              </div>
            )}

            {!isDesktop && (
              <div className="flex flex-col col-span-2 gap-3 my-6">
                <Button
                  form="add-new-quote-form"
                  type="submit"
                  className="cursor-pointer"
                  disabled={
                    (isEditing && !isDuplicate && !canEdit) ||
                    createQuotation.isPending ||
                    updateQuotation.isPending ||
                    duplicateQuotation.isPending
                  }
                >
                  {isDuplicate
                    ? 'Create Duplicate'
                    : isEditing
                      ? 'Save Changes'
                      : 'Add Quote'}
                </Button>
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
