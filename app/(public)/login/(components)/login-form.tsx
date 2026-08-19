'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notifySuccess, notifyError } from '@/lib/toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getSafeRedirectUrl } from '@/lib/utils/redirect-helpers';
import { ForgotPasswordModal } from './forgot-password-modal';
import { NewPasswordModal } from './new-password-modal';
import { NewUserInfoModal } from './new-user-info-modal';
import { ResetPasswordConfirmationModal } from './reset-password-confirmation-modal';
import Image from 'next/image';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [showNewUserInfoModal, setShowNewUserInfoModal] = useState(false);
  const [
    showResetPasswordConfirmationModal,
    setShowResetPasswordConfirmationModal,
  ] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [wrongPasswordAttempts, setWrongPasswordAttempts] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const loginFormSchema = z.object({
    email: z
      .string()
      .nonempty({ message: 'Email is required' })
      .email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .nonempty({ message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' }),
  });

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsLoading(true);

    try {
      const result = await nextAuthSignIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth credentials provider returns error string on failure
        form.setError('email', {
          type: 'manual',
          message: 'Invalid email or password. Please check your credentials.',
        });
      } else {
        // Refresh the auth context to update the user state
        await refreshUser();

        notifySuccess(`Welcome back!`, {
          dismissible: true,
        });

        // Redirect to the intended destination
        router.push(getSafeRedirectUrl(searchParams));
      }
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      notifyError('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleForgotPassword() {
    setShowForgotPasswordModal(true);
  }

  async function handleNewPasswordSuccess() {
    // Refresh the auth context after successful password change
    await refreshUser();

    notifySuccess('Welcome to QuarryLink!', {
      dismissible: true,
    });

    // Redirect to the intended destination
    router.push(getSafeRedirectUrl(searchParams));
  }

  // async function handleGoogleSignIn() {
  //   try {
  //     sessionStorage.setItem('oauth_redirect_url', getSafeRedirectUrl());
  //     await signInWithRedirect({ provider: 'Google' });
  //   } catch (error) {
  //     console.error('Google sign-in error:', error);
  //     notifyError('Failed to sign in with Google. Please try again.');
  //   }
  // }

  // async function handleMicrosoftSignIn() {
  //   try {
  //     sessionStorage.setItem('oauth_redirect_url', getSafeRedirectUrl());
  //     await signInWithRedirect({ provider: { custom: 'Microsoft' } });
  //   } catch (error) {
  //     console.error('Microsoft sign-in error:', error);
  //     notifyError('Failed to sign in with Microsoft. Please try again.');
  //   }
  // }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/quarrylink-logo.png"
              alt="QuarryLink Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your QuarryLink account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
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
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="w-full text-center"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Button>

                {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or sign in with
                  </span>
                </div> */}

                {/* <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleMicrosoftSignIn}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                    >
                      <rect x="1" y="1" width="10" height="10" fill="#F35325" />
                      <rect
                        x="13"
                        y="1"
                        width="10"
                        height="10"
                        fill="#81BC06"
                      />
                      <rect
                        x="1"
                        y="13"
                        width="10"
                        height="10"
                        fill="#05A6F0"
                      />
                      <rect
                        x="13"
                        y="13"
                        width="10"
                        height="10"
                        fill="#FFBA08"
                      />
                    </svg>
                    <span className="ml-2">Login with Microsoft</span>
                  </Button>
                </div> */}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onCodeSent={(email) => {
          setResetEmail(email);
          setShowResetPasswordConfirmationModal(true);
        }}
      />

      <ResetPasswordConfirmationModal
        isOpen={showResetPasswordConfirmationModal}
        onClose={() => setShowResetPasswordConfirmationModal(false)}
        email={resetEmail}
        onSuccess={() => {
          setShowResetPasswordConfirmationModal(false);
        }}
      />

      <NewPasswordModal
        isOpen={showNewPasswordModal}
        onClose={() => setShowNewPasswordModal(false)}
        onSuccess={handleNewPasswordSuccess}
        tempPassword={tempPassword}
      />

      <NewUserInfoModal
        isOpen={showNewUserInfoModal}
        onClose={() => setShowNewUserInfoModal(false)}
        onContinue={() => setShowNewUserInfoModal(false)}
      />
    </div>
  );
}
