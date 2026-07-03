import React from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  QuotePdfDocument,
  QuotationData,
} from '@/app/(public)/quote-review/(components)/pdf/QuotePdfDocument';
import { StripeTenantDetailsSnapshot } from '@/lib/types/quotation';

async function fetchLogoAsBase64(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

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
    // Pre-fetch logo as base64 so react-pdf can render it without CORS issues
    const logoUrl = data.navbar.logoUrl && !data.navbar.logoError
      ? await fetchLogoAsBase64(data.navbar.logoUrl)
      : undefined;
    const pdfData: QuotationData = {
      ...data,
      navbar: { ...data.navbar, logoUrl: logoUrl ?? data.navbar.logoUrl },
    };

    // Generate PDF blob from the QuotePdfDocument component
    const blob = await pdf(
      <QuotePdfDocument
        data={pdfData}
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
