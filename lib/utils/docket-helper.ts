// Docket Helpers

export const calculateConvertedQty = (
  quantity: number,
  fromUom: string,
  toUom: string,
  density: number = 1,
) => {
  if (fromUom === toUom) return quantity;

  let quantityInTn = quantity;
  const normalizedFrom = fromUom.toLowerCase();
  const normalizedTo = toUom.toLowerCase();

  if (normalizedFrom === 'm3' || normalizedFrom === 'bulka') {
    quantityInTn = quantity * density;
  } else if (normalizedFrom === '20kg' || normalizedFrom === 'kg_20') {
    quantityInTn = quantity / 50;
  }

  if (normalizedTo === 'm3' || normalizedTo === 'bulka') {
    return quantityInTn / density;
  } else if (normalizedTo === '20kg' || normalizedTo === 'kg_20') {
    return quantityInTn * 50;
  }

  return quantityInTn;
};

/**
 * Calculated Gross Weight = truck tare weight + the load converted to tonnes.
 * Returns null when no tare weight is available (e.g. no truck assigned).
 */
export function calculateGrossWeight({
  tareWeight,
  loadSize,
  productUom,
  density = 1,
}: {
  tareWeight: number | null | undefined;
  loadSize: number;
  productUom: string;
  density?: number;
}): number | null {
  if (tareWeight == null) return null;
  const loadInTn = calculateConvertedQty(
    loadSize || 0,
    productUom || 'TN',
    'TN',
    density,
  );
  return tareWeight + parseFloat(loadInTn.toString());
}

export function convertTruckVolumeToProductUom(
  tankVolumeM3: number,
  productUom: string,
  density: number = 1,
): number {
  return (
    Math.round(
      calculateConvertedQty(tankVolumeM3, 'M3', productUom, density) * 100,
    ) / 100
  );
}

export function getDeliveryDistanceQuantity({
  isCollection,
  needTruckQty,
  truckQty,
  loadSize,
  productUom,
  truckUom,
  density,
}: {
  isCollection: boolean;
  needTruckQty?: boolean;
  truckQty?: number;
  loadSize: number;
  productUom: string;
  truckUom?: string;
  density: number;
}): { quantity: number; uom: string } {
  let deliveryDistanceUom = truckUom || 'TN';
  const validUoms = ['KG_20', 'KM', 'LOAD', 'TN', 'BULKA', 'HOURLY', 'M3'];

  if (!validUoms.includes(deliveryDistanceUom)) {
    const uomMap: Record<string, string> = {
      '20kg': 'KG_20',
      km: 'KM',
      Load: 'LOAD',
      TN: 'TN',
      Bulka: 'BULKA',
      Hourly: 'HOURLY',
      m3: 'M3',
    };
    deliveryDistanceUom = uomMap[deliveryDistanceUom] || 'TN';
  }

  if (isCollection) {
    return { quantity: 0, uom: deliveryDistanceUom };
  }

  let quantity = 0;
  const manualInputUoms = ['HOURLY', 'LOAD', 'KM'];

  if (needTruckQty || manualInputUoms.includes(deliveryDistanceUom)) {
    quantity = truckQty || 0;
  } else {
    quantity = calculateConvertedQty(
      loadSize,
      productUom,
      deliveryDistanceUom,
      density,
    );
  }

  // Round to 2 decimal places to avoid out of bounds errors on the backend
  quantity = Math.round(quantity * 100) / 100;

  return { quantity, uom: deliveryDistanceUom };
}
