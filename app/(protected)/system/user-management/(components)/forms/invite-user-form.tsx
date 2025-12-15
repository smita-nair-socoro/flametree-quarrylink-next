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
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { InviteUserFormSchema } from './schemas/invite-user-form-schema';
import { AlertTriangle, UserPlus, Loader2 } from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/toast';
import { useCreateUser } from '@/lib/api/user';
import { UserCreateDTO } from '@/lib/types/user';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

interface InviteUserFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  teamMemberCount: number;
  roleOptions: readonly FormSelectOption[];
}

export default function InviteUserForm({
  onCancel,
  onSuccess,
  teamMemberCount,
  roleOptions,
}: InviteUserFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [agreedToBilling, setAgreedToBilling] = React.useState(false);

  const isOverLimit = teamMemberCount >= 10;
  const PLAN_LIMIT = 10;
  const ADDITIONAL_USER_COST = 116;

  // Use the create user mutation
  const createUserMutation = useCreateUser();

  const form = useForm<z.infer<typeof InviteUserFormSchema>>({
    resolver: zodResolver(InviteUserFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      role: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof InviteUserFormSchema>) => {
    console.log('Invite user data:', data);

    try {
      // Convert frontend Role enum to backend format
      const roleToBackend = (role: string): string => {
        if (role === 'SUPERADMIN') return 'SUPER_ADMIN';
        return role; // USER and ADMIN remain the same
      };

      // Map form data to backend API structure
      const userData: UserCreateDTO = {
        email: data.email,
        name: data.full_name,
        phone: data.phone || undefined,
        role: roleToBackend(data.role), // Backend expects: "USER", "ADMIN", "SUPER_ADMIN"
        confirmed: false, // New users are unconfirmed/pending until they accept invitation
      };

      console.log('Creating user with data:', userData);

      // Call the API to create user
      await createUserMutation.mutateAsync(userData);

      // Show success toast
      notifySuccess('User Invited', {
        description: `Invitation sent to ${data.email}`,
      });

      // Reset form
      form.reset();

      // On success, call onSuccess to close the dialog
      onSuccess?.();
    } catch (error) {
      console.error('Error inviting user:', error);
      const errorMessage = extractErrorMessage(error);
      notifyError('Invitation Failed', { description: errorMessage });
    }
  };

  // Handle form validation errors
  function onError(errors: unknown) {
    console.error('Invite User validation errors:', errors);
    notifyError('Invitation Failed');
  }

  const isSubmitting = createUserMutation.isPending;

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
          id="invite-user-form"
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className={cn(
            'space-y-1 px-2',
            isSubmitting && 'pointer-events-none'
          )}
        >
          {/* Conditional Header Section */}
          {!isOverLimit ? (
            <div className="flex items-center gap-3 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F9FF]">
                <UserPlus className="h-6 w-6 text-[#0284C7]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-[#101828]">
                    Add New Team Member
                  </h3>
                </div>
                <p className="text-sm text-[#6A7282]">
                  Send an invitation to join your workspace
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#FF8C00] bg-[#FFF4E6] p-3 mb-3">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-[#FF8C00] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[16px] text-[#FF8C00]">
                    User limit reached
                  </h4>
                  <p className="text-[14px] text-[#FF8C00]">
                    You've reached your plan limit of {PLAN_LIMIT} users. Adding
                    this user will incur an additional charge of $
                    {ADDITIONAL_USER_COST}/month per user.
                  </p>
                </div>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="full_name"
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
                  <Input placeholder="john.smith@company.com" {...field} />
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
                    placeholder="+1 (555) 123-4567"
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
            options={roleOptions}
            placeholder="Select role..."
            showSearch={false}
          />

          {/* Conditional Bottom Section */}
          {!isOverLimit ? (
            <div className="rounded-lg border border-[#0284C7] bg-[#F0F9FF] p-4">
              <div className="flex gap-3">
                <UserPlus className="h-5 w-5 text-[#0284C7] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#0284C7]">
                    Invitation Details
                  </h4>
                  <p className="text-sm font-normal text-[#0284C7]">
                    An email invitation will be sent to the user with
                    instructions to set up their account and access the
                    workspace.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 mb-3">
              <h4 className="text-sm font-medium text-[#364153]">
                Billing Summary
              </h4>
              <div className="space-y-2 text-sm text-normal">
                <div className="flex justify-between">
                  <span className="text-[#6A7282]">Current users:</span>
                  <span className="font-medium text-[#364153]">
                    {teamMemberCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A7282]">Plan limit:</span>
                  <span className="font-medium text-[#364153]">
                    {PLAN_LIMIT} users
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A7282]">Additional users:</span>
                  <span className="font-medium text-[#364153]">1</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm text-[#364153] font-semibold">
                  <span>Additional monthly cost:</span>
                  <span>${ADDITIONAL_USER_COST.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {isOverLimit && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="billing-agreement"
                checked={agreedToBilling}
                onCheckedChange={(checked) =>
                  setAgreedToBilling(checked === true)
                }
              />
              <label
                htmlFor="billing-agreement"
                className="text-sm text-muted-foreground leading-tight cursor-pointer"
              >
                I understand that adding this user will increase my monthly
                subscription cost by ${ADDITIONAL_USER_COST}. This charge will
                be reflected in my next billing cycle.
              </label>
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex justify-between gap-2 mb-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              form="invite-user-form"
              type="submit"
              className="flex-1 bg-[#8E51FF] hover:bg-[#7a42e6] text-white cursor-pointer"
              disabled={isSubmitting || (isOverLimit && !agreedToBilling)}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting
                ? 'Sending Invitation...'
                : isOverLimit
                ? 'Confirm & Send Invitation'
                : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
