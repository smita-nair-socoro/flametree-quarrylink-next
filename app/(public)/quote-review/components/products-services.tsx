'use client';
import { Separator } from 'react-aria-components';
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
}

export function ProductsServices({ products }: ProductsServicesProps) {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <h2 className="text-lg font-bold text-[rgba(142,81,255,1)] mb-3">
        Products & Services
      </h2>
      <Separator className="mb-4" />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-2 text-sm font-normal text-gray-700 font-[Geist]">
                Product
              </th>
              <th className="text-left py-4 px-2 text-sm font-normal text-gray-700 font-[Geist]">
                Truck Configuration
              </th>
              <th className="text-left py-4 px-2 text-sm font-normal text-gray-700 font-[Geist]">
                Quantity
              </th>
              <th className="text-right py-4 px-2 text-sm font-normal text-gray-700 font-[Geist]">
                Total Price
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-b-0">
                <td className="py-4 px-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 font-[Geist]">{product.code}</p>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div>
                    <p className="text-sm text-gray-900 font-[Geist]">
                      {product.truckType}
                    </p>
                    <p className="text-xs text-gray-500 font-[Geist]">{product.capacity}</p>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <p className="text-sm text-gray-900 font-[Geist]">{product.quantity}</p>
                </td>
                <td className="py-4 px-2 text-right">
                  <p className="text-sm font-semibold text-gray-900 font-[Geist]">
                    {formatPrice(product.totalPrice)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
