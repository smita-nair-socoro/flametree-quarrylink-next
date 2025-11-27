'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/form-select';
import ButtonRadio from '@/components/ui/button-radio';
import { InputWithPlusMinusButtons } from '@/components/ui/input-with-plus-minus-buttons';
import { CurrencyInput } from '@/components/ui/input-mask';
import { CircleCheck } from 'lucide-react';
import { ClientFormSchema } from '../schemas/client-form-schema';
import z from 'zod';

interface Step2SubscriptionProps {
  form: UseFormReturn<z.infer<typeof ClientFormSchema>>;
  selectedSubscription: string;
  numberOfUsers: number;
  setNumberOfUsers: (value: number) => void;
  paymentTerm: 'Monthly' | 'Yearly';
  setPaymentTerm: (value: 'Monthly' | 'Yearly') => void;
  currentPlan: {
    name: string;
    monthlyPrice: string;
    yearlyPrice: string;
    features: string[];
  } | null;
  currentUnitPrice: string;
  customPrice: string;
  setCustomPrice: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const subscriptionOptions = [
  { label: 'Quarrylink ESSENTIAL', value: 'ESSENTIAL' },
  { label: 'Quarrylink PLUS', value: 'PLUS' },
  { label: 'Quarrylink PRO - Custom Pricing', value: 'PRO' },
];

const subscriptionPaymentTermOptions = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Yearly', value: 'Yearly' },
];

export default function Step2Subscription({
  form,
  selectedSubscription,
  numberOfUsers,
  setNumberOfUsers,
  paymentTerm,
  setPaymentTerm,
  currentPlan,
  currentUnitPrice,
  customPrice,
  setCustomPrice,
  onBack,
  onNext,
}: Step2SubscriptionProps) {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  React.useEffect(() => {
    if (!form.getValues('subscription_payment_term')) {
      form.setValue('subscription_payment_term', 'Monthly');
      setPaymentTerm('Monthly');
    }
  }, [form, setPaymentTerm]);

  const handleNextClick = async () => {
    const isValid = await form.trigger(['subscription']);
    if (isValid && currentPlan) {
      onNext();
    }
  };

  const isNextDisabled = () => {
    if (!currentPlan) return true;

    // For PRO plan, check if custom price is filled
    if (selectedSubscription === 'PRO' && !customPrice) {
      return true;
    }

    return false;
  };

  return (
    <div className="flex flex-col gap-5">
      <FormSelect
        control={form.control}
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
        onChange={(value) => setNumberOfUsers(value)}
      />

      <ButtonRadio
        options={subscriptionPaymentTermOptions}
        defaultValue="Monthly"
        value={form.getValues('subscription_payment_term')}
        onChange={(value) => {
          form.setValue('subscription_payment_term', value);
          setPaymentTerm(value as 'Monthly' | 'Yearly');
        }}
      />

      {/* Custom Pricing for PRO Plan */}
      {selectedSubscription === 'PRO' && (
        <div className="border border-[#E9D4FF] bg-[#FAF5FF] rounded-lg p-5 flex flex-col gap-4">
          <span className="text-base font-medium text-[#0A0A0A]">
            Define Custom Pricing
          </span>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#364153]">
              {paymentTerm} Price per User (ex GST)
            </label>
            <CurrencyInput
              placeholder="0.00"
              value={customPrice}
              onValueChange={(value) => {
                setCustomPrice(value === '' ? '' : String(value));
              }}
            />
          </div>
          <p className="text-sm text-[#6A7282]">
            Enter the custom {paymentTerm.toLowerCase()} price per user for this
            PRO plan client
          </p>
        </div>
      )}

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
            {paymentTerm} Recurring Price:{' '}
            <span className="font-semibold">
              {currentUnitPrice && currentUnitPrice !== '0.00'
                ? `$${formatCurrency(Number(currentUnitPrice) * numberOfUsers)}`
                : 'Custom'}
            </span>{' '}
            <span className="text-gray-500">(EX GST)</span>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 my-6">
        <Button variant="outline" type="button" onClick={onBack}>
          Back
        </Button>
        <Button
          className="cursor-pointer"
          type="button"
          onClick={handleNextClick}
          disabled={isNextDisabled()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
