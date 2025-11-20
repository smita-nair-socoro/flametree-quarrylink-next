'use client';
import { Separator } from '@/components/ui/separator';
import { centsToDollars } from '@/lib/utils/currency';
import { DataTableClient } from '@/components/ui/data-table-client';
import { ColumnDef } from '@tanstack/react-table';

export interface Product {
  name: string;
  code: string;
  truckType: string;
  capacity: string;
  quantity: string;
  totalPrice: number;
}

export interface ProductsServicesProps {
  products: Product[];
  forPdf?: boolean;
}

const pdfStyles = {
  title: { letterSpacing: '0.5px', fontWeight: 600 } as const,
  tableHeader: { letterSpacing: '0.5px', fontWeight: 500 } as const,
  tableHeaderRight: {
    letterSpacing: '0.5px',
    fontWeight: 500,
    textAlign: 'right' as const,
  } as const,
  table: { tableLayout: 'fixed' as const },
};

const createColumns = (forPdf: boolean): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => (
      <div>
        <p
          className={`font-semibold text-gray-900 ${
            forPdf ? 'text-xl' : 'text-sm'
          }`}
        >
          {row.original.name}
        </p>
        <p className={`text-gray-500 ${forPdf ? 'text-lg' : 'text-xs'}`}>
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'truckType',
    header: 'Truck Configuration',
    cell: ({ row }) => (
      <div>
        <p className={`text-gray-900 ${forPdf ? 'text-xl' : 'text-sm'}`}>
          {row.original.truckType}
        </p>
        <p className={`text-gray-500 ${forPdf ? 'text-lg' : 'text-xs'}`}>
          {row.original.capacity}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => (
      <p className={`text-gray-900 ${forPdf ? 'text-xl' : 'text-sm'}`}>
        {row.original.quantity}
      </p>
    ),
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total Price',
    cell: ({ row }) => (
      <p
        className={`font-semibold text-gray-900 ${
          forPdf ? 'text-xl' : 'text-sm'
        }`}
      >
        ${centsToDollars(row.original.totalPrice)}
      </p>
    ),
  },
];

export function ProductsServices({
  products,
  forPdf = false,
}: ProductsServicesProps) {
  // Use regular HTML table for PDF rendering
  if (forPdf) {
    return (
      <div className="bg-white px-10 py-6 pt-2 mb-3">
        <h2
          className="font-bold text-[#9810FA] pb-2 text-3xl"
          style={forPdf ? pdfStyles.title : undefined}
        >
          Products & Services
        </h2>
        <table
          className="w-full border-collapse"
          style={pdfStyles.table}
        >
          <colgroup>
            <col style={{ width: '38%' }} /> 
            <col style={{ width: '32%' }} />
            <col style={{ width: '12%' }} /> 
            <col style={{ width: '18%' }} /> 
          </colgroup>
          <thead className="ml-0 pl-0">
            <tr className="border-b border-border text-[#364153]">
              <th
                className="px-2 pb-3 text-left align-middle font-medium whitespace-nowrap text-2xl"
                style={pdfStyles.tableHeader}
              >
                Product
              </th>
              <th
                className="px-2 pb-3 text-left align-middle font-medium whitespace-nowrap text-2xl"
                style={pdfStyles.tableHeader}
              >
                Truck Configuration
              </th>
              <th
                className="px-2 pb-3 text-left align-middle font-medium whitespace-nowrap text-2xl"
                style={pdfStyles.tableHeader}
              >
                Quantity
              </th>
              <th
                className="px-2 pb-3 align-middle font-medium whitespace-nowrap text-2xl"
                style={pdfStyles.tableHeaderRight}
              >
                Total Price
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={index}
                className={
                  index === products.length - 1 ? '' : 'border-b border-border'
                }
              >
                <td className="p-2 align-middle whitespace-nowrap">
                  <div>
                    <p className="font-semibold text-gray-900 text-2xl">
                      {product.name}
                    </p>
                    <p className="text-gray-500 text-2xl">{product.code}</p>
                  </div>
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <div>
                    <p className="text-gray-900 text-2xl">{product.truckType}</p>
                    <p className="text-gray-500 text-2xl">{product.capacity}</p>
                  </div>
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <p className="text-gray-900 text-2xl">{product.quantity}</p>
                </td>
                <td className="p-2 align-middle text-right whitespace-nowrap">
                  <p className="font-semibold text-gray-900 text-2xl">
                    ${centsToDollars(product.totalPrice)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Use DataTableClient for web view
  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <h2 className="font-bold text-[rgba(142,81,255,1)] mb-3 text-lg">
        Products & Services
      </h2>
      <Separator className="mb-4" />
      <DataTableClient
        columns={createColumns(forPdf)}
        data={products}
        simpleTable={true}
        isShowHideColumns={false}
      />
    </div>
  );
}
