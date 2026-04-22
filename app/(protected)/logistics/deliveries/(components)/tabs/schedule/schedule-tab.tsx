'use client';

import { ScheduleMonthView } from './views/month-view';
import { ScheduleWeekDriversView } from './views/week-drivers-view';
import { ScheduleWeekTrucksView } from './views/week-trucks-view';

type ScheduleTabProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  resourceView: 'trucks' | 'drivers';
  periodView: 'week' | 'month';
};

export default function ScheduleTab({
  selectedDate,
  onDateChange,
  resourceView,
  periodView,
}: ScheduleTabProps) {
  if (periodView === 'month') {
    return <ScheduleMonthView date={selectedDate} onDateChange={onDateChange} />;
  }

  if (resourceView === 'drivers') {
    return <ScheduleWeekDriversView date={selectedDate} />;
  }

  return <ScheduleWeekTrucksView date={selectedDate} />;
}
