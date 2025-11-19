/**
 * HTML2PDF Export Module
 * Client-side PDF generation using html2canvas and jsPDF
 *
 * Note: oklch colors are converted to rgb at build time via PostCSS
 * See postcss.config.mjs for configuration
 */

export { exportToPdf } from './exportToPdf';
export { useHtml2Pdf } from './useHtml2Pdf';
export { QuotePdfPreview } from './QuotePdfPreview';
export type {
  PdfExportOptions,
  PdfExportResult,
  PdfPageDimensions,
  PdfLayoutMeasurements,
  PdfPageContent,
} from './types';
export type { UseHtml2PdfOptions, UseHtml2PdfReturn } from './useHtml2Pdf';
export type { QuotePdfPreviewProps } from './QuotePdfPreview';
