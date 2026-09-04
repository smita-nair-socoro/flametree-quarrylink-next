'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormSelect } from '@/components/ui/form-select';
import { useFormDialogFooter } from '@/components/form-dialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { QuarryListQueryOptions } from '@/lib/api/quarries';
import { useCreateInternalTransferJob } from '@/lib/api/job';
import { QuarryType } from '@/lib/types/quarry-enums';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { Loader2 } from 'lucide-react';
import { scrollToFirstError } from '@/lib/utils';

const schema = z
  .object({
    fromSiteId: z.number().min(1, 'From Site is required'),
    toSiteId: z.number().min(1, 'To Site is required'),
  })
  .refine((value) => value.fromSiteId !== value.toSiteId, {
    message: 'From Site and To Site must differ',
    path: ['toSiteId'],
  });

type FormValues = z.infer<typeof schema>;

export default function InternalTransferJobForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { data: sites = [] } = useQuery(QuarryListQueryOptions());
  const createJob = useCreateInternalTransferJob();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fromSiteId: 0, toSiteId: 0 },
  });

  const options = React.useMemo(
    () =>
      sites
        .filter(
          (site) =>
            !site.isDeleted &&
            site.quarrySupplierType === QuarryType.QUARRY,
        )
        .map((site) => ({
          value: site.id,
          label: site.name,
        })),
    [sites],
  );

  const onSubmit = async (values: FormValues) => {
    try {
      await createJob.mutateAsync({
        fromSiteId: values.fromSiteId,
        toSiteId: values.toSiteId,
      });
      notifySuccess('Internal transfer job created');
      onSuccess?.();
    } catch (error) {
      notifyError(
        extractErrorMessage(error) ||
          'Failed to create internal transfer job. Please try again.',
      );
    }
  };

  useFormDialogFooter(
    isDesktop ? (
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          form="create-internal-transfer-job-form"
          type="submit"
          disabled={createJob.isPending}
        >
          {createJob.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Add Job
        </Button>
      </div>
    ) : null,
  );

  return (
    <Form {...form}>
      <form
        id="create-internal-transfer-job-form"
        className="flex flex-col gap-4 py-1"
        onSubmit={form.handleSubmit(onSubmit, scrollToFirstError)}
      >
        <FormSelect
          control={form.control}
          name="fromSiteId"
          label="From Site*"
          searchLabel="From Site"
          options={options}
          placeholder="Select From Site"
        />
        <FormSelect
          control={form.control}
          name="toSiteId"
          label="To Site*"
          searchLabel="To Site"
          options={options}
          placeholder="Select To Site"
        />
      </form>
    </Form>
  );
}
