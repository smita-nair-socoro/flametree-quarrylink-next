'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { BrandingSchema } from './schemas/branding-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { notifySuccess, notifyError } from '@/lib/toast';
import { delay } from '@/lib/utils/time';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
export default function BrandingTab() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isNarrow = useMediaQuery('(max-width: 420px)');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(
    null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const brandingForm = useForm<z.infer<typeof BrandingSchema>>({
    resolver: zodResolver(BrandingSchema),
    defaultValues: {
      company_logo: undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = BrandingSchema.shape.company_logo.safeParse(file);

      if (!validation.success) {
        const message =
          validation.error.issues?.[0]?.message || 'Invalid file selected';
        notifyError(message);
        setSelectedFileName(null);
        setLogoPreview(null);
        brandingForm.setValue('company_logo', undefined);
        brandingForm.setError('company_logo', { type: 'manual', message });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      brandingForm.setValue('company_logo', file, { shouldValidate: true });
      brandingForm.clearErrors('company_logo');
      setSelectedFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearLogo = () => {
    setLogoPreview(null);
    setSelectedFileName(null);
    brandingForm.setValue('company_logo', undefined);
    brandingForm.clearErrors('company_logo');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof BrandingSchema>) {
    try {
      setIsSubmitting(true);
      // Simulate API call delay
      await delay(500);
      notifySuccess('Branding Updated');
    } catch (error) {
      console.error('Error updating branding:', error);
      notifyError('Update Failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle form validation errors
  function onError(errors: unknown) {
    console.error('Branding validation errors:', errors);
    notifyError('Update Failed');
  }

  return (
    <div className="w-full relative">
      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10'
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              Updating Branding...
            </p>
          </div>
        </div>
      )}
      <div className="py-3 space-y-3">
        <h2 className="text-2xl font-semibold">Company Branding</h2>

        {/* Company Logo */}
        <Card>
          <CardContent className="pt-6">
            <Form {...brandingForm}>
              <form
                id="update-branding-form"
                className={cn(
                  'p-1 w-full flex flex-col',
                  isSubmitting && 'pointer-events-none'
                )}
                onSubmit={brandingForm.handleSubmit(onSubmit, onError)}
              >
                <div className="flex flex-col gap-6">
                  <FormField
                    control={brandingForm.control}
                    name="company_logo"
                    render={({ field: { name } }) => (
                      <FormItem className="w-full">
                        <FormLabel>Company Logo *</FormLabel>
                        <div
                          className={cn(
                            'flex flex-col gap-6 sm:flex-row',
                            logoPreview ? 'items-center' : 'items-start'
                          )}
                        >
                          <div className="flex flex-col gap-2">
                            <div
                              className={cn(
                                'w-[200px] border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50',
                                logoPreview ? 'h-40' : 'h-[120px]'
                              )}
                              onClick={handleUploadClick}
                            >
                              {!logoPreview ? (
                                <>
                                  <Upload className="w-8 h-8 text-[#9F9FA9] mb-2" />
                                  <span className="text-xs text-[#9F9FA9]">
                                    No logo uploaded
                                  </span>
                                </>
                              ) : (
                                <div className="relative w-full h-[80%] p-4">
                                  <Image
                                    src={logoPreview}
                                    alt="Logo preview"
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              )}
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                              className="hidden"
                              onChange={handleFileChange}
                              name={name}
                            />
                          </div>

                          <div className="flex flex-col items-start gap-3">
                            <div
                              className={cn(
                                'inline-flex items-center gap-2 w-50 px-4 border border-input rounded-md bg-background hover:text-accent-foreground cursor-pointer',
                                logoPreview
                                  ? 'py-3 h-24 text-center'
                                  : 'py-2 text-start'
                              )}
                              onClick={handleUploadClick}
                            >
                              {!selectedFileName ? (
                                <>
                                  <Upload className="w-4 h-4 " />
                                  <span className="text-sm">Upload Logo</span>
                                </>
                              ) : (
                                <>
                                  <span className="truncate max-w-[150px] hover:bg-accent p-1 rounded-md">
                                    {selectedFileName}
                                  </span>
                                  {logoPreview && (
                                    <X
                                      className="w-5.5 h-5.5 text-muted-foreground hover:text-foreground border-1 border-[#FFEEEE] rounded bg-[#FFEEEE]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearLogo();
                                      }}
                                    />
                                  )}
                                </>
                              )}
                            </div>

                            {!logoPreview && (
                              <div className="text-xs text-gray-500 text-start">
                                <p>Recommended: JPEG, PNG or SVG, max 2MB</p>
                                <p>Optimal size: 400x200px</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div
                  className={cn(
                    'mt-6 flex flex-col',
                    isNarrow ? 'w-full' : 'w-105'
                  )}
                >
                  <Separator />
                  <Button
                    type="submit"
                    className="w-fit mt-6 cursor-pointer self-end"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
