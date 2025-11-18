/**
 * Type definitions for HTML2PDF export system
 */

export interface PdfExportOptions {
  /** Filename for the downloaded PDF (without .pdf extension) */
  filename: string;

  /** Scale factor for html2canvas rendering (higher = better quality, slower) */
  scale?: number;

  /** Image quality for canvas rendering (0-1) */
  imageQuality?: number;

  /** Enable logging for debugging */
  debug?: boolean;
}

export interface PdfPageDimensions {
  /** Width in points (A4: 595.28pt) */
  width: number;

  /** Height in points (A4: 841.89pt) */
  height: number;

  /** Pixels per point ratio */
  pxPerPt: number;
}

export interface PdfLayoutMeasurements {
  /** Header element */
  header: HTMLElement;

  /** Footer element */
  footer: HTMLElement;

  /** Content container element */
  content: HTMLElement;

  /** Individual content blocks */
  blocks: HTMLElement[];

  /** Header height in pixels */
  headerHeight: number;

  /** Footer height in pixels */
  footerHeight: number;

  /** Available content height per page in pixels */
  contentHeightPerPage: number;

  /** Total page height in pixels */
  pageHeight: number;

  /** Page width in pixels */
  pageWidth: number;
}

export interface PdfPageContent {
  /** Page number (1-indexed) */
  pageNumber: number;

  /** Content blocks to render on this page */
  blocks: HTMLElement[];

  /** Y offset for the first block on this page */
  startOffset: number;

  /** Whether this is the first page */
  isFirstPage: boolean;

  /** Whether this is the last page */
  isLastPage: boolean;
}

export interface PdfExportResult {
  /** Whether the export was successful */
  success: boolean;

  /** Error message if export failed */
  error?: string;

  /** Number of pages generated */
  pageCount?: number;

  /** Filename of the downloaded PDF */
  filename?: string;
}
