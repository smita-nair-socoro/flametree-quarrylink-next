'use client';

import { ScheduleMonthView } from './views/month-view';
import { ScheduleWeekView } from './views/week-view';

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
  if (periodView === 'week') {
    return <ScheduleWeekView date={selectedDate} viewType={resourceView} onDateChange={onDateChange} />;
  }
}
