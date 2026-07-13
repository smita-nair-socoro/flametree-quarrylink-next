'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import {
  cn,
  addNewRecordId,
  addSyncErrorRecordId,
  scrollToFirstError,
} from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { Tab } from '@/components/ui/tabs';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';
import { NewCustomerFormSchema } from './schemas/customer-form-schema';
import { Loader2 } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { useQuery } from '@tanstack/react-query';
// import { AccountManagersListQueryOptions } from '@/lib/api/user';
// Revert to AccountManagersListQueryOptions once frontend has UI to allow user to change role to account manager.
import { UsersListQueryOptions } from '@/lib/api/user';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import {
  useCreateCustomer,
  CustomerDetailQueryOptions,
} from '@/lib/api/customer';
import { CustomerDTO } from '@/lib/types/customer';
import {
  CUSTOMER_STATUS,
  CUSTOMER_TYPE,
  PAYMENT_TERM_TYPE,
  PAYMENT_TYPE,
} from '@/lib/types/customer-enums';
import {
  CustomerFormBlockBanner,
  getCustomerFormBlockState,
} from './customer-form-blocker';
import { toAddressPayload, useAddressSync } from '@/lib/utils/address-helper';
import {
  useCustomerFormState,
  EMPTY_CUSTOMER_FORM_VALUES,
} from '@/hooks/customer/use-customer-form-state';
import { useAccountingSoftwareLabel } from '@/lib/utils/tenant-config-helper';
import { AddressType } from '@/lib/types/address';
import NotesTab from './tabs/notes/notes-tab';
import DetailsTab from './tabs/details/details-tab';

type CustomerFormValues = z.infer<typeof NewCustomerFormSchema>;

function getSubmitButtonLabel(isSubmitting: boolean, isEditing: boolean): string {
  if (isSubmitting) {
    return isEditing ? 'Saving Changes...' : 'Adding Customer...';
  }
  return isEditing ? 'Save Changes' : 'Add Customer';
}

/** Zero out fields that don't belong to the submitted customer/payment type. */
function normalizeCustomerFormValues(
  rawValues: CustomerFormValues,
): CustomerFormValues {
  return {
    ...rawValues,
    ...(rawValues.customer_type === CUSTOMER_TYPE.INDIVIDUAL
      ? {
          business_name: '',
          business_email: '',
          business_phone: '',
          abn: '',
          contact_person_first_name: '',
          contact_person_last_name: '',
        }
      : {
          contact_person_name: '',
        }),
    ...(rawValues.payment_type === PAYMENT_TYPE.PREPAID
      ? { credit_limit: 0, payment_terms_day: 0 }
      : {}),
  };
}

interface BuildCustomerPayloadContext {
  id?: number;
  selectedCustomer?: CustomerDTO;
  address: AddressType;
}

interface ResolvedBillingAddress {
  billingAddressData: ReturnType<typeof toAddressPayload>;
  billingAddressId?: number;
}

function resolveBillingAddress(
  address: AddressType,
  isEditing: boolean,
  selectedCustomer?: CustomerDTO,
): ResolvedBillingAddress {
  const billingAddressData = toAddressPayload(
    address,
    isEditing && selectedCustomer ? selectedCustomer.billingAddress : null,
  );

  // Backend requires billingAddressId (maps to customers.billing_address_id) on update.
  const existingBillingAddressId =
    isEditing && selectedCustomer
      ? (selectedCustomer.billingAddressId ?? selectedCustomer.billingAddress?.id)
      : undefined;

  return {
    billingAddressData,
    billingAddressId: existingBillingAddressId ?? billingAddressData?.id,
  };
}

/** Sets the CREDIT/PREPAID-specific fields; the two are mutually exclusive. */
function applyPaymentTypeFields(
  customerData: Partial<CustomerDTO>,
  values: CustomerFormValues,
): void {
  if (values.payment_type === 'CREDIT') {
    customerData.paymentTermType =
      values.payment_terms || PAYMENT_TERM_TYPE.DAYSAFTERBILLDATE;
    return;
  }

  if (values.payment_type === PAYMENT_TYPE.PREPAID) {
    customerData.creditLimit = 0;
    customerData.invoiceDueDateDayCount = 0;
  }
}

/** Adds the id and existing accounting-software contact id for updates. */
function applyEditingIdentifiers(
  customerData: Partial<CustomerDTO>,
  isEditing: boolean,
  id: number | undefined,
  selectedCustomer?: CustomerDTO,
): void {
  if (!isEditing || !id) return;
  customerData.id = id;
  if (selectedCustomer?.accSoftwareContactId) {
    customerData.accSoftwareContactId = selectedCustomer.accSoftwareContactId;
  }
}

/** Sets the BUSINESS/INDIVIDUAL-specific fields; the two are mutually exclusive. */
function applyCustomerTypeFields(
  customerData: Partial<CustomerDTO>,
  values: CustomerFormValues,
): void {
  if (values.customer_type === CUSTOMER_TYPE.BUSINESS) {
    customerData.businessName = values.business_name || '';
    customerData.businessEmail = values.business_email || '';
    customerData.businessPhone = values.business_phone || '';
    customerData.individualContactName =
      values.contact_person_first_name + ' ' + values.contact_person_last_name ||
      '';
    customerData.contactPersonFirstName = values.contact_person_first_name || '';
    customerData.contactPersonLastName = values.contact_person_last_name || '';
    customerData.abn = values.abn || '';
    // Default fields, actually not needed but is mandatory in backend
    customerData.acn = '997744';
    customerData.vatNumber = '123';
    return;
  }

  if (values.customer_type === CUSTOMER_TYPE.INDIVIDUAL) {
    customerData.individualContactName = values.contact_person_name || '';
    customerData.abn = 'N/A';
    // Default fields for INDIVIDUAL type
    customerData.dateOfBirth = new Date().toISOString();
    customerData.govId = '123';
  }
}

function buildCustomerPayload(
  values: CustomerFormValues,
  { id, selectedCustomer, address }: BuildCustomerPayloadContext,
): Partial<CustomerDTO> {
  const isEditing = Boolean(id);
  const { billingAddressData, billingAddressId } = resolveBillingAddress(
    address,
    isEditing,
    selectedCustomer,
  );

  const customerData: Partial<CustomerDTO> = {
    customerType:
      values.customer_type === 'BUSINESS'
        ? CUSTOMER_TYPE.BUSINESS
        : CUSTOMER_TYPE.INDIVIDUAL,
    contactPersonPhone: values.contact_person_phone || '',
    contactPersonEmail: values.contact_person_email || '',
    ...(billingAddressId ? { billingAddressId } : {}),
    billingAddress: billingAddressData,
    creditLimit: Math.round(Number(values.credit_limit || 0) * 100), // Convert to cents
    accountManagerSub: values.account_manager,
    invoiceDueDateDayCount: values.payment_terms_day || 0,
    customerStatus: CUSTOMER_STATUS.ACTIVE,
    paymentType: values.payment_type,
    version: isEditing && selectedCustomer ? selectedCustomer.version : 0,
  };

  applyPaymentTypeFields(customerData, values);
  applyEditingIdentifiers(customerData, isEditing, id, selectedCustomer);
  applyCustomerTypeFields(customerData, values);

  return customerData;
}

interface DuplicateFieldError {
  field: 'business_email' | 'contact_person_email' | 'abn';
  message: string;
}

interface CustomerSubmitErrorInfo {
  duplicate: DuplicateFieldError | null;
  fallbackMessage: string;
}

/** Matches a save error against the known unique-constraint conflicts, so the
 * caller can surface it on the relevant field instead of a generic toast. */
function resolveCustomerSubmitError(
  error: unknown,
  values: CustomerFormValues,
): CustomerSubmitErrorInfo {
  const err = extractErrorResponse(error);
  const extractedMessage = extractErrorMessage(error);
  const codeStr = err?.code ? String(err.code) : undefined;
  const messageFromErr = err?.message || extractedMessage;
  const fallbackMessage =
    messageFromErr || 'Failed to save customer. Please try again.';

  if (codeStr !== '409' || typeof messageFromErr !== 'string') {
    return { duplicate: null, fallbackMessage };
  }

  // Duplicate business email
  const duplicateEmailPhrase = `Key (business_email)=(${values.business_email}) already exists`;
  if (messageFromErr.includes(duplicateEmailPhrase)) {
    return {
      duplicate: {
        field: 'business_email',
        message: `Duplicate business email "${values.business_email}" already exists.`,
      },
      fallbackMessage,
    };
  }

  // Duplicate contact email - checks both the specific key format and constraint name
  const emailKeyPattern = `Key (email)=(${values.contact_person_email}) already exists`;
  if (
    messageFromErr.includes(emailKeyPattern) ||
    messageFromErr.includes('customers_email_key')
  ) {
    return {
      duplicate: {
        field: 'contact_person_email',
        message: 'The contact person email already exists.',
      },
      fallbackMessage,
    };
  }

  // Duplicate ABN
  const duplicateABNPhrase = `Key (abn)=(${values.abn}) already exists`;
  if (messageFromErr.includes(duplicateABNPhrase)) {
    return {
      duplicate: {
        field: 'abn',
        message: `Duplicate ABN "${values.abn}" already exists.`,
      },
      fallbackMessage,
    };
  }

  return { duplicate: null, fallbackMessage };
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

  // Single source of truth: fetch customer by id when editing (get-by-id endpoint)
  const { data: selectedCustomer, isLoading: isCustomerLoading } = useQuery({
    ...CustomerDetailQueryOptions(customerId),
    enabled: isEditing && customerId > 0,
  });

  // Fetch account managers
  // const { data: users = [] } = useQuery(AccountManagersListQueryOptions());
  // Revert to AccountManagersListQueryOptions once frontend has UI to allow user to change role to account manager.
  const { data: allUsers = [] } = useQuery(UsersListQueryOptions());
  const users = React.useMemo(
    () =>
      allUsers.filter(
        (user) =>
          !user.groups.some((group) => group.toLowerCase().includes('driver')),
      ),
    [allUsers],
  );
  const accountManagerOptions = React.useMemo(
    () =>
      users
        .map((user) => ({ label: user.name, value: user.sub }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [users],
  );

  // Mutation hooks
  const createCustomer = useCreateCustomer();

  // When true, onSubmit bypasses the isEditing check and always calls create (retry sync)
  const isRetrySyncRef = React.useRef(false);

  // Derive block state — null means the form is fully editable
  const blockState = React.useMemo(
    () => getCustomerFormBlockState(isEditing ? selectedCustomer : null),
    [isEditing, selectedCustomer],
  );
  const isFormBlocked = blockState !== null;

  const [accSoftwareSyncError, setAccSoftwareSyncError] = React.useState<
    string | null
  >(null);
  const [notLinkedWarning, setNotLinkedWarning] = React.useState(false);

  const customerForm = useForm<CustomerFormValues>({
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
  const [notesCount, setNotesCount] = React.useState(0);

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
    } else if (field === 'payment_type') {
      setSelectedPaymentType(value);
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

  const NOT_LINKED_SUBSTRINGS = [
    'Customer is not linked to any accounting software',
    'Customer creation is supported only for Xero currently',
  ];

  const ARCHIVE_UNARCHIVE_PREFIXES = [
    'Archive customer failed!',
    'Unarchive customer failed!',
  ];

  const handleSyncNote = (note?: string): boolean => {
    if (!note) return false;
    // Archive/unarchive failures are handled by the block banner — skip here
    if (ARCHIVE_UNARCHIVE_PREFIXES.some((prefix) => note.startsWith(prefix))) {
      return false;
    }
    if (NOT_LINKED_SUBSTRINGS.some((msg) => note.includes(msg))) {
      setNotLinkedWarning(true);
      return true;
    }
    setAccSoftwareSyncError(note);
    return true;
  };

  // Initialize sync banners from real customer data when editing
  React.useEffect(() => {
    setAccSoftwareSyncError(null);
    setNotLinkedWarning(false);
    if (!isEditing || !selectedCustomer) return;
    handleSyncNote(selectedCustomer.accSoftwareNotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id, isEditing]);

  async function onSubmit(rawValues: CustomerFormValues) {
    const values = normalizeCustomerFormValues(rawValues);

    try {
      setIsSubmitting(true);

      const customerData = buildCustomerPayload(values, {
        id,
        selectedCustomer,
        address,
      });

      const result = await createCustomer.mutateAsync(customerData);

      if (isEditing && !isRetrySyncRef.current) {
        notifySuccess('Customer Updated Successfully!');
      } else {
        notifySuccess('Customer Added Successfully!');

        // Add the new record ID to sessionStorage for highlighting
        if (result && typeof result.id === 'number') {
          addNewRecordId('customer_main_data_table', result.id);
          if (!result.accSoftwareContactId) {
            addSyncErrorRecordId('customer_main_data_table', result.id);
          }
        }

        handleSyncNote(result.accSoftwareNotes);
      }

      onSuccess?.();
      onSaved?.();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} customer:`,
        error,
      );

      const { duplicate, fallbackMessage } = resolveCustomerSubmitError(
        error,
        values,
      );

      if (duplicate) {
        notifyError(duplicate.message);
        customerForm.setError(duplicate.field, {
          type: 'manual',
          message: duplicate.message,
        });
        return;
      }

      notifyError(fallbackMessage);
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
    scrollToFirstError();
  }

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

  // Show loading when editing and customer is still being fetched by id
  if (isEditing && isCustomerLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8">
        <Spinner size="medium" />
        <p className="text-muted-foreground">Loading customer...</p>
      </div>
    );
  }

  // Rendered inside the "Details" tab when editing, or directly (no tabs)
  // when creating a new customer, since Notes only applies to an existing,
  // saved customer.
  const detailsTabContent = (
    <DetailsTab
      form={customerForm}
      isEditing={isEditing}
      isDesktop={isDesktop}
      isSubmitting={isSubmitting}
      accSoftware={accSoftware}
      accSoftwareSyncError={accSoftwareSyncError}
      notLinkedWarning={notLinkedWarning}
      onRetrySync={() => {
        isRetrySyncRef.current = true;
        customerForm
          .handleSubmit(onSubmit, onError)()
          .finally(() => {
            isRetrySyncRef.current = false;
          });
      }}
      selectedCustomer={selectedCustomer}
      selectedCustomerType={selectedCustomerType}
      selectedPaymentType={selectedPaymentType}
      onFormFieldChange={handleFormFieldChange}
      accountManagerOptions={accountManagerOptions}
      paymentTermsOptions={paymentTermsOptions}
      address={address}
      onAddressChange={handleAddressChange}
      searchInput={searchInput}
      setSearchInput={setSearchInput}
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
