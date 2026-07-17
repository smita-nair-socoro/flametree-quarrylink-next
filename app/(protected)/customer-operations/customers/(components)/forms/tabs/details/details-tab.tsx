'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { UseFormReturn } from 'react-hook-form';
import z from 'zod';
import { Info, Settings, TriangleAlert, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormSelect } from '@/components/ui/form-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { ABNInput, CurrencyInput } from '@/components/ui/input-mask';
import { PhoneInput } from '@/components/ui/phone-input';
import { AuditInformation } from '@/components/audit-information';
import { DataTableClient } from '@/components/ui/data-table-client';
import { Separator } from '@/components/ui/separator';
import { FormDialog } from '@/components/form-dialog';
import { cn } from '@/lib/utils';
import { AddressType } from '@/lib/types/address';
import {
  AdditionalContactDTO,
  CustomerAttachmentDTO,
  CustomerDTO,
} from '@/lib/types/customer';
import { PAYMENT_TERM_TYPE } from '@/lib/types/customer-enums';
import { NewCustomerFormSchema } from '../../schemas/customer-form-schema';
import AdditionalContactForm from '../../additional-contact-form';
import { AddCustomerAttachmentDialog } from '../../add-customer-attachment-dialog';
import { getAdditionalContactColumns } from '../../../(data-tables)/additional-contact/columns';
import { getCustomerAttachmentColumns } from '../../../(data-tables)/attachment/columns';

type CustomerFormValues = z.infer<typeof NewCustomerFormSchema>;

/**
 * Desktop two-column placement for fields that pair up and swap sides depending
 * on customer type — 'business-first' puts the field in column 1 for BUSINESS
 * customers (column 2 otherwise); 'business-second' is the mirror image.
 * Falls back to a full-width single column outside the editing/desktop layout.
 */
function getPairedFieldColumnClass(
  isEditing: boolean,
  isDesktop: boolean,
  selectedCustomerType: string,
  order: 'business-first' | 'business-second',
): string {
  if (!isEditing || !isDesktop) {
    return 'col-span-2';
  }

  const isBusiness = selectedCustomerType === 'BUSINESS';
  if (order === 'business-first') {
    return isBusiness ? 'col-span-1 col-start-1' : 'col-span-1 col-start-2';
  }
  return isBusiness ? 'col-span-1 col-start-2' : 'col-span-1 col-start-1';
}

interface DetailsTabProps {
  form: UseFormReturn<CustomerFormValues>;
  isEditing: boolean;
  isDesktop: boolean;
  isSubmitting: boolean;
  accSoftware: string;
  accSoftwareSyncError: string | null;
  notLinkedWarning: boolean;
  onRetrySync: () => void;
  selectedCustomer?: CustomerDTO;
  selectedCustomerType: string;
  selectedPaymentType: string;
  onFormFieldChange: (
    field: 'customer_type' | 'payment_type',
    value: string,
  ) => void;
  accountManagerOptions: { label: string; value: string }[];
  paymentTermsOptions: { label: string; value: PAYMENT_TERM_TYPE }[];
  address: AddressType;
  onAddressChange: (address: AddressType) => void;
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  customerId: number;
  additionalContactTableData: AdditionalContactDTO[];
  additionalContactsPage?: { totalElements: number; totalPages: number };
  isAdditionalContactsFetching: boolean;
  additionalContactsPageIndex: number;
  additionalContactsPageSize: number;
  handleAdditionalContactsPaginationChange: (page: number, pageSize: number) => void;
  attachmentTableData: CustomerAttachmentDTO[];
  isAttachmentsLoading: boolean;
  addAttachmentOpen: boolean;
  setAddAttachmentOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DetailsTab({
  form,
  isEditing,
  isDesktop,
  isSubmitting,
  accSoftware,
  accSoftwareSyncError,
  notLinkedWarning,
  onRetrySync,
  selectedCustomer,
  selectedCustomerType,
  selectedPaymentType,
  onFormFieldChange,
  accountManagerOptions,
  paymentTermsOptions,
  address,
  onAddressChange,
  searchInput,
  setSearchInput,
  customerId,
  additionalContactTableData,
  additionalContactsPage,
  isAdditionalContactsFetching,
  additionalContactsPageIndex,
  additionalContactsPageSize,
  handleAdditionalContactsPaginationChange,
  attachmentTableData,
  isAttachmentsLoading,
  addAttachmentOpen,
  setAddAttachmentOpen,
}: Readonly<DetailsTabProps>) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'grid gap-1',
        isEditing && isDesktop ? 'grid-cols-2 gap-x-8' : 'grid-cols-1',
        isEditing && 'animate-in fade-in slide-in-from-left-4 duration-300',
      )}
    >
      {/* Accounting software sync error banner */}
      {accSoftwareSyncError && (
        <div className="col-span-full border border-[#DC2626] bg-[#FEF2F2] rounded-md p-4 flex items-center justify-between gap-4 mb-2">
          <div className="flex items-start gap-3">
            <TriangleAlert className="h-4 w-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#7F1D1D]">
                {accSoftware} contact could not be created
              </span>
              <span className="text-sm text-[#DC2626]">
                This customer is saved in QuarryLink, but a matching{' '}
                {accSoftware} contact was not created (e.g. validation or
                connection issue). Review the details below, then use Retry sync
                button.
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="flex-shrink-0 gap-2 border-[#FFA2A2] text-[#82181A] hover:text-[#82181A]"
            disabled={isSubmitting}
            onClick={onRetrySync}
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
            onClick={() =>
              router.push('/system/user-management?tab=Integration')
            }
          >
            <Settings className="h-4 w-4" />
            Go to Settings
          </Button>
        </div>
      )}

      {/* Warning for incomplete data from accounting software sync */}
      {isEditing &&
        selectedCustomer &&
        (() => {
          const isBusiness = selectedCustomer.customerType === 'BUSINESS';
          const isIndividual = selectedCustomer.customerType === 'INDIVIDUAL';

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
                  This customer was synced from {accSoftware} with partial data.
                  Please complete the missing fields to continue using this
                  customer in QuarryLink.
                </span>
              </div>
            </div>
          ) : null;
        })()}

      {/* Customer Type */}
      <FormField
        control={form.control}
        name="customer_type"
        render={({ field }) => (
          <FormItem className="col-span-1 col-start-1">
            <FormLabel>Customer Type*</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  onFormFieldChange('customer_type', value);
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
        control={form.control}
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
                  onFormFieldChange('payment_type', value);
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
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
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
          control={form.control}
          name="business_email"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
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
          control={form.control}
          name="business_phone"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
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
          control={form.control}
          name="abn"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
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
          control={form.control}
          name="contact_person_name"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
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
          control={form.control}
          name="contact_person_first_name"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
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
          control={form.control}
          name="contact_person_last_name"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
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
          control={form.control}
          name="contact_person_email"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
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
          control={form.control}
          name="contact_person_phone"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
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
          control={form.control}
          name="contact_person_email"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
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
          control={form.control}
          name="contact_person_phone"
          render={({ field }) => (
            <FormItem
              className={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
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
          control={form.control}
          name="credit_limit"
          render={({ field }) => (
            <FormItem
              className={getPairedFieldColumnClass(
                isEditing,
                isDesktop,
                selectedCustomerType,
                'business-first',
              )}
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
            getPairedFieldColumnClass(
              isEditing,
              isDesktop,
              selectedCustomerType,
              'business-second',
            ),
          )}
        >
          <FormLabel>Invoice Due Date*</FormLabel>
          <div className="grid grid-cols-[2fr_8fr] w-full">
            <FormField
              control={form.control}
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
                        form.trigger(['payment_terms_day', 'payment_terms']);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="absolute mt-9 whitespace-nowrap" />
                </FormItem>
              )}
            />
            <FormSelect
              control={form.control}
              name="payment_terms"
              options={paymentTermsOptions}
              placeholder="Select Payment Terms"
              className="rounded-l-none w-full"
              showSearch={false}
              onChange={() => {
                // Trigger validation for payment_terms_day when payment_terms changes
                form.trigger(['payment_terms_day', 'payment_terms']);
              }}
            />
          </div>
        </div>
      )}

      {/* Account Manager */}
      <FormSelect
        control={form.control}
        name="account_manager"
        label="Account Manager*"
        options={accountManagerOptions}
        autoSelectForOnlyOneOption={!isEditing}
        placeholder="Select Account Manager"
        formItemClassName={getPairedFieldColumnClass(
          isEditing,
          isDesktop,
          selectedCustomerType,
          'business-first',
        )}
      />

      {/* Billing Address */}
      <FormField
        control={form.control}
        name="billing_address"
        render={({ field }) => (
          <FormItem
            className={getPairedFieldColumnClass(
              isEditing,
              isDesktop,
              selectedCustomerType,
              'business-second',
            )}
          >
            <FormLabel>Billing Address*</FormLabel>
            <FormControl>
              <AddressAutoComplete
                address={address}
                setAddress={onAddressChange}
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

      {/* Additional Contacts */}
      {isEditing && (
        <div className="col-span-2 col-start-1 mb-6">
          <Separator className="my-4" />
          <div className="flex flex-col gap-4 mt-6">
            <div
              className={cn(
                isDesktop
                  ? 'flex justify-between items-center'
                  : 'flex flex-col gap-4',
              )}
            >
              <span className="text-lg font-semibold">Additional Contacts</span>
              <FormDialog
                dialogTitle="Add New Contact"
                dialogDescription="Fill in the contact details below."
                buttonTitle="Add New Contact"
                dialogWidth="600px"
                contentClass="-mt-5"
                preventAutoFocus
              >
                <AdditionalContactForm customerId={customerId} />
              </FormDialog>
            </div>

            <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
              <DataTableClient
                tableId={`customer-additional-contacts-${customerId}`}
                columns={getAdditionalContactColumns(customerId)}
                data={additionalContactTableData}
                simpleTable={true}
                isLoading={isAdditionalContactsFetching}
                totalElements={additionalContactsPage?.totalElements ?? 0}
                totalPages={Math.max(additionalContactsPage?.totalPages ?? 0, 1)}
                externalPageIndex={additionalContactsPageIndex}
                externalPageSize={additionalContactsPageSize}
                onPaginationChange={handleAdditionalContactsPaginationChange}
                defaultSorting={[{ id: 'name', desc: false }]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Attachments */}
      {isEditing && (
        <div className="col-span-2 col-start-1 mb-6">
          <Separator className="my-4" />
          <div className="flex flex-col gap-4 mt-6">
            <div
              className={cn(
                isDesktop
                  ? 'flex justify-between items-center'
                  : 'flex flex-col gap-4',
              )}
            >
              <span className="text-lg font-semibold">Attachments</span>
              <Button
                type="button"
                className="cursor-pointer"
                onClick={() => setAddAttachmentOpen(true)}
              >
                Add Attachment
              </Button>
            </div>

            <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
              <DataTableClient
                tableId={`customer-attachments-${customerId}`}
                columns={getCustomerAttachmentColumns(customerId)}
                data={attachmentTableData}
                simpleTable={true}
                isLoading={isAttachmentsLoading}
                defaultSorting={[{ id: 'fileName', desc: false }]}
              />
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <AddCustomerAttachmentDialog
          open={addAttachmentOpen}
          onOpenChange={setAddAttachmentOpen}
          customerId={customerId}
        />
      )}

      {/* Audit Information */}
      {isEditing && (
        <>
          <Separator className="col-span-full my-4 mb-5" />
          <AuditInformation
            createdBy={selectedCustomer?.createdBy}
            lastModifiedBy={selectedCustomer?.lastModifiedBy}
            createdAt={selectedCustomer?.createdAt}
            updatedAt={selectedCustomer?.updatedAt}
          />
        </>
      )}
    </div>
  );
}
