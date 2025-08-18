'use client';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { Activity, Factory, Share, Tags } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ProductsListQueryOptions } from '@/lib/api/quaries';
import { LoadingSpinner } from '@/components/loading-spinner';
import { notifyError } from '@/lib/toast';
import { quotationColumns } from './(components)/(data-tables)/quotation/columns';
import { FormDialog } from '@/components/form-dialog';
import rawJson from '@/lib/tests/quotationResponseData.json';
import {
  QuotationDetails,
  QUOTE_STATUS,
  QUOTE_TYPE,
} from '@/lib/types/quotation';
import QuotationForm from './(components)/forms/quotation-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { Button } from '@/components/ui/button';

export default function QuotationsPage() {
  //TODO: Fetch from server

  const quotationQuery = useQuery(ProductsListQueryOptions());

  const convertedJson = convertKeysToSnakeCase(rawJson);

  const { items: rawItems } = convertedJson as unknown as {
    items: Array<
      Omit<QuotationDetails, 'quote_type' | 'quote_status'> & {
        quote_type: string;
        quote_status: string;
      }
    >;
  };

  const items: QuotationDetails[] = rawItems.map((item) => ({
    ...item,
    quote_type: item.quote_type as QUOTE_TYPE,
    quote_status: item.quote_status as QUOTE_STATUS,
  }));

  if (quotationQuery.isLoading) {
    return <LoadingSpinner message="Loading Quotations" />;
  }

  if (quotationQuery.error) {
    notifyError('Quotation', { description: 'Error loading Quotations' });
  }

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Factory },
    { column: 'quote_type', title: 'Quote Type', icon: Tags },
    // { column: 'products', title: 'Products', icon: Factory },
    { column: 'customer_name', title: 'Customer Name', icon: Activity },
    { column: 'account_manager', title: 'Account Manager', icon: Factory },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Quotations</h1>
          <p className="text-sm text-muted-foreground">Manage your quotation</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button variant="secondary">
            <Share className="w-10 h-20" />
            Export
          </Button>
          <FormDialog
            dialogTitle="Add Quote"
            dialogDescription="This is a card description."
            buttonTitle="Add Quote"
          >
            <QuotationForm />
          </FormDialog>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          data={items ?? []}
          columns={quotationColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search quotes..."
        />
      </div>
    </div>
  );
}
