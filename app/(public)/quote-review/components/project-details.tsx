'use client';

import { TableBadges } from '@/components/table-badges';
import { Separator } from '@/components/ui/separator';

export interface ProjectDetailsProps {
  type: 'DELIVERY' | 'COLLECTION';
  projectName: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryWindow: string;
}

export function ProjectDetails({
  type,
  projectName,
  deliveryAddress,
  deliveryDate,
  deliveryWindow,
}: ProjectDetailsProps) {
  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <h2 className="text-lg font-semibold text-[rgba(142,81,255,1)] mb-3">
        Project Details
      </h2>
      <Separator className="mb-4" />
      <div className="mb-3">
        <TableBadges names={[type]}></TableBadges>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Project Name */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Project Name
          </h3>
          <p className="text-sm text-gray-600">{projectName}</p>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Delivery Address
          </h3>
          <p className="text-sm text-gray-600">
            {deliveryAddress}
          </p>
        </div>

        {/* Delivery Date */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Delivery Date
          </h3>
          <p className="text-sm text-gray-600">{deliveryDate}</p>
        </div>

        {/* Delivery Window */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Delivery Window
          </h3>
          <p className="text-sm text-gray-60">{deliveryWindow}</p>
        </div>
      </div>
    </div>
  );
}
