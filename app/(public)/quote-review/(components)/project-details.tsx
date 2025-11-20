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

const pdfStyles = {
  title: { letterSpacing: '0.5px', fontWeight: 600 } as const,
  label: { letterSpacing: '0.3px' } as const,
  value: {
    letterSpacing: '0.3px',
    fontWeight: 400,
    maxWidth: '300px',
  } as const,
};

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
      className={`${
        forPdf
          ? 'px-10 py-6 pt-2 bg-[#F9FAFB]'
          : 'px-8 py-4 pt-10 mb-4 bg-white'
      }`}
    >
      <h2
        className={`font-semibold text-[rgba(142,81,255,1)] ${
          forPdf ? 'text-3xl pb-2' : 'text-lg mb-3'
        }`}
        style={forPdf ? pdfStyles.title : undefined}
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
            style={forPdf ? pdfStyles.label : undefined}
          >
            Project Name
          </h3>
          <p
            className={` ${
              forPdf ? 'text-[26px] text-[#0A0A0A]' : 'text-sm text-gray-600'
            }`}
            style={forPdf ? pdfStyles.value : undefined}
          >
            {projectName}
          </p>
        </div>

        {/* Delivery Address */}
        <div>
          <h3
            className={`font-semibold text-gray-700 mb-3 ${
              forPdf ? 'text-2xl' : 'text-sm'
            }`}
            style={forPdf ? pdfStyles.label : undefined}
          >
            Delivery Address
          </h3>
          <p
            className={` ${
              forPdf ? 'text-[26px] text-[#0A0A0A]' : 'text-sm text-gray-600'
            }`}
            style={forPdf ? pdfStyles.value : undefined}
          >
            {deliveryAddress}
          </p>
        </div>

        {/* Delivery Date */}
        <div>
          <h3
            className={`font-semibold text-gray-700 mb-3 ${
              forPdf ? 'text-2xl' : 'text-sm'
            }`}
            style={forPdf ? pdfStyles.label : undefined}
          >
            Delivery Date
          </h3>
          <p
            className={` ${
              forPdf ? 'text-[26px] text-[#0A0A0A]' : 'text-sm text-gray-600'
            }`}
            style={forPdf ? pdfStyles.value : undefined}
          >
            {deliveryDate}
          </p>
        </div>

        {/* Delivery Window */}
        <div>
          <h3
            className={`font-semibold text-gray-700 mb-3 ${
              forPdf ? 'text-2xl' : 'text-sm'
            }`}
            style={forPdf ? pdfStyles.label : undefined}
          >
            Delivery Window
          </h3>
          <p
            className={` ${
              forPdf ? 'text-[26px] text-[#0A0A0A]' : 'text-sm text-gray-600'
            }`}
            style={forPdf ? pdfStyles.value : undefined}
          >
            {deliveryWindow}
          </p>
        </div>
      </div>
    </div>
  );
}
