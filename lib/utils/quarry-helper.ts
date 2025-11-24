/**
 * Quarry utility functions for transforming quarry data
 * between backend and frontend formats
 */

import { Quarry } from '../types/quarry';

/**
 * Transform quarry data from backend format to frontend format
 * Maps backend field names to frontend field names
 *
 * @param quarry - Raw quarry data from backend API
 * @returns Quarry object with frontend field names
 *
 * @example
 * transformQuarryData({ opening_closing_info: "Mon-Fri 8am-6pm" })
 * // Returns { opening_closing_times: "Mon-Fri 8am-6pm" }
 */
export function transformQuarryData(quarry: any): Quarry {
  // Debug logging
  console.log('Transform Quarry - Input:', {
    opening_closing_info: quarry.opening_closing_info,
    opening_closing_times: quarry.opening_closing_times,
  });

  // Map opening_closing_info (backend) to opening_closing_times (frontend)
  const transformed = {
    ...quarry,
    opening_closing_times:
      quarry.opening_closing_info || quarry.opening_closing_times || '',
  };

  console.log('Transform Quarry - Output:', {
    opening_closing_times: transformed.opening_closing_times,
  });

  return transformed;
}
