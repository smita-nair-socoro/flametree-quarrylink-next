'use client';

import * as React from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Contact,
  IdCard,
  Package,
  Pencil,
  Plus,
  Trash2,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GroupedFieldSelector,
  type GroupedFieldCategory,
} from '@/components/ui/grouped-field-selector';
import {
  useCreateTrackingCategory,
  useDeleteTrackingCategory,
  useGetTrackingCategories,
  useGetTrackingCategoriesDefinitions,
  useUpdateTrackingCategory,
} from '@/lib/api/accounting';
import type {
  FieldMapping,
  TrackingCategory,
  TrackingCategoryDefinition,
} from '@/lib/types/accounting';
import { notifyError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

const MAX_FIELD_MAPPINGS = 2;

function buildFieldCategories(
  definitions: TrackingCategoryDefinition[] = [],
): GroupedFieldCategory[] {
  const groups = new Map<
    number,
    { key: string; label: string; fields: Set<string> }
  >();

  for (const definition of definitions) {
    const group = groups.get(definition.accountingTrackingGroupId) ?? {
      key: definition.trackingGroupName,
      label: definition.trackingGroupName,
      fields: new Set<string>(),
    };
    group.fields.add(definition.trackingCategoryName);
    groups.set(definition.accountingTrackingGroupId, group);
  }

  return Array.from(groups.values()).map((group) => ({
    key: group.key,
    label: group.label,
    fields: Array.from(group.fields),
  }));
}

function buildFieldMappings(
  trackingCategories: TrackingCategory[] = [],
): FieldMapping[] {
  return trackingCategories.map((category) => ({
    id: category.id,
    name: category.trackingCategoryName,
    category: category.trackingGroupName,
    field: category.trackingCategoryDefinitionName,
    definitionId: category.accountingTrackingCategoryDefinitionId,
    optionNames: category.trackingOptionNames,
  }));
}

function findDefinitionId(
  definitions: TrackingCategoryDefinition[],
  category: string,
  field: string,
): number | undefined {
  return definitions.find(
    (definition) =>
      definition.trackingGroupName === category &&
      definition.trackingCategoryName === field,
  )?.id;
}

const CATEGORY_ICON_CONFIG: Record<
  string,
  { icon: LucideIcon; bgClass: string; iconClass: string }
> = {
  Product: {
    icon: Package,
    bgClass: 'bg-[#F3E8FF]',
    iconClass: 'text-[#8B5CF6]',
  },
  Customer: {
    icon: Contact,
    bgClass: 'bg-[#DCFCE7]',
    iconClass: 'text-[#16A34A]',
  },
  Job: {
    icon: ClipboardCheck,
    bgClass: 'bg-[#EFF6FF]',
    iconClass: 'text-[#2563EB]',
  },
  Docket: {
    icon: ClipboardList,
    bgClass: 'bg-[#FFF7ED]',
    iconClass: 'text-[#EA580C]',
  },
  Driver: {
    icon: IdCard,
    bgClass: 'bg-[#FCE7F3]',
    iconClass: 'text-[#DB2777]',
  },
  Truck: {
    icon: Truck,
    bgClass: 'bg-[#F3F4F6]',
    iconClass: 'text-[#4B5563]',
  },
};

function CategoryIcon({ category }: { category: string }) {
  const config = CATEGORY_ICON_CONFIG[category];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
        config.bgClass,
      )}
    >
      <Icon className={cn('h-5 w-5', config.iconClass)} />
    </div>
  );
}

function MappingForm({
  categories,
  draftName,
  draftField,
  onNameChange,
  onFieldChange,
  onCancel,
  onSave,
  autoOpenSelector = false,
  isSaving = false,
}: {
  categories: GroupedFieldCategory[];
  draftName: string;
  draftField: string;
  onNameChange: (value: string) => void;
  onFieldChange: (category: string, field: string) => void;
  onCancel: () => void;
  onSave: () => void;
  autoOpenSelector?: boolean;
  isSaving?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-[#FAFAFA] p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="field-mapping-name">Name</Label>
          <Input
            id="field-mapping-name"
            placeholder="Enter a name"
            value={draftName}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </div>

        <GroupedFieldSelector
          categories={categories}
          field={draftField}
          placeholder="Select tracking group"
          onChange={onFieldChange}
          defaultOpen={autoOpenSelector}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#3F3F46] hover:bg-[#27272A] text-white cursor-pointer"
            onClick={onSave}
            disabled={!draftName.trim() || !draftField || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MappingRow({
  mapping,
  onEdit,
  onDelete,
  disabled,
}: {
  mapping: FieldMapping;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <CategoryIcon category={mapping.category} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#101828]">
            {mapping.name}
          </p>
          <div className="flex items-center gap-2 truncate text-sm text-[#6A7282]">
            <span>{mapping.category}</span>
            <ChevronRight className="h-4 w-4" />
            <span>{mapping.field}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label={`Edit ${mapping.name}`}
          disabled={disabled}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label={`Delete ${mapping.name}`}
          disabled={disabled}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function TrackingCategoriesMapping() {
  const [fieldsExpanded, setFieldsExpanded] = React.useState(false);
  const trackingCategoriesQuery = useGetTrackingCategories({
    enabled: fieldsExpanded,
  });
  const trackingCategoriesDefinitionsQuery =
    useGetTrackingCategoriesDefinitions({ enabled: false });
  const trackingCategories = React.useMemo(
    () => trackingCategoriesQuery.data ?? [],
    [trackingCategoriesQuery.data],
  );
  const trackingCategoryDefinitions = React.useMemo(
    () => trackingCategoriesDefinitionsQuery.data ?? [],
    [trackingCategoriesDefinitionsQuery.data],
  );
  const isLoadingTrackingCategories =
    trackingCategoriesDefinitionsQuery.isFetching;
  const [isAdding, setIsAdding] = React.useState(false);
  const apiMappings = React.useMemo(
    () => buildFieldMappings(trackingCategories),
    [trackingCategories],
  );
  const fieldCategories = React.useMemo(
    () => buildFieldCategories(trackingCategoryDefinitions),
    [trackingCategoryDefinitions],
  );
  const [mappings, setMappings] = React.useState<FieldMapping[]>(apiMappings);
  const [draftName, setDraftName] = React.useState('');
  const [draftCategory, setDraftCategory] = React.useState('');
  const [draftField, setDraftField] = React.useState('');
  const [editingMappingId, setEditingMappingId] = React.useState<number | null>(
    null,
  );
  const [editDraftName, setEditDraftName] = React.useState('');
  const [editDraftCategory, setEditDraftCategory] = React.useState('');
  const [editDraftField, setEditDraftField] = React.useState('');
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTargetMapping, setDeleteTargetMapping] =
    React.useState<FieldMapping | null>(null);
  const createTrackingCategory = useCreateTrackingCategory();
  const updateTrackingCategory = useUpdateTrackingCategory();
  const deleteTrackingCategory = useDeleteTrackingCategory();

  const canAddMore = mappings.length < MAX_FIELD_MAPPINGS;
  const showAddButton = canAddMore && !isAdding && !editingMappingId;
  const isSaving =
    createTrackingCategory.isPending ||
    updateTrackingCategory.isPending ||
    deleteTrackingCategory.isPending;

  React.useEffect(() => {
    setMappings(apiMappings);
  }, [apiMappings]);

  const resetDraft = React.useCallback(() => {
    setDraftName('');
    setDraftCategory('');
    setDraftField('');
  }, []);

  const handleStartAdd = async () => {
    resetDraft();
    setEditingMappingId(null);
    try {
      await trackingCategoriesDefinitionsQuery.refetch();
    } catch (error) {
      console.error('Error loading tracking category definitions:', error);
      notifyError(extractErrorMessage(error));
    }
    if (mappings.length >= MAX_FIELD_MAPPINGS) return;
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    resetDraft();
    setIsAdding(false);
  };

  const handleStartEdit = async (mapping: FieldMapping) => {
    setIsAdding(false);
    resetDraft();
    try {
      await trackingCategoriesDefinitionsQuery.refetch();
    } catch (error) {
      console.error('Error loading tracking category definitions:', error);
      notifyError(extractErrorMessage(error));
    }
    setEditingMappingId(mapping.id);
    setEditDraftName(mapping.name);
    setEditDraftCategory(mapping.category);
    setEditDraftField(mapping.field);
  };

  const handleCancelEdit = () => {
    setEditingMappingId(null);
    setEditDraftName('');
    setEditDraftCategory('');
    setEditDraftField('');
  };

  const handleSaveEdit = async () => {
    if (!editingMappingId || !editDraftName.trim() || !editDraftField) {
      return;
    }

    const currentMapping = mappings.find(
      (mapping) => mapping.id === editingMappingId,
    );
    const definitionId = findDefinitionId(
      trackingCategoryDefinitions,
      editDraftCategory,
      editDraftField,
    );
    if (!currentMapping || definitionId === undefined) return;

    try {
      await updateTrackingCategory.mutateAsync({
        id: editingMappingId,
        data: {
          trackingCategoryName: editDraftName.trim(),
          accountingTrackingCategoryDefinitionId: definitionId,
          trackingOptionNames: currentMapping.optionNames,
        },
      });
    } catch (error) {
      console.error('Error updating tracking category:', error);
      notifyError(extractErrorMessage(error));
    }

    handleCancelEdit();
  };

  const handleSaveAdd = async () => {
    if (
      !draftName.trim() ||
      !draftField ||
      mappings.length >= MAX_FIELD_MAPPINGS
    ) {
      return;
    }

    const definitionId = findDefinitionId(
      trackingCategoryDefinitions,
      draftCategory,
      draftField,
    );
    if (definitionId === undefined) return;

    try {
      await createTrackingCategory.mutateAsync({
        trackingCategoryName: draftName.trim(),
        accountingTrackingCategoryDefinitionId: definitionId,
        trackingOptionNames: [],
      });
    } catch (error) {
      console.error('Error creating tracking category:', error);
      notifyError(extractErrorMessage(error));
    }

    resetDraft();
    setIsAdding(false);
  };

  const handleOpenDelete = (mapping: FieldMapping) => {
    setDeleteTargetMapping(mapping);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetMapping) return;

    try {
      await deleteTrackingCategory.mutateAsync(deleteTargetMapping.id);
      setDeleteTargetMapping(null);
    } catch (error) {
      console.error('Error deleting tracking category:', error);
      notifyError(extractErrorMessage(error));
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-[#364153]"
          onClick={() => setFieldsExpanded((current) => !current)}
        >
          {fieldsExpanded
            ? 'Hide tracking categories'
            : 'Manage tracking categories'}
          <ChevronDown
            className={cn(
              'ml-1 h-4 w-4 transition-transform',
              fieldsExpanded && 'rotate-180',
            )}
          />
        </Button>
      </div>

      {fieldsExpanded && (
        <div className="flex flex-col gap-4 border-t pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#101828]">
                  Tracking Categories
                </p>
                <Badge
                  variant="destructive"
                  className="rounded-full border-transparent px-2.5 py-0.5 text-xs font-medium"
                >
                  {mappings.length} of {MAX_FIELD_MAPPINGS} used
                </Badge>
              </div>
              <p className="text-sm text-[#6A7282]">
                Configure up to {MAX_FIELD_MAPPINGS} custom tracking categories
                using your QuarryLink data.
              </p>
            </div>
            {showAddButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={isLoadingTrackingCategories}
                onClick={handleStartAdd}
              >
                <Plus className="h-4 w-4" />
                {isLoadingTrackingCategories ? 'Loading...' : 'Add category'}
              </Button>
            )}
          </div>

          {isAdding && (
            <MappingForm
              categories={fieldCategories}
              draftName={draftName}
              draftField={draftField}
              onNameChange={setDraftName}
              onFieldChange={(category, field) => {
                setDraftCategory(category);
                setDraftField(field);
              }}
              onCancel={handleCancelAdd}
              onSave={handleSaveAdd}
              isSaving={isSaving}
            />
          )}

          {!isAdding &&
            !trackingCategoriesQuery.isLoading &&
            mappings.length === 0 && (
            <button
              type="button"
              className="flex min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#D1D5DC] bg-[#FAFAFA] px-6 py-8 text-center transition-colors hover:border-[#9CA3AF]"
              onClick={handleStartAdd}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]">
                <Plus className="h-5 w-5 text-[#9CA3AF]" />
              </div>
              <p className="text-sm font-medium text-[#101828]">
                Add your first tracking category
              </p>
              <p className="text-sm text-[#6A7282]">
                No tracking categories have been configured yet.
              </p>
            </button>
          )}

          {trackingCategoriesQuery.isLoading && (
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-5 text-sm text-[#6A7282]">
              Loading tracking categories...
            </div>
          )}

          {mappings.length > 0 && (
            <div className="flex flex-col gap-3">
              {mappings.map((mapping) =>
                editingMappingId === mapping.id ? (
                  <MappingForm
                    key={mapping.id}
                    categories={fieldCategories}
                    draftName={editDraftName}
                    draftField={editDraftField}
                    onNameChange={setEditDraftName}
                    onFieldChange={(category, field) => {
                      setEditDraftCategory(category);
                      setEditDraftField(field);
                    }}
                    onCancel={handleCancelEdit}
                    onSave={handleSaveEdit}
                    autoOpenSelector
                    isSaving={isSaving}
                  />
                ) : (
                  <MappingRow
                    key={mapping.id}
                    mapping={mapping}
                    onEdit={() => handleStartEdit(mapping)}
                    onDelete={() => handleOpenDelete(mapping)}
                    disabled={isAdding || editingMappingId !== null || isSaving}
                  />
                ),
              )}
            </div>
          )}
        </div>
      )}

      <ActionDialog
        open={deleteOpen}
        onOpenChangeAction={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleteTargetMapping(null);
          }
        }}
        title="Delete tracking category?"
        titleIcon={
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
            <AlertTriangle className="h-5 w-5 text-[#E7000B]" />
          </div>
        }
        content={
          deleteTargetMapping ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#364153]">
                Are you sure you want to delete the tracking category &quot;
                {deleteTargetMapping?.name}&quot;?
              </p>
              <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4">
                <p className="text-sm font-semibold text-[#101828]">
                  What happens next:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#364153]">
                  <li>This category will be removed from the integration mapping.</li>
                  <li>
                    Invoices already pushed to Xero will keep their existing
                    tracking value.
                  </li>
                  <li>New invoices will no longer include this tracking category.</li>
                  <li>You can recreate it at any time from this page.</li>
                </ul>
              </div>
            </div>
          ) : null
        }
        confirmText={
          deleteTrackingCategory.isPending ? 'Deleting...' : 'Delete category'
        }
        confirmVariant="destructive"
        confirmCustomColor="#E7000B"
        confirmDisabled={deleteTrackingCategory.isPending}
        cancelText="Cancel"
        onConfirmAction={() => void handleConfirmDelete()}
      />
    </>
  );
}
