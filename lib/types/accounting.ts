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

export interface FieldMapping {
  id: number;
  name: string;
  category: string;
  field: string;
  definitionId: number;
  optionNames: string[];
}

export interface createUpdateTrackingCategory {
  trackingCategoryName: string;
  accountingTrackingCategoryDefinitionId: number;
  trackingOptionNames: string[];
}

export interface AccountCode {
  id?: number;
  code: string;
  name: string;
  type?: string;
  status?: string;
}
