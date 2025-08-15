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
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewCustomerFormSchema } from './schemas/customer-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function CustomerForm({ id, onCancel, className }: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));

  // TODO: Once Address Type is added, do this
  //   const [address, setAddress] = React.useState<AddressType>({
  //     address1: '',
  //     address2: '',
  //     formattedAddress: '',
  //     city: '',
  //     region: '',
  //     postalCode: '',
  //     country: '',
  //     lat: 0,
  //     lng: 0,
  //   });
  const [searchInput, setSearchInput] = React.useState('');

  const customerForm = useForm<z.infer<typeof NewCustomerFormSchema>>({
    resolver: zodResolver(NewCustomerFormSchema),
    defaultValues: {
      customer_type: 'Business',
      payment_type: 'Credit',
      business_name: '',
      abn: '',
      contact_person_name: '',
      email: '',
      phone: '',
      credit_limit: '',
      payment_terms: '',
      created_at: undefined,
      updated_at: undefined,
      created_by: '',
      last_modified_by: '',
    },
  });
}
