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
  console.log('📄 Starting page split...');

  const pages: PdfPageContent[] = [];
  let currentPage: HTMLElement[] = [];
  let currentPageHeight = 0;

  for (const block of measurements.blocks) {
    const blockHeight = block.offsetHeight * scale;
    console.log(`  Block: height=${blockHeight}px, currentPageHeight=${currentPageHeight}px, available=${measurements.contentHeightPerPage}px`);

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

  console.log(`✅ Split complete: ${pages.length} pages created`);
  pages.forEach((page, idx) => {
    console.log(`  Page ${page.pageNumber}: ${page.blocks.length} blocks`);
  });

  return pages;
}
