'use client';

import * as React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import DriverPreStartChecklist from '../../drivers-app/(components)/checklist/driver-pre-start-checklist';
import TruckInspectionChecklist from '../../drivers-app/(components)/checklist/truck-inspection-checklist';

export default function DeliveriesPage() {
  const [selectedChecklist, setSelectedChecklist] = React.useState<
    'daily' | 'vehicle'
  >('daily');

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-50 min-h-screen">
      <div className="w-[430px] bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <RadioGroup
          defaultValue="daily"
          value={selectedChecklist}
          onValueChange={(v) => setSelectedChecklist(v as 'daily' | 'vehicle')}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily" className="cursor-pointer">
              Daily Compliance Checklist
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vehicle" id="vehicle" />
            <Label htmlFor="vehicle" className="cursor-pointer">
              Vehicle Inspection Checklist
            </Label>
          </div>
        </RadioGroup>
      </div>

      {selectedChecklist === 'daily' ? (
        <div className="w-[430px]">
          <DriverPreStartChecklist />
        </div>
      ) : (
        <div className="w-[430px]">
          <TruckInspectionChecklist />
        </div>
      )}
    </div>
  );
}
