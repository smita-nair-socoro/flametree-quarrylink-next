/**
 * Canvas rendering utilities for PDF export
 */

import html2canvas from 'html2canvas';
import type { PdfLayoutMeasurements, PdfPageContent } from '../types';
import { waitForImagesToLoad } from './waitForResources';

/**
 * Render a single page to canvas using html2canvas
 */
export async function renderPageToCanvas(
  measurements: PdfLayoutMeasurements,
  pageContent: PdfPageContent,
  scale: number
): Promise<HTMLCanvasElement> {
  // Create a temporary container for this page
  const pageContainer = document.createElement('div');
  pageContainer.style.width = `${measurements.pageWidth / scale}px`;
  pageContainer.style.height = `${measurements.pageHeight / scale}px`;
  pageContainer.style.position = 'absolute';
  pageContainer.style.left = '-9999px';
  pageContainer.style.top = '0';
  pageContainer.style.backgroundColor = 'white';
  pageContainer.style.overflow = 'hidden';

  // Clone and add header
  const headerClone = measurements.header.cloneNode(true) as HTMLElement;
  pageContainer.appendChild(headerClone);

  // Create content wrapper with FIXED height (not min-height)
  const contentWrapper = document.createElement('div');
  contentWrapper.style.height = `${measurements.contentHeightPerPage / scale}px`;
  contentWrapper.style.overflow = 'hidden'; // Clip any overflow
  contentWrapper.style.position = 'relative'; // Positioning context

  // Clone and add content blocks for this page
  for (const block of pageContent.blocks) {
    const blockClone = block.cloneNode(true) as HTMLElement;
    contentWrapper.appendChild(blockClone);
  }

  pageContainer.appendChild(contentWrapper);

  // Clone and add footer with absolute positioning
  const footerClone = measurements.footer.cloneNode(true) as HTMLElement;
  footerClone.style.position = 'absolute';
  footerClone.style.bottom = '0';
  footerClone.style.left = '0';
  footerClone.style.right = '0';
  pageContainer.appendChild(footerClone);

  // Add to DOM temporarily for rendering
  document.body.appendChild(pageContainer);

  try {
    // Wait for all images to load before capturing
    await waitForImagesToLoad(pageContainer);

    // Render to canvas (oklch colors already converted to rgb by PostCSS)
    const canvas = await html2canvas(pageContainer, {
      scale,
      useCORS: true,
      allowTaint: true, // Allow cross-origin images
      logging: false,
      backgroundColor: '#ffffff',
      width: measurements.pageWidth / scale,
      height: measurements.pageHeight / scale,
      imageTimeout: 15000, // 15 second timeout for images
    });

    return canvas;
  } finally {
    // Clean up
    document.body.removeChild(pageContainer);
  }
}
