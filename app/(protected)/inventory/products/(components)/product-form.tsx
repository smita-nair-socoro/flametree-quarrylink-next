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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';
import { Dialog } from '@radix-ui/react-dialog';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import {
  NewCategoryFormSchema,
  NewProductFormSchema,
  NewQuarryFormSchema,
} from './product-form-schemas';

export default function ProductForm({
  className,
}: React.ComponentProps<'form'>) {
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] =
    React.useState(false);

  const [isNewQuarryDialogOpen, setIsNewQuarryDialogOpen] =
    React.useState(false);

  const form = useForm<z.infer<typeof NewProductFormSchema>>({
    resolver: zodResolver(NewProductFormSchema),
    defaultValues: {
      product_name: '',
      product_code: '',
      category: [],
      description: '',
      quarry_sources: '',
      cost_price_per_tonne: '',
      sell_price_per_tonne: '',
    },
  });

  const categoryForm = useForm<z.infer<typeof NewCategoryFormSchema>>({
    resolver: zodResolver(NewCategoryFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const quarryForm = useForm<z.infer<typeof NewQuarryFormSchema>>({
    resolver: zodResolver(NewQuarryFormSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof NewProductFormSchema>) {
    // Do something with the form values.
    // This will be type-safe and validated.
    console.log(values);
  }

  function onSubmitNewCategory(values: z.infer<typeof NewCategoryFormSchema>) {
    // Do something with the form values.
    // This will be type-safe and validated.

    setIsNewCategoryDialogOpen(false);

    console.log(values);
  }

  function onSubmitNewQuarry(values: z.infer<typeof NewQuarryFormSchema>) {
    // Do something with the form values.
    // This will be type-safe and validated.

    setIsNewCategoryDialogOpen(false);

    console.log(values);
  }

  const handleAddClick = () => {
    // open your Dialog (implemented elsewhere)
    setIsNewCategoryDialogOpen(true);
  };

  // TODO: Fetch this from API – for now hard-coded:
  const categoryList: FormSelectOption[] = [
    { value: 'bulk-gravel', label: 'Bulk Gravel' },
    { value: 'fine-sand', label: 'Fine Sand' },
    { value: 'coarse-sand', label: 'Coarse Sand' },
    { value: 'pea-gravel', label: 'Pea Gravel' },
    { value: 'shingle', label: 'Shingle' },
    { value: 'limestone-chippings', label: 'Limestone Chippings' },
    { value: 'granite-aggregate', label: 'Granite Aggregate' },
    { value: 'recycled-aggregate', label: 'Recycled Aggregate' },
    { value: 'ballast', label: 'Ballast' },
    { value: 'riprap-stone', label: 'Riprap Stone' },
    { value: 'crusher-run', label: 'Crusher Run' },
    { value: 'screened-topsoil', label: 'Screened Topsoil' },
    { value: 'road-base', label: 'Road Base' },
    { value: 'drainage-stone', label: 'Drainage Stone' },
    { value: 'decorative-gravel', label: 'Decorative Gravel' },
    { value: 'building-sand', label: 'Building Sand' },
    { value: 'sharp-sand', label: 'Sharp Sand' },
  ];

  // TODO: Fetch this from API – for now hard-coded:
  const quarryList: FormSelectOption[] = [
    { value: 'highland-quarry', label: 'Highland Quarry' },
    { value: 'blue-ridge-quarry', label: 'Blue Ridge Quarry' },
    { value: 'silverstone-quarry', label: 'Silverstone Quarry' },
    { value: 'granite-hill-quarry', label: 'Granite Hill Quarry' },
    { value: 'stonebrook-quarry', label: 'Stonebrook Quarry' },
    { value: 'green-valley-quarry', label: 'Green Valley Quarry' },
    { value: 'sunset-ridge-quarry', label: 'Sunset Ridge Quarry' },
    { value: 'riverside-quarry', label: 'Riverside Quarry' },
    { value: 'emerald-rock-quarry', label: 'Emerald Rock Quarry' },
    { value: 'mountain-view-quarry', label: 'Mountain View Quarry' },
    { value: 'oakfield-quarry', label: 'Oakfield Quarry' },
    { value: 'pebble-creek-quarry', label: 'Pebble Creek Quarry' },
    { value: 'northport-quarry', label: 'Northport Quarry' },
    { value: 'redstone-quarry', label: 'Redstone Quarry' },
    { value: 'blackrock-quarry', label: 'Blackrock Quarry' },
    { value: 'sierra-madre-quarry', label: 'Sierra Madre Quarry' },
    { value: 'canyon-falls-quarry', label: 'Canyon Falls Quarry' },
    { value: 'golden-peak-quarry', label: 'Golden Peak Quarry' },
  ];

  return (
    <ScrollArea className="overflow-auto">
      <Form {...form}>
        <form
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 items-start gap-6 p-1 ',
            className,
          )}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid col-span-2 md:col-span-1 gap-3">
            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid col-span-2 md:col-span-1 gap-3">
            <FormField
              control={form.control}
              name="product_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Code</FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="ION001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional unique identifier for this product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2 grid gap-3">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories*</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categoryList}
                      className="w-full"
                      placeholder="Pick categories…"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      modalPopover={true}
                      maxCount={3}
                      onAddClick={handleAddClick}
                      addButtonLabel="+ New Category"
                    />
                  </FormControl>
                  <FormDescription>
                    Select one or more categories
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2 grid gap-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description"
                      className="resize-none w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="col-span-2" orientation="horizontal" />

          <h2 className="col-span-2 font-bold">Quarry Sources</h2>

          <div className="grid grid-cols-1 col-span-2 md:grid-cols-4 gap-3 items-end">
            <FormSelect
              control={form.control}
              name="quarry_sources"
              label="Quarry"
              options={quarryList}
              placeholder="Select Quarry"
              onAddClick={() => setIsNewQuarryDialogOpen(true)}
              addButtonLabel="+ New Quarry"
            />

            <FormField
              control={form.control}
              name="cost_price_per_tonne"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price per tonne</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="w-full"
                      placeholder="$00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sell_price_per_tonne"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sell Price per tonne</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="w-full"
                      placeholder="$00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="button">+ Add to Quarry</Button>
          </div>

          <div className="col-span-2">
            <Button className="w-full" type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </Form>

      <Dialog
        open={isNewCategoryDialogOpen}
        onOpenChange={setIsNewCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category to organise your inventory.
            </DialogDescription>
          </DialogHeader>

          <Form {...categoryForm}>
            <form
              className={cn('grid grid-cols-1 tems-start gap-3', className)}
              onSubmit={categoryForm.handleSubmit(onSubmitNewCategory)}
            >
              <div className="grid col-span-1 gap-2">
                <FormField
                  control={categoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name*</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          placeholder="Enter category name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Button className="w-full" type="submit">
                  Add Category
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNewQuarryDialogOpen}
        onOpenChange={setIsNewQuarryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Quarry</DialogTitle>
            <DialogDescription>
              Create a new quarry organise your resources.
            </DialogDescription>
          </DialogHeader>

          <Form {...quarryForm}>
            <form
              className={cn('grid grid-cols-1 tems-start gap-3', className)}
              onSubmit={categoryForm.handleSubmit(onSubmitNewQuarry)}
            >
              <div className="grid col-span-1 gap-2">
                <FormField
                  control={quarryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quarry Name*</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          placeholder="Enter quarry name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Button className="w-full" type="submit">
                  Add Quarry
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
