import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChecklistTemplate } from '@/lib/types/checklist-template';

interface ChecklistTemplateStore {
  driverTemplate: ChecklistTemplate | null;
  truckTemplate: ChecklistTemplate | null;
  setDriverTemplate: (template: ChecklistTemplate) => void;
  setTruckTemplate: (template: ChecklistTemplate) => void;
}

export const useChecklistTemplateStore = create<ChecklistTemplateStore>()(
  devtools(
    (set) => ({
      driverTemplate: null,
      truckTemplate: null,
      setDriverTemplate: (template) => set({ driverTemplate: template }),
      setTruckTemplate: (template) => set({ truckTemplate: template }),
    }),
    { name: 'ChecklistTemplateStore' },
  ),
);
