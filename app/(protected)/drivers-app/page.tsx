'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DriverAppAssignedDocketsQueryOptions } from '@/lib/api/driver-app';
import {
  DriverChecklistTemplateQueryOptions,
  TruckChecklistTemplateQueryOptions,
} from '@/lib/api/checklist';
import { useChecklistTemplateStore } from '@/app/stores/checklist-template-store';
import { useDriverChecklistStore } from '@/app/stores/driver-checklist-store';
import { ChecklistPromptDrawer } from './(components)/checklist/checklist-prompt-drawer';
import DocketsTab from './(components)/tabs/dockets/dockets-tab';
import CalendarTab from './(components)/tabs/calendar/calendar-tab';
import { FileText, Calendar, LogOut, StopCircleIcon, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/app/stores/user-store';
import { useAuth } from '@/hooks/use-auth';

export default function DriversAppPage() {
  const [isChecklistPromptOpen, setIsChecklistPromptOpen] = useState(false);
  const [checklistType, setChecklistType] = useState<
    'pre-start' | 'vehicle-inspection'
  >('pre-start');
  const [checklistTruckLicensePlate, setChecklistTruckLicensePlate] = useState<
    string | undefined
  >();
  const [checklistDocketId, setChecklistDocketId] = useState<
    number | undefined
  >();
  const [checklistTruckId, setChecklistTruckId] = useState<
    number | undefined
  >();
  const [activeTab, setActiveTab] = useState<'dockets' | 'calendar'>('dockets');
  const userName = useUserStore((state) => state.userName);
  const { signOut } = useAuth();
  const router = useRouter();

  const { data: driverData } = useQuery(DriverAppAssignedDocketsQueryOptions());
  const dockets = driverData?.dockets ?? [];

  const setDriverTemplate = useChecklistTemplateStore(
    (s) => s.setDriverTemplate,
  );
  const setTruckTemplate = useChecklistTemplateStore((s) => s.setTruckTemplate);
  const { data: driverTemplate } = useQuery(
    DriverChecklistTemplateQueryOptions(),
  );
  const { data: truckTemplate } = useQuery(
    TruckChecklistTemplateQueryOptions(),
  );

  React.useEffect(() => {
    if (driverTemplate) setDriverTemplate(driverTemplate);
  }, [driverTemplate, setDriverTemplate]);

  React.useEffect(() => {
    if (truckTemplate) setTruckTemplate(truckTemplate);
  }, [truckTemplate, setTruckTemplate]);

  const setIsDailyChecklistRequired = useDriverChecklistStore(
    (s) => s.setIsDailyChecklistRequired,
  );
  const isDailyChecklistRequired = useDriverChecklistStore(
    (s) => s.isDailyChecklistRequired,
  );

  React.useEffect(() => {
    const checklist = driverData?.latestDriverChecklist;
    if (!checklist) {
      setIsDailyChecklistRequired(true);
      return;
    }
    const todayUTC = new Date().toISOString().split('T')[0];
    const checklistDateUTC = checklist.checklistDate.split('T')[0];
    setIsDailyChecklistRequired(todayUTC !== checklistDateUTC);
  }, [driverData, setIsDailyChecklistRequired]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-full shadow-xl bg-white h-full flex flex-col relative">
        <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeTab !== 'calendar' && (
            <div className="flex flex-col px-6 pt-6 pb-4 shadow-sm  border-b border-gray-100 gap-1 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[20px] font-bold text-[#0F172A]">
                  Deliveries
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] px-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-[13px] font-medium">Log out</span>
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-[#64748B]">
                  Welcome back,
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[18px] font-bold text-[#0F172A]">
                    {userName}
                  </span>
                  {driverData?.haulier?.haulierName && (
                    <span className="text-[13px] text-[#64748B]">
                      {driverData.haulier.haulierName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center justify-center gap-2 bg-[#F1F5F9] w-[117px] h-[32px] px-3 rounded-lg border border-gray-100">
                  <FileText className="h-[16px] w-[16px] text-gray-600" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] font-bold text-[#0F172A] leading-none">
                      {dockets.length}
                    </span>
                    <span className="text-[12px] text-[#64748B] font-medium leading-none">
                      Assigned
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#F1F5F9] w-[117px] h-[32px] px-3 rounded-lg border border-gray-100">
                  <StopCircleIcon className="h-[16px] w-[16px] text-gray-600" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] font-bold text-[#0F172A] leading-none">
                      {
                        dockets.filter((d) => d.docketStatus === 'STOPPED')
                          .length
                      }
                    </span>
                    <span className="text-[13px] text-[#64748B] font-medium leading-none">
                      Stopped
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable content area */}
          <div className="flex-1 flex flex-col w-full bg-[#F8FAFC]">
            {isDailyChecklistRequired && (
              <div className="mx-4 mt-4 p-4 rounded-xl border border-[#B9F8CF] bg-[#F0FDF4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-green-600" />
                  <span className="text-[15px] font-medium text-green-700">
                    Daily Checklist Required
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="bg-white border-[#7BF1A8] text-green-700 hover:bg-green-50 h-9 px-5 rounded-lg text-sm font-medium"
                  size="xs"
                  onClick={() => {
                    setChecklistType('pre-start');
                    setChecklistTruckLicensePlate(undefined);
                    setChecklistDocketId(undefined);
                    setChecklistTruckId(undefined);
                    setIsChecklistPromptOpen(true);
                  }}
                >
                  Start
                </Button>
              </div>
            )}

            {activeTab === 'dockets' && (
              <DocketsTab
                dockets={dockets}
                onOpenChecklist={(
                  type,
                  truckLicensePlate,
                  docketId,
                  truckId,
                ) => {
                  setChecklistType(type);
                  setChecklistTruckLicensePlate(truckLicensePlate);
                  setChecklistDocketId(docketId);
                  setChecklistTruckId(truckId);
                  setIsChecklistPromptOpen(true);
                }}
              />
            )}
            {activeTab === 'calendar' && <CalendarTab dockets={dockets} />}
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="h-20 border-t border-gray-200 flex items-center w-full bg-white shrink-0">
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setActiveTab('dockets')}
              className={cn(
                'flex flex-col items-center gap-1',
                activeTab === 'dockets'
                  ? 'text-[#8E51FF]'
                  : 'text-gray-400 hover:text-gray-600',
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-md transition-colors',
                  activeTab === 'dockets' ? 'bg-[#F3E8FF]' : 'bg-transparent',
                )}
              >
                <FileText
                  className={cn(
                    'h-[20px] w-[20px]',
                    activeTab === 'dockets'
                      ? 'text-[#8E51FF]'
                      : 'text-gray-400',
                  )}
                  strokeWidth={2.5}
                />
              </div>
              <span
                className={cn(
                  'text-[13px] font-semibold tracking-wide',
                  activeTab === 'dockets'
                    ? 'text-[#8E51FF] border-b-2 border-[#8E51FF]'
                    : 'text-gray-400',
                )}
              >
                Dockets
              </span>
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                'flex flex-col items-center gap-1',
                activeTab === 'calendar'
                  ? 'text-[#8E51FF]'
                  : 'text-gray-400 hover:text-gray-600',
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-md transition-colors',
                  activeTab === 'calendar' ? 'bg-[#F3E8FF]' : 'bg-transparent',
                )}
              >
                <Calendar
                  className={cn(
                    'h-[20px] w-[20px]',
                    activeTab === 'calendar'
                      ? 'text-[#8E51FF]'
                      : 'text-gray-400',
                  )}
                  strokeWidth={2.5}
                />
              </div>
              <span
                className={cn(
                  'text-[13px] font-semibold tracking-wide',
                  activeTab === 'calendar'
                    ? 'text-[#8E51FF] border-b-2 border-[#8E51FF]'
                    : 'text-gray-400',
                )}
              >
                Calendar
              </span>
            </button>
          </div>
        </div>
      </div>

      <ChecklistPromptDrawer
        open={isChecklistPromptOpen}
        onOpenChange={setIsChecklistPromptOpen}
        type={checklistType}
        truckLicensePlate={checklistTruckLicensePlate}
        driverName={driverData?.driverName}
        driverId={driverData?.id}
        truckId={checklistTruckId}
        docketId={checklistDocketId}
        onCompleteExternally={() => setIsChecklistPromptOpen(false)}
        onCompleteNow={() => setIsChecklistPromptOpen(false)}
      />
    </div>
  );
}
