'use client';

import React from 'react';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { Activity, Factory, Tags } from 'lucide-react';
import { quotationColumns } from './(components)/(data-tables)/quotation/columns';
import { FormDialog } from '@/components/form-dialog';
import rawJson from '@/lib/tests/quotationResponseData.json';
import { Quotation } from '@/lib/types/quotation';
import QuotationForm from './(components)/forms/quotation-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';

export default function QuotationsPage() {
  const convertedJson = convertKeysToSnakeCase(rawJson);
  const { items: rawItems } = convertedJson as unknown as {
    items: Array<
      Omit<Quotation, 'quoteId'> & {
        quoteId: number;
      }
    >;
  };

  const items: Quotation[] = rawItems.map((item) => ({
    ...item,
    quoteId: item.id,
  }));

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
          <h3 className="text-2xl font-bold">Quotations</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Quote"
            dialogDescription="This is a card description."
            buttonTitle="Add Quote"
            headerSeparator={true}
          >
            <QuotationForm />
          </FormDialog>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min mt-3">
        <DataTableClient
          tableId="quotation_main_data_table"
          data={items ?? []}
          columns={quotationColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search quotes..."
        />
      </div>
    </div>
  );
}
