import { describe, expect, test } from 'vitest';
import {
  shouldUseActualLoadSizeForGvm,
  formatUomLabel,
  calculateConvertedQty,
  calculateGrossWeight,
  convertTruckVolumeToProductUom,
  getDeliveryDistanceQuantity,
} from '../docket-helper';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';

describe('shouldUseActualLoadSizeForGvm', () => {
  test('returns false when not a delivery', () => {
    expect(shouldUseActualLoadSizeForGvm(DOCKET_STATUS.DELIVERED, false)).toBe(
      false,
    );
  });

  test('returns false when status is missing', () => {
    expect(shouldUseActualLoadSizeForGvm(undefined, true)).toBe(false);
  });

  test('returns true for post-assignment delivery statuses', () => {
    for (const status of [
      DOCKET_STATUS.IN_TRANSIT,
      DOCKET_STATUS.ARRIVED,
      DOCKET_STATUS.DELIVERED,
      DOCKET_STATUS.STOPPED,
      DOCKET_STATUS.VOIDED,
      DOCKET_STATUS.CANCELLED,
      DOCKET_STATUS.INVOICED,
    ]) {
      expect(shouldUseActualLoadSizeForGvm(status, true)).toBe(true);
    }
  });

  test('returns false for pre-assignment delivery statuses', () => {
    expect(shouldUseActualLoadSizeForGvm(DOCKET_STATUS.ASSIGNED, true)).toBe(
      false,
    );
    expect(
      shouldUseActualLoadSizeForGvm(DOCKET_STATUS.UNASSIGNED, true),
    ).toBe(false);
  });
});

describe('formatUomLabel', () => {
  test('maps known UOMs (case-insensitive) to display labels', () => {
    expect(formatUomLabel('kg_20')).toBe('x 20kg');
    expect(formatUomLabel('20KG')).toBe('x 20kg');
    expect(formatUomLabel('M3')).toBe('m³');
    expect(formatUomLabel('bulka')).toBe('Bulka');
    expect(formatUomLabel('TN')).toBe('TN');
    expect(formatUomLabel('hourly')).toBe('Hourly');
    expect(formatUomLabel('LOAD')).toBe('Load');
    expect(formatUomLabel('km')).toBe('km');
  });

  test('returns the original string for unknown UOMs', () => {
    expect(formatUomLabel('WEIRD')).toBe('WEIRD');
  });
});

describe('calculateConvertedQty', () => {
  test('returns the same quantity when units match', () => {
    expect(calculateConvertedQty(10, 'TN', 'TN')).toBe(10);
  });

  test('converts M3 to TN using density', () => {
    expect(calculateConvertedQty(10, 'M3', 'TN', 2)).toBe(20);
  });

  test('converts TN to M3 using density', () => {
    expect(calculateConvertedQty(20, 'TN', 'M3', 2)).toBe(10);
  });

  test('converts 20kg units to TN (divide by 50)', () => {
    expect(calculateConvertedQty(50, 'kg_20', 'TN')).toBe(1);
  });

  test('converts TN to 20kg units (multiply by 50)', () => {
    expect(calculateConvertedQty(1, 'TN', '20kg')).toBe(50);
  });

  test('defaults density to 1 when not provided', () => {
    expect(calculateConvertedQty(10, 'M3', 'TN')).toBe(10);
  });
});

describe('calculateGrossWeight', () => {
  test('returns null when tare weight is not available', () => {
    expect(
      calculateGrossWeight({
        tareWeight: null,
        loadSize: 10,
        productUom: 'TN',
      }),
    ).toBeNull();
  });

  test('adds tare weight to the load converted to tonnes', () => {
    expect(
      calculateGrossWeight({
        tareWeight: 5000,
        loadSize: 10,
        productUom: 'TN',
      }),
    ).toBe(5010);
  });

  test('converts non-TN load sizes before summing', () => {
    expect(
      calculateGrossWeight({
        tareWeight: 5000,
        loadSize: 10,
        productUom: 'M3',
        density: 2,
      }),
    ).toBe(5020);
  });
});

describe('convertTruckVolumeToProductUom', () => {
  test('converts m3 volume to product UOM and rounds to 2 decimals', () => {
    expect(convertTruckVolumeToProductUom(10, 'TN', 1.5)).toBe(15);
  });

  test('rounds fractional results to 2 decimal places', () => {
    expect(convertTruckVolumeToProductUom(1, 'TN', 1.333)).toBe(1.33);
  });
});

describe('getDeliveryDistanceQuantity', () => {
  test('returns 0 quantity for collections', () => {
    expect(
      getDeliveryDistanceQuantity({
        isCollection: true,
        loadSize: 10,
        productUom: 'TN',
        truckUom: 'TN',
        density: 1,
      }),
    ).toEqual({ quantity: 0, uom: 'TN' });
  });

  test('uses truck quantity directly for HOURLY/LOAD/KM uoms', () => {
    expect(
      getDeliveryDistanceQuantity({
        isCollection: false,
        truckQty: 3,
        loadSize: 10,
        productUom: 'TN',
        truckUom: 'HOURLY',
        density: 1,
      }),
    ).toEqual({ quantity: 3, uom: 'HOURLY' });
  });

  test('uses truck quantity when needTruckQty is set regardless of uom', () => {
    expect(
      getDeliveryDistanceQuantity({
        isCollection: false,
        needTruckQty: true,
        truckQty: 5,
        loadSize: 10,
        productUom: 'TN',
        truckUom: 'TN',
        density: 1,
      }),
    ).toEqual({ quantity: 5, uom: 'TN' });
  });

  test('converts load size into the truck UOM otherwise', () => {
    expect(
      getDeliveryDistanceQuantity({
        isCollection: false,
        loadSize: 10,
        productUom: 'M3',
        truckUom: 'TN',
        density: 2,
      }),
    ).toEqual({ quantity: 20, uom: 'TN' });
  });

  test('normalizes unrecognized uom strings via the alias map', () => {
    expect(
      getDeliveryDistanceQuantity({
        isCollection: false,
        loadSize: 10,
        productUom: 'TN',
        truckUom: '20kg',
        density: 1,
      }),
    ).toEqual({ quantity: 500, uom: 'KG_20' });
  });

  test('defaults truckUom to TN when not provided', () => {
    expect(
      getDeliveryDistanceQuantity({
        isCollection: false,
        loadSize: 10,
        productUom: 'TN',
        density: 1,
      }),
    ).toEqual({ quantity: 10, uom: 'TN' });
  });
});
