'use client';

import { ScheduleMonthView } from './views/month-view';
import { ScheduleWeekDriversView } from './views/week-drivers-view';
import { ScheduleWeekTrucksView } from './views/week-trucks-view';

type ScheduleTabProps = {
  selectedDate: Date;
  resourceView: 'trucks' | 'drivers';
  periodView: 'week' | 'month';
};

export default function ScheduleTab({
  selectedDate,
  resourceView,
  periodView,
}: ScheduleTabProps) {
  if (periodView === 'month') {
    return <ScheduleMonthView date={selectedDate} />;
  }

  if (resourceView === 'drivers') {
    return <ScheduleWeekDriversView date={selectedDate} />;
  }

  return <ScheduleWeekTrucksView date={selectedDate} />;
}
