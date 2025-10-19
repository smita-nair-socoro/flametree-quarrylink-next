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
import { ChangePasswordSchema } from './schemas/change-password-schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import rawJson from '@/lib/tests/personalInformationResponseData.json';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { User } from '@/lib/types/user';

const convertedJson = convertKeysToSnakeCase(rawJson);
const { full_name, email, phone, created_at, last_login_at } =
  convertedJson as User;

export default function SettingsTab() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const settingsForm = useForm<z.infer<typeof PersonalInformationSchema>>({
    resolver: zodResolver(PersonalInformationSchema),
    defaultValues: {
      full_name: full_name,
      phone: phone,
      created_at: new Date(created_at),
      last_login_at: new Date(last_login_at),
    },
  });

  const changePasswordForm = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((name) => name[0].toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmitPersonalInformation(
    values: z.infer<typeof PersonalInformationSchema>
  ) {
    console.log('onSubmit function called!');
    console.log('Form is valid:', settingsForm.formState.isValid);
    console.log('Form errors:', settingsForm.formState.errors);
    console.log('Form data:', values);

    setIsSubmitting(true);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
  }

  async function onSubmitChangePassword(
    values: z.infer<typeof ChangePasswordSchema>
  ) {
    console.log('onSubmit function called!');
    console.log('Form is valid:', changePasswordForm.formState.isValid);
    console.log('Form errors:', changePasswordForm.formState.errors);
    console.log('Form data:', values);

    setIsSubmitting(true);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    changePasswordForm.reset();
    setIsSubmitting(false);
  }

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
              Updating Settings...
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
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
                  isSubmitting && 'pointer-events-none'
                )}
                onSubmit={settingsForm.handleSubmit(
                  onSubmitPersonalInformation
                )}
              >
                <div className="flex flex-col">
                  {/* Full Name */}
                  <div className="flex justify-start gap-2">
                    <div className="w-22 h-20 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                      <span className="text-xl text-[#2563EB] font-medium">
                        {getInitials(full_name)}
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
                    <Input className="w-full" value={email} disabled />
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
                  <div className="flex flex-col gap-1">
                    <span>
                      Last Login:{' '}
                      {new Date(last_login_at).toLocaleDateString('en-AU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </span>
                    <span>
                      Created On:{' '}
                      {new Date(created_at).toLocaleDateString('en-AU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-fit mt-4 cursor-pointer"
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

        {/* Change Password */}
        <Card>
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
                  onSubmitChangePassword
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
                          className="w-full"
                          placeholder="Enter Confirm Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-fit mt-4 cursor-pointer"
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
        </Card>
      </div>
    </div>
  );
}
