import { format, startOfDay } from 'date-fns';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { DRIVER_TYPE } from '@/lib/types/driver-enums';
import { TRUCK_BUSINESS_TYPE } from '@/lib/types/truck-enums';
import type {
  DispatchTruckResource,
  DispatchDriverResource,
  DispatchDocketDTO,
  DispatchBoardDocketRow,
  DocketDTO,
} from '@/lib/types/docket';
import type { DispatchBoardFilterState } from '@/app/(protected)/logistics/dispatch/views/drivers-trucks-filter';
import type { TruckResource } from '@/lib/types/truck';

export type DispatchDocketUiFields = {
  uiAssignedTruckId?: string | null;
  uiAssignedTime?: string | null;
  uiAssignedDuration?: number;
};

export type DispatchDocket = DispatchBoardDocketRow &
  DispatchDocketUiFields &
  Partial<Omit<DocketDTO, 'pickUpAddress' | 'deliveryAddress'>>;

export function isDispatchTruckResource(
  r: DispatchTruckResource | DispatchDriverResource,
): r is DispatchTruckResource {
  return 'licensePlate' in r;
}

export function isDispatchDriverResource(
  r: DispatchTruckResource | DispatchDriverResource,
): r is DispatchDriverResource {
  return 'driverName' in r;
}

export function inferTruckBusinessType(
  r: DispatchTruckResource,
): TRUCK_BUSINESS_TYPE {
  const dt = r.drivers?.[0]?.driverType;
  if (dt === DRIVER_TYPE.SUBCONTRACTOR) {
    return TRUCK_BUSINESS_TYPE.EXTERNAL;
  }
  return TRUCK_BUSINESS_TYPE.INTERNAL;
}

export function truckMatchesFleetFilters(
  r: DispatchTruckResource,
  f: DispatchBoardFilterState,
): boolean {
  if (f.truckIds.length > 0 && !f.truckIds.includes(String(r.id))) return false;
  if (f.haulierIds.length > 0) {
    const hasHaulier = (r.drivers || []).some((d) => {
      const hid = String(d.haulierId || d.haulier?.id);
      return f.haulierIds.includes(hid);
    });
    if (!hasHaulier) return false;
  }
  if (f.truckBusinessTypes.length > 0) {
    if (!f.truckBusinessTypes.includes(inferTruckBusinessType(r))) return false;
  }
  if (f.driverStatuses.length > 0) {
    const want = new Set(f.driverStatuses);
    const ok = (r.drivers || []).some(
      (d) => d.driverStatus != null && want.has(d.driverStatus),
    );
    if (!ok) return false;
  }
  return true;
}

export function driverRowMatchesFilters(
  r: DispatchDriverResource,
  f: DispatchBoardFilterState,
): boolean {
  if (f.driverIds.length > 0 && !f.driverIds.includes(String(r.id))) {
    return false;
  }
  if (f.driverStatuses.length > 0) {
    const want = new Set(f.driverStatuses);
    if (r.driverStatus == null) {
      return true;
    }
    if (!want.has(r.driverStatus)) return false;
  }
  return true;
}

export function matchesBoardJobFilter(
  d: DispatchDocket,
  jobStatuses: string[],
): boolean {
  if (jobStatuses.length === 0) {
    return d.docketStatus !== DOCKET_STATUS.UNASSIGNED;
  }
  return jobStatuses.includes(String(d.docketStatus));
}

export function formatCargoLineForUnassign(d: DispatchDocket): string {
  const uom =
    d.productSellUom === 'M3'
      ? 'm³'
      : d.productSellUom === 'KG_20'
        ? 'x 20kg'
        : d.productSellUom || '';
  const product = d.productName || 'Product';
  const loadSize = d.actualLoadSize || d.plannedLoadSize || 0;
  return `${product} • ${loadSize} ${uom}`.trim();
}

export function assignmentDateDisplayForUnassign(
  d: DispatchDocket,
  fallbackDay: Date,
): string {
  const iso = d.deliveryCollectionDate;
  if (iso) {
    const local = iso.includes('T') ? iso.replace('Z', '') : iso;
    return format(new Date(local), 'EEE d MMM yyyy');
  }
  return format(fallbackDay, 'EEE d MMM yyyy');
}

export function resolveUnassignAssignmentLabels(
  docket: DispatchDocket,
  viewType: 'trucks' | 'drivers',
  trucksData: DispatchDocketDTO | undefined,
  driversData: DispatchDocketDTO | undefined,
): { truck: string; driver: string } {
  let truck = '—';
  let driver = '—';
  const uid = docket.uiAssignedTruckId;
  if (!uid) return { truck, driver };

  if (viewType === 'trucks' && trucksData?.resources) {
    const t = trucksData.resources.find(
      (r): r is DispatchTruckResource =>
        isDispatchTruckResource(r) && String(r.id) === uid,
    );
    if (t) {
      truck = t.licensePlate;
      driver =
        docket.driver?.driverName ?? t.drivers?.[0]?.driverName ?? driver;
    }
  }
  if (viewType === 'drivers' && driversData?.resources) {
    const row = driversData.resources.find(
      (r): r is DispatchDriverResource =>
        isDispatchDriverResource(r) && String(r.id) === uid,
    );
    if (row) {
      driver = row.driverName;
      truck = row.trucks?.[0]?.licensePlate ?? truck;
    }
  }
  return { truck, driver };
}

export const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    return timeStr.split('T')[1].substring(0, 5);
  }
  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1].substring(0, 5);
  }
  if (timeStr.includes(':')) {
    return timeStr.split(':').slice(0, 2).join(':');
  }
  return timeStr;
};

export const formatTimeRange = (start?: string, end?: string) => {
  const startTime = formatTime(start);
  const endTime = formatTime(end);
  return startTime && endTime
    ? `${startTime} - ${endTime}`
    : startTime || endTime || 'N/A';
};

export const formatDate = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    const localTimeStr = timeStr.replace('Z', '');
    return format(new Date(localTimeStr), 'EEE dd MMM');
  }
  return timeStr;
};

export const formatLocalISO = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export function isDocketOnSelectedLocalDay(
  d: Pick<DispatchDocket, 'deliveryCollectionDate'>,
  day: Date,
): boolean {
  const iso = d.deliveryCollectionDate;
  if (!iso) return false;
  const docketDate = new Date(iso.includes('T') ? iso.replace('Z', '') : iso);
  return (
    docketDate.getFullYear() === day.getFullYear() &&
    docketDate.getMonth() === day.getMonth() &&
    docketDate.getDate() === day.getDate()
  );
}

export function parseCollectionStartMs(iso: string | undefined): number {
  if (!iso) return 0;
  const local = iso.includes('T') ? iso.replace('Z', '') : iso;
  const t = new Date(local).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function dayBucketMs(iso: string | undefined): number {
  const ms = parseCollectionStartMs(iso);
  if (!ms) return 0;
  return startOfDay(new Date(ms)).getTime();
}

export function normalizedLoadM3ForSort(docket: DispatchDocket): number {
  const density = docket.jobItem?.product?.densityTonnagePerM3;
  const uom = docket.productSellUom;
  const qty = Number(docket.actualLoadSize || docket.plannedLoadSize || 0);
  if (!Number.isFinite(qty)) return 0;

  if (density != null && density > 0) {
    if (uom === 'TN') return qty / density;
    if (uom === 'M3') return qty;
    if (uom === 'KG_20' || uom === 'BULKA') {
      return (qty * 0.02) / density;
    }
  }

  return qty;
}

export function matchesUnassignedSearch(
  docket: DispatchDocket,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const num = (docket.docketNumber || '').toLowerCase();
  const customer = (docket.customerName || '').toLowerCase();
  return num.includes(q) || customer.includes(q);
}

export function isGenericDispatchTruckName(name?: string): boolean {
  return (name ?? '').toLowerCase().includes('generic');
}

/** Default truck column order when utilisation sorting is off. */
export function sortDispatchBoardTruckColumns(
  trucks: TruckResource[],
): TruckResource[] {
  const internal = trucks.filter(
    (t) => t.businessType === TRUCK_BUSINESS_TYPE.INTERNAL,
  );
  const external = trucks.filter(
    (t) => t.businessType !== TRUCK_BUSINESS_TYPE.INTERNAL,
  );

  const sortWithinFleetGroup = (list: TruckResource[]) =>
    [...list].sort((a, b) => {
      const genericA = isGenericDispatchTruckName(a.name);
      const genericB = isGenericDispatchTruckName(b.name);
      if (genericA !== genericB) return genericA ? 1 : -1;
      return (a.name || '').localeCompare(b.name || '', undefined, {
        sensitivity: 'base',
      });
    });

  const sortedInternal = sortWithinFleetGroup(internal);

  const byHaulier = new Map<string, TruckResource[]>();
  for (const t of external) {
    const key = t.haulierName?.trim() || 'External';
    const group = byHaulier.get(key);
    if (group) group.push(t);
    else byHaulier.set(key, [t]);
  }

  const sortedExternal = [...byHaulier.keys()]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .flatMap((key) => sortWithinFleetGroup(byHaulier.get(key)!));

  return [...sortedInternal, ...sortedExternal];
}

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
