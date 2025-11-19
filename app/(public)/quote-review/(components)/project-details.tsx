'use client';

import { TableBadges, SimplePdfBadge } from '@/components/table-badges';
import { Separator } from '@/components/ui/separator';

export interface ProjectDetailsProps {
  type: 'DELIVERY' | 'COLLECTION';
  projectName: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryWindow: string;
  forPdf?: boolean;
}

export function ProjectDetails({
  type,
  projectName,
  deliveryAddress,
  deliveryDate,
  deliveryWindow,
  forPdf = false,
}: ProjectDetailsProps) {
  return (
    <div
      className={`bg-white ${
        forPdf ? 'px-10 py-6 pt-8 mb-3' : 'px-8 py-4 pt-10 mb-4'
      }`}
    >
      <h2
        className={`font-semibold text-[rgba(142,81,255,1)] ${
          forPdf ? 'text-3xl' : 'text-lg mb-3'
        }`}
        style={forPdf ? { letterSpacing: '0.5px' } : undefined}
      >
        Project Details
      </h2>
      <Separator className={`${forPdf ? 'hidden' : 'mb-4'}`} />
      <div className={`${forPdf ? 'mt-6' : 'mb-4'}`}>
        {forPdf ? (
          <SimplePdfBadge name={type} />
        ) : (
          <TableBadges names={[type]} />
        )}
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-4 ${
          forPdf ? 'gap-1' : 'gap-8'
        }`}
      >
        {/* Project Name */}
        <div>
          <h3
            className={`font-semibold text-gray-700 mb-3 ${
              forPdf ? 'text-2xl' : 'text-sm'
            }`}
            style={forPdf ? { letterSpacing: '0.3px' } : undefined}
          >
            Project Name
          </h3>
          <p className={`text-gray-600 ${forPdf ? 'text-2xl' : 'text-sm'}`}>
            {projectName}
          </p>
        </div>

        {/* Delivery Address */}
        <div>
          <h3
            className={`font-semibold text-gray-700 mb-3 ${
              forPdf ? 'text-3xl' : 'text-sm'
            }`}
            style={forPdf ? { letterSpacing: '0.3px' } : undefined}
          >
            Delivery Address
          </h3>
          <p className={`text-gray-600 ${forPdf ? 'text-2xl' : 'text-sm'}`}>
            {deliveryAddress}
          </p>
        </div>

        {/* Delivery Date */}
        <div>
          <h3
            className={`font-semibold text-gray-700 mb-3 ${
              forPdf ? 'text-3xl' : 'text-sm'
            }`}
            style={forPdf ? { letterSpacing: '0.3px' } : undefined}
          >
            Delivery Date
          </h3>
          <p className={`text-gray-600 ${forPdf ? 'text-2xl' : 'text-sm'}`}>
            {deliveryDate}
          </p>
        </div>

        {/* Delivery Window */}
        <div>
          <h3
            className={`font-semibold text-gray-700 mb-3 ${
              forPdf ? 'text-3xl' : 'text-sm'
            }`}
            style={forPdf ? { letterSpacing: '0.3px' } : undefined}
          >
            Delivery Window
          </h3>
          <p className={`text-gray-600 ${forPdf ? 'text-2xl' : 'text-sm'}`}>
            {deliveryWindow}
          </p>
        </div>
      </div>
    </div>
  );
}
