/**
 * Core HTML2PDF export utility
 * Uses html2canvas and jsPDF to export DOM elements to multi-page A4 PDF
 *
 * Note: oklch colors are converted to rgb at build time via PostCSS
 */

import jsPDF from 'jspdf';
import { notifyError } from '@/lib/toast';
import type { PdfExportOptions, PdfExportResult } from './types';
import { A4_WIDTH_PT, A4_HEIGHT_PT } from './helpers/pdfDimensions';
import { waitForFontsToLoad, waitForImagesToLoad } from './helpers/waitForResources';
import { measureLayout } from './helpers/layoutMeasurement';
import { splitContentIntoPages } from './helpers/pageSplitter';
import { renderPageToCanvas } from './helpers/canvasRenderer';

// Default export options
const DEFAULT_OPTIONS: Required<Omit<PdfExportOptions, 'filename'>> = {
  scale: 2, // Higher quality
  imageQuality: 0.95,
  debug: false,
};

/**
 * Export DOM content to PDF (A4 size)
 */
export async function exportToPdf(
  options: PdfExportOptions
): Promise<PdfExportResult> {
  try {
    // Merge options with defaults
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Find root element
    const rootElement = document.querySelector<HTMLElement>('[data-pdf-root]');
    if (!rootElement) {
      throw new Error(
        'PDF root element not found. Ensure container has data-pdf-root attribute.'
      );
    }

    // Store original styles
    const originalStyles = {
      position: rootElement.style.position,
      left: rootElement.style.left,
      top: rootElement.style.top,
      opacity: rootElement.style.opacity,
      visibility: rootElement.style.visibility,
    };

    // Make element visible for proper measurements
    rootElement.style.position = 'absolute';
    rootElement.style.left = '0';
    rootElement.style.top = '0';
    rootElement.style.opacity = '1';
    rootElement.style.visibility = 'visible';

    // Wait for fonts to load
    await waitForFontsToLoad();

    // Wait for layout to settle
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Wait for all images to load before measuring (critical for correct dimensions)
    await waitForImagesToLoad(rootElement);

    // Measure layout
    const measurements = measureLayout(rootElement, opts.scale);

    // Split content into pages
    const pages = splitContentIntoPages(measurements, opts.scale);

    // Create PDF document (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });

    // Render each page
    for (let i = 0; i < pages.length; i++) {
      const canvas = await renderPageToCanvas(measurements, pages[i], opts.scale);
      const imgData = canvas.toDataURL('image/jpeg', opts.imageQuality);

      if (i > 0) {
        pdf.addPage();
      }

      // Add image to PDF (full A4 page)
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT, undefined, 'FAST');
    }

    // Download PDF
    const filename = `${opts.filename}.pdf`;
    pdf.save(filename);

    // Restore original styles
    rootElement.style.position = originalStyles.position;
    rootElement.style.left = originalStyles.left;
    rootElement.style.top = originalStyles.top;
    rootElement.style.opacity = originalStyles.opacity;
    rootElement.style.visibility = originalStyles.visibility;

    return {
      success: true,
      pageCount: pages.length,
      filename,
    };
  } catch (error) {
    notifyError(
      error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.'
    );

    // Restore original styles even on error
    const rootElement = document.querySelector<HTMLElement>('[data-pdf-root]');
    if (rootElement) {
      rootElement.style.position = 'fixed';
      rootElement.style.left = '-9999px';
      rootElement.style.top = '0';
      rootElement.style.opacity = '0';
      rootElement.style.visibility = 'hidden';
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
