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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { getRelativeTime, formatLocalDate } from '@/lib/utils/date';
import { getInitials } from '@/lib/utils/user-helper';
import { EditClientUserFormSchema } from './schemas/client-user-form-schema';
import { AlertTriangle } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';
import { User } from '@/lib/types/user';
import { notifyError } from '@/lib/toast';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';

type EditClientUserFormValues = z.infer<typeof EditClientUserFormSchema>;

type EditClientUserPayload = EditClientUserFormValues & {
  id?: number;
  clientId?: number;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  totalLogins?: number;
  quotationCreated?: number;
  updatedAt?: string | null;
};

interface EditClientUserFormProps {
  roles: readonly FormSelectOption[];
  currentUserId?: number | string;
  initialData?: User | null;
  onSave?: (updated: EditClientUserPayload) => void | Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
}

type StatusValue = EditClientUserFormValues['status'];

export function EditClientUserForm({
  roles,
  currentUserId,
  initialData,
  onSave,
  onCancel,
  onSuccess,
}: EditClientUserFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const fullName = initialData?.name.trim() || 'Unnamed User';

  // Convert groups array to role string
  const getRoleFromGroups = React.useCallback(
    (groups: string[] | undefined): string => {
      if (!groups || !Array.isArray(groups) || groups.length === 0) {
        return '';
      }

      const groupsStr = groups.join(',').toLowerCase();

      // Check in priority order
      if (
        groupsStr.includes('super_admin') ||
        groupsStr.includes('superadmin')
      ) {
        return 'SUPERADMIN';
      }
      if (groupsStr.includes('admin')) {
        return 'ADMIN';
      }
      return 'USER';
    },
    []
  );

  const defaultValues = React.useMemo<EditClientUserFormValues>(
    () => ({
      full_name: fullName,
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      role: getRoleFromGroups(initialData?.groups),
      status: normalizeStatus(initialData?.status),
    }),
    [
      fullName,
      initialData?.email,
      initialData?.phone,
      initialData?.groups,
      initialData?.status,
      getRoleFromGroups,
    ]
  );

  const form = useForm<EditClientUserFormValues>({
    resolver: zodResolver(EditClientUserFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const joinedDate = initialData?.createdAt || undefined;
  const formattedJoined = formatLocalDate(joinedDate);

  const lastLoginRelative = initialData?.lastLoginAt
    ? getRelativeTime(initialData.lastLoginAt)
    : 'Never';

  const totalLogins =
    typeof initialData?.totalLogins === 'number'
      ? initialData.totalLogins
      : 0;
  const quotations =
    typeof initialData?.quotationCreated === 'number'
      ? initialData.quotationCreated
      : 0;

  const disableRoleChange =
    currentUserId !== undefined &&
    initialData?.id !== undefined &&
    String(currentUserId) === String(initialData.id);

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const handleSubmit = async (values: EditClientUserFormValues) => {
    const normalizedPhone = values.phone?.trim() || '';

    const payload: EditClientUserPayload = {
      ...values,
      id: initialData?.id,
      clientId: initialData?.clientId,
      phone: normalizedPhone,
      createdAt: initialData?.createdAt,
      lastLoginAt: initialData?.lastLoginAt,
      totalLogins: initialData?.totalLogins,
      quotationCreated: initialData?.quotationCreated,
      updatedAt: initialData?.updatedAt,
    };

    try {
      await onSave?.(payload);
      form.reset({
        ...values,
        phone: normalizedPhone,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error updating client user:', error);
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
          messageFromErr || 'Failed to update client user. Please try again.',
      });
    }
  };

  useFormDialogFooter(
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
      <Button form="edit-client-user-form" type="submit">Save Changes</Button>
    </div>,
  );

  if (!initialData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No user selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-lg border border-border bg-[#F9FAFB] p-4 sm:p-5">
        <div
          className={
            isDesktop
              ? 'flex flex-row items-center gap-5'
              : 'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5'
          }
        >
          <Avatar className="size-14 bg-[#DBEAFE] text-lg font-semibold text-[#2563EB]">
            <AvatarFallback className="text-base font-semibold">
              {getInitials(fullName, initialData.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-lg font-semibold text-foreground">
              {fullName}
            </span>
            <span className="text-sm text-[#4B5563]">{initialData.email}</span>
            <span className="font-sm text-[#6B7280]">
              Joined: {formattedJoined}
            </span>
          </div>
        </div>
      </header>

      <Form {...form}>
        <form
          id="edit-client-user-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
        >
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                User Information
              </h3>
              <Separator className="mt-2" />
            </div>

            <div className={isDesktop ? 'grid gap-4 grid-cols-2' : 'space-y-4'}>
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
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-foreground">
                Role &amp; Status
              </h3>
              <Separator className="mt-2" />
            </div>

            <div
              className={
                isDesktop
                  ? 'grid gap-4 grid-cols-2 mt-4 mb-0'
                  : 'space-y-4 mt-4'
              }
            >
              <FormSelect<EditClientUserFormValues>
                control={form.control}
                name="role"
                label="Role*"
                searchLabel="role"
                options={roles}
                placeholder="Select role"
                showSearch={false}
                disabled={disableRoleChange}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        className={
                          isDesktop
                            ? 'flex flex-row gap-8'
                            : 'flex flex-col gap-2'
                        }
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="ACTIVE" id="status-active" />
                          <FormLabel
                            htmlFor="status-active"
                            className="font-normal"
                          >
                            Active
                          </FormLabel>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="INACTIVE"
                            id="status-inactive"
                          />
                          <FormLabel
                            htmlFor="status-inactive"
                            className="font-normal"
                          >
                            Inactive
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {disableRoleChange ? (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900 mt-0">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  You cannot change your own role.
                </AlertDescription>
              </Alert>
            ) : null}
          </section>

          <section className="space-y-4">
            <div
              className={
                isDesktop
                  ? 'flex flex-row items-center justify-between'
                  : 'flex flex-col gap-2'
              }
            >
              <div className={isDesktop ? 'w-4/5' : 'w-full'}>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Activity Summary
                </h3>
                <Separator />
              </div>
              <div className="text-[14px] text-[#18181B]">
                View Full Activity
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
          </section>

        </form>
      </Form>
    </div>
  );
}


function normalizeStatus(status: string | undefined | null): StatusValue {
  if (status === 'INACTIVE') return 'INACTIVE';
  return 'ACTIVE';
}
