/**
 * Core HTML2PDF export utility
 * Uses html2canvas and jsPDF to export DOM elements to multi-page A4 PDF
 *
 * Note: oklch colors are converted to rgb at build time via PostCSS
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { notifyError, notifyWarning } from '@/lib/toast';
import type {
  PdfExportOptions,
  PdfExportResult,
  PdfLayoutMeasurements,
  PdfPageContent,
  PdfPageDimensions,
} from './types';

// A4 dimensions in points (72 DPI)
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

// Default export options
const DEFAULT_OPTIONS: Required<Omit<PdfExportOptions, 'filename'>> = {
  scale: 2, // Higher quality
  imageQuality: 0.95,
  debug: false,
};

/**
 * Wait for all fonts to be loaded
 * This ensures consistent text rendering across browsers
 */
async function waitForFontsToLoad(): Promise<void> {
  if (!document.fonts) {
    return;
  }

  try {
    await document.fonts.ready;
  } catch {
    // Silently continue on error
  }
}

/**
 * Wait for all images in an element to load
 * This ensures html2canvas can capture images properly
 */
async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll<HTMLImageElement>('img'));

  const imagePromises = images.map((img) => {
    // Already loaded
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }

    // Wait for load event
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => {
        notifyWarning(`Failed to load image: ${img.src}`);
        resolve(); // Continue anyway
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        notifyWarning(`Image load timeout: ${img.src}`);
        resolve();
      }, 10000);
    });
  });

  await Promise.all(imagePromises);
}

/**
 * Calculate A4 page dimensions in pixels based on fixed DPI
 * Uses fixed devicePixelRatio of 2 for consistency across all browsers/systems
 */
function getPageDimensions(scale: number): PdfPageDimensions {
  // Use fixed DPI instead of window.devicePixelRatio for consistency
  const FIXED_DPI = 2;
  const pxPerPt = (FIXED_DPI * 96) / 72; // Convert points to pixels

  return {
    width: A4_WIDTH_PT,
    height: A4_HEIGHT_PT,
    pxPerPt: pxPerPt * scale,
  };
}

/**
 * Find and measure all PDF layout elements in the DOM
 */
function measureLayout(rootElement: HTMLElement, scale: number): PdfLayoutMeasurements {
  const header = rootElement.querySelector<HTMLElement>('[data-pdf-header]');
  const footer = rootElement.querySelector<HTMLElement>('[data-pdf-footer]');
  const content = rootElement.querySelector<HTMLElement>('[data-pdf-content]');

  if (!header || !footer || !content) {
    throw new Error(
      'PDF layout elements not found. Ensure elements have data-pdf-header, data-pdf-footer, and data-pdf-content attributes.'
    );
  }

  const blocks = Array.from(content.querySelectorAll<HTMLElement>('[data-pdf-block]'));

  if (blocks.length === 0) {
    throw new Error(
      'No content blocks found. Ensure content sections have data-pdf-block attribute.'
    );
  }

  const dimensions = getPageDimensions(scale);
  const pageHeight = dimensions.height * dimensions.pxPerPt;
  const pageWidth = dimensions.width * dimensions.pxPerPt;

  const headerHeight = header.offsetHeight * scale;
  const footerHeight = footer.offsetHeight * scale;
  const contentHeightPerPage = pageHeight - headerHeight - footerHeight;

  return {
    header,
    footer,
    content,
    blocks,
    headerHeight,
    footerHeight,
    contentHeightPerPage,
    pageHeight,
    pageWidth,
  };
}

/**
 * Split content blocks across multiple pages based on available height
 */
function splitContentIntoPages(
  measurements: PdfLayoutMeasurements,
  scale: number
): PdfPageContent[] {
  const pages: PdfPageContent[] = [];
  let currentPage: HTMLElement[] = [];
  let currentPageHeight = 0;

  for (const block of measurements.blocks) {
    const blockHeight = block.offsetHeight * scale;

    // Check if block fits on current page
    if (currentPageHeight + blockHeight <= measurements.contentHeightPerPage) {
      // Fits on current page
      currentPage.push(block);
      currentPageHeight += blockHeight;
    } else {
      // Block doesn't fit, start a new page
      if (currentPage.length > 0) {
        pages.push({
          pageNumber: pages.length + 1,
          blocks: currentPage,
          startOffset: 0,
          isFirstPage: pages.length === 0,
          isLastPage: false,
        });
      }

      // Start new page with this block
      currentPage = [block];
      currentPageHeight = blockHeight;

      // If single block is larger than available height, we still need to include it
      // (it will overflow but won't crash)
      if (blockHeight > measurements.contentHeightPerPage) {
        notifyWarning(
          `Content block exceeds available page height. Some content may be cut off.`
        );
      }
    }
  }

  // Add the last page
  if (currentPage.length > 0) {
    pages.push({
      pageNumber: pages.length + 1,
      blocks: currentPage,
      startOffset: 0,
      isFirstPage: pages.length === 0,
      isLastPage: true,
    });
  }

  // Update isLastPage flag
  if (pages.length > 0) {
    pages[pages.length - 1].isLastPage = true;
  }

  return pages;
}

/**
 * Render a single page to canvas using html2canvas
 */
async function renderPageToCanvas(
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

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.style.minHeight = `${measurements.contentHeightPerPage / scale}px`;

  // Clone and add content blocks for this page
  for (const block of pageContent.blocks) {
    const blockClone = block.cloneNode(true) as HTMLElement;
    contentWrapper.appendChild(blockClone);
  }

  pageContainer.appendChild(contentWrapper);

  // Clone and add footer
  const footerClone = measurements.footer.cloneNode(true) as HTMLElement;
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
