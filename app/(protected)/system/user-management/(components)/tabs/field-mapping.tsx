'use client';

import { AccountCodeMapping } from './mapping/account-code';
import { DepartmentsMapping } from './mapping/departments';
import { TrackingCategoriesMapping } from './mapping/tracking-categories';
import { useAccountingSoftwareProvider } from '@/lib/utils/tenant-config-helper';

export function FieldMappings() {
  const accountingSoftware = useAccountingSoftwareProvider();
  const isMyobAcumatica = accountingSoftware === 'MYOB_ACUMATICA';

  return (
    <div className="flex flex-col gap-5">
      <TrackingCategoriesMapping />
      <AccountCodeMapping />
      {!isMyobAcumatica && <DepartmentsMapping />}
    </div>
  );
}
