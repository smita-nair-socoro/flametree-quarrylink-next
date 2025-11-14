'use client';

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
    <div className="bg-white px-8 py-8">
      <h2 className="text-3xl font-bold text-purple-600 mb-6">
        Products & Services
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-2 text-base font-semibold text-gray-700">
                Product
              </th>
              <th className="text-left py-4 px-2 text-base font-semibold text-gray-700">
                Truck Configuration
              </th>
              <th className="text-left py-4 px-2 text-base font-semibold text-gray-700">
                Quantity
              </th>
              <th className="text-right py-4 px-2 text-base font-semibold text-gray-700">
                Total Price
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 px-2">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">{product.code}</p>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {product.truckType}
                    </p>
                    <p className="text-sm text-gray-500">{product.capacity}</p>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <p className="text-base text-gray-900">{product.quantity}</p>
                </td>
                <td className="py-4 px-2 text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(product.totalPrice)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 border-b border-gray-200"></div>
    </div>
  );
}
