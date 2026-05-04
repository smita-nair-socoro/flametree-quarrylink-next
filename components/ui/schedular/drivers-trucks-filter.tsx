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

const STATUS_OPTIONS = [
  'All (Except Unassigned)',
  'Assigned',
  'In-Transit',
  'Delivered',
  'Unassigned',
];

const DRIVER_OPTIONS = [
  { name: 'Sarah Wilson', rego: 'VIC456' },
  { name: 'Mike Johnson', rego: 'VIC456' },
  { name: 'Tom Anderson', rego: 'VIC345' },
  { name: 'James Brown', rego: 'VIC789' },
  { name: 'External Driver 1', rego: '48OIL' },
  { name: 'Lisa Martinez', rego: 'VIC012' },
];

const DRIVER_STATUS_OPTIONS = ['Available', 'Busy'];

const TRUCK_TYPE_OPTIONS = ['Internal', 'External'];

const HAULIER_OPTIONS = [
  { name: 'HANSON', rego: 'HANSON' },
  { name: 'BRISBANE', rego: 'BRISBANE' },
  { name: 'CENTRAL', rego: 'CENTRAL' },
  { name: 'TASMANIA', rego: 'TASMANIA' },
];

const TRUCK_OPTIONS = [
  { name: 'TRUCK1', rego: 'TRUCK1' },
  { name: 'TRUCK2', rego: 'TRUCK2' },
  { name: 'TRUCK3', rego: 'TRUCK3' },
  { name: 'TRUCK4', rego: 'TRUCK4' },
  { name: 'TRUCK5', rego: 'TRUCK5' },
];

export function DriversTrucksFilter({
  viewType,
}: {
  viewType: 'drivers' | 'trucks';
}) {
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([
    'All (Except Unassigned)',
  ]);
  const [selectedDrivers, setSelectedDrivers] = React.useState<string[]>([]);
  const [selectedDriverStatuses, setSelectedDriverStatuses] = React.useState<
    string[]
  >([]);
  const [selectedTruckType, setSelectedTruckType] = React.useState<string[]>(
    [],
  );
  const [selectedHaulier, setSelectedHaulier] = React.useState<string[]>([]);
  const [selectedTrucks, setSelectedTrucks] = React.useState<string[]>([]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => (prev[0] === status ? [] : [status]));
  };

  const toggleDriver = (driverName: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(driverName)
        ? prev.filter((d) => d !== driverName)
        : [...prev, driverName],
    );
  };

  const toggleDriverStatus = (status: string) => {
    setSelectedDriverStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleTruckType = (truckType: string) => {
    setSelectedTruckType((prev) => (prev[0] === truckType ? [] : [truckType]));
  };

  const toggleHaulier = (haulier: string) => {
    setSelectedHaulier((prev) => (prev[0] === haulier ? [] : [haulier]));
  };

  const toggleTrucks = (trucks: string) => {
    setSelectedTrucks((prev) => (prev[0] === trucks ? [] : [trucks]));
  };

  return (
    <div className="border-b bg-white px-6 py-3 flex items-center gap-6">
      {/* JOBS Section */}
      <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 tracking-wider">
            JOBS
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${selectedStatuses.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
              >
                <Plus className="w-4 h-4 text-gray-500" />
                <span
                  className={`font-medium text-gray-700 ${selectedStatuses.length > 0 ? 'mr-1' : ''}`}
                >
                  Status
                </span>
                {selectedStatuses.length > 0 && (
                  <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                    {selectedStatuses.length === 1
                      ? selectedStatuses[0]
                      : `${selectedStatuses.length} selected`}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {STATUS_OPTIONS.map((status) => (
                      <CommandItem
                        key={status}
                        onSelect={() => toggleStatus(status)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedStatuses.includes(status)}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                        />
                        <span>{status}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer">
            <Plus className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Customer</span>
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-2" />

          {/* DRIVERS Section */}
          <div className="flex items-center gap-3">
            {viewType === 'drivers' && (
              <>
                <span className="text-xs font-semibold text-gray-500 tracking-wider">
                  DRIVERS
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${selectedDriverStatuses.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${selectedDriverStatuses.length > 0 ? 'mr-1' : ''}`}
                      >
                        Driver status
                      </span>
                      {selectedDriverStatuses.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                          {selectedDriverStatuses.length === 1
                            ? selectedDriverStatuses[0]
                            : `${selectedDriverStatuses.length} selected`}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {DRIVER_STATUS_OPTIONS.map((status) => (
                            <CommandItem
                              key={status}
                              onSelect={() => toggleDriverStatus(status)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedDriverStatuses.includes(
                                  status,
                                )}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                              />
                              <span>{status}</span>
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
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${selectedDrivers.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${selectedDrivers.length > 0 ? 'mr-1' : ''}`}
                      >
                        Drivers
                      </span>
                      {selectedDrivers.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                          {selectedDrivers.length === 1
                            ? selectedDrivers[0]
                            : `${selectedDrivers.length} selected`}
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
                        <CommandEmpty>No driver found.</CommandEmpty>
                        <CommandGroup>
                          {DRIVER_OPTIONS.map((driver) => (
                            <CommandItem
                              key={driver.name}
                              onSelect={() => toggleDriver(driver.name)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedDrivers.includes(
                                    driver.name,
                                  )}
                                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                                />
                                <span>{driver.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {driver.rego}
                              </span>
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
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${selectedTruckType.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${selectedTruckType.length > 0 ? 'mr-1' : ''}`}
                      >
                        Truck Type
                      </span>
                      {selectedTruckType.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                          {selectedTruckType.length === 1
                            ? selectedTruckType[0]
                            : `${selectedTruckType.length} selected`}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {TRUCK_TYPE_OPTIONS.map((status) => (
                            <CommandItem
                              key={status}
                              onSelect={() => toggleTruckType(status)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedTruckType.includes(status)}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                              />
                              <span>{status}</span>
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
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${selectedHaulier.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${selectedHaulier.length > 0 ? 'mr-1' : ''}`}
                      >
                        Haulier
                      </span>
                      {selectedHaulier.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                          {selectedHaulier.length === 1
                            ? selectedHaulier[0]
                            : `${selectedHaulier.length} selected`}
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
                        <CommandEmpty>No driver found.</CommandEmpty>
                        <CommandGroup>
                          {HAULIER_OPTIONS.map((haulier) => (
                            <CommandItem
                              key={haulier.name}
                              onSelect={() => toggleHaulier(haulier.name)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedHaulier.includes(
                                    haulier.name,
                                  )}
                                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                                />
                                <span>{haulier.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {haulier.rego}
                              </span>
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
                      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${selectedTrucks.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span
                        className={`font-medium text-gray-700 ${selectedTrucks.length > 0 ? 'mr-1' : ''}`}
                      >
                        Trucks
                      </span>
                      {selectedTrucks.length > 0 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                          {selectedTrucks.length === 1
                            ? selectedTrucks[0]
                            : `${selectedTrucks.length} selected`}
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
                        <CommandEmpty>No driver found.</CommandEmpty>
                        <CommandGroup>
                          {TRUCK_OPTIONS.map((truck) => (
                            <CommandItem
                              key={truck.name}
                              onSelect={() => toggleTrucks(truck.name)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedTrucks.includes(truck.name)}
                                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                                />
                                <span>{truck.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {truck.rego}
                              </span>
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
              onClick={() => {
                setSelectedStatuses([]);
                setSelectedDrivers([]);
                setSelectedDriverStatuses([]);
                setSelectedTruckType([]);
                setSelectedHaulier([]);
                setSelectedTrucks([]);
              }}
              className="ml-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors font-medium text-gray-700 cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors font-medium text-gray-700 cursor-pointer">
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
