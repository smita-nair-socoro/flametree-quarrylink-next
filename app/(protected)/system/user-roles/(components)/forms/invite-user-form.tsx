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
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import React from 'react';
import {
  InviteUserFormSchema,
  InviteUserFormValues,
} from './schemas/invite-user-form-schema';

const ROLE_OPTIONS: FormSelectOption[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
  { label: 'Manager', value: 'manager' },
  { label: 'Viewer', value: 'viewer' },
];

interface InviteUserFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function InviteUserForm({
  onCancel,
  onSuccess,
}: InviteUserFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(InviteUserFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'user',
    },
  });

  const onSubmit = async (data: InviteUserFormValues) => {
    console.log('Invite user data:', data);

    setIsSubmitting(true);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);

    // TODO: Add actual API call here
    // On success, call onSuccess to close the dialog
    onSuccess?.();
  };

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
              Sending Invitation...
            </p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('space-y-1', isSubmitting && 'pointer-events-none')}
        >
          <p className="text-sm text-muted-foreground mb-6">
            Send an invitation to a new team member with their assigned role and
            contact information.
          </p>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name*</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address*</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john.smith@company.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone Number{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
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

          <FormSelect
            control={form.control}
            name="role"
            label="Role*"
            searchLabel="role"
            options={ROLE_OPTIONS}
            placeholder="Select role"
            showSearch={false}
          />

          <Separator className="my-4" />

          <div className="flex justify-end gap-2 mb-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="bg-[#8E51FF] hover:bg-[#7a42e6] text-white"
              disabled={isSubmitting}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
