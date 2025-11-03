'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { confirmSignIn } from 'aws-amplify/auth';
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

interface NewPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .nonempty({ message: 'New password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
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

export function NewPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: NewPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onSubmit',
  });

  async function onSubmit(values: z.infer<typeof newPasswordSchema>) {
    setIsLoading(true);

    try {
      // For NEW_PASSWORD_REQUIRED challenge, we only need the new password
      // The verification code (if needed) should be handled by Cognito automatically
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: values.newPassword,
        options: {
          userAttributes: {
            name: 'QuarryLink User', // Default name for new users
          },
        },
      });

      if (isSignedIn) {
        notifySuccess('Password updated successfully! Welcome to QuarryLink.');
        onSuccess();
        handleClose();
      }
    } catch (error: unknown) {
      console.error('New password error:', error);

      const errorObj = error as { name?: string };

      if (errorObj.name === 'InvalidPasswordException') {
        notifyError('Password does not meet requirements');
      } else if (errorObj.name === 'InvalidParameterException') {
        notifyError('Invalid password format or missing required attributes');
      } else if (errorObj.name === 'CodeMismatchException') {
        notifyError('Verification failed. Please try signing in again.');
      } else {
        notifyError('Failed to update password. Please try again.');
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
            Set Your Password
          </DialogTitle>
          <DialogDescription className="text-center">
            Welcome to QuarryLink! Please set a new password to complete your
            account setup.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormLabel>Confirm Password</FormLabel>
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="flex-1"
              >
                {isLoading ? 'Setting Password...' : 'Set Password'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
