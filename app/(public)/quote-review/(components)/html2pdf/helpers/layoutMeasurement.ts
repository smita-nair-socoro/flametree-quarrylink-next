/**
 * Layout measurement utilities for PDF export
 */

import type { PdfLayoutMeasurements } from '../types';
import { getPageDimensions } from './pdfDimensions';

/**
 * Find and measure all PDF layout elements in the DOM
 */
export function measureLayout(rootElement: HTMLElement, scale: number): PdfLayoutMeasurements {
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

  // Add small safety margin to prevent edge cases
  const SAFETY_MARGIN_PX = 10;
  const headerHeight = header.offsetHeight * scale;
  const footerHeight = footer.offsetHeight * scale;
  const contentHeightPerPage = pageHeight - headerHeight - footerHeight - SAFETY_MARGIN_PX;

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
