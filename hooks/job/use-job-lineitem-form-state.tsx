import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useQuery } from '@tanstack/react-query';

import { NewJobLineItemFormSchema } from '@/app/(protected)/customer-operations/jobs/(components)/forms/schemas/job-line-item-form-schema';
import {
  ProductsListQueryOptions,
  ProductDetailWithQuarrySupplierProductQueryOptions,
} from '@/lib/api/product';
import {
  CustomerDeliveryAddressesQueryOptions,
  useUpdateDeliveryAddressUsage,
} from '@/lib/api/customer';
import {
  JobItemByIdQueryOptions,
  JobItemsQueryOptions,
  useCreateJobItem,
  useUpdateJobItem,
} from '@/lib/api/job';
import { useSelectedJob } from '@/app/stores/job-store';
import { notifyError, notifySuccess } from '@/lib/toast';
import {
  centsToDollarsNum,
  dollarsToCents,
  roundToTwoDecimals,
} from '@/lib/utils/currency';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { scrollToFirstError } from '@/lib/utils';
import { JobItem } from '@/lib/types/job';
import { JOB_LINE_ITEM_TYPE } from '@/lib/types/job-enums';
import { QuarrySupplierProduct } from '@/lib/types/quarry';
import {
  AddressType,
  Address,
  CustomerDeliveryAddress,
} from '@/lib/types/address';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { toAddressType } from '@/lib/utils/address-helper';
import { toAddressPayload } from '@/lib/utils/address-helper';

type FormValues = z.infer<typeof NewJobLineItemFormSchema>;

export type SelectOption = { label: string; value: number | string };

type Props = {
  id?: number;
  canEdit?: boolean;
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
  costSubtotalExGST: number;
  costGst: number;
  totalCost: number;
  invoiceSubtotalExGST: number;
  invoiceGst: number;
  totalInvoiceInclGst: number;
};

export function useJobLineItemFormState({
  id,
  canEdit,
  onSuccess,
  onSaved,
}: Props) {
  const isEditing = Boolean(id && id > 0);
  const jobLineItemId = Number(id || 0);

  const { data: jobLineItemData } = useQuery({
    ...JobItemByIdQueryOptions(jobLineItemId),
    enabled: isEditing && jobLineItemId > 0,
  });

  const isDocketLinked = React.useMemo(() => {
    return Boolean(jobLineItemData?.allocatedQuantity && jobLineItemData.allocatedQuantity > 0);
  }, [jobLineItemData]);

  const selectedJob = useSelectedJob();

  const isReadOnly = (isEditing && !canEdit) || isDocketLinked || selectedJob?.jobStatus === JOB_STATUS.CANCELLED;

  const isProductDeletedOnCompletedJob = React.useMemo(() => {
    return (
      isEditing &&
      selectedJob?.jobStatus === JOB_STATUS.COMPLETED &&
      jobLineItemData?.product?.deleted === true
    );
  }, [isEditing, selectedJob?.jobStatus, jobLineItemData?.product?.deleted]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const jobId = jobLineItemData?.jobId ?? selectedJob?.id ?? 0;
  const { data: jobWithItems } = useQuery({
    ...JobItemsQueryOptions(jobId),
    enabled: jobId > 0,
  });

  const getFormValuesFromLineItem = React.useCallback((): FormValues => {
    return {
      type: jobLineItemData?.jobItemType ?? JOB_LINE_ITEM_TYPE.DELIVERY,
      address: isEditing
        ? (jobLineItemData?.customerDeliveryAddress?.address
          ?.formattedAddress ?? '')
        : '',
      productId: isEditing ? (jobLineItemData?.productId ?? 0) : 0,
      quarrySupplierId: isEditing
        ? (jobLineItemData?.quarrySupplierId ?? 0)
        : 0,
      supplierProductName: '', // Not present in jobItems, will be populated by effect
      productCostUom: isEditing ? (jobLineItemData?.productCostUom ?? '') : '',
      densityTonnagePerM3: isEditing ? (jobLineItemData?.densityTonnagePerM3 ?? 0) : 0,
      productCostQty: isEditing ? (jobLineItemData?.productCostQty ?? 0) : 0,
      productCostPrice: isEditing
        ? centsToDollarsNum(jobLineItemData?.productCostPrice || 0)
        : 0,
      productSellUom: isEditing ? (jobLineItemData?.productSellUom ?? '') : '',
      productSellQty: isEditing ? (jobLineItemData?.productSellQty ?? 0) : 0,
      productSellPrice: isEditing
        ? centsToDollarsNum(jobLineItemData?.productSellPrice || 0)
        : 0,
      truckType: isEditing ? (jobLineItemData?.truckType ?? '') : '',
      truckCostUom: isEditing ? (jobLineItemData?.truckCostUom ?? '') : '',
      truckCostQty: isEditing ? (jobLineItemData?.truckCostQty ?? 0) : 0,
      truckCostPrice: isEditing
        ? centsToDollarsNum(jobLineItemData?.truckCostPrice || 0)
        : 0,
      truckSellUom: isEditing ? (jobLineItemData?.truckSellUom ?? '') : '',
      truckSellQty: isEditing ? (jobLineItemData?.truckSellQty ?? 0) : 0,
      truckSellPrice: isEditing
        ? centsToDollarsNum(jobLineItemData?.truckSellPrice || 0)
        : 0,
      totalProductCostPrice: isEditing
        ? centsToDollarsNum(jobLineItemData?.totalProductCostPrice || 0)
        : 0,
      totalTruckCostPrice: isEditing
        ? centsToDollarsNum(jobLineItemData?.totalTruckCostPrice || 0)
        : 0,
      totalProductSellPrice: isEditing
        ? centsToDollarsNum(jobLineItemData?.totalProductSellPrice || 0)
        : 0,
      totalTruckSellPrice: isEditing
        ? centsToDollarsNum(jobLineItemData?.totalTruckSellPrice || 0)
        : 0,
      grossProfit: 0, // Not present in jobItems, calculated in form
    };
  }, [isEditing, jobLineItemData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(NewJobLineItemFormSchema),
    mode: 'onChange',
    defaultValues: getFormValuesFromLineItem(),
  });

  const [addressInput, setAddressInput] = React.useState<AddressType>(() =>
    toAddressType(jobLineItemData?.customerDeliveryAddress?.address ?? null),
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
    if (!jobLineItemData?.customerDeliveryAddress?.address) {
      return;
    }
    setAddressInput(
      toAddressType(jobLineItemData.customerDeliveryAddress?.address),
    );
  }, [isEditing, jobLineItemData?.customerDeliveryAddress?.address]);

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
    if (!jobLineItemData) return;
    if (id && jobLineItemData?.id && jobLineItemData.id !== id) return;
    form.reset(getFormValuesFromLineItem(), {
      keepDirty: false,
      keepTouched: false,
    });
  }, [form, getFormValuesFromLineItem, id, isEditing, jobLineItemData]);

  const jobItemType = form.watch('type');

  // If collection, zero out truck fields so they don't affect totals / submit payload
  React.useEffect(() => {
    if (jobItemType !== JOB_LINE_ITEM_TYPE.COLLECTION) return;
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
  }, [jobItemType, form]);

  // Products
  const { data: products } = useQuery(ProductsListQueryOptions());
  const productOptions: SelectOption[] = React.useMemo(() => {
    if (!products) return [];
    return products
      .map((product) => ({
        label: product.productName,
        value: product.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  // Customer delivery addresses (for DELIVERY quote type)
  const customerId =
    selectedJob?.customerId ||
    selectedJob?.customerWithAddressResponse?.id ||
    0;
  const isDelivery = jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY;

  const { data: deliveryAddresses } = useQuery({
    ...CustomerDeliveryAddressesQueryOptions(customerId, 5),
    enabled: !!customerId && isDelivery && !isEditing,
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
    [customerId, updateDeliveryAddressUsage],
  );

  // Get billing address for comparison (pinned address for delivery quotes)
  const billingAddress =
    jobWithItems?.customerWithAddressResponse?.billingAddress ??
    selectedJob?.customerWithAddressResponse?.billingAddress;
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
    ProductDetailWithQuarrySupplierProductQueryOptions(selectedProductId),
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
      a.name.localeCompare(b.name),
    );
  }, [productDetailsQuery.data, selectedProductId]);

  const quarryOptions: SelectOption[] = React.useMemo(
    () => quarrySuppliers.map((q) => ({ label: q.name, value: q.id })),
    [quarrySuppliers],
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
      details.quarrySupplierProducts,
    )
      ? (details.quarrySupplierProducts as QuarrySupplierProduct[])
      : [];
    return qsps.find(
      (qsp: QuarrySupplierProduct) =>
        Number(qsp?.quarrySupplierId || 0) === currentQuarryId,
    );
  }, [
    productDetailsQuery.data,
    selectedProductId,
    watchedQuarrySupplierId,
    form,
  ]);

  // Reset dependent fields when product changes
  React.useEffect(() => {
    const currentProductId = Number(form.getValues('productId') || 0);
    const initialProductId = Number(
      isEditing ? (jobLineItemData?.productId ?? 0) : 0,
    );
    if (currentProductId !== initialProductId) {
      const opts = { shouldDirty: false } as const;
      form.setValue('quarrySupplierId', 0, opts);
      form.setValue('supplierProductName', '', opts);
      form.setValue('densityTonnagePerM3', 0, opts);
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
      if (jobLineItemData?.jobItemType === JOB_LINE_ITEM_TYPE.COLLECTION) {
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
  }, [
    selectedProductId,
    isEditing,
    jobLineItemData?.productId,
    form,
    jobLineItemData?.jobItemType,
  ]);

  // Reset pricing and address when quarry changes
  const quarryId = form.watch('quarrySupplierId');
  React.useEffect(() => {
    const currentQuarryId = Number(form.getValues('quarrySupplierId') || 0);
    const initialQuarryId = Number(
      isEditing ? (jobLineItemData?.quarrySupplierId ?? 0) : 0,
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

      // Clear address when quarry changes for Collection jobs
      if (jobLineItemData?.jobItemType === JOB_LINE_ITEM_TYPE.COLLECTION) {
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
  }, [
    quarryId,
    isEditing,
    jobLineItemData?.quarrySupplierId ?? 0,
    form,
    jobLineItemData?.jobItemType,
  ]);

  // Populate supplierProductName and density from selected quarry supplier product
  React.useEffect(() => {
    const currentProductId = Number(form.getValues('productId') || 0);
    const currentQuarryId = Number(form.getValues('quarrySupplierId') || 0);
    const details = productDetailsQuery.data;

    if (!isEditing && (!currentProductId || !currentQuarryId)) {
      form.setValue('densityTonnagePerM3', 0, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }

    if (
      !details ||
      !currentProductId ||
      details.id !== currentProductId ||
      !currentQuarryId
    ) {
      return;
    }
    const qsps: QuarrySupplierProduct[] = Array.isArray(
      details.quarrySupplierProducts,
    )
      ? (details.quarrySupplierProducts as QuarrySupplierProduct[])
      : [];
    const matched = qsps.find(
      (qsp: QuarrySupplierProduct) =>
        Number(qsp?.quarrySupplierId || 0) === currentQuarryId,
    );
    const supplierProductName = matched?.supplierProductName || '';
    if (supplierProductName) {
      // Don't mark as dirty for auto-population.
      form.setValue('supplierProductName', supplierProductName, {
        shouldDirty: false,
      });
    }

    if (!isEditing) {
      const qspDensity = Number(matched?.densityTonnagePerM3 ?? 0);
      const productDensity = Number(details.densityTonnagePerM3 ?? 0);
      const resolvedDensity = qspDensity > 0 ? qspDensity : productDensity;
      form.setValue('densityTonnagePerM3', resolvedDensity, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [quarryId, selectedProductId, productDetailsQuery.data, form, isEditing]);

  // Static options
  const truckTypeOptions: SelectOption[] = React.useMemo(
    () => [
      { label: 'Truck', value: 'TRUCK' },
      { label: 'Semi-Trailer', value: 'SEMI_TRAILER' },
      { label: 'Truck + Trailer', value: 'TRUCK_AND_TRAILER' },
      { label: 'Rigid truck', value: 'RIGID_TRUCK' },
      { label: 'Flatbed', value: 'FLATBED' },
      { label: 'Tipper', value: 'TIPPER' },
      { label: 'Tandem', value: 'TANDEM' },
      { label: 'Quad', value: 'QUAD' },
      { label: 'Tri-Axle', value: 'TRI_AXLE' },
      { label: 'Tautliner', value: 'TAUTLINER' },
      { label: 'Crane Truck', value: 'CRANE_TRUCK' },
    ],
    [],
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
    if (qsp?.availableForTruckRateKm) opts.push({ label: 'km', value: 'KM' });
    if (qsp?.availableForTruckRate20kg)
      opts.push({ label: '20kg', value: 'KG_20' });
    if (qsp?.availableForTruckRateBulka)
      opts.push({ label: 'Bulka', value: 'BULKA' });
    return opts;
  }, [selectedQuarrySupplierProduct]);

  // Auto-fill product pricing on UOM changes
  const productCostUom = form.watch('productCostUom');
  const productSellUom = form.watch('productSellUom');
  const productSellQty = form.watch('productSellQty');
  const densityTonnagePerM3 = form.watch('densityTonnagePerM3');

  // Helper conversion functions (reusable)
  const toTn = React.useCallback(
    (q: number, unit: string, density: number): number => {
      switch (unit) {
        case 'TN':
          return q;
        case 'M3':
          return density > 0 ? q * density : 0;
        case 'KG_20':
          return q / 50; // 50 x 20kg bags = 1 tonne
        case 'BULKA':
          return density > 0 ? q * density : 0; // 1 bulka = 1 m3
        default:
          return 0;
      }
    },
    [],
  );

  const fromTn = React.useCallback(
    (tn: number, unit: string, density: number): number => {
      switch (unit) {
        case 'TN':
          return tn;
        case 'M3':
          return density > 0 ? tn / density : 0;
        case 'KG_20':
          return tn * 50;
        case 'BULKA':
          return density > 0 ? tn / density : 0; // 1 bulka = 1 m3
        default:
          return 0;
      }
    },
    [],
  );

  // Auto-calculate product cost quantity based on sell quantity/UOM and density
  React.useEffect(() => {
    const density = Number(densityTonnagePerM3 || 0);
    const from = form.getValues('productSellUom') || '';
    const to = form.getValues('productCostUom') || '';
    const qty = Number(form.getValues('productSellQty') || 0);

    if (!qty || qty <= 0) {
      form.setValue('productCostQty', 0, {
        shouldDirty: false,
        shouldValidate: true,
      });
      return;
    }

    if (!from || !to) {
      // If units are not selected yet, clear cost qty
      form.setValue('productCostQty', 0, { shouldDirty: false });
      return;
    }

    // If the same unit, cost qty = sell qty
    if (from === to) {
      form.setValue('productCostQty', qty, { shouldDirty: false });
      return;
    }

    // Convert via TN
    const tn = toTn(qty, from, density);
    const converted = fromTn(tn, to, density);
    const roundedConverted = Number.isFinite(converted)
      ? roundToTwoDecimals(converted)
      : 0;
    form.setValue('productCostQty', roundedConverted, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [
    productSellQty,
    productSellUom,
    productCostUom,
    densityTonnagePerM3,
    form,
    toTn,
    fromTn,
  ]);

  React.useEffect(() => {
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (!qsp) return;

    // In edit mode, don't overwrite existing price unless UOM or quarry actually changed
    if (isEditing) {
      const initialUom = jobLineItemData?.productCostUom || '';
      const currentUom = form.getValues('productCostUom') || '';
      const initialQuarryId = Number(jobLineItemData?.quarrySupplierId ?? 0);
      const currentQuarryId = Number(form.getValues('quarrySupplierId') || 0);
      if (currentUom === initialUom && currentQuarryId === initialQuarryId) {
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
    jobLineItemData?.productCostUom,
  ]);

  React.useEffect(() => {
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (!qsp) return;

    // In edit mode, don't overwrite existing price unless UOM or quarry actually changed
    if (isEditing) {
      const initialUom = jobLineItemData?.productSellUom || '';
      const currentUom = form.getValues('productSellUom') || '';
      const initialQuarryId = Number(jobLineItemData?.quarrySupplierId ?? 0);
      const currentQuarryId = Number(form.getValues('quarrySupplierId') || 0);
      if (currentUom === initialUom && currentQuarryId === initialQuarryId) {
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
    jobLineItemData?.productSellUom,
  ]);

  // Auto-fill truck pricing on UOM changes
  const truckCostUom = form.watch('truckCostUom');
  const truckSellUom = form.watch('truckSellUom');

  React.useEffect(() => {
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (!qsp) return;

    // In edit mode, don't overwrite existing price unless UOM or quarry actually changed
    if (isEditing) {
      const initialUom = jobLineItemData?.truckCostUom || '';
      const currentUom = form.getValues('truckCostUom') || '';
      const initialQuarryId = Number(jobLineItemData?.quarrySupplierId ?? 0);
      const currentQuarryId = Number(form.getValues('quarrySupplierId') || 0);
      if (currentUom === initialUom && currentQuarryId === initialQuarryId) {
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
      case 'KG_20':
        rate = centsToDollarsNum(qsp.kg20TruckRate || 0);
        break;
      case 'BULKA':
        rate = centsToDollarsNum(qsp.bulkaTruckRate || 0);
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
    jobLineItemData?.truckCostUom,
  ]);

  React.useEffect(() => {
    const qsp = selectedQuarrySupplierProduct as
      | QuarrySupplierProduct
      | undefined;
    if (!qsp) return;

    // In edit mode, don't overwrite existing price unless UOM or quarry actually changed
    if (isEditing) {
      const initialUom = jobLineItemData?.truckSellUom || '';
      const currentUom = form.getValues('truckSellUom') || '';
      const initialQuarryId = Number(jobLineItemData?.quarrySupplierId ?? 0);
      const currentQuarryId = Number(form.getValues('quarrySupplierId') || 0);
      if (currentUom === initialUom && currentQuarryId === initialQuarryId) {
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
      case 'KG_20':
        rate = centsToDollarsNum(qsp.kg20TruckRate || 0);
        break;
      case 'BULKA':
        rate = centsToDollarsNum(qsp.bulkaTruckRate || 0);
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
    jobLineItemData?.truckSellUom,
  ]);

  // Reset truck UOMs when truck type changes
  const truckType = form.watch('truckType');
  React.useEffect(() => {
    const currentTruckType = form.getValues('truckType');
    const initialTruckType = isEditing ? jobLineItemData?.truckType : '';
    if (currentTruckType !== initialTruckType) {
      form.setValue('truckCostUom', '', { shouldDirty: false });
      form.setValue('truckSellUom', '', { shouldDirty: false });
    }
  }, [truckType, isEditing, jobLineItemData?.truckType, form]);

  // Auto-calculate truck sell qty when UOM is TN, M3, BULKA, or KG_20
  React.useEffect(() => {
    const density = Number(densityTonnagePerM3 || 0);
    const productSellQty = Number(form.getValues('productSellQty') || 0);
    const productSellUom = form.getValues('productSellUom') || '';
    const currentTruckSellUom = form.getValues('truckSellUom') || '';

    // Only auto-calculate for TN, M3, BULKA, KG_20
    const autoCalculateUoms = ['TN', 'M3', 'BULKA', 'KG_20'];
    if (!autoCalculateUoms.includes(currentTruckSellUom)) {
      return; // Let user input for HOURLY, LOAD, KM
    }

    if (
      !productSellQty ||
      productSellQty <= 0 ||
      !productSellUom ||
      !currentTruckSellUom
    ) {
      form.setValue('truckSellQty', 0, { shouldDirty: false });
      return;
    }

    // Convert product sell qty to TN, then to truck sell UOM
    const tn = toTn(productSellQty, productSellUom, density);
    const converted = fromTn(tn, currentTruckSellUom, density);
    const roundedConverted = Number.isFinite(converted)
      ? roundToTwoDecimals(converted)
      : 0;
    form.setValue('truckSellQty', roundedConverted, { shouldDirty: false });
  }, [
    productSellQty,
    productSellUom,
    truckSellUom,
    densityTonnagePerM3,
    form,
    toTn,
    fromTn,
  ]);

  // Auto-calculate truck cost qty when UOM is TN, M3, BULKA, or KG_20
  React.useEffect(() => {
    const density = Number(densityTonnagePerM3 || 0);
    const productSellQty = Number(form.getValues('productSellQty') || 0);
    const productSellUom = form.getValues('productSellUom') || '';
    const currentTruckCostUom = form.getValues('truckCostUom') || '';

    // Only auto-calculate for TN, M3, BULKA, KG_20
    const autoCalculateUoms = ['TN', 'M3', 'BULKA', 'KG_20'];
    if (!autoCalculateUoms.includes(currentTruckCostUom)) {
      return; // Let user input for HOURLY, LOAD, KM
    }

    if (
      !productSellQty ||
      productSellQty <= 0 ||
      !productSellUom ||
      !currentTruckCostUom
    ) {
      form.setValue('truckCostQty', 0, { shouldDirty: false });
      return;
    }

    // Convert product sell qty to TN, then to truck cost UOM
    const tn = toTn(productSellQty, productSellUom, density);
    const converted = fromTn(tn, currentTruckCostUom, density);
    const roundedConverted = Number.isFinite(converted)
      ? roundToTwoDecimals(converted)
      : 0;
    form.setValue('truckCostQty', roundedConverted, { shouldDirty: false });
  }, [
    productSellQty,
    productSellUom,
    truckCostUom,
    densityTonnagePerM3,
    form,
    toTn,
    fromTn,
  ]);

  // Auto-sync truck cost qty with truck sell qty if both use the same manual input UOM
  const watchedTruckSellQty = form.watch('truckSellQty');
  React.useEffect(() => {
    const currentTruckCostUom = form.getValues('truckCostUom') || '';
    const currentTruckSellUom = form.getValues('truckSellUom') || '';
    const manualInputUoms = ['HOURLY', 'LOAD', 'KM'];

    if (
      manualInputUoms.includes(currentTruckCostUom) &&
      currentTruckCostUom === currentTruckSellUom
    ) {
      form.setValue('truckCostQty', watchedTruckSellQty, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [truckCostUom, truckSellUom, watchedTruckSellQty, form]);

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
      costSubtotalExGST: 0,
      costGst: 0,
      totalCost: 0,
      invoiceSubtotalExGST: 0,
      invoiceGst: 0,
      totalInvoiceInclGst: 0,
    });
  const productCostQty = form.watch('productCostQty');
  const productCostPrice = form.watch('productCostPrice');
  const truckCostQty = form.watch('truckCostQty');
  const truckCostPrice = form.watch('truckCostPrice');
  const productSellPrice = form.watch('productSellPrice');
  const truckSellQty = form.watch('truckSellQty');
  const truckSellPrice = form.watch('truckSellPrice');
  React.useEffect(() => {
    const values = form.getValues();
    const totalProductCostPrice = roundToTwoDecimals(
      (values.productCostQty || 0) * (values.productCostPrice || 0),
    );
    const totalTruckCostPrice = roundToTwoDecimals(
      (values.truckCostQty || 0) * (values.truckCostPrice || 0),
    );
    const totalProductSellPrice = roundToTwoDecimals(
      (values.productSellQty || 0) * (values.productSellPrice || 0),
    );
    const totalTruckSellPrice = roundToTwoDecimals(
      (values.truckSellQty || 0) * (values.truckSellPrice || 0),
    );
    const costSubtotalExGST = roundToTwoDecimals(
      totalProductCostPrice + totalTruckCostPrice,
    );
    const costGst = roundToTwoDecimals(costSubtotalExGST * 0.1);
    const totalCost = roundToTwoDecimals(costSubtotalExGST + costGst);
    const totalInvoice = roundToTwoDecimals(
      totalProductSellPrice + totalTruckSellPrice,
    );
    const invoiceGst = roundToTwoDecimals(totalInvoice * 0.1);
    const totalInvoiceInclGst = roundToTwoDecimals(totalInvoice + invoiceGst);
    // Gross profit = Total Invoice (incl. GST) - Total Cost (incl. GST)
    const grossProfit = roundToTwoDecimals(totalInvoiceInclGst - totalCost);
    const grossProfitPercentage =
      totalInvoiceInclGst > 0
        ? roundToTwoDecimals((grossProfit / totalInvoiceInclGst) * 100)
        : 0;

    setPricingBreakdown({
      totalProductCostPrice,
      totalTruckCostPrice,
      totalProductSellPrice,
      totalTruckSellPrice,
      totalInvoice,
      grossProfit,
      grossProfitPercentage,
      costSubtotalExGST,
      costGst,
      totalCost,
      invoiceSubtotalExGST: totalInvoice,
      invoiceGst,
      totalInvoiceInclGst,
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

  const createJobItem = useCreateJobItem();
  const updateJobItem = useUpdateJobItem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit(onSubmit, scrollToFirstError)(e);
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    if (!selectedJob?.id) {
      throw new Error('No job selected');
    }

    const originalAddress = jobLineItemData?.customerDeliveryAddress?.address;

    const mappedAddress = toAddressPayload(
      addressInput,
      originalAddress as Address,
    );
    const addressPayload = mappedAddress
      ? (({ id, ...rest }) => rest)(mappedAddress)
      : undefined;

    const customerDeliveryAddress:
      | Partial<CustomerDeliveryAddress>
      | undefined =
      addressPayload && customerId
        ? {
          ...(isEditing && jobLineItemData?.customerDeliveryAddress?.id
            ? { id: jobLineItemData.customerDeliveryAddress.id }
            : {}),
          customerId,
          addressId:
            isEditing && jobLineItemData?.customerDeliveryAddress?.addressId
              ? jobLineItemData.customerDeliveryAddress.addressId
              : mappedAddress?.id,
          address: addressPayload,
          inUse: true,
          lastUsedAt: jobLineItemData?.customerDeliveryAddress?.lastUsedAt,
        }
        : undefined;

    const payload: Partial<JobItem> = {
      jobId: selectedJob.id,
      jobItemType: values.type,
      productId: values.productId,
      quarrySupplierId: values.quarrySupplierId,

      densityTonnagePerM3: values.densityTonnagePerM3,

      customerDeliveryAddressId:
        isEditing && jobLineItemData?.customerDeliveryAddress?.id
          ? customerDeliveryAddress?.id
          : undefined,
      customerDeliveryAddress,

      // Product pricing
      productCostUom: values.productCostUom,
      productCostQty: values.productCostQty || 0,
      productCostPrice: dollarsToCents(values.productCostPrice),
      totalProductCostPrice: dollarsToCents(values.totalProductCostPrice),
      productSellUom: values.productSellUom,
      productSellQty: values.productSellQty || 0,
      productSellPrice: dollarsToCents(values.productSellPrice),
      totalProductSellPrice: dollarsToCents(values.totalProductSellPrice),

      // Truck pricing
      truckType: values.truckType || undefined,
      truckCostUom: values.truckCostUom,
      truckCostQty: values.truckCostQty,
      truckCostPrice: dollarsToCents(values.truckCostPrice ?? 0),
      totalTruckCostPrice: dollarsToCents(values.totalTruckCostPrice ?? 0),
      truckSellUom: values.truckSellUom,
      truckSellQty: values.truckSellQty || 0,
      truckSellPrice: dollarsToCents(values.truckSellPrice ?? 0),
      totalTruckSellPrice: dollarsToCents(values.totalTruckSellPrice ?? 0),

      totalQuantityRequired: values.productSellQty || 0,
      allocatedQuantity: 0,
      remainingQuantity: values.productSellQty || 0,
      grossProfit: dollarsToCents(values.grossProfit || 0),
      version: jobLineItemData?.version || 1,
    };

    if (isEditing && jobLineItemData?.id) {
      payload.id = jobLineItemData.id;
    }
    try {
      if (isEditing && jobLineItemData?.id) {
        await updateJobItem.mutateAsync({
          id: jobLineItemData.id,
          data: payload,
        });
        notifySuccess('Job line item updated successfully');
      } else {
        console.log('payload is ', payload);
        await createJobItem.mutateAsync(payload);
        notifySuccess('Job line item created successfully');
      }
      form.reset();
      onSaved?.();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save job line item:', error);
      notifyError(extractErrorMessage(error) || 'Failed to save job line item');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isEditing,
    isReadOnly,
    form,
    jobLineItemData,
    selectedJob,
    billingAddress,
    selectedQuarrySupplierProduct,
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
    handleSubmit,
    onSubmit,
    isPending:
      isSubmitting || createJobItem.isPending || updateJobItem.isPending,
    customerDeliveryAddressSuggestions,
    handleDeleteDeliveryAddress,
    productDetails: productDetailsQuery.data,
    isSubmitting,
    isProductDeletedOnCompletedJob,
  };
}
