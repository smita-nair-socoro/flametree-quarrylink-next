'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';
import { DocketStatusColorsPopover } from '@/components/ui/schedular/docket-status-colors-popover';
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
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { DRIVER_STATUS } from '@/lib/types/driver-enums';
import { TRUCK_BUSINESS_TYPE } from '@/lib/types/truck-enums';

export const DEFAULT_JOB_STATUS_FILTER_OPTIONS: {
  value: string;
  label: string;
}[] = [
    { value: DOCKET_STATUS.ASSIGNED, label: 'Assigned' },
    { value: DOCKET_STATUS.IN_TRANSIT, label: 'In transit' },
    { value: DOCKET_STATUS.STOPPED, label: 'Stopped' },
    { value: DOCKET_STATUS.ARRIVED, label: 'Arrived' },
    { value: DOCKET_STATUS.DELIVERED, label: 'Delivered' },
    { value: DOCKET_STATUS.INVOICED, label: 'Invoiced' },
    { value: DOCKET_STATUS.CANCELLED, label: 'Cancelled' },
    { value: DOCKET_STATUS.VOIDED, label: 'Voided' },
  ];

export const SCHEDULE_MONTH_JOB_STATUS_FILTER_OPTIONS: {
  value: string;
  label: string;
}[] = [
    { value: DOCKET_STATUS.UNASSIGNED, label: 'Unassigned' },
    ...DEFAULT_JOB_STATUS_FILTER_OPTIONS,
  ];

const DRIVER_STATUS_OPTIONS: { value: DRIVER_STATUS; label: string }[] = [
  { value: DRIVER_STATUS.ACTIVE, label: 'Active' },
  { value: DRIVER_STATUS.DEACTIVATED, label: 'DEACTIVATED' },
  { value: DRIVER_STATUS.ON_DUTY, label: 'On duty' },
  { value: DRIVER_STATUS.PENDING_INVITATION, label: 'Pending invitation' },
];

const TRUCK_BUSINESS_TYPE_OPTIONS: {
  value: TRUCK_BUSINESS_TYPE;
  label: string;
}[] = [
    { value: TRUCK_BUSINESS_TYPE.INTERNAL, label: 'Internal' },
    { value: TRUCK_BUSINESS_TYPE.EXTERNAL, label: 'External' },
  ];

export type ResourceFilterOption = {
  id: string;
  label: string;
};

export type DispatchBoardFilterState = {
  jobStatuses: string[];
  customerNames: string[];
  driverIds: string[];
  driverStatuses: DRIVER_STATUS[];
  truckBusinessTypes: TRUCK_BUSINESS_TYPE[];
  haulierIds: string[];
  truckIds: string[];
};

export const DEFAULT_DISPATCH_BOARD_FILTER: DispatchBoardFilterState = {
  jobStatuses: [],
  customerNames: [],
  driverIds: [],
  driverStatuses: [],
  truckBusinessTypes: [],
  haulierIds: [],
  truckIds: [],
};

type Props = {
  viewType: 'drivers' | 'trucks';
  driverOptions: ResourceFilterOption[];
  truckOptions: ResourceFilterOption[];
  haulierOptions: ResourceFilterOption[];
  customerOptions: string[];
  isLoadingResources?: boolean;
  filter: DispatchBoardFilterState;
  onFilterChange: (next: DispatchBoardFilterState) => void;
  jobStatusOptions?: { value: string; label: string }[];
};

export function DispatchDriversTrucksFilter({
  viewType,
  driverOptions,
  truckOptions,
  haulierOptions,
  customerOptions,
  isLoadingResources,
  filter,
  onFilterChange,
  jobStatusOptions = DEFAULT_JOB_STATUS_FILTER_OPTIONS,
}: Props) {
  const setFilter = (patch: Partial<DispatchBoardFilterState>) => {
    onFilterChange({ ...filter, ...patch });
  };

  const toggleJobStatus = (status: string) => {
    setFilter({
      jobStatuses: filter.jobStatuses.includes(status)
        ? filter.jobStatuses.filter((s) => s !== status)
        : [...filter.jobStatuses, status],
    });
  };

  const toggleCustomerName = (name: string) => {
    setFilter({
      customerNames: filter.customerNames.includes(name)
        ? filter.customerNames.filter((n) => n !== name)
        : [...filter.customerNames, name],
    });
  };

  const toggleDriverId = (id: string) => {
    setFilter({
      driverIds: filter.driverIds.includes(id)
        ? filter.driverIds.filter((d) => d !== id)
        : [...filter.driverIds, id],
    });
  };

  const toggleDriverStatus = (status: DRIVER_STATUS) => {
    setFilter({
      driverStatuses: filter.driverStatuses.includes(status)
        ? filter.driverStatuses.filter((s) => s !== status)
        : [...filter.driverStatuses, status],
    });
  };

  const toggleTruckBusinessType = (t: TRUCK_BUSINESS_TYPE) => {
    setFilter({
      truckBusinessTypes: filter.truckBusinessTypes.includes(t)
        ? filter.truckBusinessTypes.filter((x) => x !== t)
        : [...filter.truckBusinessTypes, t],
    });
  };

  const toggleHaulierId = (id: string) => {
    setFilter({
      haulierIds: filter.haulierIds.includes(id)
        ? filter.haulierIds.filter((h) => h !== id)
        : [...filter.haulierIds, id],
    });
  };

  const renderHaulierFilter = () => (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.haulierIds.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
        >
          <Plus className="w-4 h-4 text-gray-500" />
          <span
            className={`font-medium text-gray-700 ${filter.haulierIds.length > 0 ? 'mr-1' : ''}`}
          >
            Haulier
          </span>
          {filter.haulierIds.length > 0 && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium max-w-[120px] truncate">
              {filter.haulierIds.length === 1
                ? (haulierOptions.find((h) => h.id === filter.haulierIds[0])
                  ?.label ?? filter.haulierIds[0])
                : `${filter.haulierIds.length} selected`}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search hauliers..."
            className="focus-visible:ring-primary focus-within:ring-primary"
          />
          <CommandList>
            <CommandEmpty>
              {isLoadingResources
                ? 'Loading hauliers…'
                : haulierOptions.length === 0
                  ? 'No hauliers on this fleet.'
                  : 'No haulier found.'}
            </CommandEmpty>
            <CommandGroup>
              {haulierOptions.map((haulier) => (
                <CommandItem
                  key={haulier.id}
                  value={haulier.label}
                  onSelect={() => toggleHaulierId(haulier.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 shrink-0 items-center justify-center border border-primary rounded-[4px]',
                        filter.haulierIds.includes(haulier.id)
                          ? 'bg-primary text-white'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check
                        className={cn(
                          'h-3.5 w-3.5',
                          filter.haulierIds.includes(haulier.id) &&
                          'text-white',
                        )}
                      />
                    </div>
                    <span>{haulier.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  const toggleTruckId = (id: string) => {
    setFilter({
      truckIds: filter.truckIds.includes(id)
        ? filter.truckIds.filter((t) => t !== id)
        : [...filter.truckIds, id],
    });
  };

  const clearFilters = () => {
    onFilterChange({ ...DEFAULT_DISPATCH_BOARD_FILTER });
  };

  const jobStatusLabel =
    filter.jobStatuses.length === 1
      ? jobStatusOptions.find((o) => o.value === filter.jobStatuses[0])?.label
      : `${filter.jobStatuses.length} selected`;

  const customerLabel =
    filter.customerNames.length === 1
      ? filter.customerNames[0]
      : `${filter.customerNames.length} selected`;

  return (
    <div className="border-b bg-white px-4 py-3 md:px-6 flex items-center gap-6">
      <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full">
        <div className="flex items-center justify-between gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap min-w-0 flex-1">
            <span className="text-xs font-semibold text-gray-500 tracking-wider">
              JOBS
            </span>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.jobStatuses.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                  <span
                    className={`font-medium text-gray-700 ${filter.jobStatuses.length > 0 ? 'mr-1' : ''}`}
                  >
                    Status
                  </span>
                  {filter.jobStatuses.length > 0 && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium max-w-[180px] truncate">
                      {jobStatusLabel}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {jobStatusOptions.map((opt) => (
                        <CommandItem
                          key={opt.value}
                          onSelect={() => toggleJobStatus(opt.value)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 shrink-0 items-center justify-center border border-primary rounded-[4px]',
                              filter.jobStatuses.includes(opt.value)
                                ? 'bg-primary text-white'
                                : 'opacity-50 [&_svg]:invisible',
                            )}
                          >
                            <Check
                              className={cn(
                                'h-3.5 w-3.5',
                                filter.jobStatuses.includes(opt.value) &&
                                'text-white',
                              )}
                            />
                          </div>
                          <span>{opt.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.customerNames.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                  <span
                    className={`font-medium text-gray-700 ${filter.customerNames.length > 0 ? 'mr-1' : ''}`}
                  >
                    Customer
                  </span>
                  {filter.customerNames.length > 0 && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium max-w-[180px] truncate">
                      {customerLabel}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search customers..."
                    className="focus-visible:ring-primary focus-within:ring-primary"
                  />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {customerOptions.map((customer) => (
                        <CommandItem
                          key={customer}
                          value={customer}
                          onSelect={() => toggleCustomerName(customer)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 shrink-0 items-center justify-center border border-primary rounded-[4px]',
                              filter.customerNames.includes(customer)
                                ? 'bg-primary text-white'
                                : 'opacity-50 [&_svg]:invisible',
                            )}
                          >
                            <Check
                              className={cn(
                                'h-3.5 w-3.5',
                                filter.customerNames.includes(customer) &&
                                'text-white',
                              )}
                            />
                          </div>
                          <span>{customer}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {viewType === 'drivers' && (
              <>
                <span className="text-xs font-semibold text-gray-500 tracking-wider">
                  DRIVERS
                </span>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.driverStatuses.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${filter.driverStatuses.length > 0 ? 'mr-1' : ''}`}
                      >
                        Driver status
                      </span>
                      {filter.driverStatuses.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium max-w-[160px] truncate">
                          {filter.driverStatuses.length === 1
                            ? DRIVER_STATUS_OPTIONS.find(
                              (o) => o.value === filter.driverStatuses[0],
                            )?.label
                            : `${filter.driverStatuses.length} selected`}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {DRIVER_STATUS_OPTIONS.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              onSelect={() => toggleDriverStatus(opt.value)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <div
                                className={cn(
                                  'mr-2 flex h-4 w-4 shrink-0 items-center justify-center border border-primary rounded-[4px]',
                                  filter.driverStatuses.includes(opt.value)
                                    ? 'bg-primary text-white'
                                    : 'opacity-50 [&_svg]:invisible',
                                )}
                              >
                                <Check
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    filter.driverStatuses.includes(
                                      opt.value,
                                    ) && 'text-white',
                                  )}
                                />
                              </div>
                              <span>{opt.label}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.driverIds.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${filter.driverIds.length > 0 ? 'mr-1' : ''}`}
                      >
                        Drivers
                      </span>
                      {filter.driverIds.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium max-w-[140px] truncate">
                          {filter.driverIds.length === 1
                            ? (driverOptions.find(
                              (o) => o.id === filter.driverIds[0],
                            )?.label ?? filter.driverIds[0])
                            : `${filter.driverIds.length} selected`}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search drivers..."
                        className="focus-visible:ring-primary focus-within:ring-primary"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingResources
                            ? 'Loading drivers…'
                            : 'No drivers found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {driverOptions.map((driver) => (
                            <CommandItem
                              key={driver.id}
                              value={`${driver.label}`}
                              onSelect={() => toggleDriverId(driver.id)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    'mr-2 flex h-4 w-4 shrink-0 items-center justify-center border border-primary rounded-[4px]',
                                    filter.driverIds.includes(driver.id)
                                      ? 'bg-primary text-white'
                                      : 'opacity-50 [&_svg]:invisible',
                                  )}
                                >
                                  <Check
                                    className={cn(
                                      'h-3.5 w-3.5',
                                      filter.driverIds.includes(driver.id) &&
                                      'text-white',
                                    )}
                                  />
                                </div>
                                <span>{driver.label}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </>
            )}

            {viewType === 'trucks' && (
              <>
                <span className="text-xs font-semibold text-gray-500 tracking-wider">
                  FLEET
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.truckBusinessTypes.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${filter.truckBusinessTypes.length > 0 ? 'mr-1' : ''}`}
                      >
                        Truck type
                      </span>
                      {filter.truckBusinessTypes.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                          {filter.truckBusinessTypes.length === 1
                            ? TRUCK_BUSINESS_TYPE_OPTIONS.find(
                              (o) =>
                                o.value === filter.truckBusinessTypes[0],
                            )?.label
                            : `${filter.truckBusinessTypes.length} selected`}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {TRUCK_BUSINESS_TYPE_OPTIONS.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              onSelect={() =>
                                toggleTruckBusinessType(opt.value)
                              }
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <div
                                className={cn(
                                  'mr-2 flex h-4 w-4 shrink-0 items-center justify-center border border-primary rounded-[4px]',
                                  filter.truckBusinessTypes.includes(
                                    opt.value,
                                  )
                                    ? 'bg-primary text-white'
                                    : 'opacity-50 [&_svg]:invisible',
                                )}
                              >
                                <Check
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    filter.truckBusinessTypes.includes(
                                      opt.value,
                                    ) && 'text-white',
                                  )}
                                />
                              </div>
                              <span>{opt.label}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {renderHaulierFilter()}

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.truckIds.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${filter.truckIds.length > 0 ? 'mr-1' : ''}`}
                      >
                        Trucks
                      </span>
                      {filter.truckIds.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium max-w-[120px] truncate">
                          {filter.truckIds.length === 1
                            ? (truckOptions.find(
                              (t) => t.id === filter.truckIds[0],
                            )?.label ?? filter.truckIds[0])
                            : `${filter.truckIds.length} selected`}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search trucks…"
                        className="focus-visible:ring-primary focus-within:ring-primary"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingResources
                            ? 'Loading trucks…'
                            : 'No trucks found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {truckOptions.map((truck) => (
                            <CommandItem
                              key={truck.id}
                              value={`${truck.label}`}
                              onSelect={() => toggleTruckId(truck.id)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    'mr-2 flex h-4 w-4 shrink-0 items-center justify-center border border-primary rounded-[4px]',
                                    filter.truckIds.includes(truck.id)
                                      ? 'bg-primary text-white'
                                      : 'opacity-50 [&_svg]:invisible',
                                  )}
                                >
                                  <Check
                                    className={cn(
                                      'h-3.5 w-3.5',
                                      filter.truckIds.includes(truck.id) &&
                                      'text-white',
                                    )}
                                  />
                                </div>
                                <span>{truck.label}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="ml-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Clear filters
            </button>
          </div>
          <div className="shrink-0 lg:hidden">
            <DocketStatusColorsPopover />
          </div>
        </div>

        <div className="shrink-0">
          <DocketStatusColorsPopover />
        </div>
      </div>
    </div>
  );
}
