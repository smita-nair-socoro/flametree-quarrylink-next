'use client';

import { Separator } from '@/components/ui/separator';

export interface ProjectDetailsProps {
  projectName: string;
  deliveryDate: string;
  deliveryWindow: string;
}

export function ProjectDetails({
  projectName,
  deliveryDate,
  deliveryWindow,
}: ProjectDetailsProps) {
  return (
    <div className="px-8 py-4 pt-10 mb-4 bg-white">
      <h2 className="font-semibold text-lg mb-3 text-[rgba(142,81,255,1)]">
        Project Details
      </h2>
      <Separator className="mb-4" />

      <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
        {/* Project Name */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            Project Name
          </h3>
          <p className="text-sm text-gray-600">{projectName}</p>
        </div>

        {/* Estimated Start Date* */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            Estimated Start Date*
          </h3>
          <p className="text-sm text-gray-600">{deliveryDate}</p>
        </div>

        {/* Timeframe */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            Timeframe
          </h3>
          <p className="text-sm text-gray-600">{deliveryWindow}</p>
        </div>
      </div>
    </div>
  );
}
