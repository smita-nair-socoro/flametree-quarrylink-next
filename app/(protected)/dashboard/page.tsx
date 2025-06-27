'use client';

import { useEffect, useState } from 'react';
import { addDays, startOfToday } from 'date-fns';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    console.log(date);
  }, [date]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-2xl">Dashboard</h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <DatePicker
            value={date}
            onChangeAction={setDate}
            disabled={{ before: addDays(startOfToday(), 0) }}
            placeholder="Pick a date"
          />

          <Button variant="outline" className="flex items-center">
            <DownloadIcon className="mr-1 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  );
}
