'use client';

import { Palette } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DocketStatusColorsPopover() {
  return (
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
              Consistent across dispatch board, week, and month. Slot cards use
              a slightly stronger tint.
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
  );
}
