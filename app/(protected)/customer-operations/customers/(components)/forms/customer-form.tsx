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

import { cn, addNewRecordId, addSyncErrorRecordId } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { FormSelect } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewCustomerFormSchema } from './schemas/customer-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Loader2,
  Info,
  TriangleAlert,
  RefreshCw,
  Settings,
} from 'lucide-react';

import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { ABNInput, CurrencyInput } from '@/components/ui/input-mask';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { useQuery } from '@tanstack/react-query';
import { UsersListQueryOptions } from '@/lib/api/user';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import {
  useCreateCustomer,
  useUpdateCustomer,
  CustomerDetailQueryOptions,
} from '@/lib/api/customer';
import { useRouter } from 'next/navigation';
import { CustomerDTO } from '@/lib/types/customer';
import {
  CUSTOMER_STATUS,
  CUSTOMER_TYPE,
  PAYMENT_TERM_TYPE,
  PAYMENT_TYPE,
} from '@/lib/types/customer-enums';
import { toAddressPayload } from '@/lib/utils/address-helper';
import { useAddressSync } from '@/lib/utils/address-helper';
import {
  useCustomerFormState,
  EMPTY_CUSTOMER_FORM_VALUES,
} from '@/hooks/customer/use-customer-form-state';
import { AuditInformation } from '@/components/audit-information';

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
}: FormProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);
  const customerId = id ?? 0;

  // Single source of truth: fetch customer by id when editing (get-by-id endpoint)
  const { data: selectedCustomer, isLoading: isCustomerLoading } = useQuery({
    ...CustomerDetailQueryOptions(customerId),
    enabled: isEditing && customerId > 0,
  });

  // Fetch users (account managers)
  const { data: users = [] } = useQuery(UsersListQueryOptions());
  const accountManagerOptions = React.useMemo(
    () =>
      users.map((user) => ({
        label: user.name,
        value: user.sub,
      })),
    [users],
  );

  // Mutation hooks
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  // When true, onSubmit bypasses the isEditing check and always calls create (retry sync)
  const isRetrySyncRef = React.useRef(false);

  const [xeroSyncError, setXeroSyncError] = React.useState<string | null>(null);
  const [notLinkedWarning, setNotLinkedWarning] = React.useState(false);

  const customerForm = useForm<z.infer<typeof NewCustomerFormSchema>>({
    resolver: zodResolver(NewCustomerFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY_CUSTOMER_FORM_VALUES,
  });

  const {
    selectedCustomerType,
    setSelectedCustomerType,
    selectedPaymentType,
    setSelectedPaymentType,
    address,
    setAddress,
    searchInput,
    setSearchInput,
  } = useCustomerFormState(selectedCustomer ?? null, isEditing, customerForm);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(customerForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerForm.formState.isDirty]);

  const handleFormFieldChange = (
    field: 'customer_type' | 'payment_type',
    value: string,
  ) => {
    if (field === 'customer_type') {
      setSelectedCustomerType(value);
      if (value === 'INDIVIDUAL') {
        // Clear business-specific fields
        customerForm.setValue('business_name', '');
        customerForm.setValue('business_email', '');
        customerForm.setValue('business_phone', '');
        customerForm.setValue('abn', '');
        customerForm.setValue('contact_person_first_name', '');
        customerForm.setValue('contact_person_last_name', '');
        // Clear contact person name for fresh start
        customerForm.setValue('contact_person_name', '');
      } else if (value === 'BUSINESS') {
        // Clear individual-specific fields
        customerForm.setValue('contact_person_name', '');
        customerForm.setValue('contact_person_first_name', '');
        customerForm.setValue('contact_person_last_name', '');
      }
    } else if (field === 'payment_type') {
      setSelectedPaymentType(value);
      if (value === 'PREPAID') {
        customerForm.setValue('credit_limit', 0);
        customerForm.setValue('payment_terms_day', 0);
      }
    }
  };

  const handleAddressChange = useAddressSync(
    customerForm,
    'billing_address',
    address,
    setAddress,
    setSearchInput,
  );

  const paymentTermsOptions = [
    {
      label: 'of the following month',
      value: PAYMENT_TERM_TYPE.OFTHEFOLLOWINGMONTH,
    },
    {
      label: 'day(s) after the invoice date',
      value: PAYMENT_TERM_TYPE.DAYSAFTERBILLDATE,
    },
    {
      label: 'day(s) after the invoice month',
      value: PAYMENT_TERM_TYPE.DAYSAFTERBILLMONTH,
    },
    { label: 'of the current month', value: PAYMENT_TERM_TYPE.OFCURRENTMONTH },
  ];

  // If older customer records stored the manager name (not sub), map it when users load.
  React.useEffect(() => {
    if (
      !isEditing ||
      !selectedCustomer?.accountManagerSub ||
      users.length === 0
    ) {
      return;
    }

    const currentValue = customerForm.getValues('account_manager') || '';
    const subSet = new Set(users.map((u) => u.sub));
    if (currentValue && subSet.has(currentValue)) return;

    const matched =
      users.find((u) => u.sub === selectedCustomer.accountManagerSub) ||
      users.find((u) => u.name === selectedCustomer.accountManagerSub);

    if (matched?.sub) {
      customerForm.setValue('account_manager', matched.sub);
    }
  }, [isEditing, selectedCustomer, users, customerForm]);

  const NOT_LINKED_MSG = 'Customer is not linked to any accounting software';

  const handleSyncNote = (note?: string): boolean => {
    if (!note) return false;
    if (note.toLowerCase().includes('not synced')) {
      setXeroSyncError(note);
      return true;
    }
    if (note === NOT_LINKED_MSG) {
      setNotLinkedWarning(true);
      return true;
    }
    return false;
  };

  // Initialize sync banners from real customer data when editing
  React.useEffect(() => {
    setXeroSyncError(null);
    setNotLinkedWarning(false);
    if (!isEditing || !selectedCustomer) return;
    if (!selectedCustomer.accSoftwareContactId) {
      handleSyncNote(selectedCustomer.accSoftwareNotes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id, isEditing]);

  async function onSubmit(values: z.infer<typeof NewCustomerFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Customer Form Values:', values);

    try {
      setIsSubmitting(true);

      // Convert address using helper function
      const billingAddressData = toAddressPayload(
        address,
        isEditing && selectedCustomer ? selectedCustomer.billingAddress : null,
      );

      // Backend requires billingAddressId (maps to customers.billing_address_id) on update.
      const billingAddressIdFromExisting =
        (isEditing && selectedCustomer
          ? (selectedCustomer.billingAddressId ??
            selectedCustomer.billingAddress?.id)
          : undefined) ?? billingAddressData?.id;

      // Build the CustomerDTO payload
      const customerData: Partial<CustomerDTO> = {
        customerType:
          values.customer_type === 'BUSINESS'
            ? CUSTOMER_TYPE.BUSINESS
            : CUSTOMER_TYPE.INDIVIDUAL,
        contactPersonPhone: values.contact_person_phone || '',
        contactPersonEmail: values.contact_person_email || '',
        ...(billingAddressIdFromExisting
          ? { billingAddressId: billingAddressIdFromExisting }
          : {}),
        billingAddress: billingAddressData,
        creditLimit: Math.round(Number(values.credit_limit || 0) * 100), // Convert to cents
        accountManagerSub: values.account_manager,
        invoiceDueDateDayCount: values.payment_terms_day || 0,
        customerStatus: CUSTOMER_STATUS.ACTIVE,
        paymentType: values.payment_type,
        version: isEditing && selectedCustomer ? selectedCustomer.version : 0,
      };

      // Only set paymentTermType for CREDIT payment type
      if (values.payment_type === 'CREDIT') {
        customerData.paymentTermType =
          values.payment_terms || PAYMENT_TERM_TYPE.DAYSAFTERBILLDATE;
      }

      // Add id for updates
      if (isEditing && id) {
        customerData.id = id;
      }

      // Handle BUSINESS type specific fields
      if (values.customer_type === CUSTOMER_TYPE.BUSINESS) {
        customerData.businessName = values.business_name || '';
        customerData.businessEmail = values.business_email || '';
        customerData.businessPhone = values.business_phone || '';
        customerData.individualContactName =
          values.contact_person_first_name +
            ' ' +
            values.contact_person_last_name || '';
        customerData.contactPersonFirstName =
          values.contact_person_first_name || '';
        customerData.contactPersonLastName =
          values.contact_person_last_name || '';
        customerData.abn = values.abn || '';
        // Default fields, actually not needed but is mandatory in backend
        customerData.acn = '997744';
        customerData.vatNumber = '123';
      }

      // Handle INDIVIDUAL type specific fields
      if (values.customer_type === CUSTOMER_TYPE.INDIVIDUAL) {
        customerData.individualContactName = values.contact_person_name || '';
        customerData.abn = 'N/A';
        // Default fields for INDIVIDUAL type
        customerData.dateOfBirth = new Date().toISOString();
        customerData.govId = '123';
      }

      // Handle PREPAID payment type
      if (values.payment_type === PAYMENT_TYPE.PREPAID) {
        customerData.creditLimit = 0;
        customerData.invoiceDueDateDayCount = 0;
      }

      console.log('Customer Data Payload:', customerData);

      // Call the appropriate mutation (retry sync always uses create, never update)
      if (isEditing && !isRetrySyncRef.current) {
        const result = await updateCustomer.mutateAsync(customerData);
        notifySuccess('Customer Updated Successfully!');
        if (!result.accSoftwareContactId && handleSyncNote(result.accSoftwareNotes)) return;
      } else {
        const newCustomer = await createCustomer.mutateAsync(customerData);
        notifySuccess('Customer Added Successfully!');

        // Add the new record ID to sessionStorage for highlighting
        if (newCustomer && typeof newCustomer.id === 'number') {
          addNewRecordId('customer_main_data_table', newCustomer.id);
          if (!newCustomer.accSoftwareContactId) {
            addSyncErrorRecordId('customer_main_data_table', newCustomer.id);
          }
        }

        if (!newCustomer.accSoftwareContactId && handleSyncNote(newCustomer.accSoftwareNotes)) return;
      }

      onSuccess?.();
      onSaved?.();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} customer:`,
        error,
      );

      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;

      // Duplicate business email (HTTP 409)
      const duplicateEmailPhrase = `Key (business_email)=(${values.business_email}) already exists`;
      const isDuplicateEmail =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateEmailPhrase);

      if (isDuplicateEmail) {
        const msg = `Duplicate business email "${values.business_email}" already exists.`;
        notifyError(msg);
        customerForm.setError('business_email', {
          type: 'manual',
          message: msg,
        });
        return;
      }

      // Duplicate contact email - Check both the specific key format and constraint name
      const emailKeyPattern = `Key (email)=(${values.contact_person_email}) already exists`;
      const isDuplicateContactEmail =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        (messageFromErr.includes(emailKeyPattern) ||
          messageFromErr.includes('customers_email_key'));

      if (isDuplicateContactEmail) {
        const msg = 'The contact person email already exists.';
        notifyError(msg);
        customerForm.setError('contact_person_email', {
          type: 'manual',
          message: msg,
        });
        return;
      }

      // Duplicate ABN (HTTP 409)
      const duplicateABNPhrase = `Key (abn)=(${values.abn}) already exists`;
      const isDuplicateABN =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateABNPhrase);

      if (isDuplicateABN) {
        const msg = `Duplicate ABN "${values.abn}" already exists.`;
        notifyError(msg);
        customerForm.setError('abn', { type: 'manual', message: msg });
        return;
      }

      // Fallback error using extracted message
      notifyError(
        messageFromErr || 'Failed to save customer. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle form validation errors
  function onError(errors: unknown) {
    console.error('Form validation errors:', errors);
    notifyError(
      isEditing ? 'Failed to Update Customer' : 'Failed to Add Customer',
      {
        description: 'Check required fields',
      },
    );
  }

  // Show loading when editing and customer is still being fetched by id
  if (isEditing && isCustomerLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8">
        <Spinner size="medium" />
        <p className="text-muted-foreground">Loading customer...</p>
      </div>
    );
  }

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

      <Form {...customerForm}>
        <form
          id="add-new-customer-form"
          className={cn(
            'p-1 gap-1 w-full',
            isEditing && isDesktop
              ? 'grid grid-cols-2 gap-x-8'
              : 'grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none',
          )}
          onSubmit={customerForm.handleSubmit(onSubmit, onError)}
        >
          {/* Xero sync error banner */}
          {xeroSyncError && (
            <div className="col-span-full border border-[#DC2626] bg-[#FEF2F2] rounded-md p-4 flex items-center justify-between gap-4 mb-2">
              <div className="flex items-start gap-3">
                <TriangleAlert className="h-4 w-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-[#7F1D1D]">
                    Xero contact could not be created
                  </span>
                  <span className="text-sm text-[#DC2626]">
                    This customer is saved in QuarryLink, but a matching Xero
                    contact was not created (e.g. validation or connection
                    issue). Review the details below, then use Retry sync
                    button.
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="flex-shrink-0 gap-2 border-[#FFA2A2] text-[#82181A] hover:text-[#82181A]"
                disabled={isSubmitting}
                onClick={() => {
                  isRetrySyncRef.current = true;
                  customerForm.handleSubmit(onSubmit, onError)().finally(() => {
                    isRetrySyncRef.current = false;
                  });
                }}
              >
                <RefreshCw
                  className={cn('h-4 w-4', isSubmitting && 'animate-spin')}
                />
                Retry sync
              </Button>
            </div>
          )}

          {/* Accounting not linked banner */}
          {notLinkedWarning && (
            <div className="col-span-full border border-[#D97706] bg-[#FFFBEB] rounded-md p-4 flex items-center justify-between gap-4 mb-2">
              <div className="flex items-start gap-3">
                <TriangleAlert className="h-4 w-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-[#92400E]">
                    Accounting integration not set up
                  </span>
                  <span className="text-sm text-[#B45309]">
                    This customer will be saved in QuarryLink only. To sync
                    customers with your accounting system, please configure your
                    connection in Settings first.
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="flex-shrink-0 gap-2 border-[#D97706] text-[#92400E] hover:text-[#92400E]"
                onClick={() => router.push('/system/accounting')}
              >
                <Settings className="h-4 w-4" />
                Go to Settings
              </Button>
            </div>
          )}

          {/* Warning for incomplete data from Xero sync */}
          {isEditing &&
            selectedCustomer &&
            (() => {
              const isBusiness = selectedCustomer.customerType === 'BUSINESS';
              const isIndividual =
                selectedCustomer.customerType === 'INDIVIDUAL';

              // Check for missing fields
              const missingFields = [];

              // Common required fields
              if (
                !selectedCustomer.contactPersonEmail ||
                selectedCustomer.contactPersonEmail.trim() === ''
              ) {
                missingFields.push('email');
              }
              if (
                !selectedCustomer.contactPersonPhone ||
                selectedCustomer.contactPersonPhone.trim() === ''
              ) {
                missingFields.push('phone');
              }
              if (
                !selectedCustomer.accountManagerSub ||
                selectedCustomer.accountManagerSub.trim() === ''
              ) {
                missingFields.push('account manager');
              }

              // Business-specific required fields
              if (isBusiness) {
                if (
                  !selectedCustomer.businessName ||
                  selectedCustomer.businessName.trim() === ''
                ) {
                  missingFields.push('business name');
                }
                if (
                  !selectedCustomer.abn ||
                  selectedCustomer.abn.trim() === '' ||
                  selectedCustomer.abn === 'N/A'
                ) {
                  missingFields.push('ABN');
                }
                // Check if firstName and lastName exist
                if (
                  !selectedCustomer.contactPersonFirstName ||
                  selectedCustomer.contactPersonFirstName.trim() === ''
                ) {
                  missingFields.push('contact person first name');
                }
                if (
                  !selectedCustomer.contactPersonLastName ||
                  selectedCustomer.contactPersonLastName.trim() === ''
                ) {
                  missingFields.push('contact person last name');
                }
              }

              // Individual-specific required fields
              if (isIndividual) {
                if (
                  !selectedCustomer.individualContactName ||
                  selectedCustomer.individualContactName.trim() === ''
                ) {
                  missingFields.push('contact person name');
                }
              }

              const showWarning = missingFields.length > 0;

              return showWarning ? (
                <div className="border border-blue-600 bg-blue-50 p-4 rounded-md mb-4 flex flex-col col-span-full">
                  <div className="flex items-center gap-2 text-[#09090B] text-sm">
                    <Info className="h-4 w-4 text-[#0075FF]" />
                    <span>
                      This customer was synced from Xero with partial data.
                      Please complete the missing fields to continue using this
                      customer in QuarryLink.
                    </span>
                  </div>
                </div>
              ) : null;
            })()}

          {/* Customer Type */}
          <FormField
            control={customerForm.control}
            name="customer_type"
            render={({ field }) => (
              <FormItem className="col-span-1 col-start-1">
                <FormLabel>Customer Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormFieldChange('customer_type', value);
                    }}
                    className="grid grid-flow-col auto-cols-max gap-4"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="BUSINESS" />
                      </FormControl>
                      <FormLabel className="font-normal">Business</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="INDIVIDUAL" />
                      </FormControl>
                      <FormLabel className="font-normal">Individual</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Type */}
          <FormField
            control={customerForm.control}
            name="payment_type"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop
                    ? 'col-span-1 col-start-2'
                    : 'col-span-1 col-start-1'
                }
              >
                <FormLabel>Payment Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormFieldChange('payment_type', value);
                    }}
                    className="grid grid-flow-col auto-cols-max gap-4"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="CREDIT" />
                      </FormControl>
                      <FormLabel className="font-normal">Credit</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="PREPAID" />
                      </FormControl>
                      <FormLabel className="font-normal">Pre-Paid</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Name */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="business_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Business Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Business Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Business Email */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="business_email"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Business Email*</FormLabel>
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
          )}

          {/* Business Phone */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="business_phone"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Business Phone*</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* ABN */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="abn"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>ABN*</FormLabel>
                  <FormControl>
                    <ABNInput className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Name - For INDIVIDUAL type only */}
          {selectedCustomerType === 'INDIVIDUAL' && (
            <FormField
              control={customerForm.control}
              name="contact_person_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Contact Person Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* Contact Person First Name - For BUSINESS type only */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_first_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person First Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter First Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Last Name - For BUSINESS type only */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_last_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Last Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Last Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Email - For BUSINESS type */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_email"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Email*</FormLabel>
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
          )}

          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_phone"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Phone*</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Email - For INDIVIDUAL type */}
          {selectedCustomerType === 'INDIVIDUAL' && (
            <FormField
              control={customerForm.control}
              name="contact_person_email"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Email*</FormLabel>
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
          )}

          {/* Contact Person Phone - For INDIVIDUAL type */}
          {selectedCustomerType === 'INDIVIDUAL' && (
            <FormField
              control={customerForm.control}
              name="contact_person_phone"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Phone*</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Credit Limit */}
          {selectedPaymentType === 'CREDIT' && (
            <FormField
              control={customerForm.control}
              name="credit_limit"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? selectedCustomerType === 'BUSINESS'
                        ? 'col-span-1 col-start-1'
                        : 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Credit Limit*</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      id="credit_limit"
                      className="w-full"
                      placeholder="Enter Credit Limit"
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value === '' ? 0 : value)
                      }
                      decimalPlaces={2}
                      allowNegative={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Payment Terms */}
          {selectedPaymentType === 'CREDIT' && (
            <div
              className={cn(
                'space-y-2',
                isEditing && isDesktop
                  ? selectedCustomerType === 'BUSINESS'
                    ? 'col-span-1 col-start-2'
                    : 'col-span-1 col-start-1'
                  : 'col-span-2',
              )}
            >
              <FormLabel>Invoice Due Date*</FormLabel>
              <div className="grid grid-cols-[2fr_8fr] w-full">
                <FormField
                  control={customerForm.control}
                  name="payment_terms_day"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <Input
                          type="number"
                          className="rounded-r-none border-r-0 focus-visible:z-10 w-full"
                          placeholder="Days"
                          {...field}
                          isNumber
                          onChange={(e) => {
                            field.onChange(e);
                            // Trigger validation for both payment_terms_day and payment_terms fields
                            customerForm.trigger([
                              'payment_terms_day',
                              'payment_terms',
                            ]);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="absolute mt-9 whitespace-nowrap" />
                    </FormItem>
                  )}
                />
                <FormSelect
                  control={customerForm.control}
                  name="payment_terms"
                  options={paymentTermsOptions}
                  placeholder="Select Payment Terms"
                  className="rounded-l-none w-full"
                  showSearch={false}
                  onChange={() => {
                    // Trigger validation for payment_terms_day when payment_terms changes
                    customerForm.trigger([
                      'payment_terms_day',
                      'payment_terms',
                    ]);
                  }}
                />
              </div>
            </div>
          )}

          {/* Account Manager */}
          <FormSelect
            control={customerForm.control}
            name="account_manager"
            label="Account Manager*"
            options={accountManagerOptions}
            placeholder="Select Account Manager"
            formItemClassName={
              isEditing && isDesktop
                ? selectedCustomerType === 'BUSINESS'
                  ? 'col-span-1 col-start-1'
                  : 'col-span-1 col-start-2'
                : 'col-span-2'
            }
          />

          {/* Billing Address */}
          <FormField
            control={customerForm.control}
            name="billing_address"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop
                    ? selectedCustomerType === 'BUSINESS'
                      ? 'col-span-1 col-start-2'
                      : 'col-span-1 col-start-1'
                    : 'col-span-2'
                }
              >
                <FormLabel>Billing Address*</FormLabel>
                <FormControl>
                  <AddressAutoComplete
                    address={address}
                    setAddress={handleAddressChange}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    dialogTitle="Search for Billing Address"
                    placeholder="Search for Billing Address..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Audit Information */}
          {isEditing && (
            <AuditInformation
              createdBy={selectedCustomer?.createdBy}
              lastModifiedBy={selectedCustomer?.lastModifiedBy}
              createdAt={selectedCustomer?.createdAt}
              updatedAt={selectedCustomer?.updatedAt}
            />
          )}

          {/* Form Actions */}
          {isDesktop && (
            <div className="flex justify-end space-x-2 col-span-2 mb-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
              <Button
                form="add-new-customer-form"
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Customer...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Add Customer'}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 mb-6">
              <Button
                // TODO: QLINK-257 Edit Customer Functionality
                // form="add-new-customer-form"
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Customer...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Add Customer'}
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
