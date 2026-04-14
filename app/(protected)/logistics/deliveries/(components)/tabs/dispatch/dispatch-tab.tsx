'use client';

import { DispatchDriversView } from './views/drivers-view';
import { DispatchTrucksView } from './views/trucks-view';

type DispatchTabProps = {
  selectedDate: Date;
  resourceView: 'trucks' | 'drivers';
};

export default function DispatchTab({ selectedDate, resourceView }: DispatchTabProps) {
  if (resourceView === 'drivers') {
    return <DispatchDriversView date={selectedDate} />;
  }

  return <DispatchTrucksView date={selectedDate} />;
}
