'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { ClientFormSchema } from './schemas/client-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function ClientForm({ id, onCancel, className }: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const clientForm = useForm<z.infer<typeof ClientFormSchema>>({
    resolver: zodResolver(ClientFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      contact_name: '',
      email: '',
      phone: '',
      subscription: '',
      abn: '',
      billing_address: '',
    },
  });

  // const subscriptionOptions = [
  //   { label: 'Essential', value: 'ESSENTIAL' },
  //   { label: 'Plus', value: 'PLUS' },
  //   { label: 'Pro', value: 'PRO' },
  // ];

  async function onSubmit(values: z.infer<typeof ClientFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Client Form Values:', values);

    setIsSubmitting(true);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

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
              Adding Client...
            </p>
          </div>
        </div>
      )}

      <Form {...clientForm}>
        <form
          id="add-new-client-form"
          className={cn(
            'p-1 gap-1 w-full grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={clientForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={clientForm.control}
            name="name"
            render={({ field }) => (
              <FormItem
                className={isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'}
              >
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Enter Company Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Form Actions */}
          {isDesktop && (
            <div className="flex justify-end space-x-2 col-span-2 mb-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
              <Button
                form="add-new-client-form"
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isEditing ? 'Save Changes' : 'Add Client'}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 mb-6">
              <Button type="submit" className="cursor-pointer">
                {isEditing ? 'Save Changes' : 'Add Client'}
              </Button>
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
