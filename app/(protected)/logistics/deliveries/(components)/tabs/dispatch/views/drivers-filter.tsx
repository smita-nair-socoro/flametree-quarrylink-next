'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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

const DRIVER_STATUS_OPTIONS = [
  'Available',
  'On Trip',
  'Break',
  'Off Duty',
];

export function DispatchDriversFilter() {
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(['All (Except Unassigned)']);
  const [selectedDrivers, setSelectedDrivers] = React.useState<string[]>([]);
  const [selectedDriverStatuses, setSelectedDriverStatuses] = React.useState<string[]>([]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleDriver = (driverName: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(driverName) ? prev.filter((d) => d !== driverName) : [...prev, driverName]
    );
  };

  const toggleDriverStatus = (status: string) => {
    setSelectedDriverStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="border-b bg-white px-6 py-3 flex items-center gap-6">
      {/* JOBS Section */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500 tracking-wider">JOBS</span>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${selectedStatuses.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}>
              <Plus className="w-4 h-4 text-gray-500" />
              <span className={`font-medium text-gray-700 ${selectedStatuses.length > 0 ? 'mr-1' : ''}`}>Status</span>
              {selectedStatuses.length > 0 && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {selectedStatuses.length === 1 ? selectedStatuses[0] : `${selectedStatuses.length} selected`}
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

        <button className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
          <Plus className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700">Customer</span>
        </button>
      </div>

      <div className="w-[1px] h-5 bg-gray-200 mx-2" />

      {/* DRIVERS Section */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500 tracking-wider">DRIVERS</span>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${selectedDriverStatuses.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}>
              <Plus className="w-4 h-4 text-gray-500" />
              <span className={`font-medium text-gray-700 ${selectedDriverStatuses.length > 0 ? 'mr-1' : ''}`}>Driver status</span>
              {selectedDriverStatuses.length > 0 && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {selectedDriverStatuses.length === 1 ? selectedDriverStatuses[0] : `${selectedDriverStatuses.length} selected`}
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
                        checked={selectedDriverStatuses.includes(status)}
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
            <button className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${selectedDrivers.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}>
              <Plus className="w-4 h-4 text-gray-500" />
              <span className={`font-medium text-gray-700 ${selectedDrivers.length > 0 ? 'mr-1' : ''}`}>Drivers</span>
              {selectedDrivers.length > 0 && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {selectedDrivers.length === 1 ? selectedDrivers[0] : `${selectedDrivers.length} selected`}
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
                          checked={selectedDrivers.includes(driver.name)}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white"
                        />
                        <span>{driver.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{driver.rego}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
