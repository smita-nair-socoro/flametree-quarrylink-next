'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import React from 'react';
import {
  InviteUserFormSchema,
  InviteUserFormValues,
} from './schemas/invite-user-form-schema';

interface InviteUserFormProps {
  onCancel?: () => void;
}

export default function InviteUserForm({ onCancel }: InviteUserFormProps) {
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(InviteUserFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: '',
    },
  });

  const onSubmit = (data: InviteUserFormValues) => {
    console.log('Invite user data:', data);
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
        <p className="text-sm text-muted-foreground mb-6">
          Send an invitation to a new team member with their assigned role and
          contact information.
        </p>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Full Name<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email Address<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john.smith@company.com"
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
              <FormLabel>
                Phone Number{' '}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <PhoneInput
                  className="w-full"
                  defaultCountry="AU"
                  placeholder="Enter phone number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Role<span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        <div className="flex justify-end gap-2 mb-4 mt-4">
          <Button type="button" variant="outline" onClick={onCancel} size="lg">
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            className="bg-[#8E51FF] hover:bg-[#7a42e6] text-white"
          >
            Send Invitation
          </Button>
        </div>
      </form>
    </Form>
  );
}
