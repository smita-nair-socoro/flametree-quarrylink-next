/**
 * React hook for HTML2PDF export
 * Manages PDF export state and provides easy integration
 */

'use client';

import { useState, useCallback } from 'react';
import { exportToPdf } from './exportToPdf';
import type { PdfExportOptions, PdfExportResult } from './types';

export interface UseHtml2PdfOptions {
  /** Default filename for PDF export (without .pdf extension) */
  defaultFilename?: string;

  /** Enable debug logging */
  debug?: boolean;

  /** Custom scale factor (default: 2) */
  scale?: number;

  /** Custom image quality (default: 0.95) */
  imageQuality?: number;
}

export interface UseHtml2PdfReturn {
  /** Export the PDF */
  exportPdf: (options?: Partial<PdfExportOptions>) => Promise<PdfExportResult>;

  /** Whether PDF export is in progress */
  isExporting: boolean;

  /** Error message if export failed */
  error: string | null;

  /** Clear error message */
  clearError: () => void;

  /** Last successful export result */
  lastResult: PdfExportResult | null;
}

/**
 * Hook for managing PDF export with html2canvas and jsPDF
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { exportPdf, isExporting, error } = useHtml2Pdf({
 *     defaultFilename: 'my-document',
 *     debug: true,
 *   });
 *
 *   const handleDownload = async () => {
 *     const result = await exportPdf();
 *     if (result.success) {
 *       console.log(`Generated ${result.pageCount} pages`);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDownload} disabled={isExporting}>
 *       {isExporting ? 'Generating PDF...' : 'Download PDF'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useHtml2Pdf(options: UseHtml2PdfOptions = {}): UseHtml2PdfReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PdfExportResult | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const exportPdf = useCallback(
    async (exportOptions?: Partial<PdfExportOptions>): Promise<PdfExportResult> => {
      // Clear previous error
      setError(null);
      setIsExporting(true);

      try {
        // Merge options
        const finalOptions: PdfExportOptions = {
          filename: exportOptions?.filename || options.defaultFilename || 'document',
          scale: exportOptions?.scale || options.scale,
          imageQuality: exportOptions?.imageQuality || options.imageQuality,
          debug: exportOptions?.debug ?? options.debug,
        };

        // Wait a tick to ensure DOM is fully rendered
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Export PDF
        const result = await exportToPdf(finalOptions);

        if (result.success) {
          setLastResult(result);
        } else {
          setError(result.error || 'PDF export failed');
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsExporting(false);
      }
    },
    [options.defaultFilename, options.debug, options.scale, options.imageQuality]
  );

  return {
    exportPdf,
    isExporting,
    error,
    clearError,
    lastResult,
  };
}
