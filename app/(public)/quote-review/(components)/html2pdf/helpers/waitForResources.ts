/**
 * Resource loading utilities for PDF export
 */

import { notifyWarning } from '@/lib/toast';

/**
 * Wait for all fonts to be loaded
 * This ensures consistent text rendering across browsers
 */
export async function waitForFontsToLoad(): Promise<void> {
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
export async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
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
