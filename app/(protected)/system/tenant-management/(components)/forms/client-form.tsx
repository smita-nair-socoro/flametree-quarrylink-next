'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { ClientFormSchema } from './schemas/client-form-schema';
import { useSelectedClient } from '@/app/stores/client-store';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { AddressType } from '@/lib/types/address';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { notifyError } from '@/lib/toast';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import UserAccessTab from './tabs/user-access-tab';
import UsageStatisticsTab from './tabs/usage-statistics-tab';
import BillingHistoryTab from './tabs/billing-history-tab';
import { Tab } from '@/components/ui/tabs';
import { Client } from '@/lib/types/client';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJsonWithClientWithUsers from '@/lib/tests/clientWithUsersResponseData.json';
import { User } from '@/lib/types/user';
import Step1CompanyDetails from './steps/step-1-company-details';
import Step2Subscription from './steps/step-2-subscription';
import Step3Summary from './steps/step-3-summary';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onClientAdded?: (clientName: string, clientEmail: string) => void;
  className?: string;
  onCancel?: () => void;
}

export default function ClientForm({
  id,
  onCancel,
  onClientAdded,
  className,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const selectedClient = useSelectedClient();
  const [selectedSubscription, setSelectedSubscription] =
    React.useState<string>(isEditing ? selectedClient?.subscription || '' : '');
  const [numberOfUsers, setNumberOfUsers] = React.useState(10);
  const [paymentTerm, setPaymentTerm] = React.useState<'Monthly' | 'Yearly'>(
    'Monthly'
  );
  const [customPrice, setCustomPrice] = React.useState('');
  const [step, setStep] = React.useState(1);
  const [address, setAddress] = React.useState<AddressType>({
    address1: '',
    address2: '',
    formattedAddress: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    lat: 0,
    lng: 0,
  });
  const [searchInput, setSearchInput] = React.useState('');

  const clientForm = useForm<z.infer<typeof ClientFormSchema>>({
    resolver: zodResolver(ClientFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: isEditing ? selectedClient?.name || '' : '',
      contact_name: isEditing ? selectedClient?.contact_name || '' : '',
      email: isEditing ? selectedClient?.email || '' : '',
      phone: isEditing ? selectedClient?.phone || '' : '',
      subscription: isEditing ? selectedClient?.subscription || '' : '',
      subscription_payment_term: isEditing
        ? selectedClient?.subscription_payment_term || ''
        : '',
      unit_subscription_price: 0,
      total_subscription_price: 0,
      number_of_users: 10,
      abn: isEditing ? selectedClient?.abn || '' : '',
      billing_address: '',
      created_by: isEditing ? selectedClient?.created_by || '' : '',
      last_modified_by: isEditing ? selectedClient?.last_modified_by || '' : '',
      created_at: isEditing ? selectedClient?.created_at || '' : '',
      updated_at: isEditing ? selectedClient?.updated_at || '' : '',
    },
  });

  // This will be changed so leave it as it is for now
  const subscriptionDetails = {
    ESSENTIAL: {
      name: 'ESSENTIAL',
      monthlyPrice: '116.00',
      yearlyPrice: '89.00',
      features: [
        'Customer Management',
        'Product Management',
        'Suppliers & Quarries (Up to 1 quarry)',
        'Quote Management',
        'User management (Minimum 10 users)',
        'Integrations (Xero)',
      ],
    },
    PLUS: {
      name: 'PLUS',
      monthlyPrice: '233.00',
      yearlyPrice: '179.00',
      features: [
        'Customer Management',
        'Product Management',
        'Suppliers & Quarries (Up to 1 quarry)',
        'Quote Management',
        'User management (Minimum 10 users)',
        'Jobs, Dockets & Invoicing',
        'Driver & Fleet Management',
        'Deliveries Schedule',
        'Reports & Dashboards',
        'Driver Application',
        'Integrations (Xero)',
      ],
    },
    PRO: {
      name: 'PRO',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      features: [
        'Customer Management',
        'Product Management',
        'Suppliers & Quarries (Up to 1 quarry)',
        'Quote Management',
        'User management (Minimum 10 users)',
        'Jobs, Dockets & Invoicing',
        'Driver & Fleet Management',
        'Deliveries Schedule',
        'Reports & Dashboards',
        'Driver Application',
        'Stockpile Management',
        'Site & Driver Sign-In',
        'Weighbridge Integration',
        'Production Planning',
        'Integrations (All Via Custom APIs)',
      ],
    },
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const currentPlan = selectedSubscription
    ? subscriptionDetails[
        selectedSubscription as keyof typeof subscriptionDetails
      ]
    : null;

  // Get the current unit price (price per user) based on payment term
  const currentUnitPrice = React.useMemo(() => {
    if (!currentPlan) return '0.00';

    // For PRO plan, use custom pricing if available
    if (selectedSubscription === 'PRO') {
      return customPrice || '0.00';
    }

    // For ESSENTIAL and PLUS plans, use predefined pricing
    return paymentTerm === 'Yearly'
      ? currentPlan.yearlyPrice
      : currentPlan.monthlyPrice;
  }, [currentPlan, selectedSubscription, paymentTerm, customPrice]);

  const handleAddressChange = React.useCallback(
    (newAddress: AddressType) => {
      setAddress(newAddress);
      if (newAddress.formattedAddress) {
        setSearchInput('');
        // Trigger validation for the billing_address field
        clientForm.trigger('billing_address');
      }
    },
    [clientForm]
  );

  // Watch the subscription field for changes
  const watchedSubscription = clientForm.watch('subscription');

  React.useEffect(() => {
    setSelectedSubscription(watchedSubscription || '');
  }, [watchedSubscription]);

  // Update unit and total subscription prices whenever they change
  React.useEffect(() => {
    if (currentUnitPrice && currentUnitPrice !== '0.00') {
      const unitPrice = Number(currentUnitPrice);
      if (!isNaN(unitPrice)) {
        const totalPrice = unitPrice * numberOfUsers;
        clientForm.setValue('unit_subscription_price', unitPrice);
        clientForm.setValue('total_subscription_price', totalPrice);
      }
    }
  }, [currentUnitPrice, numberOfUsers, clientForm]);

  // Sync numberOfUsers with form
  React.useEffect(() => {
    clientForm.setValue('number_of_users', numberOfUsers);
  }, [numberOfUsers, clientForm]);

  // Clear custom price when payment term changes (PRO plan only)
  React.useEffect(() => {
    if (selectedSubscription === 'PRO') {
      setCustomPrice('');
    }
  }, [paymentTerm, selectedSubscription]);

  async function onSubmit(values: z.infer<typeof ClientFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Client Form Values:', values);

    setIsSubmitting(true);

    try {
      // Simulate API call delay (remove this in production and replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Replace with actual API call
      // if (isEditing && id) {
      //   await updateClient.mutateAsync({ id, data: payload });
      // } else {
      //   await createClient.mutateAsync(payload);
      // }

      // Close the form modal first
      onCancel?.();

      // Trigger success callback with client data
      if (!isEditing) {
        setTimeout(() => {
          onClientAdded?.(values.name, values.email);
        }, 300);
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} client:`,
        error
      );
      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;

      // Duplicate client name or ABN (HTTP 409)
      const duplicateNamePhrase = `Key (name)=(${values.name}) already exists`;
      const duplicateABNPhrase = `Key (abn)=(${values.abn}) already exists`;
      const isDuplicateName =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateNamePhrase);
      const isDuplicateABN =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateABNPhrase);

      if (isDuplicateName) {
        const msg = `Client with name "${values.name}" already exists.`;
        notifyError(msg, { duration: 2000 });
        clientForm.setError('name', { type: 'manual', message: msg });
        return;
      }

      if (isDuplicateABN) {
        const msg = `Client with ABN "${values.abn}" already exists.`;
        notifyError(msg, { duration: 2000 });
        clientForm.setError('abn', { type: 'manual', message: msg });
        return;
      }

      // Fallback error using extracted message
      notifyError(
        messageFromErr ||
          `Failed to ${isEditing ? 'update' : 'create'} client. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Prepare user data for the UserAccessTab
  const convertedClientWithUsers = React.useMemo(() => {
    if (isEditing && selectedClient?.id) {
      const convertedDetailedJson = convertKeysToSnakeCase(
        rawJsonWithClientWithUsers
      );
      const { items: detailedItems } = convertedDetailedJson as unknown as {
        items: Client[];
      };
      // Find the client matching the selected ID
      const detailedClient = detailedItems.find(
        (client) => client.id === selectedClient.id
      );
      const users = (detailedClient?.user || []) as User[];
      return convertKeysToSnakeCase(users) as User[];
    }
    return [] as User[];
  }, [isEditing, selectedClient?.id]);

  const tabs = [
    {
      name: 'User & Access',
      content: (
        <UserAccessTab convertedClientWithUsers={convertedClientWithUsers} />
      ),
    },
    {
      name: 'Usage Statistics',
      content: <UsageStatisticsTab />,
    },
    {
      name: 'Billing History',
      content: <BillingHistoryTab />,
    },
  ];

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10'
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              Adding Client...
            </p>
          </div>
        </div>
      )}

      <Form {...clientForm}>
        <form
          id="add-new-client-form"
          className={cn(
            'p-1 gap-1 w-full grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={clientForm.handleSubmit(onSubmit)}
        >
          {!isEditing && (
            <Progress
              value={step === 1 ? 33 : step === 2 ? 66 : 100}
              className="mb-5"
            />
          )}
          {!isEditing && step === 1 && (
            <Step1CompanyDetails
              form={clientForm}
              address={address}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              handleAddressChange={handleAddressChange}
              onCancel={onCancel}
              onNext={() => setStep(2)}
            />
          )}

          {!isEditing && step === 2 && (
            <Step2Subscription
              form={clientForm}
              selectedSubscription={selectedSubscription}
              numberOfUsers={numberOfUsers}
              setNumberOfUsers={setNumberOfUsers}
              paymentTerm={paymentTerm}
              setPaymentTerm={setPaymentTerm}
              currentPlan={currentPlan}
              currentUnitPrice={currentUnitPrice}
              customPrice={customPrice}
              setCustomPrice={setCustomPrice}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {!isEditing && step === 3 && (
            <Step3Summary
              form={clientForm}
              isDesktop={isDesktop}
              isSubmitting={isSubmitting}
              numberOfUsers={numberOfUsers}
              paymentTerm={paymentTerm}
              currentUnitPrice={currentUnitPrice}
              onBack={() => setStep(2)}
              onCancel={onCancel}
            />
          )}

          {/* Editing Mode - Company & Subscription Details */}
          {isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#E5E5E5] bg-white p-4 rounded-lg flex flex-col gap-2">
                  <span>Company Details</span>
                  <div className="flex flex-col gap-1 text-sm text-[#737373]">
                    <span>{clientForm.getValues('name')}</span>
                    <span>ABN: {clientForm.getValues('abn')}</span>
                    <span>Contact: {clientForm.getValues('contact_name')}</span>
                    <span>Email: {clientForm.getValues('email')}</span>
                    <span>Phone: {clientForm.getValues('phone')}</span>
                  </div>
                </div>
                <div className="border border-[#E5E5E5] bg-white p-4 rounded-lg flex flex-col gap-2">
                  <span>Subscription Details</span>
                  <div className="flex flex-col gap-1 text-sm text-[#737373]">
                    <span>
                      QuarryLink {clientForm.getValues('subscription')}{' '}
                      Subscription
                    </span>
                    <span>Monthly billing cycle</span>
                    <span>Up to 5 users, 5 drivers, 10 trucks</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-0 mt-5">
                <div className="flex flex-col gap-2">
                  <span className="text-[#0A0A0A] font-semibold text-[20px]">
                    Pricing
                  </span>
                  <Separator />
                </div>
                <div className="border-t border-b border-[#E5E5E5] overflow-hidden">
                  <div className="flex justify-between py-4 px-4 bg-slate-50 border-b border-[#E5E5E5]">
                    <span className="text-sm font-normal">
                      QuarryLink {clientForm.getValues('subscription')} (
                      {paymentTerm})
                    </span>
                    <span className="text-sm font-normal">
                      ${(Number(currentUnitPrice) * numberOfUsers).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-4 px-4 bg-slate-50 border-b border-[#E5E5E5]">
                    <span className="text-sm font-normal">GST (10%)</span>
                    <span className="text-sm font-normal">
                      $
                      {(Number(currentUnitPrice) * numberOfUsers * 0.1).toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-4 px-4 bg-slate-100">
                    <span className="text-sm font-semibold">
                      Total Monthly Invoice:
                    </span>
                    <span className="text-sm font-semibold">
                      $
                      {formatCurrency(
                        Number(currentUnitPrice) * numberOfUsers +
                          Number(currentUnitPrice) * numberOfUsers * 0.1
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {isEditing && (
            <div className="mt-6">
              <Tab
                tabs={tabs}
                variant="underline"
                tabsClassName=""
                tabsTriggerClassName=""
              />
            </div>
          )}

          {/* Audit Information */}
          {isEditing && (
            <div className="col-span-full space-y-6 mt-10 mb-4">
              <h2 className="text-2xl font-bold">Audit Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient?.created_by || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient?.last_modified_by || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient?.created_at
                      ? new Date(selectedClient.created_at).toLocaleDateString(
                          'en-AU',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Modified Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient?.updated_at
                      ? new Date(selectedClient.updated_at).toLocaleDateString(
                          'en-AU',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end space-x-2 my-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                Close
              </Button>
              <Button
                form="add-new-client-form"
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
