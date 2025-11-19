/**
 * Content splitting utilities for multi-page PDFs
 */

import { notifyWarning } from '@/lib/toast';
import type { PdfLayoutMeasurements, PdfPageContent } from '../types';

/**
 * Split content blocks across multiple pages based on available height
 */
export function splitContentIntoPages(
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
