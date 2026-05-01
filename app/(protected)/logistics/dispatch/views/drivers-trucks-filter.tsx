'use client';

import * as React from 'react';
import { Plus, Palette } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { DRIVER_STATUS } from '@/lib/types/driver-enums';
import { TRUCK_BUSINESS_TYPE } from '@/lib/types/truck-enums';

export const JOB_STATUS_FILTER_ALL = '__ALL_EXCEPT_UNASSIGNED__';

const JOB_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: JOB_STATUS_FILTER_ALL, label: 'All (Except Unassigned)' },
  { value: DOCKET_STATUS.ASSIGNED, label: 'Assigned' },
  { value: DOCKET_STATUS.IN_TRANSIT, label: 'In transit' },
  { value: DOCKET_STATUS.DELIVERED, label: 'Delivered' },
  { value: DOCKET_STATUS.ARRIVED, label: 'Arrived' },
];

const DRIVER_STATUS_OPTIONS: { value: DRIVER_STATUS; label: string }[] = [
  { value: DRIVER_STATUS.ACTIVE, label: 'Active' },
  { value: DRIVER_STATUS.INACTIVE, label: 'Inactive' },
  { value: DRIVER_STATUS.ON_DUTY, label: 'On duty' },
  { value: DRIVER_STATUS.PENDING_INVITATION, label: 'Pending invitation' },
];

const TRUCK_BUSINESS_TYPE_OPTIONS: { value: TRUCK_BUSINESS_TYPE; label: string }[] =
  [
    { value: TRUCK_BUSINESS_TYPE.INTERNAL, label: 'Internal' },
    { value: TRUCK_BUSINESS_TYPE.EXTERNAL, label: 'External' },
  ];

export type ResourceFilterOption = {
  id: string;
  label: string;
};

export type DispatchBoardFilterState = {
  jobStatus: string;
  driverIds: string[];
  driverStatuses: DRIVER_STATUS[];
  truckBusinessType: TRUCK_BUSINESS_TYPE | null;
  haulierId: string | null;
  truckId: string | null;
};

export const DEFAULT_DISPATCH_BOARD_FILTER: DispatchBoardFilterState = {
  jobStatus: JOB_STATUS_FILTER_ALL,
  driverIds: [],
  driverStatuses: [],
  truckBusinessType: null,
  haulierId: null,
  truckId: null,
};

type Props = {
  viewType: 'drivers' | 'trucks';
  driverOptions: ResourceFilterOption[];
  truckOptions: ResourceFilterOption[];
  haulierOptions: ResourceFilterOption[];
  isLoadingResources?: boolean;
  filter: DispatchBoardFilterState;
  onFilterChange: (next: DispatchBoardFilterState) => void;
};

export function DispatchDriversTrucksFilter({
  viewType,
  driverOptions,
  truckOptions,
  haulierOptions,
  isLoadingResources,
  filter,
  onFilterChange,
}: Props) {
  const setFilter = (patch: Partial<DispatchBoardFilterState>) => {
    onFilterChange({ ...filter, ...patch });
  };

  const toggleJobStatus = (status: string) => {
    setFilter({
      jobStatus: filter.jobStatus === status ? JOB_STATUS_FILTER_ALL : status,
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
      truckBusinessType:
        filter.truckBusinessType === t ? null : t,
    });
  };

  const toggleHaulierId = (id: string) => {
    setFilter({
      haulierId: filter.haulierId === id ? null : id,
    });
  };

  const toggleTruckId = (id: string) => {
    setFilter({
      truckId: filter.truckId === id ? null : id,
    });
  };

  const clearFilters = () => {
    onFilterChange({ ...DEFAULT_DISPATCH_BOARD_FILTER });
  };

  const jobStatusLabel =
    JOB_STATUS_OPTIONS.find((o) => o.value === filter.jobStatus)?.label ??
    'Status';

  return (
    <div className="border-b bg-white px-6 py-3 flex items-center gap-6">
      <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 tracking-wider">
            JOBS
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.jobStatus !== JOB_STATUS_FILTER_ALL ? 'border-gray-300' : 'border-gray-200'}`}
              >
                <Plus className="w-4 h-4 text-gray-500" />
                <span
                  className={`font-medium text-gray-700 ${filter.jobStatus !== JOB_STATUS_FILTER_ALL ? 'mr-1' : ''}`}
                >
                  Status
                </span>
                {filter.jobStatus !== JOB_STATUS_FILTER_ALL && (
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
                    {JOB_STATUS_OPTIONS.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        onSelect={() => toggleJobStatus(opt.value)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={filter.jobStatus === opt.value}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                        />
                        <span>{opt.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <button
            type="button"
            className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Customer</span>
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-2" />

          <div className="flex items-center gap-3">
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
                              <Checkbox
                                checked={filter.driverStatuses.includes(opt.value)}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                              />
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
                            ? driverOptions.find(
                              (o) => o.id === filter.driverIds[0],
                            )?.label ?? filter.driverIds[0]
                            : `${filter.driverIds.length} selected`}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search drivers..."
                        className="focus-visible:ring-purple-500 focus-within:ring-purple-500"
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
                                <Checkbox
                                  checked={filter.driverIds.includes(driver.id)}
                                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                                />
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
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.truckBusinessType ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${filter.truckBusinessType ? 'mr-1' : ''}`}
                      >
                        Truck type
                      </span>
                      {filter.truckBusinessType && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                          {
                            TRUCK_BUSINESS_TYPE_OPTIONS.find(
                              (o) => o.value === filter.truckBusinessType,
                            )?.label
                          }
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
                              <Checkbox
                                checked={filter.truckBusinessType === opt.value}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                              />
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
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.haulierId ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${filter.haulierId ? 'mr-1' : ''}`}
                      >
                        Haulier
                      </span>
                      {filter.haulierId && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium max-w-[120px] truncate">
                          {haulierOptions.find((h) => h.id === filter.haulierId)
                            ?.label ?? filter.haulierId}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search hauliers..."
                        className="focus-visible:ring-purple-500 focus-within:ring-purple-500"
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
                                <Checkbox
                                  checked={filter.haulierId === haulier.id}
                                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                                />
                                <span>{haulier.label}</span>
                              </div>
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
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${filter.truckId ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${filter.truckId ? 'mr-1' : ''}`}
                      >
                        Trucks
                      </span>
                      {filter.truckId && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium max-w-[120px] truncate">
                          {truckOptions.find((t) => t.id === filter.truckId)
                            ?.label ?? filter.truckId}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search trucks…"
                        className="focus-visible:ring-purple-500 focus-within:ring-purple-500"
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
                                <Checkbox
                                  checked={filter.truckId === truck.id}
                                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                                />
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
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors font-medium text-gray-700 cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              Status colors
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[420px]" align="end">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-semibold text-gray-900">
                  Docket status colors
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Consistent across dispatch board, week, and month. Slot cards
                  use a slightly stronger tint.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">
                  Collection & Dispatch
                </h5>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-gray-300 bg-white overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full border-b border-gray-200" />
                    </div>
                    <span className="text-sm text-gray-700">Unassigned</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-yellow-300 bg-yellow-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-yellow-200" />
                    </div>
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-blue-300 bg-blue-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-blue-200" />
                    </div>
                    <span className="text-sm text-gray-700">Preparing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-pink-300 bg-pink-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-pink-200" />
                    </div>
                    <span className="text-sm text-gray-700">Ready</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-green-300 bg-green-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-green-200" />
                    </div>
                    <span className="text-sm text-gray-700">Collected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-cyan-300 bg-cyan-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-cyan-200" />
                    </div>
                    <span className="text-sm text-gray-700">Assigned</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-indigo-300 bg-indigo-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-indigo-200" />
                    </div>
                    <span className="text-sm text-gray-700">In transit</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-orange-300 bg-orange-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-orange-200" />
                    </div>
                    <span className="text-sm text-gray-700">Stopped</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-yellow-300 bg-yellow-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-yellow-200" />
                    </div>
                    <span className="text-sm text-gray-700">Arrived</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">
                  Delivered & Closed
                </h5>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-green-300 bg-green-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-green-200" />
                    </div>
                    <span className="text-sm text-gray-700">Delivered</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-purple-300 bg-purple-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-purple-200" />
                    </div>
                    <span className="text-sm text-gray-700">Invoiced</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-red-300 bg-red-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-red-200" />
                    </div>
                    <span className="text-sm text-gray-700">Cancelled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-yellow-300 bg-yellow-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-yellow-200" />
                    </div>
                    <span className="text-sm text-gray-700">Cash sale</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded border border-red-300 bg-red-50 overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full bg-red-200" />
                    </div>
                    <span className="text-sm text-gray-700">Voided</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
