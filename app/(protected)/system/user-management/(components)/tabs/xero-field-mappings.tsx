'use client';

import * as React from 'react';
import {
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Contact,
  IdCard,
  Package,
  Pencil,
  Plus,
  Truck,
  Trash2,
  type LucideIcon,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GroupedFieldSelector,
  type GroupedFieldCategory,
} from '@/components/ui/grouped-field-selector';
import { cn } from '@/lib/utils';

const MAX_FIELD_MAPPINGS = 2;

type FieldMapping = {
  id: string;
  name: string;
  category: string;
  field: string;
};

const XERO_FIELD_CATEGORIES: GroupedFieldCategory[] = [
  {
    key: 'PRODUCT',
    label: 'Product',
    fields: ['Product Name', 'Product Code', 'Material Type', 'Description'],
  },
  {
    key: 'CUSTOMER',
    label: 'Customer',
    fields: [
      'Business Name',
      'Contact Name',
      'Email',
      'Phone',
      'Customer Type',
      'Payment Terms',
    ],
  },
  {
    key: 'JOB',
    label: 'Job',
    fields: ['Job Number', 'Job Type', 'Job Status', 'Project Name'],
  },
  {
    key: 'DOCKET',
    label: 'Docket',
    fields: ['Docket Number', 'Load Size', 'Delivery Date', 'Status'],
  },
  {
    key: 'DRIVER',
    label: 'Driver',
    fields: ['Driver Name', 'License Number', 'Phone', 'Email'],
  },
  {
    key: 'TRUCK',
    label: 'Truck',
    fields: ['License Plate', 'Truck Type', 'Capacity', 'Status'],
  },
];

const MOCK_FIELD_MAPPINGS: FieldMapping[] = [
  {
    id: 'mock-1',
    name: 'Quarrylink Product',
    category: 'Product',
    field: 'Product Name',
  },
];

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
  draftName,
  draftField,
  onNameChange,
  onFieldChange,
  onCancel,
  onSave,
  autoOpenSelector = false,
}: {
  draftName: string;
  draftField: string;
  onNameChange: (value: string) => void;
  onFieldChange: (category: string, field: string) => void;
  onCancel: () => void;
  onSave: () => void;
  autoOpenSelector?: boolean;
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
          categories={XERO_FIELD_CATEGORIES}
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
            className="bg-[#3F3F46] hover:bg-[#27272A] text-white"
            onClick={onSave}
            disabled={!draftName.trim() || !draftField}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function MappingRow({
  mapping,
  onEdit,
  disabled,
}: {
  mapping: FieldMapping;
  onEdit: () => void;
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
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function XeroFieldMappings() {
  const [fieldsExpanded, setFieldsExpanded] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [mappings, setMappings] =
    React.useState<FieldMapping[]>(MOCK_FIELD_MAPPINGS);
  // const [mappings, setMappings] =
  //   React.useState<FieldMapping[]>([]);
  const [draftName, setDraftName] = React.useState('');
  const [draftCategory, setDraftCategory] = React.useState('');
  const [draftField, setDraftField] = React.useState('');
  const [editingMappingId, setEditingMappingId] = React.useState<string | null>(
    null,
  );
  const [editDraftName, setEditDraftName] = React.useState('');
  const [editDraftField, setEditDraftField] = React.useState('');

  const canAddMore = mappings.length < MAX_FIELD_MAPPINGS;
  const showAddButton = canAddMore && !isAdding && !editingMappingId;

  const resetDraft = React.useCallback(() => {
    setDraftName('');
    setDraftCategory('');
    setDraftField('');
  }, []);

  const handleStartAdd = () => {
    resetDraft();
    setEditingMappingId(null);
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    resetDraft();
    setIsAdding(false);
  };

  const handleStartEdit = (mapping: FieldMapping) => {
    setIsAdding(false);
    resetDraft();
    setEditingMappingId(mapping.id);
    setEditDraftName(mapping.name);
    setEditDraftField(mapping.field);
  };

  const handleCancelEdit = () => {
    setEditingMappingId(null);
    setEditDraftName('');
    setEditDraftField('');
  };

  const handleSaveEdit = () => {
    // Mock only — close edit mode without persisting changes.
    handleCancelEdit();
  };

  const handleSaveAdd = () => {
    if (!draftName.trim() || !draftField || mappings.length >= MAX_FIELD_MAPPINGS) {
      return;
    }

    setMappings((current) => [
      ...current,
      {
        id: `mapping-${Date.now()}`,
        name: draftName.trim(),
        category: draftCategory,
        field: draftField,
      },
    ]);
    resetDraft();
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-[#364153]"
          onClick={() => setFieldsExpanded((current) => !current)}
        >
          {fieldsExpanded ? 'Hide tracking categories' : 'Manage tracking categories'}
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
              <p className="text-sm font-semibold text-[#101828]">
                Tracking Categories
              </p>
              <p className="text-sm text-[#6A7282]">
                Configure custom tracking categories using your QuarryLink data.
              </p>
            </div>
            {showAddButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleStartAdd}
              >
                <Plus className="h-4 w-4" />
                Add category
              </Button>
            )}
          </div>

          {isAdding && (
            <MappingForm
              draftName={draftName}
              draftField={draftField}
              onNameChange={setDraftName}
              onFieldChange={(category, field) => {
                setDraftCategory(category);
                setDraftField(field);
              }}
              onCancel={handleCancelAdd}
              onSave={handleSaveAdd}
            />
          )}

          {!isAdding && mappings.length === 0 && (
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

          {mappings.length > 0 && (
            <div className="flex flex-col gap-3">
              {mappings.map((mapping) =>
                editingMappingId === mapping.id ? (
                  <MappingForm
                    key={mapping.id}
                    draftName={editDraftName}
                    draftField={editDraftField}
                    onNameChange={setEditDraftName}
                    onFieldChange={(_category, field) => {
                      setEditDraftField(field);
                    }}
                    onCancel={handleCancelEdit}
                    onSave={handleSaveEdit}
                    autoOpenSelector
                  />
                ) : (
                  <MappingRow
                    key={mapping.id}
                    mapping={mapping}
                    onEdit={() => handleStartEdit(mapping)}
                    disabled={isAdding || editingMappingId !== null}
                  />
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
