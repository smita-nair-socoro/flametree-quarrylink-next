'use client';

import { Badge } from '@/components/ui/badge';

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
    <div className="bg-white px-8 py-8">
      <h2 className="text-3xl font-bold text-purple-600 mb-6">
        Project Details
      </h2>

      <Badge
        variant="secondary"
        className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 mb-6"
      >
        {type}
      </Badge>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Project Name */}
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">
            Project Name
          </h3>
          <p className="text-base text-gray-600">{projectName}</p>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">
            Delivery Address
          </h3>
          <p className="text-base text-gray-600">{deliveryAddress}</p>
        </div>

        {/* Delivery Date */}
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">
            Delivery Date
          </h3>
          <p className="text-base text-gray-600">{deliveryDate}</p>
        </div>

        {/* Delivery Window */}
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">
            Delivery Window
          </h3>
          <p className="text-base text-gray-600">{deliveryWindow}</p>
        </div>
      </div>

      <div className="mt-8 border-b border-gray-200"></div>
    </div>
  );
}
