/**
 * Core HTML2PDF export utility
 * Uses html2canvas and jsPDF to export DOM elements to multi-page A4 PDF
 *
 * Note: oklch colors are converted to rgb at build time via PostCSS
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
 * Wait for all images in an element to load
 * This ensures html2canvas can capture images properly
 */
async function waitForImagesToLoad(element: HTMLElement, debug = false): Promise<void> {
  const images = Array.from(element.querySelectorAll<HTMLImageElement>('img'));

  if (debug) {
    console.log(`[PDF Export] Waiting for ${images.length} images to load...`);
  }

  const imagePromises = images.map((img) => {
    // Already loaded
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }

    // Wait for load event
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`[PDF Export] Failed to load image: ${img.src}`);
        resolve(); // Continue anyway
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        console.warn(`[PDF Export] Image load timeout: ${img.src}`);
        resolve();
      }, 10000);
    });
  });

  await Promise.all(imagePromises);

  if (debug) {
    console.log('[PDF Export] All images loaded');
  }
}

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
function measureLayout(rootElement: HTMLElement, scale: number, debug = false): PdfLayoutMeasurements {
  const header = rootElement.querySelector<HTMLElement>('[data-pdf-header]');
  const footer = rootElement.querySelector<HTMLElement>('[data-pdf-footer]');
  const content = rootElement.querySelector<HTMLElement>('[data-pdf-content]');

  if (debug) {
    console.log('[PDF Export] Found elements:', {
      header: !!header,
      footer: !!footer,
      content: !!content,
      headerOffsetHeight: header?.offsetHeight,
      footerOffsetHeight: footer?.offsetHeight,
      contentOffsetHeight: content?.offsetHeight,
    });
  }

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

  if (debug) {
    console.log('[PDF Export] Raw measurements:', {
      'header.offsetHeight': header.offsetHeight,
      'footer.offsetHeight': footer.offsetHeight,
      scale,
      headerHeight,
      footerHeight,
      pageHeight,
      contentHeightPerPage,
    });
  }

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
  scale: number,
  debug = false
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
    await waitForImagesToLoad(pageContainer, debug);

    if (debug) {
      console.log('[PDF Export] Rendering page to canvas...');
    }

    // Render to canvas (oklch colors already converted to rgb by PostCSS)
    const canvas = await html2canvas(pageContainer, {
      scale,
      useCORS: true,
      allowTaint: true, // Allow cross-origin images
      logging: debug, // Enable logging in debug mode
      backgroundColor: '#ffffff',
      width: measurements.pageWidth / scale,
      height: measurements.pageHeight / scale,
      imageTimeout: 15000, // 15 second timeout for images
      onclone: () => {
        if (debug) {
          console.log('[PDF Export] Document cloned for rendering');
        }
      },
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

    // CRITICAL: Temporarily show element on-screen to allow proper measurements
    // Store original styles
    const originalStyles = {
      position: rootElement.style.position,
      left: rootElement.style.left,
      top: rootElement.style.top,
      opacity: rootElement.style.opacity,
      visibility: rootElement.style.visibility,
    };

    // Make it fully visible and in normal position (no tricks!)
    rootElement.style.position = 'absolute';
    rootElement.style.left = '0';
    rootElement.style.top = '0';
    rootElement.style.opacity = '1';
    rootElement.style.visibility = 'visible';

    if (opts.debug) {
      console.log('[PDF Export] Temporarily showing element for measurements');
      console.log('[PDF Export] Element dimensions:', {
        width: rootElement.offsetWidth,
        height: rootElement.offsetHeight,
        children: rootElement.children.length,
        innerHTML: rootElement.innerHTML.substring(0, 200),
      });
    }

    // Wait for layout to settle
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Wait for all images to load before measuring (critical for correct dimensions)
    await waitForImagesToLoad(rootElement, opts.debug);

    // Measure layout
    if (opts.debug) {
      console.log('[PDF Export] Measuring layout...');
    }
    const measurements = measureLayout(rootElement, opts.scale, opts.debug);

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

      const canvas = await renderPageToCanvas(measurements, pages[i], opts.scale, opts.debug);
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

    // Restore original styles
    rootElement.style.position = originalStyles.position;
    rootElement.style.left = originalStyles.left;
    rootElement.style.top = originalStyles.top;
    rootElement.style.opacity = originalStyles.opacity;
    rootElement.style.visibility = originalStyles.visibility;

    if (opts.debug) {
      console.log('[PDF Export] Restored element to hidden state');
    }

    return {
      success: true,
      pageCount: pages.length,
      filename,
    };
  } catch (error) {
    console.error('[PDF Export] Export failed:', error);

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
