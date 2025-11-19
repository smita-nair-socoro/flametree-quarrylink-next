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
  console.log(`🖼️  Rendering Page ${pageContent.pageNumber}...`);

  // Create a temporary container for this page with FLEXBOX layout
  const pageContainer = document.createElement('div');
  const containerWidth = measurements.pageWidth / scale;
  const containerHeight = measurements.pageHeight / scale;

  pageContainer.style.width = `${containerWidth}px`;
  pageContainer.style.height = `${containerHeight}px`;
  pageContainer.style.position = 'absolute';
  pageContainer.style.left = '-9999px';
  pageContainer.style.top = '0';
  pageContainer.style.backgroundColor = 'white';
  pageContainer.style.overflow = 'hidden';

  // Use flexbox to automatically distribute space
  pageContainer.style.display = 'flex';
  pageContainer.style.flexDirection = 'column';

  console.log(`  Container: ${containerWidth}px × ${containerHeight}px (flexbox)`);

  // Clone and add header
  const headerClone = measurements.header.cloneNode(true) as HTMLElement;
  headerClone.style.flexShrink = '0'; // Don't shrink
  pageContainer.appendChild(headerClone);
  console.log(`  Header: flex-shrink: 0`);

  // Create content wrapper that fills remaining space
  const contentWrapper = document.createElement('div');
  contentWrapper.style.flex = '1'; // Take up remaining space
  contentWrapper.style.overflow = 'hidden'; // Clip any overflow
  contentWrapper.style.position = 'relative'; // Positioning context

  console.log(`  Content wrapper: flex: 1 (fills remaining space)`);

  // Clone and add content blocks for this page
  for (const block of pageContent.blocks) {
    const blockClone = block.cloneNode(true) as HTMLElement;
    contentWrapper.appendChild(blockClone);
  }

  pageContainer.appendChild(contentWrapper);

  // Clone and add footer (in normal flow)
  // Flexbox ensures it stays at bottom without gaps
  const footerClone = measurements.footer.cloneNode(true) as HTMLElement;
  footerClone.style.flexShrink = '0'; // Don't shrink
  pageContainer.appendChild(footerClone);

  console.log(`  Footer: flex-shrink: 0 (normal flow, at bottom)`);

  // Add to DOM temporarily for rendering
  document.body.appendChild(pageContainer);

  try {
    // Wait for all images to load before capturing
    await waitForImagesToLoad(pageContainer);

    // Check actual rendered heights after DOM insertion
    console.log(`  Actual rendered heights:`, {
      headerActual: `${headerClone.offsetHeight}px`,
      contentWrapperActual: `${contentWrapper.offsetHeight}px`,
      footerActual: `${footerClone.offsetHeight}px`,
      totalExpected: `${containerHeight}px`,
    });

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

    console.log(`  ✅ Canvas rendered: ${canvas.width}px × ${canvas.height}px`);

    return canvas;
  } finally {
    // Clean up
    document.body.removeChild(pageContainer);
  }
}
