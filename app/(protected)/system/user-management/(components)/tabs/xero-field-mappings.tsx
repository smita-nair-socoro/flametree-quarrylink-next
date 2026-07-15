'use client';

import { AccountCodeMapping } from './mapping/account-code';
import { DepartmentsMapping } from './mapping/departments';
import { TrackingCategoriesMapping } from './mapping/tracking-categories';

export function XeroFieldMappings() {
  return (
    <div className="flex flex-col gap-5">
      <TrackingCategoriesMapping />
      <AccountCodeMapping />
      <DepartmentsMapping />
    </div>
  );
}
