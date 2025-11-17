import React from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  QuotePdfDocument,
  QuotationData,
} from '@/app/(public)/quote-review/(components)/pdf/QuotePdfDocument';

/**
 * Generic function to generate and download a PDF document
 * @param PdfComponent - The React component that renders the PDF document
 * @param data - The data to pass to the PDF component
 * @param filename - The desired filename for the downloaded PDF (without .pdf extension)
 */
export async function downloadPdf<T>(
  PdfComponent: React.ComponentType<{ data: T }>,
  data: T,
  filename: string
): Promise<void> {
  try {
    // Generate PDF blob from the provided PDF component
    const blob = await pdf(<PdfComponent data={data} />).toBlob();

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

/**
 * Generate and download a PDF document for a quotation
 * @param data - The quotation data to render in the PDF
 * @param filename - The desired filename for the downloaded PDF (without .pdf extension)
 */
export async function downloadQuotePdf(
  data: QuotationData,
  filename: string
): Promise<void> {
  return downloadPdf(QuotePdfDocument, data, filename);
}
