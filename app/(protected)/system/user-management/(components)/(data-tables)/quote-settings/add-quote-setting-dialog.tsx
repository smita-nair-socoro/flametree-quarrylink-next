'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { isAnyDropdownOpen } from '@/components/ui/dropdown-menu';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  textTemplateFormSchema,
  externalLinkFormSchema,
  replaceDocumentFormSchema,
  TextTemplateFormValues,
  ExternalLinkFormValues,
  ReplaceDocumentFormValues,
} from '../../tabs/schemas/quote-setting-schema';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import {
  QuoteExternalLinkItem,
  QuoteTermsAndConditionsDocument,
  QuoteTextTemplateItem,
} from '@/lib/types/terms-conditions';

interface AddQuoteSettingDialogProps {
  type: QuoteSettingItemType | null;
  currentDocument?: QuoteTermsAndConditionsDocument;
  editingTextTemplate?: QuoteTextTemplateItem | null;
  editingExternalLink?: QuoteExternalLinkItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmitTextTemplate: (values: TextTemplateFormValues) => void;
  onSubmitExternalLink: (values: ExternalLinkFormValues) => void;
  onSubmitReplaceDocument: (values: ReplaceDocumentFormValues) => void;
}

export function AddQuoteSettingDialog({
  type,
  currentDocument,
  editingTextTemplate,
  editingExternalLink,
  onOpenChange,
  onSubmitTextTemplate,
  onSubmitExternalLink,
  onSubmitReplaceDocument,
}: Readonly<AddQuoteSettingDialogProps>) {
  const handleCancel = () => onOpenChange(false);
  const isOpen = type !== null;

  // Radix's dismissable-layer stack can leave document.body.style.pointerEvents
  // stuck at 'none' when the "Add Item" dropdown and this dialog close in the
  // same tick, freezing the rest of the page. Clear it defensively on close.
  React.useEffect(() => {
    if (isOpen) return;
    const raf = globalThis.requestAnimationFrame(() => {
      if (document.body?.style?.pointerEvents === 'none') {
        document.body.style.pointerEvents = '';
      }
    });
    return () => globalThis.cancelAnimationFrame(raf);
  }, [isOpen]);

  React.useEffect(() => {
    return () => {
      if (document.body?.style?.pointerEvents === 'none') {
        document.body.style.pointerEvents = '';
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          type === QuoteSettingItemType.TEXT_TEMPLATE
            ? 'sm:max-w-2xl'
            : 'sm:max-w-md'
        }
        onEscapeKeyDown={(event) => {
          if (isAnyDropdownOpen()) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (isAnyDropdownOpen()) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (isAnyDropdownOpen()) {
            event.preventDefault();
          }
        }}
      >
        {type === QuoteSettingItemType.TEXT_TEMPLATE && (
          <TextTemplateForm
            key={editingTextTemplate?.id ?? 'new'}
            editingItem={editingTextTemplate}
            onCancel={handleCancel}
            onSubmit={onSubmitTextTemplate}
          />
        )}
        {type === QuoteSettingItemType.EXTERNAL_LINK && (
          <ExternalLinkForm
            key={editingExternalLink?.id ?? 'new'}
            editingItem={editingExternalLink}
            onCancel={handleCancel}
            onSubmit={onSubmitExternalLink}
          />
        )}
        {type === QuoteSettingItemType.UPLOADED_DOCUMENT && (
          <ReplaceDocumentForm
            currentDocument={currentDocument}
            onCancel={handleCancel}
            onSubmit={onSubmitReplaceDocument}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TextTemplateForm({
  editingItem,
  onCancel,
  onSubmit,
}: Readonly<{
  editingItem?: QuoteTextTemplateItem | null;
  onCancel: () => void;
  onSubmit: (values: TextTemplateFormValues) => void;
}>) {
  const isEditing = Boolean(editingItem);
  const form = useForm<TextTemplateFormValues>({
    resolver: zodResolver(textTemplateFormSchema),
    defaultValues: {
      name: editingItem?.name ?? '',
      content: editingItem?.content ?? '',
      isDefault: editingItem?.isDefault ?? false,
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Text Template' : 'Add Text Template'}
        </DialogTitle>
        <DialogDescription>
          Text templates are available when staff compose quotes under Notes
          &amp; Terms.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Standard Supply Terms" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms &amp; conditions text</FormLabel>
                <FormControl>
                  <RichTextEditor
                    placeholder="Enter terms and conditions..."
                    maxLength={8000}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-md border border-[#E4E4E7] bg-[#F4F4F54D] px-3 py-2.5 text-[#09090B]">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-[#09090B]">
                  Attach to new quotes by default
                </FormLabel>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Template'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

function ExternalLinkForm({
  editingItem,
  onCancel,
  onSubmit,
}: Readonly<{
  editingItem?: QuoteExternalLinkItem | null;
  onCancel: () => void;
  onSubmit: (values: ExternalLinkFormValues) => void;
}>) {
  const isEditing = Boolean(editingItem);
  const form = useForm<ExternalLinkFormValues>({
    resolver: zodResolver(externalLinkFormSchema),
    defaultValues: {
      name: editingItem?.name ?? '',
      url: editingItem?.url ?? '',
      isDefault: editingItem?.isDefault ?? false,
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit External Link' : 'Add External Link'}
        </DialogTitle>
        <DialogDescription>
          Link to policies hosted on SharePoint, Google Drive, or any external
          URL. Customers will see a clickable link on their quote.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display label</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Credit Policy (SharePoint)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://company.sharepoint.com/..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-md border border-[#E4E4E7] bg-[#F4F4F54D] px-3 py-2.5 text-[#09090B]">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-[#09090B]">
                  Attach to new quotes by default
                </FormLabel>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Link'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

function ReplaceDocumentForm({
  currentDocument,
  onCancel,
  onSubmit,
}: Readonly<{
  currentDocument?: QuoteTermsAndConditionsDocument;
  onCancel: () => void;
  onSubmit: (values: ReplaceDocumentFormValues) => void;
}>) {
  const isReplacing = Boolean(currentDocument);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const form = useForm<ReplaceDocumentFormValues>({
    resolver: zodResolver(replaceDocumentFormSchema),
    defaultValues: {
      name: currentDocument?.name ?? '',
      file: undefined,
      isDefault: currentDocument?.isDefault ?? false,
    },
  });

  const selectedFile = form.watch('file');

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isReplacing ? 'Replace Policy Document' : 'Upload Policy Document'}
        </DialogTitle>
        <DialogDescription>
          {isReplacing
            ? 'Uploading a new PDF will replace the current document. Only one policy document is allowed in your library.'
            : 'Upload a single PDF policy document. Customers can view and download it from quotes.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {currentDocument && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Current document: {currentDocument.name} (
              {currentDocument.fileName})
            </div>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Standard Supply Terms 2026"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem>
                <FormLabel>PDF file</FormLabel>
                <FormControl>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        form.setValue('file', file, { shouldValidate: true });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm hover:bg-accent"
                    >
                      <Upload className="h-4 w-4" />
                      {selectedFile
                        ? selectedFile.name
                        : isReplacing
                          ? 'Choose Replacement PDF'
                          : 'Choose PDF'}
                    </button>
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  PDF only, max 10 MB
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-md border border-[#E4E4E7] bg-[#F4F4F54D] px-3 py-2.5 text-[#09090B]">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-[#09090B]">
                  Attach to new quotes by default
                </FormLabel>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isReplacing ? 'Replace Document' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
