'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { PersonalInformationSchema } from './schemas/personal-information-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
// import { ChangePasswordSchema } from './schemas/change-password-schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { notifySuccess, notifyError } from '@/lib/toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import {
  UserDetailQueryOptions,
  useUpdateUser,
  // useChangePassword,
} from '@/lib/api/user';
import { TenantInternalDetailsQueryOptions } from '@/lib/api/tenant';
import { useTenantCurrencyTax } from '@/lib/utils/currency-tax-helper';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { Info } from 'lucide-react';

const DEFAULT_TIMEZONE = 'Australia/Sydney';

/** Currency code -> display name, e.g. "AUD" -> "Australian Dollar". */
function getCurrencyName(currencyCode: string): string {
  try {
    return (
      new Intl.DisplayNames(['en'], { type: 'currency' }).of(currencyCode) ||
      currencyCode
    );
  } catch {
    return currencyCode;
  }
}

/** IANA timezone id -> "Australia/Sydney (UTC+10:00)". */
function getTimezoneLabel(timeZoneId: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneId,
      timeZoneName: 'longOffset',
    }).formatToParts(new Date());
    const offset =
      parts.find((part) => part.type === 'timeZoneName')?.value || '';
    return `${timeZoneId} (${offset.replace('GMT', 'UTC')})`;
  } catch {
    return timeZoneId;
  }
}
import { getInitials } from '@/lib/utils/user-helper';

export default function SettingsTab() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { user: authUser } = useAuth();

  // Fetch current user's detailed data using their Cognito sub
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    ...UserDetailQueryOptions(authUser?.userId || ''),
    enabled: !!authUser?.userId,
  });

  // Use update user mutation
  const updateUserMutation = useUpdateUser();

  // Fetch tenant (workspace) settings - currency, tax, timezone
  const { data: tenantDetails } = useQuery(TenantInternalDetailsQueryOptions());
  const { currencyCode, taxLabel, taxPercentage } = useTenantCurrencyTax();
  const currencyName = getCurrencyName(currencyCode);
  const timezoneLabel = getTimezoneLabel(
    tenantDetails?.timeZoneId || DEFAULT_TIMEZONE,
  );

  // Use change password mutation
  // const changePasswordMutation = useChangePassword();

  const settingsForm = useForm<z.infer<typeof PersonalInformationSchema>>({
    resolver: zodResolver(PersonalInformationSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      created_at: '',
      last_login_at: '',
    },
  });

  // Update form when user data loads
  React.useEffect(() => {
    if (currentUser) {
      settingsForm.reset({
        full_name: currentUser.name || '',
        phone: currentUser.phone || '',
        created_at: '',
        last_login_at: '',
      });
    }
  }, [currentUser, settingsForm]);

  // const changePasswordForm = useForm<z.infer<typeof ChangePasswordSchema>>({
  //   resolver: zodResolver(ChangePasswordSchema),
  //   defaultValues: {
  //     current_password: '',
  //     new_password: '',
  //     confirm_password: '',
  //   },
  // });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmitPersonalInformation(
    values: z.infer<typeof PersonalInformationSchema>,
  ) {
    if (!currentUser?.sub) {
      notifyError('User not found');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert frontend role to backend format (if groups exist)
      const roleToBackend = (groups: string[] | undefined): string => {
        if (!groups || groups.length === 0) return 'USER';
        const groupsStr = groups.join(',').toLowerCase();
        if (
          groupsStr.includes('super_admin') ||
          groupsStr.includes('superadmin')
        ) {
          return 'SUPER_ADMIN';
        }
        if (groupsStr.includes('admin')) {
          return 'ADMIN';
        }
        return 'USER';
      };

      const updateData = {
        name: values.full_name,
        phone: values.phone || undefined,
        role: roleToBackend(currentUser.groups),
      };

      // Call the API to update user
      await updateUserMutation.mutateAsync({
        id: currentUser.sub,
        data: updateData,
      });

      // Show success toast
      notifySuccess('Profile Updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;

      // Check for specific error codes if needed
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
          messageFromErr || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Personal Information form validation errors
  function onErrorPersonalInformation(errors: unknown) {
    console.error('Personal Information validation errors:', errors);
    notifyError('Update Failed');
  }

  // async function onSubmitChangePassword(
  //   values: z.infer<typeof ChangePasswordSchema>
  // ) {
  //   if (!currentUser?.sub) {
  //     notifyError('User not found');
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);

  //     // Call the API to change password
  //     await changePasswordMutation.mutateAsync({
  //       oldPassword: values.current_password,
  //       newPassword: values.new_password,
  //     });

  //     notifySuccess('Password Changed');
  //     changePasswordForm.reset();
  //   } catch (error) {
  //     console.error('Error changing password:', error);
  //     notifyError('Password Change Failed', {
  //       description: extractErrorMessage(error),
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }

  // // Handle Change Password form validation errors
  // function onErrorChangePassword(errors: unknown) {
  //   console.error('Change Password validation errors:', errors);
  //   notifyError('Please fix the validation errors before submitting.');
  // }

  // Show loading state while fetching user
  if (isLoadingUser) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Spinner size="medium" />
        <p className="text-lg text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

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
              Updating Settings...
            </p>
          </div>
        </div>
      )}
      <div className="py-3 space-y-3">
        <h2 className="text-2xl font-semibold">Account Settings</h2>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-medium -mb-3">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...settingsForm}>
              <form
                id="update-personal-information-form"
                className={cn(
                  'p-1 w-full flex flex-col',
                  isSubmitting && 'pointer-events-none',
                )}
                onSubmit={settingsForm.handleSubmit(
                  onSubmitPersonalInformation,
                  onErrorPersonalInformation,
                )}
              >
                <div className="flex flex-col">
                  {/* Full Name */}
                  <div className="flex justify-start gap-2">
                    <div className="w-20 h-20 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl text-[#2563EB] font-medium">
                        {getInitials(currentUser?.name, currentUser?.email)}
                      </span>
                    </div>
                    <FormField
                      control={settingsForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem className="w-full mt-3">
                          <FormLabel>Full Name*</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              placeholder="Enter Full Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col mt-3 gap-2">
                    <Label>Email Address (Cannot be changed)</Label>
                    <Input
                      className="w-full"
                      value={currentUser?.email || ''}
                      disabled
                    />
                  </div>

                  {/* Phone */}
                  <FormField
                    control={settingsForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="w-full mt-5">
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <PhoneInput
                            className="w-full"
                            defaultCountry="AU"
                            placeholder="Enter Phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Audit Information */}
                  {/* <div className="flex flex-col gap-1">
                    <span className="text-sm text-[#4B5563]">
                      Last Login:
                    </span>
                    <span className="text-sm text-[#4B5563]">
                      Created On:
                    </span>
                  </div> */}
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-fit mt-4 cursor-pointer"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Workspace Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-medium -mb-3">
              Workspace Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Currency</Label>
                <Input className="w-full" value={currencyCode} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Currency Name</Label>
                <Input className="w-full" value={currencyName} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tax Rate</Label>
                <Input
                  className="w-full"
                  value={`${taxPercentage}%`}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tax Label</Label>
                <Input className="w-full" value={taxLabel} disabled />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Timezone</Label>
                <Input className="w-full" value={timezoneLabel} disabled />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F5F3FF] px-4 py-3 text-sm text-[#7C3AED]">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>
                These values are configured by QuarryLink support team and
                cannot be changed here.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-medium -mb-3">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...changePasswordForm}>
              <form
                id="change-password-form"
                className="w-full flex flex-col p-1"
                onSubmit={changePasswordForm.handleSubmit(
                  onSubmitChangePassword,
                  onErrorChangePassword
                )}
              >
                <FormField
                  control={changePasswordForm.control}
                  name="current_password"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Current Password*</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="w-full"
                          placeholder="Enter Current Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>New Password*</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="w-full"
                          placeholder="Enter New Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Confirm Password*</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="w-full"
                          placeholder="Enter Confirm Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-muted-foreground mt-1 mb-1">
                  <div className="font-medium mb-1">Password Requirements:</div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>At least 8 characters long</li>
                    <li>Contains uppercase and lowercase letters</li>
                    <li>Contains at least one number</li>
                    <li>Contains at least one special character (@$!%*?&)</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-fit mt-4 cursor-pointer"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {isSubmitting ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
