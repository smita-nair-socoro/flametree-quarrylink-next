import React from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  QuotePdfDocument,
  QuotationData,
} from '@/app/(public)/quote-review/(components)/pdf/QuotePdfDocument';
import { StripeTenantDetailsSnapshot } from '@/lib/types/quotation';

/**
 * Generate and download a PDF document for a quotation
 * @param data - The quotation data to render in the PDF
 * @param quoteId - The quote ID to include in hyperlinks
 * @param filename - The desired filename for the downloaded PDF (without .pdf extension)
 * @param baseUrl - Optional base URL for hyperlinks (defaults to current origin)
 * @param tenantDetails - Optional tenant details for branding
 */
export async function downloadQuotePdf(
  data: QuotationData,
  quoteId: string,
  filename: string,
  baseUrl?: string,
  tenantDetails?: StripeTenantDetailsSnapshot
): Promise<void> {
  try {
    // Generate PDF blob from the QuotePdfDocument component
    const blob = await pdf(
      <QuotePdfDocument
        data={data}
        quoteId={quoteId}
        baseUrl={baseUrl || window.location.origin}
        tenantDetails={tenantDetails}
      />
    ).toBlob();

    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate or download PDF:', error);
    throw new Error('PDF generation failed. Please try again.');
  }
}
