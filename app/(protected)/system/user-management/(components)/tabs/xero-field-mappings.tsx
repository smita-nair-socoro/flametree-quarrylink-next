'use client';

import type {
  TrackingCategory,
  TrackingCategoryDefinition,
} from '@/lib/types/accounting';
import { AccountCodeMapping } from './mapping/account-code';
import { TrackingCategoriesMapping } from './mapping/tracking-categories';

const EMPTY_TRACKING_CATEGORIES: TrackingCategory[] = [];
const EMPTY_TRACKING_CATEGORY_DEFINITIONS: TrackingCategoryDefinition[] = [];

export function XeroFieldMappings({
  trackingCategories = EMPTY_TRACKING_CATEGORIES,
  trackingCategoryDefinitions = EMPTY_TRACKING_CATEGORY_DEFINITIONS,
  onLoadTrackingCategoryDefinitions,
  isLoadingTrackingCategories = false,
}: {
  trackingCategories?: TrackingCategory[];
  trackingCategoryDefinitions?: TrackingCategoryDefinition[];
  onLoadTrackingCategoryDefinitions?: () => Promise<void>;
  isLoadingTrackingCategories?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <TrackingCategoriesMapping
        trackingCategories={trackingCategories}
        trackingCategoryDefinitions={trackingCategoryDefinitions}
        onLoadTrackingCategoryDefinitions={onLoadTrackingCategoryDefinitions}
        isLoadingTrackingCategories={isLoadingTrackingCategories}
      />
      <AccountCodeMapping />
    </div>
  );
}
