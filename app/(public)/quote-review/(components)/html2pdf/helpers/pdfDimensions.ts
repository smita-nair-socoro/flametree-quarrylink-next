/**
 * PDF dimension constants and calculators
 */

import type { PdfPageDimensions } from '../types';

// A4 dimensions in points (72 DPI)
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;

/**
 * Calculate A4 page dimensions in pixels based on fixed DPI
 * Uses fixed devicePixelRatio of 2 for consistency across all browsers/systems
 */
export function getPageDimensions(scale: number): PdfPageDimensions {
  // Use fixed DPI instead of window.devicePixelRatio for consistency
  const FIXED_DPI = 2;
  const pxPerPt = (FIXED_DPI * 96) / 72; // Convert points to pixels

  return {
    width: A4_WIDTH_PT,
    height: A4_HEIGHT_PT,
    pxPerPt: pxPerPt * scale,
  };
}
