'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
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
import { getRelativeTime } from '@/lib/utils/date';
import { EditTeamMemberFormSchema } from './schemas/team-member-form-schema';
import { useSelectedTeamMember } from '@/app/stores/team-member-store';

type EditTeamMemberFormValues = z.infer<typeof EditTeamMemberFormSchema>;

type EditTeamMemberPayload = EditTeamMemberFormValues & {
  id?: number;
  user_name?: string | null;
  created_at?: string | null;
  joined_at?: string | null;
  last_login_at?: string | null;
  total_logins?: number | null;
  quotation_created?: number | null;
  jobs_managed?: number | null;
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

interface StatItemProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

const StatItem = ({ label, value, hint }: StatItemProps) => (
  <div className="rounded-lg border border-border bg-muted/30 p-4">
    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
      {label}
    </p>
    <p className="text-lg font-semibold text-foreground">{value}</p>
    {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);

export function EditTeamMemberForm({
  roles,
  currentUserId,
  onSave,
  onCancel,
  onSuccess,
}: EditTeamMemberFormProps) {
  const initialData = useSelectedTeamMember();

  const fullName =
    initialData?.full_name?.trim() ||
    initialData?.user_name?.trim() ||
    initialData?.email ||
    '';

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

  const joinedDate =
    initialData?.joined_at || initialData?.created_at || undefined;
  const formattedJoined = joinedDate
    ? formatDate(joinedDate, 'd MMM yyyy')
    : '—';

  const lastLoginRelative = initialData?.last_login_at
    ? getRelativeTime(initialData.last_login_at)
    : 'Never';
  const lastLoginExact = initialData?.last_login_at
    ? formatDate(initialData.last_login_at, 'd MMM yyyy, h:mm a')
    : 'No login recorded';

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
      phone: normalizedPhone,
      user_name: values.full_name,
      created_at: initialData?.created_at,
      joined_at: initialData?.joined_at,
      last_login_at: initialData?.last_login_at,
      total_logins: initialData?.total_logins,
      quotation_created: initialData?.quotation_created,
      jobs_managed: initialData?.jobs_managed,
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
      <header className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <Avatar className="size-14 bg-primary/10 text-lg font-semibold text-primary">
            <AvatarFallback className="text-base font-semibold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-lg font-semibold text-foreground">
              {fullName}
            </span>
            <span className="text-sm text-muted-foreground">
              {initialData?.email}
            </span>
          </div>
          <div className="text-sm text-muted-foreground sm:text-right">
            <span className="font-medium text-foreground">Joined:</span>{' '}
            {formattedJoined}
          </div>
        </div>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                User Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Fine tune the basics they see on profile and outbound
                communications.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
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
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} disabled readOnly />
                    </FormControl>
                    <FormDescription>Cannot be changed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-foreground">
                Role &amp; Status
              </h3>
              <p className="text-sm text-muted-foreground">
                Adjust the level of access and whether this account can sign in.
              </p>
            </div>

            {disableRoleChange ? (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertDescription className="text-sm">
                  You cannot change your own role.
                </AlertDescription>
              </Alert>
            ) : null}

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
                <FormItem className="space-y-3">
                  <FormLabel>Account Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex flex-col gap-2 sm:flex-row sm:gap-6"
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
                        <RadioGroupItem value="INACTIVE" id="status-inactive" />
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
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Activity Summary
                </h3>
                <p className="text-sm text-muted-foreground">
                  Snapshot of their recent platform engagement.
                </p>
              </div>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-primary"
              >
                View Full Activity
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <StatItem
                  label="Last Login"
                  value={lastLoginRelative}
                  hint={lastLoginExact}
                />
                <StatItem
                  label="Total Logins"
                  value={totalLogins.toLocaleString()}
                />
              </div>
              <div className="space-y-3">
                <StatItem
                  label="Quotations Created"
                  value={quotations.toLocaleString()}
                />
                <StatItem label="Jobs Managed" value={jobs.toLocaleString()} />
              </div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              className="sm:w-auto"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="sm:w-auto">
              Save Changes
            </Button>
          </div>
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

function formatDate(value: string | number | Date, pattern: string): string {
  try {
    return format(new Date(value), pattern);
  } catch {
    return '—';
  }
}
