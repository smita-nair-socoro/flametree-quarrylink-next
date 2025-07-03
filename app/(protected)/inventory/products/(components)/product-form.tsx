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
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';

export default function ProductForm({
  className,
}: React.ComponentProps<'form'>) {
  const NewProductFormSchema = z.object({
    product_name: z
      .string()
      .min(2, { message: 'Product Name must be at least 2 characters.' })
      .max(100, { message: "Product Name can't be more than 100 characters" }),
    product_code: z
      .string().optional(),
    category: z
      .array(z.string())
      .min(1, { message: 'Select at least one category.' }),
    description: z
      .string().optional()
  });

  const form = useForm<z.infer<typeof NewProductFormSchema>>({
    resolver: zodResolver(NewProductFormSchema),
    defaultValues: {
      product_name: '',
      product_code: '',
      category: [],
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof NewProductFormSchema>) {
    // Do something with the form values.
    // This will be type-safe and validated.
    console.log(values);
  }


  //TODO: Fetch this from api call for now hard code it
  const categoryList = [
    { value: "react", label: "React" },
    { value: "angular", label: "Angular" },
    { value: "vue", label: "Vue" },
    { value: "svelte", label: "Svelte" },
    { value: "ember", label: "Ember" },
  ];

  return (
    <Form {...form}>
      <form
        className={cn('grid grid-cols-1 md:grid-cols-2 items-start gap-6', className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid gap-3'>
          <FormField
            control={form.control}
            name="product_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Code</FormLabel>
                <FormControl>
                  <Input className='w-full' placeholder="ION001" {...field} />
                </FormControl>
                <FormDescription>Optional unique identifier for this product</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-2 grid gap-3">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={categoryList}
                    className='w-full'
                    placeholder="Pick categories…"
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    maxCount={3}
                  />
                </FormControl>
                <FormDescription>Select one or more categories</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-2 grid gap-3">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Product description"
                    className="resize-none w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-2">
          <Button className="w-full" type="submit">
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
