'use client';

import { Control } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { MessageSquare, FileText, Link2, Upload } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { isPolicyDocument } from '@/hooks/use-quote-settings-action';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import { QuoteSettingItem } from '@/lib/types/terms-conditions';
import { PolicyDocumentViewQueryOptions } from '@/lib/api/quote-profile-content';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { notifyError } from '@/lib/toast';
import z from 'zod';
import { QuotationFormSchema } from './schemas/quotation-form-schema';

const MAX_NOTES_LENGTH = 2000;

const typeLabels: Record<QuoteSettingItemType, string> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: 'Text template',
  [QuoteSettingItemType.EXTERNAL_LINK]: 'External link',
  [QuoteSettingItemType.POLICY_DOCUMENT]: 'Policy document',
};

const typeIcons: Record<QuoteSettingItemType, typeof FileText> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: FileText,
  [QuoteSettingItemType.EXTERNAL_LINK]: Link2,
  [QuoteSettingItemType.POLICY_DOCUMENT]: Upload,
};

function formatFileSize(bytes: number): string {
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

function itemSubtitle(item: QuoteSettingItem): string {
  if (isPolicyDocument(item)) {
    return `${typeLabels[QuoteSettingItemType.POLICY_DOCUMENT]} · ${formatFileSize(item.fileSizeBytes)}`;
  }
  return typeLabels[item.type];
}

interface QuoteContentAndNotesSectionProps {
  control: Control<z.infer<typeof QuotationFormSchema>>;
  items: QuoteSettingItem[];
  disabled?: boolean;
}

export function QuoteContentAndNotesSection({
  control,
  items,
  disabled,
}: Readonly<QuoteContentAndNotesSectionProps>) {
  const queryClient = useQueryClient();

  const viewPolicyDocument = async (id: number) => {
    try {
      const { url } = await queryClient.fetchQuery(
        PolicyDocumentViewQueryOptions(id),
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      notifyError(extractErrorMessage(err));
    }
  };

  return (
    <div className="col-span-full space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#8E51FF]" />
          <h2 className="text-xl font-semibold">Notes & Terms</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Content entered here is included in the quote email, customer quote
          view, and PDF sent to the customer.
        </p>
      </div>

      <FormField
        control={control}
        name="customerNotes"
        render={({ field }) => {
          const length = field.value?.length ?? 0;
          return (
            <FormItem>
              <FormLabel>Customer Notes</FormLabel>
              <p className="text-sm text-muted-foreground -mt-1">
                Optional message shown to the customer after Products &amp;
                Services and before the pricing summary (e.g. site access
                instructions, special conditions).
              </p>
              <FormControl>
                <Textarea
                  placeholder="Add a note for the customer (optional)..."
                  className="min-h-24 resize-none"
                  maxLength={MAX_NOTES_LENGTH}
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <div className="text-right text-xs text-muted-foreground">
                {length}/{MAX_NOTES_LENGTH}
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <div className="border border-[#E4E4E7] rounded-lg bg-[#FAFAFA] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#8E51FF]" />
          <h3 className="font-semibold">T&amp;Cs &amp; Policy Documents</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Text templates, policy document, and external links from your
          library — managed in System &rarr; Quote Settings.
        </p>

        <FormField
          control={control}
          name="attachedItemIds"
          render={({ field }) => {
            const selectedIds = field.value ?? [];
            const toggle = (id: string | number, checked: boolean) => {
              field.onChange(
                checked
                  ? [...selectedIds, id]
                  : selectedIds.filter((existingId) => existingId !== id),
              );
            };

            return (
              <FormItem className="space-y-2">
                <FormLabel>Attached items</FormLabel>
                <div className="rounded-md border border-[#E4E4E7] bg-white divide-y divide-[#E4E4E7]">
                  {items.map((item) => {
                    const Icon = isPolicyDocument(item)
                      ? typeIcons[QuoteSettingItemType.POLICY_DOCUMENT]
                      : typeIcons[item.type];
                    const checked = selectedIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          className="border-[#A1A1AA]"
                          onCheckedChange={(value) =>
                            toggle(item.id, value === true)
                          }
                        />
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#09090B]">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {itemSubtitle(item)}
                          </p>
                        </div>
                        {isPolicyDocument(item) && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              viewPolicyDocument(item.id);
                            }}
                          >
                            View
                          </Button>
                        )}
                      </label>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
}
