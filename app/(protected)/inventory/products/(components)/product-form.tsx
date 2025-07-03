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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ProductForm({
  className,
}: React.ComponentProps<'form'>) {
  const NewProductFormSchema = z.object({
    product_name: z
      .string()
      .min(2, { message: 'Product Name must be at least 2 characters.' })
      .max(100, { message: "Product Name can't be more than 100 characters" }),
    product_code: z.string().optional(),
    category: z
      .array(z.string())
      .min(1, { message: 'Select at least one category.' }),
    description: z.string().optional(),
    quarry_sources: z
      .string()
      .min(2, { message: 'Please select at least one quarry' }),
    cost_price_per_tonne: z.string(),
    sell_price_per_tonne: z.string(),
  });

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

  function onSubmit(values: z.infer<typeof NewProductFormSchema>) {
    // Do something with the form values.
    // This will be type-safe and validated.
    console.log(values);
  }

  //TODO: Fetch this from api call for now hard code it
  const categoryList = [
    { value: 'react', label: 'React' },
    { value: 'angular', label: 'Angular' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'ember', label: 'Ember' },
  ];

  //TODO: Fetch this from api call as well
  const languages = [
    { label: 'English', value: 'en' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Spanish', value: 'es' },
    { label: 'Portuguese', value: 'pt' },
    { label: 'Russian', value: 'ru' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Korean', value: 'ko' },
    { label: 'Chinese', value: 'zh' },
  ] as const;

  return (
    <ScrollArea className="overflow-auto">
      <Form {...form}>
        <form
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 items-start gap-6',
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
                      maxCount={3}
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
            <FormField
              control={form.control}
              name="quarry_sources"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Quarry</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? languages.find(
                                (language) => language.value === field.value,
                              )?.label
                            : 'Select Quarry'}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search Quarry..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No Quarry found.</CommandEmpty>
                          <CommandGroup>
                            {languages.map((language) => (
                              <CommandItem
                                value={language.label}
                                key={language.value}
                                onSelect={() => {
                                  form.setValue(
                                    'quarry_sources',
                                    language.value,
                                  );
                                }}
                              >
                                {language.label}
                                <Check
                                  className={cn(
                                    'ml-auto',
                                    language.value === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
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
    </ScrollArea>
  );
}
