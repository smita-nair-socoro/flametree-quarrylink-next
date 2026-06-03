'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { EditTeamMemberFormSchema } from './schemas/team-member-form-schema';
import { useSelectedTeamMember } from '@/app/stores/team-member-store';
import { useUserStore } from '@/app/stores/user-store';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TableBadges } from '@/components/table-badges';
import { notifySuccess, notifyError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@tanstack/react-query';
import { UserDetailQueryOptions, useUpdateUser } from '@/lib/api/user';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import {
  isUserSuperAdmin,
  getRoleValueFromGroups,
  getInitials,
} from '@/lib/utils/user-helper';

type EditTeamMemberFormValues = z.infer<typeof EditTeamMemberFormSchema>;

type EditTeamMemberPayload = EditTeamMemberFormValues & {
  id?: number;
  clientId?: number;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  totalLogins?: number;
  quotationCreated?: number;
  updatedAt?: string | null;
  status?: string | null;
};

interface EditTeamMemberFormProps {
  roles: readonly FormSelectOption[];
  onSave?: (updated: EditTeamMemberPayload) => void | Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function EditTeamMemberForm({
  roles,
  onCancel,
  onSuccess,
  onDirtyChange,
}: EditTeamMemberFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isSuperAdmin = useUserStore((state) => state.isSuperAdmin());
  const selectedUser = useSelectedTeamMember(); // User from store (basic data from list)

  // Use the update user mutation
  const updateUserMutation = useUpdateUser();

  // Fetch detailed user data by ID (using sub as the ID)
  const {
    data: detailedUser,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery({
    ...UserDetailQueryOptions(selectedUser?.sub || ''),
    enabled: !!selectedUser?.sub, // Only fetch if we have a sub (user ID)
  });

  // Use detailed data if available, fallback to store data
  const initialData = detailedUser || selectedUser;

  const fullName = initialData?.name?.trim() || 'Unnamed User';

  const defaultValues = React.useMemo<EditTeamMemberFormValues>(() => {
    const role = getRoleValueFromGroups(initialData?.groups);

    return {
      full_name: fullName,
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      role: role,
      status: initialData?.status,
    };
  }, [
    fullName,
    initialData?.email,
    initialData?.phone,
    initialData?.groups,
    initialData?.status,
  ]);

  const form = useForm<EditTeamMemberFormValues>({
    resolver: zodResolver(EditTeamMemberFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const isTargetSuperAdmin = isUserSuperAdmin(initialData?.groups);

  // Only block role change when a non-super-admin is editing a super admin
  const disableRoleChange = !isSuperAdmin && isTargetSuperAdmin;

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const handleSubmit = async (values: EditTeamMemberFormValues) => {
    if (!initialData?.sub) {
      notifyError('No user ID found');
      return;
    }

    try {
      // Convert frontend role to backend format
      const roleToBackend = (role: string): string => {
        if (role === 'SUPERADMIN') return 'SUPER_ADMIN';
        return role; // USER and ADMIN remain the same
      };

      const normalizedPhone = values.phone?.trim() || '';

      // Create UserUpdateDTO matching backend structure
      const updateData = {
        name: values.full_name,
        phone: normalizedPhone || undefined,
        role: roleToBackend(values.role),
      };

      // Call the API to update user (use sub as the ID)
      await updateUserMutation.mutateAsync({
        id: initialData.sub, // sub is already a string
        data: updateData,
      });

      // Reset form with updated values
      form.reset({
        ...values,
        phone: normalizedPhone,
      });

      // Show success toast
      notifySuccess('User Updated');
      onSuccess?.();
    } catch (error) {
      console.error('Error updating team member:', error);
      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;

      // Check for specific error codes if needed
      // For example, duplicate email (409) or permission errors (403)
      if (codeStr === '409') {
        const msg = 'User with this information already exists.';
        notifyError('Update Failed', {
          description: msg,
        });
        return;
      }

      // Fallback error using extracted message
      notifyError('Update Failed', {
        description:
          messageFromErr || 'Failed to update user. Please try again.',
      });
    }
  };

  // Handle form validation errors
  const handleError = (errors: unknown) => {
    console.error('Team Member validation errors:', errors);
    notifyError('Update Failed');
  };

  // Use mutation's pending state for loading indicator
  const isSubmitting = updateUserMutation.isPending;

  // Show loading state while fetching details
  if (isLoadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Spinner size="medium" />
        <p className="text-lg text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

  // Show error if details fetch failed
  if (detailsError) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load user details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show message if no user selected
  if (!initialData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No team member selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative">
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
              Updating User...
            </p>
          </div>
        </div>
      )}

      <header className="rounded-lg border border-border bg-[#F9FAFB] p-4 sm:p-5">
        <div
          className={
            isDesktop
              ? 'flex flex-row items-center gap-5'
              : 'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5'
          }
        >
          <Avatar className="size-14 bg-[#DBEAFE] text-lg font-semibold text-[#2563EB]">
            <AvatarFallback className="bg-[#DBEAFE] text-base font-semibold text-[#2563EB]">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-lg font-semibold text-foreground">
              {fullName}
            </span>
            <TableBadges names={initialData.status} visibleCount={1} />
            <span className="text-[16px] text-[#4B5563]">
              {initialData.email}
            </span>
            {/* <span className="text-[14px] text-[#6B7280]">
              Joined: {formattedJoined}
            </span> */}
          </div>
        </div>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, handleError)}
          className={cn(
            'flex flex-col gap-2 mt-2',
            isSubmitting && 'pointer-events-none'
          )}
        >
          <section className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                User Information
              </h3>
              <Separator className="mt-2" />
            </div>

            <div className={isDesktop ? 'grid gap-2 grid-cols-2' : 'space-y-4'}>
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jane Smith"
                        autoFocus={false}
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="AU"
                        placeholder="e.g. +61 400 000 000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={isDesktop ? 'col-span-2' : ''}>
                    <FormLabel>Email Address* (Cannot be changed)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-0">
              <h3 className="text-base font-semibold text-foreground">
                Role &amp; Status
              </h3>
              <Separator className="mt-2" />
            </div>

            <div className={isDesktop ? 'mt-4 mb-0' : 'space-y-4 mt-4'}>
              <FormSelect<EditTeamMemberFormValues>
                control={form.control}
                name="role"
                label="Role*"
                searchLabel="role"
                options={roles}
                placeholder="Select role"
                showSearch={false}
                disabled={disableRoleChange}
              />
            </div>

            {!isSuperAdmin && isTargetSuperAdmin && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900 mt-0">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  You cannot change a Super Admin&apos;s role.
                </AlertDescription>
              </Alert>
            )}
          </section>

          {/* <section className="space-y-4">
            <div
              className={
                isDesktop
                  ? 'flex flex-row items-center justify-between'
                  : 'flex flex-col gap-2'
              }
            >
              <div className="w-full">
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Activity Summary
                </h3>
                <Separator />
              </div>
            </div>

            <div className={isDesktop ? 'grid gap-4 grid-cols-2' : 'space-y-4'}>
              <div className="space-y-3">
                <p className="text-sm">Last Login: {lastLoginRelative}</p>
                <p className="text-sm">
                  Total Logins: {totalLogins.toLocaleString()} times
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm">
                  Quotations Created: {quotations.toLocaleString()}
                </p>
              </div>
            </div>
          </section> */}

          {isDesktop && <Separator />}

          {isDesktop && (
            <div className="flex flex-row justify-end gap-2 mb-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col gap-3 mb-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
