'use client';

import { TableBadges } from '@/components/table-badges';
import { Separator } from '@/components/ui/separator';
import { QUOTE_TYPE } from '@/lib/types/quotation-enums'; 

export interface ProjectDetailsProps {
  type: QUOTE_TYPE;
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
    <div className="px-8 py-4 pt-10 mb-4 bg-white">
      <h2 className="font-semibold text-lg mb-3 text-[rgba(142,81,255,1)]">
        Project Details
      </h2>
      <Separator className="mb-4" />
      <div className="mb-4">
        <TableBadges names={[type]} />
      </div>

      <div className="gap-8 grid grid-cols-1 md:grid-cols-4">
        {/* Project Name */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            Project Name
          </h3>
          <p className="text-sm text-gray-600">
            {projectName}
          </p>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            Delivery Address
          </h3>
          <p className="text-sm text-gray-600">
            {deliveryAddress}
          </p>
        </div>

        {/* Delivery Date */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            Delivery Date
          </h3>
          <p className="text-sm text-gray-600">
            {deliveryDate}
          </p>
        </div>

        {/* Delivery Window */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            Delivery Window
          </h3>
          <p className="text-sm text-gray-600">
            {deliveryWindow}
          </p>
        </div>
      </div>
    </div>
  );
}
