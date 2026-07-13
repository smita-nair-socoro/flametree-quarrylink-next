export interface TrackingCategory {
  id: number;
  trackingCategoryName: string;
  accountingTrackingCategoryDefinitionId: number;
  trackingCategoryDefinitionName: string;
  accountingTrackingGroupId: number;
  trackingGroupName: string;
  trackingOptionNames: string[];
}

export interface TrackingCategoryDefinition {
  id: number;
  trackingCategoryName: string;
  accountingTrackingGroupId: number;
  trackingGroupName: string;
}

export interface createUpdateTrackingCategory {
  trackingCategoryName: string;
  accountingTrackingCategoryDefinitionId: number;
  trackingOptionNames: string[];
}
