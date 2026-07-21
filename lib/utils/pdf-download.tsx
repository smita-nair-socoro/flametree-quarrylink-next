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

    // PNGs work fine in pdfkit and may have transparency — keep as PNG.
    // JPEGs with non-sRGB colour profiles cause pdfkit's "Unknown version" crash;
    // decode + re-encode via canvas to normalise to sRGB.
    // Cap at 240px (logo renders at 30pt in the PDF).
    const isPng = blob.type === 'image/png';
    const MAX = 240;
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.85);
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
  tenantDetails?: StripeTenantDetailsSnapshot,
): Promise<void> {
  try {
    // Pre-fetch logo as base64 so react-pdf can render it without CORS issues.
    // The logo URL always comes from the backend (CloudFront), never a local path.
    const resolvedLogoUrl =
      data.navbar.logoUrl && !data.navbar.logoError
        ? await fetchLogoAsBase64(data.navbar.logoUrl)
        : undefined;
    const pdfData: QuotationData = {
      ...data,
      navbar: {
        ...data.navbar,
        logoUrl: resolvedLogoUrl ?? data.navbar.logoUrl,
      },
    };

    // Generate PDF blob from the QuotePdfDocument component
    const blob = await pdf(
      <QuotePdfDocument
        data={pdfData}
        quoteId={quoteId}
        baseUrl={baseUrl || window.location.origin}
        tenantDetails={tenantDetails}
      />,
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
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate or download PDF:', error);
    throw new Error('PDF generation failed. Please try again.');
  }
}
