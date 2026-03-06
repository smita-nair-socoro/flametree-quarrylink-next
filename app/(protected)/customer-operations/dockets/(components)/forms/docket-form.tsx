'use client';

import React from 'react';
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
import z from 'zod';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DocketFormSchema } from './schemas/docket-form-schema';
import { useDocketFormState } from '@/hooks/docket/use-docket-form-state';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { FormSelect } from '@/components/ui/form-select';
import { Calendar, Clock, MapPin, Package, Truck } from 'lucide-react';
import { DatePicker } from '@/components/date-picker';
import { formatLocalDateShort } from '@/lib/utils/date';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { Map } from '@/components/ui/map';
import { MultipleInput } from '@/components/ui/multiple-input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';

interface FormProps {
  id?: number;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSaved?: () => void;
  className?: string;
  isQuickDocket?: boolean;
  jobId?: number;
}

export default function DocketForm({
  id,
  onCancel,
  // onSuccess,
  onDirtyChange,
  // onSaved,
  className,
  isQuickDocket = true,
  jobId,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    docketForm,
    isEditing,
    isJobLocked,
    allJobs,
    jobLineItemOptions,
    selectedJobId,
    selectedJob,
    selectedJobLineItemDetails,
    pricingBreakdown,
    truckTypeOptions,
    mapMarkers,
    today,
    pickUpAddress,
    setPickUpAddress,
    deliveryAddress,
    setDeliveryAddress,
    pickUpSearchInput,
    setPickUpSearchInput,
    deliverySearchInput,
    setDeliverySearchInput,
  } = useDocketFormState({
    id,
    isQuickDocket,
    jobId,
    onDirtyChange,
  });

  async function onSubmit(values: z.infer<typeof DocketFormSchema>) {
    setIsSubmitting(true);
    console.log(`Docket Form Values:`, values);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
  }

  return (
    <div className="w-full relative">
      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10',
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isEditing ? 'Updating Docket...' : 'Adding Docket...'}
            </p>
          </div>
        </div>
      )}
      <Form {...docketForm}>
        <form
          id="add-new-docket-form"
          className={cn('p-1 w-full flex flex-col', className)}
          onSubmit={docketForm.handleSubmit(onSubmit)}
        >
          <div className={cn('p-1 flex flex-col gap-4 w-full', className)}>
            <FormSelect
              control={docketForm.control}
              name="jobId"
              label="Job Reference*"
              searchLabel="Job References"
              options={allJobs}
              placeholder="Select Job"
              disabled={isJobLocked}
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
              }
            />

            <div className="border rounded-md p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="items-center flex gap-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Product & Vehicle Details
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Product selection and vehicle configuration
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    control={docketForm.control}
                    name="jobLineItemId"
                    label="Product*"
                    searchLabel="Products"
                    options={jobLineItemOptions}
                    placeholder={
                      !selectedJobId
                        ? 'Select Job First'
                        : jobLineItemOptions.length === 0
                          ? 'No Products Found'
                          : 'Select Product'
                    }
                    disabled={!selectedJobId || jobLineItemOptions.length === 0}
                  />

                  <FormField
                    name="quarryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quarry / Supplier</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            readOnly
                            value={
                              field.value ??
                              selectedJobLineItemDetails().quarryName ??
                              ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div
                  className={cn(
                    !docketForm.watch('jobLineItemId') ||
                      selectedJobLineItemDetails().type === 'COLLECTION'
                      ? 'grid grid-cols-2 gap-4'
                      : !selectedJobLineItemDetails().needTruckQty
                        ? 'grid grid-cols-3 gap-4'
                        : 'grid grid-cols-4 gap-4',
                  )}
                >
                  {selectedJobLineItemDetails().type === 'DELIVERY' && (
                    <FormSelect
                      control={docketForm.control}
                      name="truckType"
                      label="Truck Type*"
                      searchLabel="Truck Type"
                      options={truckTypeOptions}
                      placeholder="Select Truck Type"
                      disabled={
                        !selectedJobId || jobLineItemOptions.length === 0
                      }
                    />
                  )}

                  <FormField
                    name="productUoM"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product UoM</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            readOnly
                            value={
                              field.value ??
                              selectedJobLineItemDetails().productUom ??
                              ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="loadSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Load Size</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            {...field}
                            isNumber
                            disabled={!docketForm.watch('jobLineItemId')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedJobLineItemDetails().needTruckQty && (
                    <FormField
                      name="truckQty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Distance</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              isNumber
                              suffix={
                                selectedJobLineItemDetails().truckUom
                                  ? selectedJobLineItemDetails().truckUom
                                  : ''
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="border rounded-md p-4 flex flex-col gap-4">
                  <div className="flex justify-between">
                    <span className="text-md font-medium">
                      Product Quantity Available
                    </span>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current docket:
                      </span>
                      <span className="text-sm font-medium">
                        {docketForm.watch('loadSize')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Remaining Product Availability in Job
                      </span>
                      <span className="text-sm font-medium">
                        {selectedJobLineItemDetails().remainingQty}{' '}
                        {selectedJobLineItemDetails().productUom === '20kg'
                          ? 'x 20kg'
                          : selectedJobLineItemDetails().productUom}{' '}
                        total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-md p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="items-center flex gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Delivery Information
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Delivery date, address, and purchase order
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={docketForm.control}
                    name="deliveryCollectionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Date*</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={
                              selectedJob.deliveryStartDate
                                ? new Date(selectedJob.deliveryStartDate)
                                : undefined
                            }
                            onChangeAction={field.onChange}
                            placeholder="Pick a date"
                            disabled={{ before: today }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="purchaseOrder"
                    render={() => (
                      <FormItem>
                        <FormLabel>PO Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            value={selectedJob.poNumber}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="pickUpAddressId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <MapPin className="w-4 h-4 text-red-500" />
                          Pick Up Address
                        </FormLabel>
                        <FormControl>
                          <AddressAutoComplete
                            address={pickUpAddress}
                            setAddress={setPickUpAddress}
                            searchInput={pickUpSearchInput}
                            setSearchInput={setPickUpSearchInput}
                            dialogTitle="Pick Up Address"
                            placeholder="Enter site address..."
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {selectedJobLineItemDetails().type !== 'COLLECTION' && (
                    <FormField
                      name="deliveryAddressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <MapPin className="w-4 h-4 text-green-500" />
                            Delivery Address
                          </FormLabel>
                          <FormControl>
                            <AddressAutoComplete
                              address={deliveryAddress}
                              setAddress={setDeliveryAddress}
                              searchInput={deliverySearchInput}
                              setSearchInput={setDeliverySearchInput}
                              dialogTitle="Delivery Address"
                              placeholder="Enter site address..."
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                {<Map markers={mapMarkers} className="h-[400px] w-full" />}
              </div>
            </div>

            <div className="border rounded-md p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="items-center flex gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Time & Contact Details
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Delivery timing and contact information
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={docketForm.control}
                    name="deliveryCollectionStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time Window</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            id="time-picker-start"
                            value={field.value ?? ''}
                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={docketForm.control}
                    name="deliveryCollectionEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time Window</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            id="time-picker-end"
                            value={field.value ?? ''}
                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    name="customerContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={docketForm.control}
                    name="customerContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <PhoneInput
                            className="w-full"
                            defaultCountry="AU"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={docketForm.control}
                  name="docketEmail"
                  render={({ field }) => {
                    const fixedValues = ['jaywoo.choi@socoro.com.au'];
                    return (
                      <FormItem className={'col-span-2 col-start-1'}>
                        <FormLabel>Docket Email</FormLabel>
                        <FormControl>
                          <MultipleInput
                            className="w-full"
                            fixedValues={fixedValues}
                            validate={(s) =>
                              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
                            }
                            label="Press Enter or comma to add email addresses for docket notifications"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={docketForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          className="w-full min-h-[80px]"
                          placeholder="Enter important FYI notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg border shadow-md px-4 py-3">
              <h3 className="text-lg font-bold mb-3">Sale Summary</h3>
              <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                <div>
                  <span>Product Sell</span>
                  <span>${pricingBreakdown.productSell.toFixed(2)}</span>
                </div>
                {selectedJobLineItemDetails().needTruckQty && (
                  <div>
                    <span>Truck Sell</span>
                    <span>${pricingBreakdown.truckSell.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-dashed border-purple-300">
                  <span>Subtotal (ex-GST)</span>
                  <span>${pricingBreakdown.subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <span>GST (10%)</span>
                  <span>${pricingBreakdown.gst.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-dashed border-purple-300">
                  <span className="font-bold text-lg">Total Invoice</span>
                  <span className="font-bold text-lg">
                    ${pricingBreakdown.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Information */}
          {isEditing && (
            <div className="col-span-full space-y-6 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Created By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedJob.createdBy || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedJob.lastModifiedBy || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Created Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateShort(selectedJob.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Modified Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateShort(selectedJob.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isDesktop && (
            <div className="flex justify-end space-x-2 col-span-2 my-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
              <Button
                className="cursor-pointer"
                type="button"
                onClick={() => docketForm.handleSubmit(onSubmit)()}
              >
                {isEditing ? 'Save Changes' : 'Create Docket'}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 my-6">
              <Button
                type="button"
                className="cursor-pointer"
                onClick={() => docketForm.handleSubmit(onSubmit)()}
              >
                {isEditing ? 'Save Changes' : 'Create Docket'}
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
