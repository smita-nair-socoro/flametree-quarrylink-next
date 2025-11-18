'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ClientFormSchema } from '../schemas/client-form-schema';
import z from 'zod';

interface Step3SummaryProps {
  form: UseFormReturn<z.infer<typeof ClientFormSchema>>;
  isDesktop: boolean;
  isSubmitting: boolean;
  numberOfUsers: number;
  paymentTerm: 'Monthly' | 'Yearly';
  currentUnitPrice: string;
  onBack: () => void;
  onCancel?: () => void;
}

export default function Step3Summary({
  form,
  isDesktop,
  isSubmitting,
  numberOfUsers,
  paymentTerm,
  currentUnitPrice,
  onBack,
  onCancel,
}: Step3SummaryProps) {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <h1 className="text-xl font-semibold mb-1">Summary</h1>
      <Separator className="mb-4" />

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[#E5E5E5] bg-white p-4 rounded-lg flex flex-col gap-2">
          <span>Company Details</span>
          <div className="flex flex-col gap-1 text-sm text-[#737373]">
            <span>{form.getValues('name')}</span>
            <span>ABN: {form.getValues('abn')}</span>
            <span>Contact: {form.getValues('contact_name')}</span>
            <span>Email: {form.getValues('email')}</span>
            <span>Phone: {form.getValues('phone')}</span>
          </div>
        </div>
        <div className="border border-[#E5E5E5] bg-white p-4 rounded-lg flex flex-col gap-2">
          <span>Subscription Details</span>
          <div className="flex flex-col gap-1 text-sm text-[#737373]">
            <span>
              QuarryLink {form.getValues('subscription')} Subscription
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
              QuarryLink {form.getValues('subscription')} ({paymentTerm})
            </span>
            <span className="text-sm font-normal">
              ${formatCurrency(Number(currentUnitPrice) * numberOfUsers)}
            </span>
          </div>
          <div className="flex justify-between py-4 px-4 bg-slate-50 border-b border-[#E5E5E5]">
            <span className="text-sm font-normal">GST (10%)</span>
            <span className="text-sm font-normal">
              ${formatCurrency(Number(currentUnitPrice) * numberOfUsers * 0.1)}
            </span>
          </div>
          <div className="flex justify-between py-4 px-4 bg-slate-100">
            <span className="text-sm font-semibold">
              Total {paymentTerm} Invoice:
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

      {/* Form Actions */}
      {isDesktop && (
        <div className="flex justify-end space-x-2 my-6">
          <Button variant="outline" type="button" onClick={onBack}>
            Back
          </Button>
          <Button
            form="add-new-client-form"
            className="cursor-pointer"
            type="submit"
            disabled={isSubmitting}
          >
            Add Client
          </Button>
        </div>
      )}

      {!isDesktop && (
        <div className="flex flex-col col-span-2 gap-3 mb-6">
          <Button type="submit" className="cursor-pointer">
            Add Client
          </Button>
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </>
  );
}
