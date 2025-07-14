'use client';

import * as React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { InputIcon } from '@/components/ui/input-icon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UpdatePriceSchema,
  UpdatePriceInput,
} from './quarry-price-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/ui/label';

interface UpdateQuarryProductPriceDialogFormProps {
  quarryPriceId: number;
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
  current_sell_price: string;
  current_cost_price: string;

  /** pass in the existing scheduled date (if any) as a Date */
  current_scheduled_date?: Date;
}

export function UpdateQuarryProductPriceDialogForm({
  quarryPriceId,
  open: openProp,
  onOpenChangeAction: onOpenChangeProp,
  current_cost_price,
  current_sell_price,
}: UpdateQuarryProductPriceDialogFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const title = 'Update Product Prices';

  const quarryPriceForm = useForm<UpdatePriceInput>({
    resolver: zodResolver(UpdatePriceSchema),
    defaultValues: {
      id: quarryPriceId,
      cost_price: 0,
      sell_price: 0,
      status: 'ACTIVE',
      applyTiming: 'immediate',
      scheduledDate: undefined,
    },
  });

  const tomorrow = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const watchTiming = quarryPriceForm.watch('applyTiming');

  // Reset date selection if it goes back to immediate
  React.useEffect(() => {
    if (watchTiming === 'immediate') {
      quarryPriceForm.setValue('scheduledDate', undefined);
    }
  }, [watchTiming, quarryPriceForm]);

  function onSubmit(values: UpdatePriceInput) {
    //close dialog
    handleOpenChange(false);

    console.log('submitting', values);
    // send to our API…
  }

  const handleOpenChange = (next: boolean) => {
    onOpenChangeProp?.(next);
  };

  return (
    <Dialog open={openProp} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Change the cost and sell prices of this product either immediately
            or on a scheduled date.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <Form {...quarryPriceForm}>
            <form
              id="quarry-price-form"
              className={cn('grid grid-cols-1 md:grid-cols-2 gap-6 p-1')}
              onSubmit={(e) => {
                // stop this submit from ever bubbling to the parent form
                e.stopPropagation();
                quarryPriceForm.handleSubmit(onSubmit)(e);
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="current_cost_price">Current Cost Price</Label>
                <InputIcon
                  id="current_cost_price"
                  type="text"
                  className="w-full"
                  readOnly={true}
                  disabled={true}
                  placeholder="$0.00"
                  value={current_cost_price}
                  startIcon={<DollarSign size={19} />}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="current_sell_price">Current Sell Price</Label>
                <InputIcon
                  id="current_sell_price"
                  type="text"
                  className="w-full"
                  readOnly={true}
                  disabled={true}
                  placeholder="$0.00"
                  value={current_sell_price}
                  startIcon={<DollarSign size={19} />}
                />
              </div>

              <FormField
                control={quarryPriceForm.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Cost Price</FormLabel>
                    <FormControl>
                      <InputIcon
                        type="number"
                        className="w-full"
                        placeholder="$0.00"
                        startIcon={<DollarSign size={19} />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quarryPriceForm.control}
                name="sell_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Sell Price</FormLabel>
                    <FormControl>
                      <InputIcon
                        type="number"
                        className="w-full"
                        placeholder="$0.00"
                        startIcon={<DollarSign size={19} />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quarryPriceForm.control}
                name="applyTiming"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When should this apply?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="immediate" />
                          </FormControl>
                          <FormLabel>Immediately</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="scheduled" />
                          </FormControl>
                          <FormLabel>On a specific date</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchTiming === 'scheduled' && (
                <FormField
                  control={quarryPriceForm.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
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
              )}

              <div className="col-span-full flex justify-end space-x-2">
                {isDesktop && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  form="quarry-price-form"
                  className={!isDesktop ? 'w-full' : ''}
                  type="submit"
                >
                  Update Prices
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
