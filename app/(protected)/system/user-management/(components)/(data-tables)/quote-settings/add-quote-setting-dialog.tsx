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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { QuoteTermsAndConditionsDocument } from '@/lib/types/terms-conditions';

interface AddQuoteSettingDialogProps {
  type: QuoteSettingItemType | null;
  currentDocument?: QuoteTermsAndConditionsDocument;
  onOpenChange: (open: boolean) => void;
  onSubmitTextTemplate: (values: TextTemplateFormValues) => void;
  onSubmitExternalLink: (values: ExternalLinkFormValues) => void;
  onSubmitReplaceDocument: (values: ReplaceDocumentFormValues) => void;
}

export function AddQuoteSettingDialog({
  type,
  currentDocument,
  onOpenChange,
  onSubmitTextTemplate,
  onSubmitExternalLink,
  onSubmitReplaceDocument,
}: Readonly<AddQuoteSettingDialogProps>) {
  const handleCancel = () => onOpenChange(false);

  return (
    <Dialog open={type !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {type === QuoteSettingItemType.TEXT_TEMPLATE && (
          <TextTemplateForm
            onCancel={handleCancel}
            onSubmit={onSubmitTextTemplate}
          />
        )}
        {type === QuoteSettingItemType.EXTERNAL_LINK && (
          <ExternalLinkForm
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
  onCancel,
  onSubmit,
}: Readonly<{
  onCancel: () => void;
  onSubmit: (values: TextTemplateFormValues) => void;
}>) {
  const form = useForm<TextTemplateFormValues>({
    resolver: zodResolver(textTemplateFormSchema),
    defaultValues: { name: '', content: '', isDefault: false },
  });

  const contentLength = form.watch('content')?.length ?? 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Text Template</DialogTitle>
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
                  <Textarea
                    placeholder="Enter numbered terms and conditions..."
                    className="min-h-40 resize-none"
                    maxLength={8000}
                    {...field}
                  />
                </FormControl>
                <div className="text-right text-xs text-muted-foreground">
                  {contentLength}/8000
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Attach to new quotes by default
                </FormLabel>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Template</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

function ExternalLinkForm({
  onCancel,
  onSubmit,
}: Readonly<{
  onCancel: () => void;
  onSubmit: (values: ExternalLinkFormValues) => void;
}>) {
  const form = useForm<ExternalLinkFormValues>({
    resolver: zodResolver(externalLinkFormSchema),
    defaultValues: { name: '', url: '', isDefault: false },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add External Link</DialogTitle>
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
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Attach to new quotes by default
                </FormLabel>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Link</Button>
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
        <DialogTitle>Replace Policy Document</DialogTitle>
        <DialogDescription>
          Uploading a new PDF will replace the current document. Only one policy
          document is allowed in your library.
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
                  <Input placeholder="e.g. Policy Document" {...field} />
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
                        : 'Choose Replacement PDF'}
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
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Attach to new quotes by default
                </FormLabel>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Replace Document</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
