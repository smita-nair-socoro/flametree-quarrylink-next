/**
 * Core HTML2PDF export utility
 * Uses html2canvas and jsPDF to export DOM elements to multi-page A4 PDF
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
 * Calculate A4 page dimensions in pixels based on screen DPI
 */
function getPageDimensions(scale: number): PdfPageDimensions {
  const dpi = window.devicePixelRatio || 1;
  const pxPerPt = (dpi * 96) / 72; // Convert points to pixels

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
        console.warn(
          `Block exceeds available page height (${blockHeight}px > ${measurements.contentHeightPerPage}px). Content may be cut off.`
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
    // Render to canvas
    const canvas = await html2canvas(pageContainer, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: measurements.pageWidth / scale,
      height: measurements.pageHeight / scale,
    });

    return canvas;
  } finally {
    // Clean up
    document.body.removeChild(pageContainer);
  }
}

/**
 * Export DOM content to PDF
 */
export async function exportToPdf(
  options: PdfExportOptions
): Promise<PdfExportResult> {
  const startTime = performance.now();

  try {
    // Merge options with defaults
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (opts.debug) {
      console.log('[PDF Export] Starting export with options:', opts);
    }

    // Find root element
    const rootElement = document.querySelector<HTMLElement>('[data-pdf-root]');
    if (!rootElement) {
      throw new Error(
        'PDF root element not found. Ensure container has data-pdf-root attribute.'
      );
    }

    // Measure layout
    if (opts.debug) {
      console.log('[PDF Export] Measuring layout...');
    }
    const measurements = measureLayout(rootElement, opts.scale);

    if (opts.debug) {
      console.log('[PDF Export] Layout measurements:', {
        headerHeight: measurements.headerHeight,
        footerHeight: measurements.footerHeight,
        contentHeightPerPage: measurements.contentHeightPerPage,
        blockCount: measurements.blocks.length,
      });
    }

    // Split content into pages
    if (opts.debug) {
      console.log('[PDF Export] Splitting content into pages...');
    }
    const pages = splitContentIntoPages(measurements, opts.scale);

    if (opts.debug) {
      console.log(`[PDF Export] Generated ${pages.length} pages`);
    }

    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });

    // Render each page
    for (let i = 0; i < pages.length; i++) {
      if (opts.debug) {
        console.log(`[PDF Export] Rendering page ${i + 1}/${pages.length}...`);
      }

      const canvas = await renderPageToCanvas(measurements, pages[i], opts.scale);
      const imgData = canvas.toDataURL('image/jpeg', opts.imageQuality);

      if (i > 0) {
        pdf.addPage();
      }

      // Add image to PDF (full page)
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT, undefined, 'FAST');
    }

    // Download PDF
    const filename = `${opts.filename}.pdf`;
    pdf.save(filename);

    const duration = performance.now() - startTime;

    if (opts.debug) {
      console.log(`[PDF Export] Export completed in ${duration.toFixed(2)}ms`);
    }

    return {
      success: true,
      pageCount: pages.length,
      filename,
    };
  } catch (error) {
    console.error('[PDF Export] Export failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
