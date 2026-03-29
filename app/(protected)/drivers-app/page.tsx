'use client';

import { useState } from 'react';
import DriverPreStartChecklist from './(components)/checklist/driver-pre-start-checklist';
import DocketsTab from './(components)/tabs/dockets/dockets-tab';
import CalendarTab from './(components)/tabs/calendar/calendar-tab';
import { FileText, Calendar, Settings, StopCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function DriversAppPage() {
  const [isChecklistComplete, setIsChecklistComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'dockets' | 'calendar'>('dockets');

  return (
    <div className="flex h-full">
      <div className="w-full shadow-xl bg-white h-full flex flex-col relative overflow-hidden">
        {isChecklistComplete && (

          <div className="flex flex-col px-6 pt-6 pb-4 shrink-0 shadow-sm border-gray-100 gap-6 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[20px] font-bold text-[#0F172A]">
                Deliveries
              </span>
              <Button variant="ghost" className="flex items-center justify-center">
                <Settings className="h-[16px] w-[16px] text-[#64748B]" />
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-[#64748B]">Welcome back,</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[18px] font-bold text-[#0F172A]">John Smith</span>
                <span className="text-[12px] text-gray-400 font-medium">ID: DRV-001</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center justify-center gap-2 bg-[#F1F5F9] w-[117px] h-[32px] px-3 rounded-lg border border-gray-100">
                <FileText className="h-[16px] w-[16px] text-gray-600" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] font-bold text-[#0F172A] leading-none">3</span>
                  <span className="text-[12px] text-[#64748B] font-medium leading-none">Assigned</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 bg-[#F1F5F9] w-[117px] h-[32px] px-3 rounded-lg border border-gray-100">
                <StopCircleIcon className="h-[16px] w-[16px] text-gray-600" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] font-bold text-[#0F172A] leading-none">0</span>
                  <span className="text-[13px] text-[#64748B] font-medium leading-none">Stopped</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col w-full bg-[#F8FAFC]">
          {!isChecklistComplete ? (
            <DriverPreStartChecklist onSubmit={() => setIsChecklistComplete(true)} />
          ) : (
            <>
              {activeTab === 'dockets' && <DocketsTab />}
              {activeTab === 'calendar' && <CalendarTab />}
            </>
          )}
        </div>

        {/* Bottom Navigation Tabs - Only show when checklist is complete */}
        {isChecklistComplete && (
          <div className="h-24 border-t border-gray-200 flex items-center w-full">
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => setActiveTab('dockets')}
                className={cn(
                  "flex flex-col items-center gap-1",
                  activeTab === 'dockets' ? "text-[#8E51FF]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className={cn(
                  "p-2 rounded-md transition-colors",
                  activeTab === 'dockets' ? "bg-[#F3E8FF]" : "bg-transparent"
                )}>
                  <FileText className={cn("h-[24px] w-[24px]", activeTab === 'dockets' ? "text-[#8E51FF]" : "text-gray-400")} strokeWidth={2.5} />
                </div>
                <span className={cn(
                  "text-[15px] font-semibold tracking-wide",
                  activeTab === 'dockets' ? "text-[#8E51FF] border-b-2 border-[#8E51FF]" : "text-gray-400"
                )}>
                  Dockets
                </span>
              </button>
            </div>

            <div className="flex-1 flex justify-center">
              <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                  "flex flex-col items-center gap-1",
                  activeTab === 'calendar' ? "text-[#8E51FF]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className={cn(
                  "p-2 rounded-md transition-colors",
                  activeTab === 'calendar' ? "bg-[#F3E8FF]" : "bg-transparent"
                )}>
                  <Calendar className={cn("h-[24px] w-[24px]", activeTab === 'calendar' ? "text-[#8E51FF]" : "text-gray-400")} strokeWidth={2.5} />
                </div>
                <span className={cn(
                  "text-[15px] font-semibold tracking-wide",
                  activeTab === 'calendar' ? "text-[#8E51FF] border-b-2 border-[#8E51FF]" : "text-gray-400"
                )}>
                  Calendar
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
