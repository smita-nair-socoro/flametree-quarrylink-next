'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';

export default function AddNewProductForm({
  className,
}: React.ComponentProps<'form'>) {
  const NewProductFormSchema = z.object({
    username: z
      .string()
      .min(2, { message: 'Username must be at least 2 characters.' })
      .max(50, { message: "Username can't be more than 50 characters" }),

    email: z.string().email({ message: 'Must be a valid email address' }),
  });

  const form = useForm<z.infer<typeof NewProductFormSchema>>({
    resolver: zodResolver(NewProductFormSchema),
    defaultValues: {
      username: '',
    },
  });

  function onSubmit(values: z.infer<typeof NewProductFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        className={cn('grid items-start gap-6', className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@email.com" {...field} />
                </FormControl>
                <FormDescription>This is your email address</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  );
}
