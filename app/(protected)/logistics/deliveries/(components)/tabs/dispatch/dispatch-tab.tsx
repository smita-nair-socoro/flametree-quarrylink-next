'use client';

import { DispatchView } from './views/dispatch-view';

type DispatchTabProps = {
  selectedDate: Date;
  resourceView: 'trucks' | 'drivers';
};

export default function DispatchTab({ selectedDate, resourceView }: DispatchTabProps) {
  return <DispatchView date={selectedDate} viewType={resourceView} />;
}
