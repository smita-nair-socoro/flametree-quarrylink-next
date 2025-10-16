'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resetPassword } from 'aws-amplify/auth';
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
import { Mail } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeSent: (email: string) => void;
}

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .nonempty({ message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
});

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onCodeSent,
}: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onSubmit',
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);

    try {
      await resetPassword({ username: values.email });
      setIsEmailSent(true);
      notifySuccess('Password reset email sent successfully!');
      // Transition to confirmation modal after a longer delay to let users read the message
      setTimeout(() => {
        onCodeSent(values.email);
        handleClose();
      }, 4000);
    } catch (error: unknown) {
      console.error('Reset password error:', error);

      const errorObj = error as { name?: string };

      if (errorObj.name === 'UserNotFoundException') {
        notifyError('No account found with this email address');
      } else if (errorObj.name === 'LimitExceededException') {
        notifyError('Too many requests. Please try again later.');
      } else {
        notifyError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    setIsEmailSent(false);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            {!isEmailSent
              ? "Enter your email address and we'll send you a link to reset your password."
              : "We've sent a password reset link to your email address."}
          </DialogDescription>
        </DialogHeader>

        {!isEmailSent ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-sm text-muted-foreground">
                If an account with this email exists, you will receive a
                password reset link shortly.
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
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              <div className="font-medium">Email sent successfully!</div>
              <div className="mt-1">
                Check your inbox and follow the instructions in the email to
                reset your password.
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <div className="font-medium mb-1">Didn't receive the email?</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes for the email to arrive</li>
              </ul>
            </div>

            <Button onClick={handleClose} className="w-full">
              Back to Sign In
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
