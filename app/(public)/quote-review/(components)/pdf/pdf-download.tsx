import { pdf } from '@react-pdf/renderer';
import {
  QuotePdfDocument,
  QuotationData,
} from '@/app/(public)/quote-review/(components)/pdf/QuotePdfDocument';

/**
 * Generate and download a PDF document for a quotation
 * @param quotationData - The quotation data to render in the PDF
 * @param filename - The desired filename for the downloaded PDF (without .pdf extension)
 */
export async function downloadQuotePdf(
  quotationData: QuotationData,
  filename: string
): Promise<void> {
  try {
    // Generate PDF blob from the QuotePdfDocument component
    const blob = await pdf(<QuotePdfDocument data={quotationData} />).toBlob();

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
