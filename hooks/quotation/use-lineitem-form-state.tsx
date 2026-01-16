import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useQuery } from '@tanstack/react-query';

import { NewQuotationLineItemFormSchema } from '@/app/(protected)/customer-operations/quotation/(components)/forms/schemas/line-item-quotation-schema';
import { QUOTE_TYPE } from '@/lib/types/quotation-enums';
import {
  ProductsListQueryOptions,
  ProductDetailWithQuarrySupplierProductQueryOptions,
} from '@/lib/api/product';
import {
  CustomerDeliveryAddressesQueryOptions,
  useUpdateDeliveryAddressUsage,
} from '@/lib/api/customer';
import { useSelectedLineItem } from '@/app/stores/line-item-quotation';
import { useSelectedQuotation } from '@/app/stores/quotation-store';
import { useCreateQuoteItem, useUpdateQuoteItem } from '@/lib/api/quotation';
import { notifyError, notifySuccess } from '@/lib/toast';
import { centsToDollarsNum, dollarsToCents } from '@/lib/utils/currency';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { QuotationLineItem } from '@/lib/types/quotation';
import { QuarrySupplierProduct } from '@/lib/types/quarry';
import { AddressType, CustomerDeliveryAddress } from '@/lib/types/address';
import { toAddressPayload, toAddressType } from '@/lib/utils/address-helper';

type FormValues = z.infer<typeof NewQuotationLineItemFormSchema>;

export type SelectOption = { label: string; value: number | string };

type Props = {
  id?: number;
  canEdit?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
  onSaved?: () => void;
};

type PricingBreakdown = {
  totalProductCostPrice: number;
  totalTruckCostPrice: number;
  totalProductSellPrice: number;
  totalTruckSellPrice: number;
  totalInvoice: number;
  grossProfit: number;
  grossProfitPercentage: number;
};

export function useLineItemFormState({
  id,
  canEdit,
  onCancel,
  onSuccess,
  onSaved,
}: Props) {
  const isEditing = Boolean(id && id > 0);
  const isReadOnly = isEditing && !canEdit;

  const selectedLineItem = useSelectedLineItem();
  const selectedQuotation = useSelectedQuotation();
  const quoteType = selectedQuotation?.quoteType;
  const createQuoteItem = useCreateQuoteItem();
  const updateQuoteItem = useUpdateQuoteItem();

  const getFormValuesFromLineItem = React.useCallback((): FormValues => {
    return {
      quoteType: selectedQuotation?.quoteType ?? QUOTE_TYPE.DELIVERY,
      address: isEditing
        ? selectedLineItem?.customerDeliveryAddress?.address
            ?.formattedAddress ?? ''
        : '',
      productId: isEditing ? selectedLineItem?.productId ?? 0 : 0,
      quarrySupplierId: isEditing ? selectedLineItem?.quarrySupplierId ?? 0 : 0,
      supplierProductName: isEditing
        ? selectedLineItem?.supplierProductName ?? ''
        : '',
      productCostUom: isEditing ? selectedLineItem?.productCostUom ?? '' : '',
      productCostQty: isEditing ? selectedLineItem?.productCostQty ?? 0 : 0,
      productCostPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.productCostPrice || 0)
        : 0,
      productSellUom: isEditing ? selectedLineItem?.productSellUom ?? '' : '',
      productSellQty: isEditing ? selectedLineItem?.productSellQty ?? 0 : 0,
      productSellPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.productSellPrice || 0)
        : 0,
      truckType: isEditing ? selectedLineItem?.truckType ?? '' : '',
      truckCostUom: isEditing ? selectedLineItem?.truckCostUom ?? '' : '',
      truckCostQty: isEditing ? selectedLineItem?.truckCostQty ?? 0 : 0,
      truckCostPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.truckCostPrice || 0)
        : 0,
      truckSellUom: isEditing ? selectedLineItem?.truckSellUom ?? '' : '',
      truckSellQty: isEditing ? selectedLineItem?.truckSellQty ?? 0 : 0,
      truckSellPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.truckSellPrice || 0)
        : 0,
      totalProductCostPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.totalProductCostPrice || 0)
        : 0,
      totalTruckCostPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.totalTruckCostPrice || 0)
        : 0,
      totalProductSellPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.totalProductSellPrice || 0)
        : 0,
      totalTruckSellPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.totalTruckSellPrice || 0)
        : 0,
      grossProfit: isEditing ? selectedLineItem?.grossProfit ?? 0 : 0,
    };
  }, [isEditing, selectedLineItem, selectedQuotation?.quoteType]);

  const form = useForm<FormValues>({
    resolver: zodResolver(NewQuotationLineItemFormSchema),
    mode: 'onChange',
    defaultValues: getFormValuesFromLineItem(),
  });

  const [addressInput, setAddressInput] = React.useState<AddressType>(() =>
    toAddressType(selectedLineItem?.customerDeliveryAddress?.address ?? null)
  );
  const [addressSearchInput, setAddressSearchInput] = React.useState('');

  React.useEffect(() => {
    if (!isEditing) {
      // Reset address when creating a new line item
      setAddressInput({
        address1: '',
        address2: '',
        formattedAddress: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        lat: 0,
        lng: 0,
        googlePlaceId: '',
      });
      setAddressSearchInput('');
      return;
    }
    if (!selectedLineItem?.customerDeliveryAddress?.address) {
      return;
    }
    setAddressInput(
      toAddressType(selectedLineItem.customerDeliveryAddress.address)
    );
  }, [isEditing, selectedLineItem?.customerDeliveryAddress?.address]);

  const watchedAddress = form.watch('address');
  React.useEffect(() => {
    if (!watchedAddress) return;
    if (watchedAddress === addressInput.formattedAddress) return;
    setAddressInput((prev) => ({ ...prev, formattedAddress: watchedAddress }));
  }, [watchedAddress, addressInput.formattedAddress]);

  // When viewing/editing an existing line item, ensure the loaded values become the
  // baseline defaults; otherwise RHF can consider async/programmatic updates as "dirty".
  React.useEffect(() => {
    if (!isEditing) return;
    if (!selectedLineItem) return;
    if (id && selectedLineItem?.id && selectedLineItem.id !== id) return;
    form.reset(getFormValuesFromLineItem(), {
      keepDirty: false,
      keepTouched: false,
    });
  }, [form, getFormValuesFromLineItem, id, isEditing, selectedLineItem]);

  // Keep quoteType in sync (drives conditional validation + UI)
  React.useEffect(() => {
    if (!quoteType) return;
    form.setValue('quoteType', quoteType, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [quoteType, form]);

  // If collection, zero out truck fields so they don't affect totals / submit payload
  React.useEffect(() => {
    if (quoteType !== QUOTE_TYPE.COLLECTION) return;
    const opts = { shouldValidate: true, shouldDirty: false } as const;
    form.setValue('truckType', '', opts);
    form.setValue('truckCostUom', '', opts);
    form.setValue('truckCostQty', 0, opts);
    form.setValue('truckCostPrice', 0, opts);
    form.setValue('truckSellUom', '', opts);
    form.setValue('truckSellQty', 0, opts);
    form.setValue('truckSellPrice', 0, opts);
    form.setValue('totalTruckCostPrice', 0, opts);
    form.setValue('totalTruckSellPrice', 0, opts);
  }, [quoteType, form]);

  // Products
  const { data: products } = useQuery(ProductsListQueryOptions());
  const productOptions: SelectOption[] = React.useMemo(() => {
    if (!products) return [];
    return products.map((product) => ({
      label: product.productName,
      value: product.id,
    }));
  }, [products]);

  // Customer delivery addresses (for DELIVERY quote type)
  const customerId =
    selectedQuotation?.customerId ||
    selectedQuotation?.customerWithAddressResponseDto?.id ||
    0;
  const isDeliveryQuote = quoteType === QUOTE_TYPE.DELIVERY;
  const { data: deliveryAddresses } = useQuery({
    ...CustomerDeliveryAddressesQueryOptions(customerId, 5),
    enabled: !!customerId && isDeliveryQuote && !isEditing,
  });

  // Mutation to update delivery address usage (for deleting from suggestions)
  const updateDeliveryAddressUsage = useUpdateDeliveryAddressUsage();

  // Handler to remove a delivery address from suggestions
  const handleDeleteDeliveryAddress = React.useCallback(
    (customerDeliveryAddressId: string) => {
      if (!customerId) return;

      updateDeliveryAddressUsage.mutate({
        customerId,
        customerDeliveryAddressId: Number(customerDeliveryAddressId),
        inUse: false,
      });
    },
    [customerId, updateDeliveryAddressUsage]
  );

  // Get billing address for comparison (pinned address for delivery quotes)
  const billingAddress =
    selectedQuotation?.customerWithAddressResponseDto?.billingAddress;
  const billingAddressFormatted = billingAddress?.formattedAddress || '';

  // Transform delivery addresses to suggested address format
  // Filter out addresses that match the pinned/billing address
  const customerDeliveryAddressSuggestions = React.useMemo(() => {
    if (!deliveryAddresses || !Array.isArray(deliveryAddresses)) return [];
    return deliveryAddresses
      .filter((addr) => {
        const formattedAddr = addr.address?.formattedAddress || '';
        // Exclude if it matches the billing address (pinned address)
        return formattedAddr !== billingAddressFormatted;
      })
      .map((addr) => ({
        id: String(addr.id),
        formattedAddress: addr.address?.formattedAddress || '',
        addressType: addr.address ? toAddressType(addr.address) : undefined,
        customerDeliveryAddress: addr,
      }));
  }, [deliveryAddresses, billingAddressFormatted]);

  // Selected product id
  const selectedProductId = Number(form.watch('productId') || 0);

  // Product details (to get quarry/supplier list and QSPs)
  const productDetailsQuery = useQuery(
    ProductDetailWithQuarrySupplierProductQueryOptions(selectedProductId)
  );

  // Quarry/supplier options
  const quarrySuppliers = React.useMemo(() => {
    const details = productDetailsQuery.data;
    if (!details || details.id !== selectedProductId) return [];
    const qsps = Array.isArray(details.quarrySupplierProducts)
      ? details.quarrySupplierProducts
      : [];
    const byId = new Map<number, { id: number; name: string }>();
    for (const qsp of qsps) {
      const quarrySupplierId = Number(qsp?.quarrySupplierId || 0);
      if (!quarrySupplierId) continue;
      if (qsp?.isActive === false) continue;
      const name = qsp?.quarrySupplier?.name || '';
      byId.set(quarrySupplierId, { id: quarrySupplierId, name });
    }
    return Array.from(byId.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [productDetailsQuery.data, selectedProductId]);

  const quarryOptions: SelectOption[] = React.useMemo(
    () => quarrySuppliers.map((q) => ({ label: q.name, value: q.id })),
    [quarrySuppliers]
  );

  // Selected QSP (product + quarry)
  const watchedQuarrySupplierId = form.watch('quarrySupplierId');
  const selectedQuarrySupplierProduct = React.useMemo(() => {
    const details = productDetailsQuery.data;
    const currentProductId = Number(form.getValues('productId') || 0);
    const currentQuarryId = Number(watchedQuarrySupplierId || 0);
    if (!details || details.id !== currentProductId || !currentQuarryId)
      return undefined;
    const qsps: QuarrySupplierProduct[] = Array.isArray(
      details.quarrySupplierProducts
    )
      ? (details.quarrySupplierProducts as QuarrySupplierProduct[])
      : [];
    return qsps.find(
      (qsp: QuarrySupplierProduct) =>
        Number(qsp?.quarrySupplierId || 0) === currentQuarryId
    );
  }, [
    productDetailsQuery.data,
    selectedProductId,
    watchedQuarrySupplierId,
    form,
  ]);

  // Reset dependent fields when product changes
  const isCollectionQuote = quoteType === QUOTE_TYPE.COLLECTION;
  React.useEffect(() => {
    const currentProductId = Number(form.getValues('productId') || 0);
    const initialProductId = Number(
      isEditing ? selectedLineItem?.productId : 0
    );
    if (currentProductId !== initialProductId) {
      const opts = { shouldDirty: false } as const;
      form.setValue('quarrySupplierId', 0, opts);
      form.setValue('supplierProductName', '', opts);
      form.setValue('productCostUom', '', opts);
      form.setValue('productCostQty', 0, opts);
      form.setValue('productCostPrice', 0, opts);
      form.setValue('productSellUom', '', opts);
      form.setValue('productSellQty', 0, opts);
      form.setValue('productSellPrice', 0, opts);
      form.setValue('truckType', '', opts);
      form.setValue('truckCostUom', '', opts);
      form.setValue('truckCostQty', 0, opts);
      form.setValue('truckCostPrice', 0, opts);
      form.setValue('truckSellUom', '', opts);
      form.setValue('truckSellQty', 0, opts);
      form.setValue('truckSellPrice', 0, opts);

      // Clear address when product changes for Collection quotes
      if (isCollectionQuote) {
        form.setValue('address', '', opts);
        setAddressInput({
          address1: '',
          address2: '',
          formattedAddress: '',
          city: '',
          region: '',
          postalCode: '',
          country: '',
          lat: 0,
          lng: 0,
          googlePlaceId: '',
        });
        setAddressSearchInput('');
      }
    }
  }, [selectedProductId, isEditing, selectedLineItem?.productId, form, isCollectionQuote]);

  // Reset pricing and address when quarry changes
  const quarryId = form.watch('quarrySupplierId');
  React.useEffect(() => {
    const currentQuarryId = Number(form.getValues('quarrySupplierId') || 0);
    const initialQuarryId = Number(
      isEditing ? selectedLineItem?.quarrySupplierId ?? 0 : 0
    );
    if (currentQuarryId !== initialQuarryId) {
      const opts = { shouldDirty: false } as const;
      form.setValue('supplierProductName', '', opts);
      form.setValue('productCostUom', '', opts);
      form.setValue('productCostQty', 0, opts);
      form.setValue('productCostPrice', 0, opts);
      form.setValue('productSellUom', '', opts);
      form.setValue('productSellQty', 0, opts);
      form.setValue('productSellPrice', 0, opts);
      form.setValue('truckType', '', opts);
      form.setValue('truckCostUom', '', opts);
      form.setValue('truckCostQty', 0, opts);
      form.setValue('truckCostPrice', 0, opts);
      form.setValue('truckSellUom', '', opts);
      form.setValue('truckSellQty', 0, opts);
      form.setValue('truckSellPrice', 0, opts);

      // Clear address when quarry changes for Collection quotes
      if (isCollectionQuote) {
        form.setValue('address', '', opts);
        setAddressInput({
          address1: '',
          address2: '',
          formattedAddress: '',
          city: '',
          region: '',
          postalCode: '',
          country: '',
          lat: 0,
          lng: 0,
          googlePlaceId: '',
        });
        setAddressSearchInput('');
      }
    }
  }, [quarryId, isEditing, selectedLineItem?.quarrySupplierId, form, isCollectionQuote]);

  // Populate supplierProductName from product details response
  React.useEffect(() => {
    const currentProductId = Number(form.getValues('productId') || 0);
    const currentQuarryId = Number(form.getValues('quarrySupplierId') || 0);
    const details = productDetailsQuery.data;
    if (
      !details ||
      !currentProductId ||
      details.id !== currentProductId ||
      !currentQuarryId
    ) {
      return;
    }
    const qsps: QuarrySupplierProduct[] = Array.isArray(
      details.quarrySupplierProducts
    )
      ? (details.quarrySupplierProducts as QuarrySupplierProduct[])
      : [];
    const matched = qsps.find(
      (qsp: QuarrySupplierProduct) =>
        Number(qsp?.quarrySupplierId || 0) === currentQuarryId
    );
    const supplierProductName = matched?.supplierProductName || '';
    if (supplierProductName) {
      // Don't mark as dirty for auto-population.
      form.setValue('supplierProductName', supplierProductName, {
        shouldDirty: false,
      });
    }
  }, [quarryId, selectedProductId, productDetailsQuery.data, form]);

  // Static options
  const truckTypeOptions: SelectOption[] = React.useMemo(
    () => [
      { label: 'Truck', value: 'Truck' },
      { label: 'Semi-Trailer', value: 'Semi-Trailer' },
      { label: 'Truck + Trailer', value: 'Truck + Trailer' },
      { label: 'Rigid truck', value: 'Rigid truck' },
      { label: 'B-Double', value: 'B-Double' },
      { label: 'Road train', value: 'Road train' },
      { label: 'Dog Truck', value: 'Dog Truck' },
      { label: 'Flatbed', value: 'Flatbed' },
      { label: 'Tipper', value: 'Tipper' },
      { label: 'Semi-Tipper', value: 'Semi-Tipper' },
      { label: 'Side-Tipper', value: 'Side-Tipper' },
      { label: 'Truck and Dog', value: 'Truck and Dog' },
      { label: 'Agitator truck', value: 'Agitator truck' },
    ],
    []
  );

  // UOM options derived from QSP
  const productUnitOptions: SelectOption[] = React.useMemo(() => {
    const opts: SelectOption[] = [];
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (qsp?.availableForSaleTn) opts.push({ label: 'TN', value: 'TN' });
    if (qsp?.availableForSaleM3) opts.push({ label: 'm³', value: 'M3' });
    if (qsp?.availableForSale20kg) opts.push({ label: '20kg', value: 'KG_20' });
    if (qsp?.availableForSaleBulka)
      opts.push({ label: 'Bulka', value: 'BULKA' });
    return opts;
  }, [selectedQuarrySupplierProduct]);

  const truckUnitOptions: SelectOption[] = React.useMemo(() => {
    const opts: SelectOption[] = [];
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (qsp?.availableForTruckRateTn) opts.push({ label: 'TN', value: 'TN' });
    if (qsp?.availableForTruckRateM3) opts.push({ label: 'm³', value: 'M3' });
    if (qsp?.availableForTruckRateHour)
      opts.push({ label: 'Hourly', value: 'HOURLY' });
    if (qsp?.availableForTruckRateLoad)
      opts.push({ label: 'Load', value: 'LOAD' });
    if (qsp?.availableForTruckRateKm) opts.push({ label: 'KM', value: 'KM' });
    return opts;
  }, [selectedQuarrySupplierProduct]);

  // Auto-fill product pricing on UOM changes
  const productCostUom = form.watch('productCostUom');
  const productSellUom = form.watch('productSellUom');

  React.useEffect(() => {
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (!qsp) return;

    // In edit mode, don't overwrite existing price unless UOM actually changed
    if (isEditing) {
      const initialUom = selectedLineItem?.productCostUom || '';
      const currentUom = form.getValues('productCostUom') || '';
      if (currentUom === initialUom) {
        return;
      }
    }

    let price = 0;
    switch (productCostUom) {
      case 'TN':
        price = centsToDollarsNum(qsp.perTnCostPrice || 0);
        break;
      case 'M3':
        price = centsToDollarsNum(qsp.perM3CostPrice || 0);
        break;
      case 'KG_20':
        price = centsToDollarsNum(qsp.per20kgCostPrice || 0);
        break;
      case 'BULKA':
        price = centsToDollarsNum(qsp.perBulkaCostPrice || 0);
        break;
      default:
        price = 0;
    }
    form.setValue('productCostPrice', price || 0, { shouldDirty: false });
  }, [
    productCostUom,
    selectedQuarrySupplierProduct,
    form,
    isEditing,
    selectedLineItem?.productCostUom,
  ]);

  React.useEffect(() => {
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (!qsp) return;

    // In edit mode, don't overwrite existing price unless UOM actually changed
    if (isEditing) {
      const initialUom = selectedLineItem?.productSellUom || '';
      const currentUom = form.getValues('productSellUom') || '';
      if (currentUom === initialUom) {
        return;
      }
    }

    let price = 0;
    switch (productSellUom) {
      case 'TN':
        price = centsToDollarsNum(qsp.perTnSellPrice || 0);
        break;
      case 'M3':
        price = centsToDollarsNum(qsp.perM3SellPrice || 0);
        break;
      case 'KG_20':
        price = centsToDollarsNum(qsp.per20kgSellPrice || 0);
        break;
      case 'BULKA':
        price = centsToDollarsNum(qsp.perBulkaSellPrice || 0);
        break;
      default:
        price = 0;
    }
    form.setValue('productSellPrice', price || 0, { shouldDirty: false });
  }, [
    productSellUom,
    selectedQuarrySupplierProduct,
    form,
    isEditing,
    selectedLineItem?.productSellUom,
  ]);

  // Auto-fill truck pricing on UOM changes
  const truckCostUom = form.watch('truckCostUom');
  const truckSellUom = form.watch('truckSellUom');

  React.useEffect(() => {
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (!qsp) return;

    // In edit mode, don't overwrite existing price unless UOM actually changed
    if (isEditing) {
      const initialUom = selectedLineItem?.truckCostUom || '';
      const currentUom = form.getValues('truckCostUom') || '';
      if (currentUom === initialUom) {
        return;
      }
    }

    let rate = 0;
    switch (truckCostUom) {
      case 'TN':
        rate = centsToDollarsNum(qsp.tnTruckRate || 0);
        break;
      case 'M3':
        rate = centsToDollarsNum(qsp.m3TruckRate || 0);
        break;
      case 'HOURLY':
        rate = centsToDollarsNum(qsp.hourlyTruckRate || 0);
        break;
      case 'LOAD':
        rate = centsToDollarsNum(qsp.loadTruckRate || 0);
        break;
      case 'KM':
        rate = centsToDollarsNum(qsp.kmTruckRate || 0);
        break;
      default:
        rate = 0;
    }
    form.setValue('truckCostPrice', rate || 0, { shouldDirty: false });
  }, [
    truckCostUom,
    selectedQuarrySupplierProduct,
    form,
    isEditing,
    selectedLineItem?.truckCostUom,
  ]);

  React.useEffect(() => {
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (!qsp) return;

    // In edit mode, don't overwrite existing price unless UOM actually changed
    if (isEditing) {
      const initialUom = selectedLineItem?.truckSellUom || '';
      const currentUom = form.getValues('truckSellUom') || '';
      if (currentUom === initialUom) {
        return;
      }
    }

    let rate = 0;
    switch (truckSellUom) {
      case 'TN':
        rate = centsToDollarsNum(qsp.tnTruckRate || 0);
        break;
      case 'M3':
        rate = centsToDollarsNum(qsp.m3TruckRate || 0);
        break;
      case 'HOURLY':
        rate = centsToDollarsNum(qsp.hourlyTruckRate || 0);
        break;
      case 'LOAD':
        rate = centsToDollarsNum(qsp.loadTruckRate || 0);
        break;
      case 'KM':
        rate = centsToDollarsNum(qsp.kmTruckRate || 0);
        break;
      default:
        rate = 0;
    }
    form.setValue('truckSellPrice', rate || 0, { shouldDirty: false });
  }, [
    truckSellUom,
    selectedQuarrySupplierProduct,
    form,
    isEditing,
    selectedLineItem?.truckSellUom,
  ]);

  // Reset truck UOMs when truck type changes
  const truckType = form.watch('truckType');
  React.useEffect(() => {
    const currentTruckType = form.getValues('truckType');
    const initialTruckType = isEditing ? selectedLineItem?.truckType : '';
    if (currentTruckType !== initialTruckType) {
      form.setValue('truckCostUom', '', { shouldDirty: false });
      form.setValue('truckSellUom', '', { shouldDirty: false });
    }
  }, [truckType, isEditing, selectedLineItem?.truckType, form]);

  // Pricing breakdown calculations
  const [pricingBreakdown, setPricingBreakdown] =
    React.useState<PricingBreakdown>({
      totalProductCostPrice: 0,
      totalTruckCostPrice: 0,
      totalProductSellPrice: 0,
      totalTruckSellPrice: 0,
      totalInvoice: 0,
      grossProfit: 0,
      grossProfitPercentage: 0,
    });
  const productCostQty = form.watch('productCostQty');
  const productCostPrice = form.watch('productCostPrice');
  const truckCostQty = form.watch('truckCostQty');
  const truckCostPrice = form.watch('truckCostPrice');
  const productSellQty = form.watch('productSellQty');
  const productSellPrice = form.watch('productSellPrice');
  const truckSellQty = form.watch('truckSellQty');
  const truckSellPrice = form.watch('truckSellPrice');
  React.useEffect(() => {
    const values = form.getValues();
    const totalProductCostPrice =
      (values.productCostQty || 0) * (values.productCostPrice || 0);
    const totalTruckCostPrice =
      (values.truckCostQty || 0) * (values.truckCostPrice || 0);
    const totalProductSellPrice =
      (values.productSellQty || 0) * (values.productSellPrice || 0);
    const totalTruckSellPrice =
      (values.truckSellQty || 0) * (values.truckSellPrice || 0);
    const totalInvoice = totalProductSellPrice + totalTruckSellPrice;
    const totalCost = totalProductCostPrice + totalTruckCostPrice;
    const grossProfit = totalInvoice - totalCost;
    const grossProfitPercentage =
      totalInvoice > 0 ? (grossProfit / totalInvoice) * 100 : 0;

    setPricingBreakdown({
      totalProductCostPrice,
      totalTruckCostPrice,
      totalProductSellPrice,
      totalTruckSellPrice,
      totalInvoice,
      grossProfit,
      grossProfitPercentage,
    });

    const opts = { shouldDirty: false } as const;
    form.setValue('totalProductCostPrice', totalProductCostPrice, opts);
    form.setValue('totalTruckCostPrice', totalTruckCostPrice, opts);
    form.setValue('totalProductSellPrice', totalProductSellPrice, opts);
    form.setValue('totalTruckSellPrice', totalTruckSellPrice, opts);
    form.setValue('grossProfit', grossProfit, opts);
  }, [
    productCostQty,
    productCostPrice,
    truckCostQty,
    truckCostPrice,
    productSellQty,
    productSellPrice,
    truckSellQty,
    truckSellPrice,
    form,
  ]);

  // GST
  const gst = (Number(pricingBreakdown.totalInvoice) * 0.1).toFixed(2);
  const totalInvoiceIncGST = (
    Number(pricingBreakdown.totalInvoice) + Number(gst)
  ).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit(onSubmit)(e);
  };

  async function onSubmit(values: FormValues) {
    if (!selectedQuotation?.id) {
      console.error('No quotation selected');
      return;
    }
    const customerId =
      selectedQuotation?.customerId ||
      selectedQuotation?.customerWithAddressResponseDto?.id ||
      0;
    const originalAddress = selectedLineItem?.customerDeliveryAddress?.address;
    const mappedAddress = toAddressPayload(addressInput, originalAddress);
    const addressPayload = mappedAddress
      ? (({ id, ...rest }) => rest)(mappedAddress)
      : undefined;
    const customerDeliveryAddress: CustomerDeliveryAddress | undefined =
      addressPayload && customerId
        ? {
            ...(isEditing && selectedLineItem?.customerDeliveryAddress?.id
              ? { id: selectedLineItem.customerDeliveryAddress.id }
              : {}),
            customerId,
            addressId:
              isEditing && selectedLineItem?.customerDeliveryAddress?.addressId
                ? selectedLineItem.customerDeliveryAddress.addressId
                : mappedAddress?.id,
            address: addressPayload,
            inUse: true,
            lastUsedAt: selectedLineItem?.customerDeliveryAddress?.lastUsedAt,
            version: selectedLineItem?.customerDeliveryAddress?.version ?? 0,
            createdBy: selectedLineItem?.customerDeliveryAddress?.createdBy,
            createdAt: selectedLineItem?.customerDeliveryAddress?.createdAt,
            updatedAt: selectedLineItem?.customerDeliveryAddress?.updatedAt,
            lastModifiedBy:
              selectedLineItem?.customerDeliveryAddress?.lastModifiedBy,
          }
        : undefined;

    const quoteItemData: QuotationLineItem = {
      quoteId: selectedQuotation?.id || 0,
      productId: values.productId,
      quarrySupplierId: values.quarrySupplierId,
      customerDeliveryAddressId:
        isEditing && selectedLineItem?.customerDeliveryAddress?.id
          ? customerDeliveryAddress?.id
          : undefined,
      customerDeliveryAddress,
      productName:
        (productOptions.find((p) => p.value === values.productId)
          ?.label as string) || '',
      quarryName:
        (quarryOptions.find((q) => q.value === values.quarrySupplierId)
          ?.label as string) || '',
      supplierProductName: values.supplierProductName,
      productCostUom: values.productCostUom,
      productCostQty: values.productCostQty,
      productCostPrice: dollarsToCents(values.productCostPrice),
      totalProductCostPrice: dollarsToCents(values.totalProductCostPrice),
      productSellUom: values.productSellUom,
      productSellQty: values.productSellQty,
      productSellPrice: dollarsToCents(values.productSellPrice),
      totalProductSellPrice: dollarsToCents(values.totalProductSellPrice),
      truckType: values.truckType,
      truckCostUom: values.truckCostUom,
      truckCostQty: values.truckCostQty,
      truckCostPrice: dollarsToCents(values.truckCostPrice),
      totalTruckCostPrice: dollarsToCents(values.totalTruckCostPrice),
      truckSellUom: values.truckSellUom,
      truckSellQty: values.truckSellQty,
      truckSellPrice: dollarsToCents(values.truckSellPrice),
      totalTruckSellPrice: dollarsToCents(values.totalTruckSellPrice),
      grossProfit: dollarsToCents(values.grossProfit || 0),
      totalQuantityRequired: values.productSellQty,
      allocatedQuantity: 0,
      remainingQuantity: values.productSellQty,
      requiredLoads: selectedLineItem?.requiredLoads,
      version: 1,
    };

    if (isEditing && selectedLineItem?.id) {
      quoteItemData.id = selectedLineItem.id;
    }

    try {
      if (isEditing && selectedLineItem?.id) {
        await updateQuoteItem.mutateAsync({
          id: selectedLineItem.id,
          data: quoteItemData,
        });
        notifySuccess('Line item Updated');
      } else {
        await createQuoteItem.mutateAsync(quoteItemData);
        notifySuccess('Line item Added');
      }
      form.reset();
      onSaved?.();
      onSuccess?.();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} line item:`,
        error
      );

      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const messageFromErr = err?.message || extractedMessage;

      // Fallback error using extracted message
      notifyError(
        messageFromErr ||
          `Failed to ${
            isEditing ? 'update' : 'add'
          } line item. Please try again.`
      );
    }
  }

  return {
    isEditing,
    isReadOnly,
    form,
    selectedLineItem,
    selectedQuotation,
    selectedQuarrySupplierProduct,
    quoteType,
    addressInput,
    setAddressInput,
    addressSearchInput,
    setAddressSearchInput,
    productOptions,
    quarryOptions,
    truckTypeOptions,
    productUnitOptions,
    truckUnitOptions,
    selectedProductId,
    pricingBreakdown,
    gst,
    totalInvoiceIncGST,
    handleSubmit,
    onSubmit,
    isPending: createQuoteItem.isPending || updateQuoteItem.isPending,
    customerDeliveryAddressSuggestions,
    handleDeleteDeliveryAddress,
  };
}
