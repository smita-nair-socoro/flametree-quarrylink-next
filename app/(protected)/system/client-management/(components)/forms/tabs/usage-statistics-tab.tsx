'use client';

import { Progress } from '@/components/ui/progress';

export default function UsageStatisticsTab() {
  const usage = {
    totalUsers: 20,
    currentUsers: 3,
    totalQuarries: 25,
    currentQuarries: 12,
  };

  const calculatePercentage = (current: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold mt-2">Plan Usage</h1>

        <div className="border rounded-md p-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Users:</span>
              <span className="text-sm font-medium">
                {usage.currentUsers}/{usage.totalUsers}
              </span>
            </div>
            <Progress
              value={calculatePercentage(usage.currentUsers, usage.totalUsers)}
              className="h-2"
            />
            <span className="text-xs text-[#6B7280]">
              {calculatePercentage(usage.currentUsers, usage.totalUsers)}% used
            </span>
          </div>

          {/* Quarries */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Quarries:</span>
              <span className="text-sm font-medium">
                {usage.currentQuarries}/{usage.totalQuarries}
              </span>
            </div>
            <Progress
              value={calculatePercentage(
                usage.currentQuarries,
                usage.totalQuarries
              )}
              className="h-2"
            />
            <span className="text-xs text-[#6B7280]">
              {calculatePercentage(usage.currentQuarries, usage.totalQuarries)}%
              used
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
