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
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { InviteUserFormSchema } from './schemas/invite-user-form-schema';
import { UserPlus, Loader2 } from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/toast';
import { useCreateUser } from '@/lib/api/user';
import { User, UserCreateDTO } from '@/lib/types/user';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { addNewRecordId } from '@/lib/utils';

interface InviteUserFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  roleOptions: readonly FormSelectOption[];
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function InviteUserForm({
  onCancel,
  onSuccess,
  roleOptions,
  onDirtyChange,
}: InviteUserFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

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

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

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
        confirmed: true,
      };

      console.log('Creating user with data:', userData);

      // Call the API to create user
      const newUser = await createUserMutation.mutateAsync(userData);

      // Add the new record identifiers to sessionStorage for highlighting/pinning
      if (newUser) {
        const u = newUser as User;
        if (typeof u.id === 'number') {
          addNewRecordId('team_member_data_table', u.id);
        }
        if (typeof u.sub === 'string') {
          addNewRecordId('team_member_data_table', u.sub);
        }
      }

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
      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;

      // Duplicate email (HTTP 409)
      const duplicateEmailPhrase = `Key (email)=(${data.email}) already exists`;
      const isDuplicateEmail =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateEmailPhrase);

      if (isDuplicateEmail) {
        const msg = `User with email "${data.email}" already exists.`;
        notifyError('Invitation Failed', { description: msg });
        form.setError('email', { type: 'manual', message: msg });
        return;
      }

      // Fallback error using extracted message
      notifyError('Invitation Failed', {
        description:
          messageFromErr || 'Failed to invite user. Please try again.',
      });
    }
  };

  // Handle form validation errors
  function onError(errors: unknown) {
    console.error('Invite User validation errors:', errors);
    notifyError('Invitation Failed');
  }

  const isSubmitting = createUserMutation.isPending;

  useFormDialogFooter(
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        form="invite-user-form"
        type="submit"
        className="bg-[#8E51FF] hover:bg-[#7a42e6] text-white cursor-pointer"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
      </Button>
    </div>,
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
            isSubmitting && 'pointer-events-none',
          )}
        >
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
                Send an invitation to join QuarryLink
              </p>
            </div>
          </div>

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
                <FormLabel>Phone Number</FormLabel>
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

          <div className="flex flex-col gap-5">
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
          </div>

        </form>
      </Form>
    </div>
  );
}
