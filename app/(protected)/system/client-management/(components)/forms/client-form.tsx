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

import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ABNInput } from '@/components/ui/input-mask';
import { PhoneInput } from '@/components/ui/phone-input';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { AddressType } from '@/lib/types/address';
import { FormSelect } from '@/components/ui/form-select';
import { CircleCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import ButtonRadio from '@/components/ui/button-radio';
import { InputWithPlusMinusButtons } from '@/components/ui/input-with-plus-minus-buttons';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function ClientForm({ id, onCancel, className }: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    React.useState<string>('');
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
  const selectedClient = useSelectedClient();

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
      abn: isEditing ? selectedClient?.abn || '' : '',
      billing_address: '',
    },
  });

  const subscriptionOptions = [
    { label: 'Quarrylink Essential', value: 'ESSENTIAL' },
    { label: 'Quarrylink Plus', value: 'PLUS' },
    { label: 'Quarrylink Pro', value: 'PRO' },
  ];

  // This will be changed so leave it as it is for now
  const subscriptionDetails = {
    ESSENTIAL: {
      name: 'Essential',
      price: '116.00',
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
      name: 'Plus',
      price: '233.00',
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
      name: 'Pro',
      price: '466.00',
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

  const subscriptionPaymentTermOptions = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' },
  ];

  const currentPlan = selectedSubscription
    ? subscriptionDetails[
        selectedSubscription as keyof typeof subscriptionDetails
      ]
    : null;

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

  async function onSubmit(values: z.infer<typeof ClientFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Client Form Values:', values);

    setIsSubmitting(true);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
  }

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
            <>
              <FormField
                control={clientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name*</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter Company Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={clientForm.control}
                name="abn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ABN*</FormLabel>
                    <FormControl>
                      <ABNInput className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={clientForm.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Name*</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter full name of main contact person"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={clientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email*</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="contact@company.com.au"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={clientForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone*</FormLabel>
                    <FormControl>
                      <PhoneInput
                        className="w-full"
                        defaultCountry="AU"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={clientForm.control}
                name="billing_address"
                render={({ field }) => (
                  <FormItem>
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

              <div className="flex justify-end space-x-2 mb-6">
                <Button variant="outline" type="button" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer"
                  type="button"
                  onClick={async () => {
                    // Validate step 1 fields
                    const isValid = await clientForm.trigger([
                      'name',
                      'contact_name',
                      'email',
                      'phone',
                      'billing_address',
                    ]);
                    if (isValid) {
                      setStep(2);
                    }
                  }}
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {!isEditing && step === 2 && (
            <div className="flex flex-col gap-5">
              <FormSelect
                control={clientForm.control}
                name="subscription"
                label="Subscription Plan*"
                options={subscriptionOptions}
                placeholder="Select Subscription Plan"
                showSearch={false}
                showErrorMessage={false}
              />

              <InputWithPlusMinusButtons
                label="Number of Users"
                defaultValue={10}
                minValue={10}
                maxValue={20}
                className="w-fit"
              />

              {/* <div className="grid grid-cols-2 gap-10"> */}
              <ButtonRadio
                options={subscriptionPaymentTermOptions}
                defaultValue="Monthly"
                value={clientForm.getValues('subscription_payment_term')}
                onChange={(value) =>
                  clientForm.setValue('subscription_payment_term', value)
                }
              />
              {/* </div> */}

              {currentPlan && (
                <div className="border border-green-600 bg-green-50 p-6 flex flex-col gap-5 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 shrink-0 text-green-600" />
                      <span className="font-semibold text-base">
                        QuarryLink {currentPlan.name} Selected
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 pl-7">
                      Here is an overview of modules:
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-gray-700 pl-7">
                    {currentPlan.features.map((feature, index) => (
                      <span key={index}>✓ {feature}</span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-700 font-medium pt-2 pl-7">
                    Monthly Recurring Price:{' '}
                    <span className="font-semibold">${currentPlan.price}</span>{' '}
                    <span className="text-gray-500">(EX GST)</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 my-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="cursor-pointer"
                  type="button"
                  onClick={async () => {
                    // Validate subscription field
                    const isValid = await clientForm.trigger(['subscription']);
                    if (isValid && currentPlan) {
                      setStep(3);
                    }
                  }}
                  disabled={!currentPlan}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {(step === 3 || isEditing) && (
            <>
              {!isEditing && (
                <>
                  <h1 className="text-xl font-semibold mb-1">Summary</h1>
                  <Separator className="mb-4" />
                </>
              )}

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
                    <span>Upt to 5 users, 5 drivers, 10 trucks</span>
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
                      QuarryLink {clientForm.getValues('subscription')}{' '}
                      (Monthly)
                    </span>
                    <span className="text-sm font-normal">
                      ${currentPlan?.price}
                    </span>
                  </div>
                  <div className="flex justify-between py-4 px-4 bg-slate-50 border-b border-[#E5E5E5]">
                    <span className="text-sm font-normal">GST (10%)</span>
                    <span className="text-sm font-normal">
                      ${(Number(currentPlan?.price) * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-4 px-4 bg-slate-100">
                    <span className="text-sm font-semibold">
                      Total Monthly Invoice:
                    </span>
                    <span className="text-sm font-semibold">
                      $
                      {(
                        Number(currentPlan?.price) +
                        Number(currentPlan?.price) * 0.1
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              {isDesktop && (
                <div className="flex justify-end space-x-2 my-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    form="add-new-client-form"
                    className="cursor-pointer"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isEditing ? 'Save Changes' : 'Add Client'}
                  </Button>
                </div>
              )}

              {!isDesktop && (
                <div className="flex flex-col col-span-2 gap-3 mb-6">
                  <Button type="submit" className="cursor-pointer">
                    {isEditing ? 'Save Changes' : 'Add Client'}
                  </Button>
                  <Button variant="outline" type="button" onClick={onCancel}>
                    {isEditing ? 'Close' : 'Cancel'}
                  </Button>
                </div>
              )}
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
