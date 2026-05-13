'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { confirmResetPassword } from 'aws-amplify/auth';
import { notifySuccess, notifyError } from '@/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import Image from 'next/image';

interface ResetPasswordConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
}

const resetPasswordConfirmationSchema = z
  .object({
    confirmationCode: z
      .string()
      .nonempty({ message: 'Confirmation code is required' })
      .min(6, { message: 'Confirmation code must be at least 6 characters' }),
    newPassword: z
      .string()
      .nonempty({ message: 'New password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            'Password must contain uppercase, lowercase, number, and special character',
        }
      ),
    confirmPassword: z
      .string()
      .nonempty({ message: 'Please confirm your password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function ResetPasswordConfirmationModal({
  isOpen,
  onClose,
  email,
  onSuccess,
}: ResetPasswordConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordConfirmationSchema>>({
    resolver: zodResolver(resetPasswordConfirmationSchema),
    defaultValues: {
      confirmationCode: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onSubmit',
  });

  async function onSubmit(
    values: z.infer<typeof resetPasswordConfirmationSchema>
  ) {
    setIsLoading(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: values.confirmationCode,
        newPassword: values.newPassword,
      });

      notifySuccess(
        'Password reset successfully! You can now sign in with your new password.'
      );
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      console.error('Password confirmation error:', error);

      const errorObj = error as { name?: string };

      if (errorObj.name === 'CodeMismatchException') {
        notifyError('Invalid confirmation code. Please try again.');
        form.setError('confirmationCode', {
          type: 'manual',
          message: 'Invalid confirmation code',
        });
      } else if (errorObj.name === 'ExpiredCodeException') {
        notifyError(
          'Confirmation code has expired. Please request a new password reset.'
        );
      } else if (errorObj.name === 'LimitExceededException') {
        notifyError('Too many attempts. Please try again later.');
      } else {
        notifyError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/quarrylink-logo.png"
              alt="QuarryLink Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
          <DialogTitle className="flex items-center justify-center gap-2">
            <KeyRound className="h-5 w-5" />
            Reset Your Password
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter the confirmation code from your email and set a new password
            for your account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 ">
              <div className="font-medium">Check your email</div>
              <div className="mt-1">
                We sent a confirmation code to{' '}
                <span className="font-medium">{email}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="confirmationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmation Code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              <div className="font-medium mb-1">Password Requirements:</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character (@$!%*?&)</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="flex-1"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
