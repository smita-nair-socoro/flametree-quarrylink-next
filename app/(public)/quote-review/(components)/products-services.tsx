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
      <div className="bg-white px-10 py-6 pt-8 mb-3">
        <h2
          className="font-bold text-[rgba(142,81,255,1)] mb-6 text-3xl"
          style={{ letterSpacing: '0.5px' }}
        >
          Products & Services
        </h2>
        <table
          className="w-full border-collapse"
          style={{ tableLayout: 'fixed' }}
        >
          <thead>
            <tr className="border-b border-border">
              <th
                className="text-muted-foreground px-2 pb-3 text-left align-middle font-medium whitespace-nowrap text-2xl"
                style={{ width: '25%', letterSpacing: '0.5px' }}
              >
                Product
              </th>
              <th
                className="text-muted-foreground px-2 pb-3 text-left align-middle font-medium whitespace-nowrap text-2xl"
                style={{ width: '25%', letterSpacing: '0.5px' }}
              >
                Truck Configuration
              </th>
              <th
                className="text-muted-foreground px-2 pb-3 text-left align-middle font-medium whitespace-nowrap text-2xl"
                style={{ width: '25%', letterSpacing: '0.5px' }}
              >
                Quantity
              </th>
              <th
                className="text-muted-foreground px-2 pb-3 text-left align-middle font-medium whitespace-nowrap text-2xl"
                style={{ width: '25%', letterSpacing: '0.5px' }}
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
                    <p className="font-semibold text-gray-900 text-xl">
                      {product.name}
                    </p>
                    <p className="text-gray-500 text-lg">{product.code}</p>
                  </div>
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <div>
                    <p className="text-gray-900 text-xl">{product.truckType}</p>
                    <p className="text-gray-500 text-lg">{product.capacity}</p>
                  </div>
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <p className="text-gray-900 text-xl">{product.quantity}</p>
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <p className="font-semibold text-gray-900 text-xl">
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
