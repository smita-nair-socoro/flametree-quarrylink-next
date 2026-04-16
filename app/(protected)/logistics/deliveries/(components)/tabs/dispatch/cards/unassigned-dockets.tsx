'use client';

import * as React from 'react';
import { Search, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from 'react-aria-components';
import { format } from 'date-fns';

export default function UnassignedDockets({ date }: { date: Date }) {
  const [activeTab, setActiveTab] = React.useState<'this_day' | 'all_dates'>(
    'this_day',
  );

  const mockDockets = [
    {
      id: 1,
      docketNumber: 'DD-25-00001',
      qty: '10 bulk bags',
      time: '09:00 - 11:00',
      date: 'Sun 1 Feb',
      customerName: 'City Council',
      product: 'limestone',
      pickup: 'Kealba VIC',
      delivery: 'Port Melbourne VIC',
    },
    {
      id: 2,
      docketNumber: 'DD-25-00011',
      qty: '10 TN',
      time: '07:00 - 09:00',
      date: 'Sun 1 Feb',
      customerName: 'ABC Construction Ltd',
      product: 'limestone',
      pickup: 'Laverton North VIC',
      delivery: 'Footscray VIC',
    },
    {
      id: 3,
      docketNumber: 'DD-25-00029',
      qty: '22 TN',
      time: '09:00 - 11:00',
      date: 'Sun 1 Feb',
      customerName: 'Summit Constructions',
      product: 'Gravel Mix',
      pickup: 'Sunshine VIC',
      delivery: 'Tullamarine VIC',
    },
    {
      id: 4,
      docketNumber: 'DD-25-00030',
      qty: '22 x 20kg',
      time: '09:00 - 11:00',
      date: 'Sun 2 Feb',
      customerName: 'QuarryLink',
      product: 'Crushed Granite',
      pickup: 'North Sydney',
      delivery: 'Sydney CBD',
    },
  ]

  return (
    <div className="bg-white border border-[#FDE68A] h-[90vh] rounded-xl flex flex-col">
      {/* Header Section */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wider text-[#B45309]">
              SOURCE QUEUE
            </span>
            <h2 className="text-[22px] font-bold text-[#0F172A]">Unassigned</h2>
          </div>
          <div className="px-3 py-1.5 rounded-full border border-[#FDE68A] text-[12px] font-medium text-[#B45309]">
            Drag out to assign
          </div>
        </div>

        <p className="text-[14px] text-[#64748B]">
          3 dockets waiting for assignment
        </p>

        {/* Custom Toggle Tabs */}
        <div className="flex w-full rounded-lg border border-[#FDE68A] bg-[#FEFCE8]/30">
          <button
            onClick={() => setActiveTab('this_day')}
            className={`flex-1 py-2 text-[14px] font-medium rounded-md transition-colors ${activeTab === 'this_day'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#FDE68A]'
              : 'text-[#B45309] hover:bg-[#FEFCE8]'
              }`}
          >
            This day
          </button>
          <button
            onClick={() => setActiveTab('all_dates')}
            className={`flex-1 py-2 text-[14px] font-medium rounded-md transition-colors ${activeTab === 'all_dates'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#FDE68A]'
              : 'text-[#B45309] hover:bg-[#FEFCE8]'
              }`}
          >
            All dates
          </button>
        </div>

        {activeTab === 'all_dates' && (
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Sorted by date, then by your sort option. Dragging onto the board
            schedules on <span className="font-bold text-[#0F172A]">{format(date, 'EEEE, d MMMM yyyy')}</span>.
          </p>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <Input
            placeholder="Search dockets..."
            className="pl-9 border-[#FDE68A] focus-visible:ring-[#FDE68A] rounded-lg h-10 text-[14px]"
          />
        </div>

        {/* Sort Select */}
        <Select defaultValue="time">
          <SelectTrigger className="w-full border-[#FDE68A] focus:ring-[#FDE68A] rounded-lg h-10 text-[14px] font-medium">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Sort by Time</SelectItem>
            <SelectItem value="size">Sort by Size</SelectItem>
            <SelectItem value="customer">Sort by Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-2" />
      {/* Scrollable Dockets List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        {mockDockets.map((docket) => (
          <div key={docket.id} className="bg-white border border-[#E2E8F0] rounded-xl flex overflow-hidden shadow-sm shrink-0">
            {/* Drag Handle Area */}
            <div className="w-8 bg-[#FEFCE8] flex items-start justify-center pt-4 border-r border-[#E2E8F0] shrink-0">
              <GripVertical className="h-4 w-4 text-[#D97706]" />
            </div>

            {/* Card Content */}
            <div className="flex-1 p-3 flex flex-col gap-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-medium text-[#64748B]">
                  {docket.docketNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full border border-[#FDE68A] text-[12px] font-semibold text-[#7b3805] bg-yellow-50 whitespace-nowrap">
                  {docket.qty}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full border border-[#E2E8F0] text-[12px] font-semibold text-[#0F172A] bg-white whitespace-nowrap">
                  {docket.time}
                </span>
                {activeTab === 'all_dates' && (
                  <span className="px-2 py-0.5 rounded-full border border-[#E9D5FF] text-[12px] font-semibold text-[#6D28D9] bg-[#FAF5FF] whitespace-nowrap">
                    {docket.date}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#0F172A] leading-tight truncate">
                  {docket.customerName}
                </h3>
                <p className="text-[13px] text-[#64748B] truncate">{docket.product}</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="bg-[#F8FAFC] rounded-lg p-2.5 flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold tracking-wider text-[#64748B] uppercase">
                    PICKUP
                  </span>
                  <span className="text-[14px] font-semibold text-[#0F172A] truncate">
                    {docket.pickup}
                  </span>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-2.5 flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold tracking-wider text-[#64748B] uppercase">
                    DROP
                  </span>
                  <span className="text-[14px] font-semibold text-[#0F172A] truncate">
                    {docket.delivery}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
