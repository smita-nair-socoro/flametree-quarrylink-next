import { format, startOfDay } from 'date-fns';
import { appendUtcSuffix } from '@/lib/utils/date';
import type { ConflictingDocket } from '@/lib/types/docket';
import { DRIVER_TYPE } from '@/lib/types/driver-enums';
import { TRUCK_BUSINESS_TYPE } from '@/lib/types/truck-enums';
import type {
  DispatchTruckResource,
  DispatchDriverResource,
  DispatchDocketDTO,
  DispatchBoardDocketRow,
  DispatchUnassignedDocket,
  DispatchBoardTruckRef,
  DocketDTO,
  DocketOperationalUpdateRequest,
} from '@/lib/types/docket';
import { getDeliveryDistanceQuantity } from '@/lib/utils/docket-helper';
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

export function mapUnassignedDocketDtoToBoardRow(
  d: DocketDTO,
): DispatchUnassignedDocket & DispatchDocketUiFields {
  return {
    id: d.id,
    docketNumber: d.docketNumber,
    docketStatus: d.docketStatus,
    deliveryCollectionDate: d.deliveryCollectionDate,
    deliveryCollectionStartTime: d.deliveryCollectionStartTime,
    deliveryCollectionEndTime: d.deliveryCollectionEndTime,
    productName: d.jobItem?.product?.productName || '',
    actualLoadSize: d.actualLoadSize || 0,
    plannedLoadSize: d.plannedLoadSize || 0,
    loadSize: d.actualLoadSize || d.plannedLoadSize || 0,
    customerName:
      d.job?.customerDto?.businessName || d.job?.contactPersonName || '',
    pickUpSuburb: d.pickUpAddress?.city || '',
    pickUpState: d.pickUpAddress?.state || '',
    deliverySuburb: d.deliveryAddress?.city || '',
    deliveryState: d.deliveryAddress?.state || '',
    productDensity: d.jobItem?.product?.densityTonnagePerM3 || 0,
    productSellUom: d.jobItem?.productSellUom || '',
    truckSellQty: d.jobItem?.truckSellQty ?? 0,
    truckSellUom: d.jobItem?.truckSellUom ?? '',
    truckSellPrice: d.jobItem?.truckSellPrice ?? 0,
    uiAssignedTruckId: null,
    uiAssignedTime: null,
  };
}

export function mapSchedulerUnassignedToBoardRow(
  d: DispatchUnassignedDocket,
): DispatchUnassignedDocket & DispatchDocketUiFields {
  return {
    ...d,
    loadSize: d.loadSize ?? d.actualLoadSize ?? d.plannedLoadSize ?? 0,
    uiAssignedTruckId: null,
    uiAssignedTime: null,
  };
}

/** Scheduler day-scoped unassigned rows take precedence over the global dockets list. */
export function mergeDispatchUnassignedDockets(
  schedulerUnassigned: DispatchUnassignedDocket[],
  globalUnassigned: Array<DispatchUnassignedDocket & DispatchDocketUiFields>,
  assignedIds: Set<number>,
): DispatchDocket[] {
  const byId = new Map<number, DispatchDocket>();

  for (const u of globalUnassigned) {
    if (!assignedIds.has(u.id)) byId.set(u.id, u);
  }
  for (const u of schedulerUnassigned) {
    if (!assignedIds.has(u.id)) {
      byId.set(u.id, mapSchedulerUnassignedToBoardRow(u));
    }
  }

  return Array.from(byId.values());
}

/** Product sell qty → equivalent body volume (m³). */
export function loadVolumeM3FromProductSellUom(
  loadSize: number,
  uom: string,
  density: number,
): number {
  const d = density || 1;
  const upperUom = (uom || 'TN').toUpperCase();
  if (upperUom === 'M3' || upperUom === 'BULKA') {
    return loadSize;
  }
  if (upperUom === 'TN') {
    return loadSize / d;
  }
  if (upperUom === 'KG_20' || upperUom === '20KG') {
    return loadSize / 50 / d;
  }
  return loadSize;
}

/** Display truck fill % without rounding sub-1% values down to 0. */
export function formatDispatchTruckFillPct(fillPct: number): string {
  if (!Number.isFinite(fillPct) || fillPct <= 0) return '0';
  if (fillPct < 10) {
    const formatted = fillPct.toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
  }
  return String(Math.round(fillPct));
}

/** Max product sell qty that fits in a truck body volume (m³). */
export function maxLoadInProductSellUom(
  truckVolumeM3: number,
  productSellUom: string,
  density: number,
): number {
  const d = density || 1;
  const upperUom = (productSellUom || 'TN').toUpperCase();
  if (upperUom === 'M3' || upperUom === 'BULKA') {
    return Math.floor(truckVolumeM3);
  }
  if (upperUom === 'TN') {
    return Math.floor(truckVolumeM3 * d);
  }
  if (upperUom === 'KG_20' || upperUom === '20KG') {
    return Math.floor(truckVolumeM3 * d * 50);
  }
  return Math.floor(truckVolumeM3 * d);
}

export function isVolumeProductSellUom(uom?: string): boolean {
  const upper = (uom || '').toUpperCase();
  return upper === 'M3' || upper === 'BULKA';
}

export function formatDispatchProductSellUomLabel(uom?: string): string {
  if (uom === 'M3') return 'm³';
  if (uom === 'KG_20') return 'x 20kg';
  if (uom === 'TN') return 'TN';
  if (uom === 'BULKA') return 'Bulka';
  return uom || 'TN';
}

/** Truck m³ with product-UOM equivalent when product is not volume-based. */
export function formatTruckMaxCapacityLabel(
  truckVolumeM3: number,
  productSellUom: string,
  density: number,
  formatQty: (n: number) => string = String,
): string {
  const m3Part = `${formatQty(truckVolumeM3)} m³`;
  if (isVolumeProductSellUom(productSellUom)) {
    return m3Part;
  }
  const maxProductQty = maxLoadInProductSellUom(
    truckVolumeM3,
    productSellUom,
    density,
  );
  const uomLabel = formatDispatchProductSellUomLabel(productSellUom);
  return `${m3Part} (${formatQty(maxProductQty)} ${uomLabel})`;
}

export function buildDispatchOperationalLoadUpdate(
  docket: Pick<
    DispatchDocket,
    'productSellUom' | 'productDensity' | 'truckSellUom' | 'truckSellQty'
  >,
  loadSizeInProductUom: number,
): Pick<
  DocketOperationalUpdateRequest,
  | 'actualLoadSize'
  | 'plannedLoadSize'
  | 'deliveryDistanceQuantity'
  | 'checkWindowTimeConflict'
> {
  const productUom = docket.productSellUom || 'TN';
  const truckUom = docket.truckSellUom || 'TN';
  const density = docket.productDensity || 1;
  const needTruckQty =
    truckUom === 'HOURLY' || truckUom === 'LOAD' || truckUom === 'KM';

  const { quantity } = getDeliveryDistanceQuantity({
    isCollection: false,
    needTruckQty,
    truckQty: docket.truckSellQty,
    loadSize: loadSizeInProductUom,
    productUom,
    truckUom,
    density,
  });

  return {
    actualLoadSize: loadSizeInProductUom,
    plannedLoadSize: loadSizeInProductUom,
    deliveryDistanceQuantity: quantity,
    checkWindowTimeConflict: false,
  };
}

/** System / placeholder trucks with open capacity — no load adjustment on assign. */
export function isGenericDispatchTruck(
  truck: Pick<DispatchBoardTruckRef, 'licensePlate' | 'tankVolumeM3'> & {
    truckType?: string;
  },
): boolean {
  const plate = truck.licensePlate?.toUpperCase() ?? '';
  if (plate.startsWith('GENERIC')) return true;
  if (truck.licensePlate?.toLowerCase().includes('generic')) return true;
  if (truck.truckType?.toUpperCase() === 'GENERIC') return true;
  return false;
}

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
    return true;
  }
  return jobStatuses.includes(String(d.docketStatus));
}

export type SchedulerFilterOption = {
  id: string;
  label: string;
};

export function buildSchedulerFilterCustomerOptions(
  viewType: 'trucks' | 'drivers',
  trucksData?: DispatchDocketDTO | null,
  driversData?: DispatchDocketDTO | null,
): string[] {
  const names = new Set<string>();

  if (viewType === 'trucks' && trucksData?.resources) {
    for (const r of trucksData.resources) {
      if (isDispatchTruckResource(r)) {
        for (const d of r.dockets || []) {
          if (d.customerName) names.add(d.customerName);
        }
      }
    }
    for (const d of trucksData.unassignedDockets || []) {
      if (d.customerName) names.add(d.customerName);
    }
  } else if (viewType === 'drivers' && driversData?.resources) {
    for (const r of driversData.resources) {
      if (isDispatchDriverResource(r)) {
        for (const d of r.dockets || []) {
          if (d.customerName) names.add(d.customerName);
        }
      }
    }
    for (const d of driversData.unassignedDockets || []) {
      if (d.customerName) names.add(d.customerName);
    }
  }

  return Array.from(names).sort();
}

export function isDocketInScheduleDateRange(
  d: { deliveryCollectionDate?: string },
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  if (!d.deliveryCollectionDate) return false;
  const localTimeStr = d.deliveryCollectionDate.includes('T')
    ? d.deliveryCollectionDate.replace('Z', '')
    : d.deliveryCollectionDate;
  const day = startOfDay(new Date(localTimeStr));
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);
  return day >= start && day <= end;
}

/** Customers with at least one docket on the schedule in the given date range. */
export function buildScheduleCustomerOptionsFromDockets(
  dockets: { customerName?: string; deliveryCollectionDate?: string }[],
  rangeStart: Date,
  rangeEnd: Date,
): string[] {
  const names = new Set<string>();
  for (const d of dockets) {
    if (
      d.customerName &&
      isDocketInScheduleDateRange(d, rangeStart, rangeEnd)
    ) {
      names.add(d.customerName);
    }
  }
  return Array.from(names).sort();
}

export function buildSchedulerFilterDriverOptions(
  driversData?: DispatchDocketDTO | null,
): SchedulerFilterOption[] {
  if (!driversData?.resources) return [];
  return driversData.resources.filter(isDispatchDriverResource).map((r) => ({
    id: String(r.id),
    label: r.driverName,
  }));
}

export function buildSchedulerFilterTruckOptions(
  trucksData?: DispatchDocketDTO | null,
): SchedulerFilterOption[] {
  if (!trucksData?.resources) return [];
  return trucksData.resources.filter(isDispatchTruckResource).map((r) => ({
    id: String(r.id),
    label: r.licensePlate,
  }));
}

export function buildSchedulerFilterHaulierOptions(
  trucksData?: DispatchDocketDTO | null,
): SchedulerFilterOption[] {
  if (!trucksData?.resources) return [];
  const byId = new Map<number, string>();
  for (const r of trucksData.resources) {
    if (!isDispatchTruckResource(r)) continue;
    for (const d of r.drivers || []) {
      const h = d.haulier;
      if (h?.id != null && h.haulierName) {
        byId.set(h.id, h.haulierName);
      }
    }
  }
  return [...byId.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([id, label]) => ({ id: String(id), label }));
}

export function docketMatchesScheduleJobFilters(
  d: DispatchBoardDocketRow,
  filter: DispatchBoardFilterState,
): boolean {
  if (!matchesBoardJobFilter(d as DispatchDocket, filter.jobStatuses)) {
    return false;
  }
  if (filter.customerNames.length === 0) return true;
  return !!d.customerName && filter.customerNames.includes(d.customerName);
}

export function hasActiveScheduleFleetFilters(
  filter: DispatchBoardFilterState,
): boolean {
  return (
    filter.truckIds.length > 0 ||
    filter.haulierIds.length > 0 ||
    filter.truckBusinessTypes.length > 0 ||
    filter.driverStatuses.length > 0
  );
}

export function docketPassesScheduleFleetFilters(
  docketId: number,
  trucksData: DispatchDocketDTO | undefined | null,
  filter: DispatchBoardFilterState,
): boolean {
  if (!hasActiveScheduleFleetFilters(filter)) return true;
  if (!trucksData?.resources) return false;

  for (const r of trucksData.resources) {
    if (!isDispatchTruckResource(r)) continue;
    if (!(r.dockets || []).some((d) => d.id === docketId)) continue;
    return truckMatchesFleetFilters(r, filter);
  }

  return false;
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

export function buildDispatchAssignmentWindows(
  assignmentDate: Date,
  slotTime: string,
  durationHours: number = 2,
): {
  deliveryCollectionDate: string;
  deliveryStartWindow: string;
  deliveryEndWindow: string;
} {
  const [hours, minutes] = slotTime.split(':').map(Number);
  const startWindow = new Date(assignmentDate);
  startWindow.setHours(hours, minutes, 0, 0);

  let endWindow = new Date(startWindow);
  endWindow.setHours(startWindow.getHours() + durationHours);

  if (
    endWindow.getDate() !== startWindow.getDate() ||
    endWindow.getMonth() !== startWindow.getMonth() ||
    endWindow.getFullYear() !== startWindow.getFullYear()
  ) {
    endWindow = new Date(startWindow);
    endWindow.setHours(23, 59, 59, 999);
  }

  const startIso = formatLocalISO(startWindow);
  const endIso = formatLocalISO(endWindow);
  const dateIso = `${startIso.split('T')[0]}T00:00:00.000`;

  return {
    deliveryCollectionDate: appendUtcSuffix(dateIso),
    deliveryStartWindow: appendUtcSuffix(startIso),
    deliveryEndWindow: appendUtcSuffix(endIso),
  };
}

export function formatDispatchConflictDetail(d: ConflictingDocket): string {
  const start = formatTime(d.deliveryCollectionStartTime);
  const end = formatTime(d.deliveryCollectionEndTime);
  const range =
    start && end ? `${start} - ${end}` : start || end || 'scheduled time';
  return `Potential overlap with ${d.docketNumber} (${range})`;
}

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
