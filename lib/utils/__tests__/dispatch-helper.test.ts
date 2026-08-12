import { describe, expect, test } from 'vitest';
import {
  normalizeDispatchDocketDeliveryWindows,
  mapUnassignedDocketDtoToBoardRow,
  mapSchedulerUnassignedToBoardRow,
  mapSchedulerAssignedDocketToBoardRow,
  mapSchedulerUnassignedDocketsToBoardRows,
  loadVolumeM3FromProductSellUom,
  formatDispatchTruckFillPct,
  maxLoadInProductSellUom,
  isVolumeProductSellUom,
  formatDispatchProductSellUomLabel,
  formatTruckMaxCapacityLabel,
  buildDispatchOperationalLoadUpdate,
  isGenericDispatchTruck,
  isDispatchTruckResource,
  isDispatchDriverResource,
  inferTruckBusinessType,
  inferDriverBusinessType,
  truckMatchesFleetFilters,
  driverRowMatchesFilters,
  matchesBoardJobFilter,
  buildSchedulerFilterCustomerOptions,
  isDocketInScheduleDateRange,
  buildScheduleCustomerOptionsFromDockets,
  buildSchedulerFilterDriverOptions,
  buildSchedulerFilterTruckOptions,
  buildSchedulerFilterHaulierOptions,
  docketMatchesScheduleJobFilters,
  hasActiveScheduleFleetFilters,
  docketPassesScheduleFleetFilters,
  formatCargoLineForUnassign,
  assignmentDateDisplayForUnassign,
  resolveUnassignAssignmentLabels,
  buildDispatchAssignmentWindows,
  getDispatchStatusStripeClass,
  formatDispatchConflictDetail,
  isDocketOnSelectedLocalDay,
  parseCollectionStartMs,
  dayBucketMs,
  isSchedulerQueryLoading,
  getUnassignedQueueApiSortParams,
  normalizedLoadM3ForSort,
  matchesUnassignedSearch,
  isGenericDispatchTruckName,
  sortTruckResourcesAlphabeticalGenericLast,
  sortDispatchTruckList,
  sortDispatchDriverList,
  sortDispatchBoardDriverColumns,
  sortDispatchBoardTruckColumns,
  calculateConvertedQty,
  type DispatchDocket,
} from '../dispatch-helper';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { DRIVER_TYPE } from '@/lib/types/driver-enums';
import { TRUCK_BUSINESS_TYPE } from '@/lib/types/truck-enums';
import { DEFAULT_DISPATCH_BOARD_FILTER } from '@/app/(protected)/logistics/dispatch/views/drivers-trucks-filter';
import type {
  DispatchTruckResource,
  DispatchDriverResource,
  DocketDTO,
} from '@/lib/types/docket';
import type { TruckResource } from '@/lib/types/truck';

describe('normalizeDispatchDocketDeliveryWindows', () => {
  test('clamps out-of-range delivery windows to the allowed hours', () => {
    const result = normalizeDispatchDocketDeliveryWindows({
      deliveryCollectionStartTime: '2026-01-01T02:00:00',
      deliveryCollectionEndTime: '2026-01-01T02:45:00',
    });
    expect(result.deliveryCollectionStartTime).toBe('2026-01-01T04:00:00');
    expect(result.deliveryCollectionEndTime).toBe('2026-01-01T23:00:00');
  });

  test('returns the same object reference when nothing changes', () => {
    const input = {
      deliveryCollectionStartTime: '2026-01-01T09:00:00',
      deliveryCollectionEndTime: '2026-01-01T17:00:00',
    };
    expect(normalizeDispatchDocketDeliveryWindows(input)).toBe(input);
  });
});

function buildDocketDto(overrides: Partial<DocketDTO> = {}): DocketDTO {
  return {
    id: 1,
    docketNumber: 'DOC-1',
    docketStatus: DOCKET_STATUS.UNASSIGNED,
    deliveryCollectionDate: '2026-01-01T00:00:00',
    deliveryCollectionStartTime: '2026-01-01T09:00:00',
    deliveryCollectionEndTime: '2026-01-01T11:00:00',
    actualLoadSize: 0,
    plannedLoadSize: 10,
    jobItem: {
      product: { productName: 'Sand', densityTonnagePerM3: 1.6 },
      productSellUom: 'TN',
      truckSellQty: 2,
      truckSellUom: 'TN',
      truckSellPrice: 100,
    },
    job: { customerDto: { businessName: 'Acme Co' } },
    pickUpAddress: { city: 'Melbourne', state: 'VIC' },
    deliveryAddress: { city: 'Geelong', state: 'VIC' },
    ...overrides,
  } as unknown as DocketDTO;
}

describe('mapUnassignedDocketDtoToBoardRow', () => {
  test('maps a DocketDTO into an unassigned board row', () => {
    const row = mapUnassignedDocketDtoToBoardRow(buildDocketDto());
    expect(row.productName).toBe('Sand');
    expect(row.customerName).toBe('Acme Co');
    expect(row.pickUpSuburb).toBe('Melbourne');
    expect(row.deliverySuburb).toBe('Geelong');
    expect(row.loadSize).toBe(10); // falls back to plannedLoadSize
    expect(row.uiAssignedTruckId).toBeNull();
  });

  test('falls back to contactPersonName when no business name is set', () => {
    const dto = buildDocketDto({
      job: { contactPersonName: 'John Smith' },
    } as unknown as Partial<DocketDTO>);
    const row = mapUnassignedDocketDtoToBoardRow(dto);
    expect(row.customerName).toBe('John Smith');
  });
});

describe('mapSchedulerUnassignedToBoardRow', () => {
  test('prefers loadSize, then actualLoadSize, then plannedLoadSize', () => {
    const withLoadSize = mapSchedulerUnassignedToBoardRow({
      loadSize: 5,
      actualLoadSize: 8,
      plannedLoadSize: 10,
    } as never);
    expect(withLoadSize.loadSize).toBe(5);

    const withoutLoadSize = mapSchedulerUnassignedToBoardRow({
      actualLoadSize: 8,
      plannedLoadSize: 10,
    } as never);
    expect(withoutLoadSize.loadSize).toBe(8);
  });
});

describe('mapSchedulerAssignedDocketToBoardRow', () => {
  test('computes a rounded duration in hours from the delivery window', () => {
    const result = mapSchedulerAssignedDocketToBoardRow(
      {
        deliveryCollectionStartTime: '2026-01-01T09:00:00',
        deliveryCollectionEndTime: '2026-01-01T12:30:00',
      } as never,
      'truck-1',
    );
    expect(result.uiAssignedTruckId).toBe('truck-1');
    expect(result.uiAssignedDuration).toBe(4); // rounds 3.5h -> 4h
    expect(result.uiAssignedTime).toBe('09:00');
  });

  test('defaults duration to 2 hours when no delivery window is present', () => {
    const result = mapSchedulerAssignedDocketToBoardRow({} as never, 'truck-1');
    expect(result.uiAssignedDuration).toBe(2);
  });
});

describe('mapSchedulerUnassignedDocketsToBoardRows', () => {
  test('filters out dockets already present in the assigned id set', () => {
    const dockets = [
      { id: 1, loadSize: 1 },
      { id: 2, loadSize: 2 },
    ] as never[];
    const result = mapSchedulerUnassignedDocketsToBoardRows(
      dockets as never,
      new Set([1]),
    );
    expect(result.map((d) => d.id)).toEqual([2]);
  });
});

describe('loadVolumeM3FromProductSellUom', () => {
  test('returns load size directly for m3/bulka', () => {
    expect(loadVolumeM3FromProductSellUom(10, 'M3', 1.5)).toBe(10);
    expect(loadVolumeM3FromProductSellUom(10, 'BULKA', 1.5)).toBe(10);
  });

  test('divides by density for TN', () => {
    expect(loadVolumeM3FromProductSellUom(10, 'TN', 2)).toBe(5);
  });

  test('converts 20kg bags to m3', () => {
    expect(loadVolumeM3FromProductSellUom(100, 'KG_20', 2)).toBe(1);
  });

  test('defaults density to 1 when falsy', () => {
    expect(loadVolumeM3FromProductSellUom(10, 'TN', 0)).toBe(10);
  });
});

describe('formatDispatchTruckFillPct', () => {
  test('returns 0 for non-finite or non-positive values', () => {
    expect(formatDispatchTruckFillPct(0)).toBe('0');
    expect(formatDispatchTruckFillPct(-5)).toBe('0');
    expect(formatDispatchTruckFillPct(NaN)).toBe('0');
  });

  test('shows one decimal place for sub-10% values, trimming trailing .0', () => {
    expect(formatDispatchTruckFillPct(5.4)).toBe('5.4');
    expect(formatDispatchTruckFillPct(5.0)).toBe('5');
  });

  test('rounds to whole numbers for 10%+', () => {
    expect(formatDispatchTruckFillPct(87.6)).toBe('88');
  });
});

describe('maxLoadInProductSellUom', () => {
  test('floors m3/bulka volume directly', () => {
    expect(maxLoadInProductSellUom(10.7, 'M3', 1)).toBe(10);
  });

  test('multiplies by density for TN and floors', () => {
    expect(maxLoadInProductSellUom(10, 'TN', 1.6)).toBe(16);
  });

  test('multiplies by density and 50 for 20kg bags', () => {
    expect(maxLoadInProductSellUom(1, 'KG_20', 2)).toBe(100);
  });
});

describe('isVolumeProductSellUom', () => {
  test('is true only for M3/BULKA', () => {
    expect(isVolumeProductSellUom('M3')).toBe(true);
    expect(isVolumeProductSellUom('bulka')).toBe(true);
    expect(isVolumeProductSellUom('TN')).toBe(false);
    expect(isVolumeProductSellUom(undefined)).toBe(false);
  });
});

describe('formatDispatchProductSellUomLabel', () => {
  test('maps known uoms to display labels', () => {
    expect(formatDispatchProductSellUomLabel('M3')).toBe('m³');
    expect(formatDispatchProductSellUomLabel('KG_20')).toBe('x 20kg');
    expect(formatDispatchProductSellUomLabel('TN')).toBe('TN');
    expect(formatDispatchProductSellUomLabel('BULKA')).toBe('Bulka');
  });

  test('falls back to the raw uom or TN', () => {
    expect(formatDispatchProductSellUomLabel('WEIRD')).toBe('WEIRD');
    expect(formatDispatchProductSellUomLabel(undefined)).toBe('TN');
  });
});

describe('formatTruckMaxCapacityLabel', () => {
  test('shows only m3 for volume-based products', () => {
    expect(formatTruckMaxCapacityLabel(10, 'M3', 1)).toBe('10 m³');
  });

  test('shows m3 with the converted product-uom equivalent otherwise', () => {
    expect(formatTruckMaxCapacityLabel(10, 'TN', 1.5)).toBe('10 m³ (15 TN)');
  });

  test('uses a custom quantity formatter when provided', () => {
    const formatQty = (n: number) => `#${n}`;
    expect(formatTruckMaxCapacityLabel(10, 'TN', 1.5, formatQty)).toBe(
      '#10 m³ (#15 TN)',
    );
  });
});

describe('buildDispatchOperationalLoadUpdate', () => {
  test('builds an operational update with computed delivery distance quantity', () => {
    const result = buildDispatchOperationalLoadUpdate(
      {
        productSellUom: 'TN',
        productDensity: 1,
        truckSellUom: 'TN',
        truckSellQty: 2,
      },
      10,
    );
    expect(result).toEqual({
      actualLoadSize: 10,
      plannedLoadSize: 10,
      deliveryDistanceQuantity: 10,
      checkWindowTimeConflict: false,
    });
  });

  test('uses truckSellQty directly for manual-input truck uoms', () => {
    const result = buildDispatchOperationalLoadUpdate(
      {
        productSellUom: 'TN',
        productDensity: 1,
        truckSellUom: 'HOURLY',
        truckSellQty: 3,
      },
      10,
    );
    expect(result.deliveryDistanceQuantity).toBe(3);
  });
});

describe('isGenericDispatchTruck', () => {
  test('detects generic trucks by license plate prefix, substring, or truckType', () => {
    expect(
      isGenericDispatchTruck({ licensePlate: 'GENERIC-1', tankVolumeM3: 0 }),
    ).toBe(true);
    expect(
      isGenericDispatchTruck({
        licensePlate: 'ABC-generic-1',
        tankVolumeM3: 0,
      }),
    ).toBe(true);
    expect(
      isGenericDispatchTruck({
        licensePlate: 'ABC123',
        tankVolumeM3: 0,
        truckType: 'GENERIC',
      }),
    ).toBe(true);
  });

  test('returns false for a regular truck', () => {
    expect(
      isGenericDispatchTruck({ licensePlate: 'ABC123', tankVolumeM3: 10 }),
    ).toBe(false);
  });
});

const truckResource: DispatchTruckResource = {
  id: 1,
  licensePlate: 'ABC123',
  tankVolumeM3: 10,
  truckStatus: 'AVAILABLE' as never,
  truckBusinessType: TRUCK_BUSINESS_TYPE.INTERNAL,
  drivers: [{ driverType: DRIVER_TYPE.INTERNAL } as never],
  haulier: { id: 1, haulierName: 'Acme Haulage' } as never,
};

const driverResource: DispatchDriverResource = {
  id: 1,
  driverName: 'Jane Driver',
  driverType: DRIVER_TYPE.SUBCONTRACTOR,
  haulier: { id: 2, haulierName: 'Other Haulage' } as never,
  trucks: [],
};

describe('isDispatchTruckResource / isDispatchDriverResource', () => {
  test('distinguishes truck vs driver resources', () => {
    expect(isDispatchTruckResource(truckResource)).toBe(true);
    expect(isDispatchTruckResource(driverResource)).toBe(false);
    expect(isDispatchDriverResource(driverResource)).toBe(true);
    expect(isDispatchDriverResource(truckResource)).toBe(false);
  });
});

describe('inferTruckBusinessType', () => {
  test('uses explicit truckBusinessType when present', () => {
    expect(inferTruckBusinessType(truckResource)).toBe(
      TRUCK_BUSINESS_TYPE.INTERNAL,
    );
  });

  test('falls back to subcontractor driver type when business type missing', () => {
    expect(
      inferTruckBusinessType({
        ...truckResource,
        truckBusinessType: undefined as never,
        drivers: [{ driverType: DRIVER_TYPE.SUBCONTRACTOR } as never],
      }),
    ).toBe(TRUCK_BUSINESS_TYPE.EXTERNAL);
  });

  test('defaults to internal when neither is present', () => {
    expect(
      inferTruckBusinessType({
        ...truckResource,
        truckBusinessType: undefined as never,
        drivers: [],
      }),
    ).toBe(TRUCK_BUSINESS_TYPE.INTERNAL);
  });
});

describe('inferDriverBusinessType', () => {
  test('maps subcontractor driverType to external', () => {
    expect(inferDriverBusinessType(driverResource)).toBe(
      TRUCK_BUSINESS_TYPE.EXTERNAL,
    );
  });

  test('defaults to internal otherwise', () => {
    expect(
      inferDriverBusinessType({ ...driverResource, driverType: undefined }),
    ).toBe(TRUCK_BUSINESS_TYPE.INTERNAL);
  });
});

describe('truckMatchesFleetFilters', () => {
  test('matches when no filters are active', () => {
    expect(
      truckMatchesFleetFilters(truckResource, DEFAULT_DISPATCH_BOARD_FILTER),
    ).toBe(true);
  });

  test('filters by truckIds', () => {
    expect(
      truckMatchesFleetFilters(truckResource, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        truckIds: ['1'],
      }),
    ).toBe(true);
    expect(
      truckMatchesFleetFilters(truckResource, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        truckIds: ['999'],
      }),
    ).toBe(false);
  });

  test('filters by haulierIds', () => {
    expect(
      truckMatchesFleetFilters(truckResource, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        haulierIds: ['1'],
      }),
    ).toBe(true);
    expect(
      truckMatchesFleetFilters(truckResource, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        haulierIds: ['999'],
      }),
    ).toBe(false);
  });

  test('filters by driverStatuses requiring at least one matching driver', () => {
    const withStatus = {
      ...truckResource,
      drivers: [{ driverStatus: 'ON_DUTY' } as never],
    };
    expect(
      truckMatchesFleetFilters(withStatus, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        driverStatuses: ['ON_DUTY' as never],
      }),
    ).toBe(true);
    expect(
      truckMatchesFleetFilters(withStatus, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        driverStatuses: ['OFF_DUTY' as never],
      }),
    ).toBe(false);
  });
});

describe('driverRowMatchesFilters', () => {
  test('matches when no filters are active', () => {
    expect(
      driverRowMatchesFilters(driverResource, DEFAULT_DISPATCH_BOARD_FILTER),
    ).toBe(true);
  });

  test('filters by driverIds', () => {
    expect(
      driverRowMatchesFilters(driverResource, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        driverIds: ['999'],
      }),
    ).toBe(false);
  });

  test('treats a missing driverStatus as passing the driverStatuses filter', () => {
    expect(
      driverRowMatchesFilters(
        { ...driverResource, driverStatus: undefined },
        { ...DEFAULT_DISPATCH_BOARD_FILTER, driverStatuses: ['ON_DUTY' as never] },
      ),
    ).toBe(true);
  });

  test('rejects when driverStatus does not match the filter', () => {
    expect(
      driverRowMatchesFilters(
        { ...driverResource, driverStatus: 'OFF_DUTY' as never },
        { ...DEFAULT_DISPATCH_BOARD_FILTER, driverStatuses: ['ON_DUTY' as never] },
      ),
    ).toBe(false);
  });
});

describe('matchesBoardJobFilter', () => {
  test('matches everything when no job statuses are selected', () => {
    expect(
      matchesBoardJobFilter({ docketStatus: DOCKET_STATUS.ASSIGNED } as never, []),
    ).toBe(true);
  });

  test('matches only the selected statuses', () => {
    expect(
      matchesBoardJobFilter(
        { docketStatus: DOCKET_STATUS.ASSIGNED } as never,
        [DOCKET_STATUS.ASSIGNED],
      ),
    ).toBe(true);
    expect(
      matchesBoardJobFilter(
        { docketStatus: DOCKET_STATUS.DELIVERED } as never,
        [DOCKET_STATUS.ASSIGNED],
      ),
    ).toBe(false);
  });
});

describe('buildSchedulerFilterCustomerOptions', () => {
  test('collects unique, sorted customer names from trucks view resources and unassigned', () => {
    const trucksData = {
      resources: [
        { ...truckResource, dockets: [{ customerName: 'Bravo' } as never] },
      ],
      unassignedDockets: [{ customerName: 'Alpha' } as never],
    } as never;
    expect(buildSchedulerFilterCustomerOptions('trucks', trucksData)).toEqual([
      'Alpha',
      'Bravo',
    ]);
  });

  test('collects from drivers view resources', () => {
    const driversData = {
      resources: [
        { ...driverResource, dockets: [{ customerName: 'Charlie' } as never] },
      ],
      unassignedDockets: [],
    } as never;
    expect(
      buildSchedulerFilterCustomerOptions('drivers', undefined, driversData),
    ).toEqual(['Charlie']);
  });

  test('returns empty array when data is missing', () => {
    expect(buildSchedulerFilterCustomerOptions('trucks')).toEqual([]);
  });
});

describe('isDocketInScheduleDateRange', () => {
  test('returns false when the docket has no date', () => {
    expect(
      isDocketInScheduleDateRange({}, new Date(2026, 0, 1), new Date(2026, 0, 5)),
    ).toBe(false);
  });

  test('checks inclusive calendar-day range', () => {
    const range = [new Date(2026, 0, 1), new Date(2026, 0, 5)] as const;
    expect(
      isDocketInScheduleDateRange(
        { deliveryCollectionDate: '2026-01-03T10:00:00' },
        ...range,
      ),
    ).toBe(true);
    expect(
      isDocketInScheduleDateRange(
        { deliveryCollectionDate: '2026-01-06T10:00:00' },
        ...range,
      ),
    ).toBe(false);
  });
});

describe('buildScheduleCustomerOptionsFromDockets', () => {
  test('collects unique sorted customer names within the date range', () => {
    const dockets = [
      {
        customerName: 'Zeta',
        deliveryCollectionDate: '2026-01-02T00:00:00',
      },
      {
        customerName: 'Alpha',
        deliveryCollectionDate: '2026-01-02T00:00:00',
      },
      {
        customerName: 'Outside range',
        deliveryCollectionDate: '2026-02-01T00:00:00',
      },
    ];
    expect(
      buildScheduleCustomerOptionsFromDockets(
        dockets,
        new Date(2026, 0, 1),
        new Date(2026, 0, 5),
      ),
    ).toEqual(['Alpha', 'Zeta']);
  });
});

describe('buildSchedulerFilterDriverOptions / TruckOptions / HaulierOptions', () => {
  test('driver options are built from driver resources, sorted by label', () => {
    const driversData = {
      resources: [
        { ...driverResource, id: 2, driverName: 'Zed' },
        { ...driverResource, id: 1, driverName: 'Amy' },
      ],
    } as never;
    expect(buildSchedulerFilterDriverOptions(driversData)).toEqual([
      { id: '1', label: 'Amy' },
      { id: '2', label: 'Zed' },
    ]);
  });

  test('truck options are built from truck resources, sorted by label', () => {
    const trucksData = {
      resources: [
        { ...truckResource, id: 2, licensePlate: 'ZZZ999' },
        { ...truckResource, id: 1, licensePlate: 'AAA111' },
      ],
    } as never;
    expect(buildSchedulerFilterTruckOptions(trucksData)).toEqual([
      { id: '1', label: 'AAA111' },
      { id: '2', label: 'ZZZ999' },
    ]);
  });

  test('returns empty arrays when data is missing', () => {
    expect(buildSchedulerFilterDriverOptions(undefined)).toEqual([]);
    expect(buildSchedulerFilterTruckOptions(undefined)).toEqual([]);
    expect(
      buildSchedulerFilterHaulierOptions('trucks', undefined, undefined),
    ).toEqual([]);
  });

  test('haulier options dedupe by haulier id and sort by label', () => {
    const trucksData = {
      resources: [
        { ...truckResource, haulier: { id: 1, haulierName: 'Zeta Haulage' } },
        { ...truckResource, id: 2, haulier: { id: 1, haulierName: 'Zeta Haulage' } },
        { ...truckResource, id: 3, haulier: { id: 2, haulierName: 'Alpha Haulage' } },
      ],
    } as never;
    expect(buildSchedulerFilterHaulierOptions('trucks', trucksData)).toEqual([
      { id: '2', label: 'Alpha Haulage' },
      { id: '1', label: 'Zeta Haulage' },
    ]);
  });
});

describe('docketMatchesScheduleJobFilters', () => {
  test('requires both job status and customer name filters to pass', () => {
    const docket = {
      docketStatus: DOCKET_STATUS.ASSIGNED,
      customerName: 'Acme',
    } as never;
    expect(
      docketMatchesScheduleJobFilters(docket, DEFAULT_DISPATCH_BOARD_FILTER),
    ).toBe(true);
    expect(
      docketMatchesScheduleJobFilters(docket, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        customerNames: ['Other'],
      }),
    ).toBe(false);
  });
});

describe('hasActiveScheduleFleetFilters', () => {
  test('is false with the default filter and true when any fleet filter is set', () => {
    expect(hasActiveScheduleFleetFilters(DEFAULT_DISPATCH_BOARD_FILTER)).toBe(
      false,
    );
    expect(
      hasActiveScheduleFleetFilters({
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        truckIds: ['1'],
      }),
    ).toBe(true);
  });
});

describe('docketPassesScheduleFleetFilters', () => {
  test('passes through when no fleet filters are active', () => {
    expect(
      docketPassesScheduleFleetFilters(1, undefined, DEFAULT_DISPATCH_BOARD_FILTER),
    ).toBe(true);
  });

  test('returns false when trucks data is missing but filters are active', () => {
    expect(
      docketPassesScheduleFleetFilters(1, undefined, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        truckIds: ['1'],
      }),
    ).toBe(false);
  });

  test('finds the truck carrying the docket and checks it against the filters', () => {
    const trucksData = {
      resources: [{ ...truckResource, dockets: [{ id: 42 } as never] }],
    } as never;
    expect(
      docketPassesScheduleFleetFilters(42, trucksData, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        truckIds: ['1'],
      }),
    ).toBe(true);
    expect(
      docketPassesScheduleFleetFilters(999, trucksData, {
        ...DEFAULT_DISPATCH_BOARD_FILTER,
        truckIds: ['1'],
      }),
    ).toBe(false);
  });
});

describe('formatCargoLineForUnassign', () => {
  test('formats product + load size + uom label', () => {
    expect(
      formatCargoLineForUnassign({
        productSellUom: 'M3',
        productName: 'Sand',
        actualLoadSize: 5,
      } as DispatchDocket),
    ).toBe('Sand • 5 m³');
  });

  test('defaults product name and 0 load size when missing', () => {
    expect(
      formatCargoLineForUnassign({ productSellUom: 'TN' } as DispatchDocket),
    ).toBe('Product • 0 TN');
  });
});

describe('assignmentDateDisplayForUnassign', () => {
  test('formats the docket delivery date when present', () => {
    expect(
      assignmentDateDisplayForUnassign(
        { deliveryCollectionDate: '2026-01-26T09:00:00' } as DispatchDocket,
        new Date(2026, 0, 1),
      ),
    ).toBe('Mon 26 Jan 2026');
  });

  test('falls back to the provided fallback day', () => {
    expect(
      assignmentDateDisplayForUnassign(
        {} as DispatchDocket,
        new Date(2026, 0, 26),
      ),
    ).toBe('Mon 26 Jan 2026');
  });
});

describe('resolveUnassignAssignmentLabels', () => {
  test('returns dashes when no truck is assigned', () => {
    expect(
      resolveUnassignAssignmentLabels(
        {} as DispatchDocket,
        'trucks',
        undefined,
        undefined,
      ),
    ).toEqual({ truck: '—', driver: '—' });
  });

  test('resolves truck + driver labels for trucks view', () => {
    const trucksData = { resources: [truckResource] } as never;
    const result = resolveUnassignAssignmentLabels(
      { uiAssignedTruckId: '1' } as DispatchDocket,
      'trucks',
      trucksData,
      undefined,
    );
    expect(result.truck).toBe('ABC123');
  });

  test('resolves driver + truck labels for drivers view', () => {
    const driversData = {
      resources: [{ ...driverResource, trucks: [{ licensePlate: 'XYZ999' }] }],
    } as never;
    const result = resolveUnassignAssignmentLabels(
      { uiAssignedTruckId: '1' } as DispatchDocket,
      'drivers',
      undefined,
      driversData,
    );
    expect(result.driver).toBe('Jane Driver');
    expect(result.truck).toBe('XYZ999');
  });
});

describe('buildDispatchAssignmentWindows', () => {
  test('builds a window using duration hours when no end slot is given', () => {
    const result = buildDispatchAssignmentWindows(
      new Date(2026, 0, 1),
      '09:00',
      3,
    );
    expect(result.deliveryStartWindow).toContain('T09:00:00');
    expect(result.deliveryEndWindow).toContain('T12:00:00');
    expect(result.deliveryCollectionDate).toContain('2026-01-01');
  });

  test('uses an explicit end slot time when provided', () => {
    const result = buildDispatchAssignmentWindows(
      new Date(2026, 0, 1),
      '09:00',
      2,
      '14:00',
    );
    expect(result.deliveryEndWindow).toContain('T14:00:00');
  });

  test('falls back to duration when the end slot is before the start', () => {
    const result = buildDispatchAssignmentWindows(
      new Date(2026, 0, 1),
      '09:00',
      2,
      '08:00',
    );
    expect(result.deliveryEndWindow).toContain('T11:00:00');
  });

  test('clamps the end window to end-of-day when it rolls into the next day', () => {
    const result = buildDispatchAssignmentWindows(
      new Date(2026, 0, 1),
      '23:00',
      4,
    );
    expect(result.deliveryEndWindow).toContain('T23:59:59');
  });
});

describe('getDispatchStatusStripeClass', () => {
  test('returns a mapped class for known statuses', () => {
    expect(getDispatchStatusStripeClass(DOCKET_STATUS.DELIVERED)).toBe(
      'bg-green-500',
    );
  });

  test('falls back to gray for unknown/missing statuses', () => {
    expect(getDispatchStatusStripeClass(undefined)).toBe('bg-gray-300');
    expect(getDispatchStatusStripeClass('WEIRD')).toBe('bg-gray-300');
  });
});

describe('formatDispatchConflictDetail', () => {
  test('formats a docket number with its time range', () => {
    expect(
      formatDispatchConflictDetail({
        docketNumber: 'DOC-9',
        deliveryCollectionStartTime: '2026-01-01T09:00:00',
        deliveryCollectionEndTime: '2026-01-01T11:00:00',
      } as never),
    ).toBe('Potential overlap with DOC-9 (09:00 - 11:00)');
  });

  test('falls back to "scheduled time" when no times are present', () => {
    expect(
      formatDispatchConflictDetail({ docketNumber: 'DOC-9' } as never),
    ).toBe('Potential overlap with DOC-9 (scheduled time)');
  });
});

describe('isDocketOnSelectedLocalDay', () => {
  test('matches the same local calendar day', () => {
    expect(
      isDocketOnSelectedLocalDay(
        { deliveryCollectionDate: '2026-01-15T22:00:00' },
        new Date(2026, 0, 15),
      ),
    ).toBe(true);
  });

  test('does not match a different day', () => {
    expect(
      isDocketOnSelectedLocalDay(
        { deliveryCollectionDate: '2026-01-16T00:00:00' },
        new Date(2026, 0, 15),
      ),
    ).toBe(false);
  });

  test('returns false when there is no delivery date', () => {
    expect(isDocketOnSelectedLocalDay({}, new Date(2026, 0, 15))).toBe(false);
  });
});

describe('parseCollectionStartMs / dayBucketMs', () => {
  test('parses the start time to epoch ms', () => {
    const ms = parseCollectionStartMs('2026-01-01T09:00:00');
    expect(ms).toBe(new Date(2026, 0, 1, 9, 0, 0).getTime());
  });

  test('returns 0 for missing/invalid input', () => {
    expect(parseCollectionStartMs(undefined)).toBe(0);
  });

  test('buckets by start-of-day', () => {
    const bucket = dayBucketMs('2026-01-01T09:00:00');
    expect(bucket).toBe(new Date(2026, 0, 1, 0, 0, 0).getTime());
  });

  test('returns 0 when there is no parsable time', () => {
    expect(dayBucketMs(undefined)).toBe(0);
  });
});

describe('isSchedulerQueryLoading', () => {
  test('is true while pending or loading', () => {
    expect(
      isSchedulerQueryLoading({
        isPending: true,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        hasData: false,
      }),
    ).toBe(true);
  });

  test('is true while fetching with placeholder/no data', () => {
    expect(
      isSchedulerQueryLoading({
        isPending: false,
        isLoading: false,
        isFetching: true,
        isPlaceholderData: true,
        hasData: false,
      }),
    ).toBe(true);
  });

  test('is false once real data has settled', () => {
    expect(
      isSchedulerQueryLoading({
        isPending: false,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        hasData: true,
      }),
    ).toBe(false);
  });
});

describe('getUnassignedQueueApiSortParams', () => {
  test('maps each sort key to its API field', () => {
    expect(getUnassignedQueueApiSortParams('time')).toEqual({
      sortBy: 'deliveryCollectionStartTime',
      sortOrder: 'asc',
    });
    expect(getUnassignedQueueApiSortParams('size', 'desc')).toEqual({
      sortBy: 'plannedLoadSize',
      sortOrder: 'desc',
    });
    expect(getUnassignedQueueApiSortParams('customer')).toEqual({
      sortBy: 'customerName',
      sortOrder: 'asc',
    });
  });
});

describe('normalizedLoadM3ForSort', () => {
  test('converts using product density when available', () => {
    const docket = {
      jobItem: { product: { densityTonnagePerM3: 2 } },
      productSellUom: 'TN',
      actualLoadSize: 10,
    } as unknown as DispatchDocket;
    expect(normalizedLoadM3ForSort(docket)).toBe(5);
  });

  test('returns raw qty when no density is available', () => {
    const docket = {
      productSellUom: 'TN',
      actualLoadSize: 10,
    } as unknown as DispatchDocket;
    expect(normalizedLoadM3ForSort(docket)).toBe(10);
  });

  test('returns 0 for non-finite quantities', () => {
    const docket = {
      productSellUom: 'TN',
      actualLoadSize: NaN,
    } as unknown as DispatchDocket;
    expect(normalizedLoadM3ForSort(docket)).toBe(0);
  });
});

describe('matchesUnassignedSearch', () => {
  const docket = {
    docketNumber: 'DOC-123',
    customerName: 'Acme Co',
  } as unknown as DispatchDocket;

  test('matches on docket number or customer name, case-insensitively', () => {
    expect(matchesUnassignedSearch(docket, 'doc-123')).toBe(true);
    expect(matchesUnassignedSearch(docket, 'acme')).toBe(true);
  });

  test('returns true for an empty/blank query', () => {
    expect(matchesUnassignedSearch(docket, '')).toBe(true);
    expect(matchesUnassignedSearch(docket, '   ')).toBe(true);
  });

  test('returns false when nothing matches', () => {
    expect(matchesUnassignedSearch(docket, 'nomatch')).toBe(false);
  });
});

describe('isGenericDispatchTruckName', () => {
  test('detects "generic" case-insensitively', () => {
    expect(isGenericDispatchTruckName('Generic Truck')).toBe(true);
    expect(isGenericDispatchTruckName('Truck 1')).toBe(false);
    expect(isGenericDispatchTruckName(undefined)).toBe(false);
  });
});

function truck(overrides: Partial<TruckResource>): TruckResource {
  return {
    id: '1',
    name: 'Truck A',
    capacity: 10,
    status: 'AVAILABLE' as never,
    businessType: TRUCK_BUSINESS_TYPE.INTERNAL,
    trips: 0,
    drivers: '',
    ...overrides,
  };
}

describe('sortTruckResourcesAlphabeticalGenericLast', () => {
  test('sorts alphabetically with generic trucks pushed to the end', () => {
    const list = [
      truck({ name: 'Generic 1' }),
      truck({ name: 'Charlie' }),
      truck({ name: 'Alpha' }),
    ];
    expect(
      sortTruckResourcesAlphabeticalGenericLast(list).map((t) => t.name),
    ).toEqual(['Alpha', 'Charlie', 'Generic 1']);
  });
});

describe('sortDispatchTruckList', () => {
  test('groups internal before subcontractor, alpha + generic-last within each group', () => {
    const list = [
      truck({ name: 'Zed Sub', businessType: TRUCK_BUSINESS_TYPE.EXTERNAL }),
      truck({ name: 'Generic', businessType: TRUCK_BUSINESS_TYPE.INTERNAL }),
      truck({ name: 'Amy', businessType: TRUCK_BUSINESS_TYPE.INTERNAL }),
      truck({ name: 'Bob Sub', businessType: TRUCK_BUSINESS_TYPE.EXTERNAL }),
    ];
    expect(sortDispatchTruckList(list).map((t) => t.name)).toEqual([
      'Amy',
      'Generic',
      'Bob Sub',
      'Zed Sub',
    ]);
  });
});

describe('sortDispatchDriverList', () => {
  test('groups internal before subcontractor, alphabetically within each', () => {
    const list = [
      truck({ name: 'Zed', businessType: TRUCK_BUSINESS_TYPE.INTERNAL }),
      truck({ name: 'Amy', businessType: TRUCK_BUSINESS_TYPE.INTERNAL }),
      truck({ name: 'Bob', businessType: TRUCK_BUSINESS_TYPE.EXTERNAL }),
    ];
    expect(sortDispatchDriverList(list).map((t) => t.name)).toEqual([
      'Amy',
      'Zed',
      'Bob',
    ]);
  });
});

describe('sortDispatchBoardDriverColumns', () => {
  test('sorts internal then subcontractor by driver name field', () => {
    const list = [
      truck({ drivers: 'Zed', businessType: TRUCK_BUSINESS_TYPE.EXTERNAL }),
      truck({ drivers: 'Amy', businessType: TRUCK_BUSINESS_TYPE.INTERNAL }),
      truck({ drivers: 'Bob', businessType: TRUCK_BUSINESS_TYPE.INTERNAL }),
    ];
    expect(sortDispatchBoardDriverColumns(list).map((t) => t.drivers)).toEqual(
      ['Amy', 'Bob', 'Zed'],
    );
  });
});

describe('sortDispatchBoardTruckColumns', () => {
  test('groups internal (alpha, generic-last) then external grouped by haulier', () => {
    const list = [
      truck({
        name: 'Sub B',
        businessType: TRUCK_BUSINESS_TYPE.EXTERNAL,
        haulierName: 'Zeta Haulage',
      }),
      truck({
        name: 'Sub A',
        businessType: TRUCK_BUSINESS_TYPE.EXTERNAL,
        haulierName: 'Alpha Haulage',
      }),
      truck({ name: 'Int B', businessType: TRUCK_BUSINESS_TYPE.INTERNAL }),
      truck({ name: 'Int A', businessType: TRUCK_BUSINESS_TYPE.INTERNAL }),
    ];
    expect(sortDispatchBoardTruckColumns(list).map((t) => t.name)).toEqual([
      'Int A',
      'Int B',
      'Sub A',
      'Sub B',
    ]);
  });
});

describe('calculateConvertedQty', () => {
  test('converts between product UOMs using density', () => {
    expect(calculateConvertedQty(10, 'M3', 'TN', 2)).toBe(20);
    expect(calculateConvertedQty(10, 'TN', 'TN')).toBe(10);
  });
});
