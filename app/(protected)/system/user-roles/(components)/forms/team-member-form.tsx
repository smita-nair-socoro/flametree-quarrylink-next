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
import { getRelativeTime, formatDate } from '@/lib/utils/date';
import { EditTeamMemberFormSchema } from './schemas/team-member-form-schema';
import { useSelectedTeamMember } from '@/app/stores/team-member-store';
import { AlertTriangle } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

type EditTeamMemberFormValues = z.infer<typeof EditTeamMemberFormSchema>;

type EditTeamMemberPayload = EditTeamMemberFormValues & {
  id?: number;
  client_id?: number;
  created_at?: string | null;
  last_login_at?: string | null;
  total_logins?: number;
  quotation_created?: number;
  jobs_managed?: number;
  invited_by?: number;
  deletion_reason?: string;
  isDeleted?: boolean;
  updated_at?: string | null;
};

interface EditTeamMemberFormProps {
  roles: readonly FormSelectOption[];
  currentUserId?: number | string;
  onSave?: (updated: EditTeamMemberPayload) => void | Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
}

type StatusValue = EditTeamMemberFormValues['status'];

export function EditTeamMemberForm({
  roles,
  currentUserId,
  onSave,
  onCancel,
  onSuccess,
}: EditTeamMemberFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const initialData = useSelectedTeamMember();

  const fullName = initialData?.full_name.trim() || initialData?.email || '';

  const defaultValues = React.useMemo<EditTeamMemberFormValues>(
    () => ({
      full_name: fullName,
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      role: initialData?.role ?? '',
      status: normalizeStatus(initialData?.status),
    }),
    [
      fullName,
      initialData?.email,
      initialData?.phone,
      initialData?.role,
      initialData?.status,
    ]
  );

  const form = useForm<EditTeamMemberFormValues>({
    resolver: zodResolver(EditTeamMemberFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const joinedDate = initialData?.created_at || undefined;
  const formattedJoined = joinedDate
    ? formatDate(joinedDate, 'd MMM yyyy')
    : '—';

  const lastLoginRelative = initialData?.last_login_at
    ? getRelativeTime(initialData.last_login_at)
    : 'Never';

  const totalLogins =
    typeof initialData?.total_logins === 'number'
      ? initialData.total_logins
      : 0;
  const quotations =
    typeof initialData?.quotation_created === 'number'
      ? initialData.quotation_created
      : 0;
  const jobs =
    typeof initialData?.jobs_managed === 'number'
      ? initialData.jobs_managed
      : 0;

  const disableRoleChange =
    currentUserId !== undefined &&
    initialData?.id !== undefined &&
    String(currentUserId) === String(initialData.id);

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const handleSubmit = async (values: EditTeamMemberFormValues) => {
    const normalizedPhone = values.phone?.trim() || '';

    const payload: EditTeamMemberPayload = {
      ...values,
      id: initialData?.id,
      client_id: initialData?.client_id,
      phone: normalizedPhone,
      created_at: initialData?.created_at,
      last_login_at: initialData?.last_login_at,
      total_logins: initialData?.total_logins,
      quotation_created: initialData?.quotation_created,
      jobs_managed: initialData?.jobs_managed,
      invited_by: initialData?.invited_by,
      deletion_reason: initialData?.deletion_reason,
      isDeleted: initialData?.isDeleted,
      updated_at: initialData?.updated_at,
    };

    await onSave?.(payload);
    form.reset({
      ...values,
      phone: normalizedPhone,
    });
    onSuccess?.();
  };

  if (!initialData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No team member selected</p>
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
              {getInitials(fullName)}
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
                    <FormLabel>Email Address (Cannot be changed)</FormLabel>
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
                <p className="text-sm">Jobs Managed: {jobs.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {isDesktop && <Separator />}

          {isDesktop && (
            <div className="flex flex-row justify-end gap-2 mb-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col gap-3 mb-3">
              <Button type="submit">Save Changes</Button>
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

function getInitials(name: string | undefined): string {
  if (!name) return '?';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials.slice(0, 2) || '?';
}

function normalizeStatus(status: string | undefined | null): StatusValue {
  if (status === 'INACTIVE') return 'INACTIVE';
  return 'ACTIVE';
}
