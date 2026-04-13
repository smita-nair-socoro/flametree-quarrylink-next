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
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useUploadTenantLogo, TenantLogoQueryOptions } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';

export default function BrandingTab() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isNarrow = useMediaQuery('(max-width: 550px)');
  const uploadLogoMutation = useUploadTenantLogo();
  const { data: logoData, isLoading: isLoadingLogo } = useQuery(TenantLogoQueryOptions());
  const isSubmitting = uploadLogoMutation.isPending;
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(
    null
  );
  const [hasNewFile, setHasNewFile] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Set logo preview from fetched data when available
  React.useEffect(() => {
    if (logoData?.logoPublicS3Url && !hasNewFile) {
      setLogoPreview(logoData.logoPublicS3Url);
    }
  }, [logoData, hasNewFile]);

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
        setHasNewFile(false);
        // Restore existing logo if available, otherwise clear
        if (logoData?.logoPublicS3Url) {
          setLogoPreview(logoData.logoPublicS3Url);
        } else {
          setLogoPreview(null);
        }
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
      setHasNewFile(true);

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
    setSelectedFileName(null);
    setHasNewFile(false);
    brandingForm.setValue('company_logo', undefined);
    brandingForm.clearErrors('company_logo');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset to existing logo if available, otherwise clear
    if (logoData?.logoPublicS3Url) {
      setLogoPreview(logoData.logoPublicS3Url);
    } else {
      setLogoPreview(null);
    }
  };

  async function onSubmit(data: z.infer<typeof BrandingSchema>) {
    const file = data.company_logo;
    if (!file) {
      notifyError('Please select a logo to upload');
      return;
    }

    uploadLogoMutation.mutate(file, {
      onSuccess: () => {
        notifySuccess('Logo uploaded successfully');
        setSelectedFileName(null);
        setHasNewFile(false);
        brandingForm.setValue('company_logo', undefined);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error) => {
        console.error('Error uploading logo:', error);
        notifyError('Failed to upload logo');
      },
    });
  }

  // Handle form validation errors
  function onError(errors: unknown) {
    console.log('Branding validation errors:', errors);
    notifyError('Update Failed');
  }

  return (
    <div className="py-3 relative">
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl flex items-center justify-center p-6">
          <DialogTitle className="sr-only">Logo Preview</DialogTitle>
          {logoPreview && (
            <div className="relative w-full h-80">
              <Image
                src={logoPreview}
                alt="Logo preview"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
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
                          <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <div
                              className={cn(
                                'w-full sm:w-[200px] border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50',
                                logoPreview ? 'h-40' : 'h-[120px]'
                              )}
                              onClick={() => logoPreview ? setIsPreviewOpen(true) : handleUploadClick()}
                            >
                              {isLoadingLogo ? (
                                <>
                                  <Spinner size="small" />
                                  <span className="text-xs text-[#9F9FA9] mt-2">
                                    Loading logo...
                                  </span>
                                </>
                              ) : !logoPreview ? (
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
                                    onError={() => setLogoPreview(null)}
                                  />
                                </div>
                              )}
                            </div>
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                              className="hidden"
                              onChange={handleFileChange}
                              name={name}
                            />
                          </div>

                          <div className="flex flex-col items-start gap-3 w-full sm:w-auto">
                            <div
                              className={cn(
                                'inline-flex items-center justify-center gap-2 w-full sm:w-50 px-4 border border-input rounded-md bg-background hover:text-accent-foreground cursor-pointer',
                                logoPreview
                                  ? isNarrow
                                    ? 'py-2'
                                    : 'py-3 h-24'
                                  : 'py-2'
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
                                  <span className="truncate max-w-[150px] hover:bg-accent p-1 rounded-md" title={selectedFileName || ''}>
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
                    className={cn(
                      'mt-6 cursor-pointer',
                      isNarrow ? 'w-full' : 'w-fit self-end'
                    )}
                    disabled={isSubmitting || !hasNewFile}
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
