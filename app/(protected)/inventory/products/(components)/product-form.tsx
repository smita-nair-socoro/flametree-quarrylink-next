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
import { useQuery } from '@tanstack/react-query';
import {
  CategoryListQueryOptions,
  ProductQueryOptions,
  QuarryListQueryOptions,
} from '@/lib/api/quaries';
import { useMediaQuery } from '@/hooks/use-media-query';
import { InputIcon } from '@/components/ui/input-icon';
import { DollarSign } from 'lucide-react';
import { DataTableClient } from '@/components/ui/data-table-client';
import { quarrySourcesColumns } from './(data-tables)/products/quarry-sources-columns';

interface ProductFormProps {
  productId?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function ProductForm({
  productId,
  onCancel,
  className,
}: ProductFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] =
    React.useState(false);

  const [isNewQuarryDialogOpen, setIsNewQuarryDialogOpen] =
    React.useState(false);

  const [isEditing] = React.useState(Boolean(productId));

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

  // Queries
  const productQuery = useQuery({
    ...ProductQueryOptions(productId!),
    enabled: Boolean(productId), // skips if it's creating a new product instead of editing.
  });

  const productQuarriesWithPrice = productQuery.data?.quarries ?? [];

  React.useEffect(() => {
    if (productQuery.data) {
      form.reset({
        product_name: productQuery.data.product.name,
        product_code: productQuery.data.product.product_code,
        description: productQuery.data.product.description ?? '',
        category: productQuery.data.categories.map((c) => c.id.toString()),
        quarry_sources:
          productQuery.data.quarries[0]?.quarry.id.toString() ?? '',
        cost_price_per_tonne: (
          (productQuery.data.quarries[0]?.price.cost_price ?? 0) / 100
        ).toString(),
        sell_price_per_tonne: (
          (productQuery.data.quarries[0]?.price.sell_price ?? 0) / 100
        ).toString(),
      });
    }
  }, [productQuery.data, form]);

  const { data: categories = [] } = useQuery(CategoryListQueryOptions());

  const { data: quarries = [] } = useQuery(QuarryListQueryOptions());

  const categoryOptions: FormSelectOption[] = categories.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  const quarryOptions: FormSelectOption[] = quarries.map((q) => ({
    value: q.id.toString(),
    label: q.name,
  }));

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
    // open your Dialog (implemented elsewhere
    setIsNewCategoryDialogOpen(true);
  };

  return (
    <div className="overflow-auto">
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
                      placeholder="Enter product name"
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
                    <Input
                      className="w-full"
                      placeholder="Enter product code"
                      {...field}
                    />
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
                      options={categoryOptions}
                      className="w-full"
                      placeholder="Pick categories…"
                      value={field.value}
                      onValueChange={field.onChange}
                      modalPopover={true}
                      maxCount={2}
                      onAddClick={handleAddClick}
                      addButtonLabel="+ Add New Category"
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
              options={quarryOptions}
              placeholder="Select Quarry"
              onAddClick={() => setIsNewQuarryDialogOpen(true)}
              addButtonLabel="+ Add New Quarry"
            />

            <FormField
              control={form.control}
              name="cost_price_per_tonne"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price per tonne</FormLabel>
                  <FormControl>
                    <InputIcon
                      type="number"
                      className="w-full"
                      placeholder="$00"
                      startIcon={<DollarSign size={19} />}
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
                    <InputIcon
                      type="number"
                      className="w-full"
                      placeholder="$00"
                      startIcon={<DollarSign size={19} />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="button">+ Add to Quarry</Button>
          </div>

          {productQuarriesWithPrice.length > 0 && (
            <div className="col-span-2">
              <DataTableClient
                columns={quarrySourcesColumns}
                data={productQuarriesWithPrice}
                simpleTable={true}
              />
            </div>
          )}

          <div className="col-span-2 flex justify-end space-x-2">
            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button className={!isDesktop ? 'w-full' : ''} type="submit">
              {isEditing ? 'Save Changes' : 'Create Product'}
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

              <div className="col-span-2 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsNewCategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Category</Button>
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

              <div className="col-span-2 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsNewQuarryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit"> Add Quarry</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
