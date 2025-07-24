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
import React from 'react';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewQuotationFormSchema } from './schemas/quotation-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/date-picker';
import { GetTodaysDate } from '@/lib/utils/date';
import { InputIcon } from '@/components/ui/input-icon';
import { SearchIcon } from 'lucide-react';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function QuotationForm({ id, onCancel, className }: FormProps) {
  // const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));

  const quotationForm = useForm<z.infer<typeof NewQuotationFormSchema>>({
    resolver: zodResolver(NewQuotationFormSchema),
    defaultValues: {
      quote_type: '',
      customer_id: '',
      account_manager: '',
      project_name: '',
      delivery_date: new Date(),
      delivery_window_start: '10:30:00',
      delivery_window_end: '17:00:00',
      expiry_date: new Date(),
      site_address: '',
    },
  });

  const quarryOptions: FormSelectOption[] = [
    {
      label: 'Armin Customer',
      value: '1',
    },
    {
      label: 'Bec Customer',
      value: '2',
    },
    {
      label: 'Jay Customer',
      value: '3',
    },
  ];

  function onSubmit(values: z.infer<typeof NewQuotationFormSchema>) {
    // Add some debugging
    console.log('onSubmit function called!');
    console.log('Form is valid:', quotationForm.formState.isValid);
    console.log('Form errors:', quotationForm.formState.errors);
    console.log('Quotation Form Values:', values);
  }

  const tomorrow = React.useMemo(() => {
    const d = GetTodaysDate();
    return d;
  }, []);

  return (
    <div className="overflow-auto">
      <Form {...quotationForm}>
        <form
          id="add-new-quote-form"
          className={cn('grid grid-cols-1 gap-6 p-1 ', className)}
          onSubmit={quotationForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={quotationForm.control}
            name="quote_type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Quote Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-flow-col auto-cols-max gap-4"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="Collection" />
                      </FormControl>
                      <FormLabel className="font-normal">Collection</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="Delivery" />
                      </FormControl>
                      <FormLabel className="font-normal">Delivery</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={quotationForm.control}
            name="customer_id"
            label="Customer*"
            options={quarryOptions}
            placeholder="Customer"
            formItemClassName="col-span-2"
          />

          <FormField
            control={quotationForm.control}
            name="account_manager"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Account Manager</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Armin Menhaji"
                    readOnly={true}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={quotationForm.control}
            name="project_name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Enter Project Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={quotationForm.control}
            name="delivery_date"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Delivery Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChangeAction={field.onChange}
                    placeholder="Pick a date"
                    disabled={{ before: tomorrow }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3 col-span-2">
            <FormField
              control={quotationForm.control}
              name="delivery_window_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time Window</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      id="time-picker-start"
                      step="1"
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={quotationForm.control}
              name="delivery_window_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time Window</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      id="time-picker-end"
                      step="1"
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={quotationForm.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChangeAction={field.onChange}
                    placeholder="Pick a date"
                    disabled={{ before: tomorrow }}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  If the quote is not approved by the expiry date, it will
                  automatically expire and no longer be valid.
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={quotationForm.control}
            name="site_address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <InputIcon
                    className="w-full"
                    placeholder="Search For Address"
                    startIcon={<SearchIcon size={18} />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 flex justify-end space-x-2">
            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              form="add-new-quote-form"
              className={!isDesktop ? 'w-full' : 'cursor-pointer'}
              type="submit"
            >
              {isEditing ? 'Save Changes' : 'Add Quote'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
