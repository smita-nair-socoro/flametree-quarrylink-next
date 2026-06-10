'use client';

import * as React from 'react';
import { ClipboardCheck, X, FileCheck2, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useSubmitChecklist, TruckChecklistTemplateQueryOptions } from '@/lib/api/checklist';
import { CHECKLIST_TYPE } from '@/lib/types/checklist-template-enums';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';
import { useChecklistTemplateStore } from '@/app/stores/checklist-template-store';
import { useQuery } from '@tanstack/react-query';

import DriverPreStartChecklist from './driver-pre-start-checklist';
import TruckInspectionChecklist from './truck-inspection-checklist';

export type ChecklistType = 'pre-start' | 'vehicle-inspection';

interface ChecklistPromptDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleteExternally: () => void;
  onCompleteNow: () => void;
  type?: ChecklistType;
  truckLicensePlate?: string;
  driverName?: string;
  driverId?: number;
  truckId?: number;
  truckType?: string;
  docketId?: number;
}

export function ChecklistPromptDrawer({
  open,
  onOpenChange,
  onCompleteExternally,
  onCompleteNow,
  type = 'pre-start',
  truckLicensePlate,
  driverName,
  driverId,
  truckId,
  truckType,
  docketId,
}: ChecklistPromptDrawerProps) {
  const [isChecklistOpen, setIsChecklistOpen] = React.useState(false);
  const isPreStart = type === 'pre-start';

  const driverTemplate = useChecklistTemplateStore((s) => s.driverTemplate);
  const setTruckTemplate = useChecklistTemplateStore((s) => s.setTruckTemplate);
  const truckTemplateFromStore = useChecklistTemplateStore((s) => s.truckTemplate);
  const template = isPreStart ? driverTemplate : truckTemplateFromStore;
  const submitChecklist = useSubmitChecklist();

  const { data: fetchedTruckTemplate } = useQuery({
    ...TruckChecklistTemplateQueryOptions(truckType),
    enabled: open && !isPreStart,
  });

  React.useEffect(() => {
    if (fetchedTruckTemplate) setTruckTemplate(fetchedTruckTemplate);
  }, [fetchedTruckTemplate, setTruckTemplate]);

  const handleCompleteExternally = async () => {
    if (!template) return;
    if (isPreStart) {
      await submitChecklist.mutateAsync({
        request: {
          templateId: template.id,
          checklistType: CHECKLIST_TYPE.DRIVER,
          driverId: driverId ?? 0,
          confirmed: true,
          submittedAt: new Date().toISOString(),
          answers: [],
        },
      });
    } else {
      await submitChecklist.mutateAsync({
        request: {
          templateId: template.id,
          checklistType: CHECKLIST_TYPE.TRUCK,
          truckId: truckId ?? 0,
          driverId,
          docketId,
          confirmed: true,
          submittedAt: new Date().toISOString(),
          answers: [],
        },
      });
    }
    onCompleteExternally();
    onOpenChange(false);
  };

  const handleCompleteNow = () => {
    onOpenChange(false);
    setTimeout(() => setIsChecklistOpen(true), 300);
  };

  const content = {
    title: isPreStart ? 'Daily Pre-Start Checklist' : 'Vehicle Inspection',
    description: isPreStart
      ? 'Before starting this delivery, your daily compliance checklist must be on file.'
      : 'A vehicle inspection must also be completed before the delivery can begin.',
    questionTitle: isPreStart
      ? 'Has this checklist been completed by a third-party provider?'
      : 'Has the vehicle inspection been completed by a third-party provider?',
    questionDesc: isPreStart
      ? 'If your company manages compliance externally (e.g. fleet or labour-hire provider), you can skip this step.'
      : 'If a third party has already conducted and filed your vehicle inspection, you can proceed directly to delivery.',
    yesSubtitle: isPreStart
      ? '3rd party checklist on file — continue'
      : '3rd party inspection on file — start delivery',
    noSubtitle: isPreStart
      ? 'Opens the daily checklist form'
      : 'Opens the vehicle inspection form',
  };

  return (
    <>
      {isChecklistOpen && (
        <div className="flex h-full w-full absolute inset-0 z-50 bg-white">
          {isPreStart ? (
            <DriverPreStartChecklist
              driverName={driverName}
              driverId={driverId ?? 0}
              onSubmit={() => {
                setIsChecklistOpen(false);
                onCompleteNow();
              }}
              onBack={() => setIsChecklistOpen(false)}
            />
          ) : (
            <TruckInspectionChecklist
              truckLicensePlate={truckLicensePlate}
              truckId={truckId ?? 0}
              truckType={truckType as TRUCK_TYPE | undefined}
              driverId={driverId}
              docketId={docketId}
              onSubmit={() => {
                setIsChecklistOpen(false);
                onCompleteNow();
              }}
              onBack={() => setIsChecklistOpen(false)}
            />
          )}
        </div>
      )}
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-white flex flex-col rounded-t-3xl pb-safe max-h-[90vh]">
          <DrawerHeader className="pb-4 pt-6 px-6 shrink-0 rounded-t-3xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#F3E8FF] p-2.5 rounded-xl">
                  {isPreStart ? (
                    <ClipboardCheck className="w-6 h-6 text-[#8E51FF]" />
                  ) : (
                    <Truck className="w-6 h-6 text-[#8E51FF]" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <DrawerTitle className="text-[18px] font-bold text-[#0F172A]">
                    {content.title}
                  </DrawerTitle>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-6 pt-2 flex flex-col gap-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <p className="text-[15px] text-[#475569] leading-relaxed">
              {content.description}
            </p>

            <div className="bg-[#FFFBEB] border border-[#FEF08A] rounded-2xl p-5 flex flex-col gap-2">
              <h4 className="text-[15px] font-bold text-[#92400E]">
                {content.questionTitle}
              </h4>
              <p className="text-[14px] text-[#B45309] leading-relaxed">
                {content.questionDesc}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCompleteExternally}
                disabled={!template || submitChecklist.isPending}
                className="w-full bg-[#00A63E] hover:bg-[#009036] text-white rounded-2xl p-4 flex items-center justify-between transition-colors active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <FileCheck2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[16px] font-bold">Yes, already completed</span>
                    <span className="text-[12px] text-white/80">{content.yesSubtitle}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/80" />
              </button>

              <button
                onClick={handleCompleteNow}
                className="w-full bg-[#8E51FF] hover:bg-[#7c46e0] text-white rounded-2xl p-4 flex items-center justify-between transition-colors active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[16px] font-bold">No, I'll complete it now</span>
                    <span className="text-[12px] text-white/80">{content.noSubtitle}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/80" />
              </button>

              <Button
                variant="outline"
                className="w-full h-[45px] rounded-2xl text-[16px] font-bold text-[#475569] border-gray-200 hover:bg-gray-50 mt-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}