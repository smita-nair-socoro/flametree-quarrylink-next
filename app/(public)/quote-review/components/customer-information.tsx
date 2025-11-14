'use client';

export interface CustomerInformationProps {
  customerName: string;
  email: string;
  phone: string;
  billingAddress: {
    line1: string;
    line2: string;
    country: string;
  };
}

export function CustomerInformation({
  customerName,
  email,
  phone,
  billingAddress,
}: CustomerInformationProps) {
  return (
    <div className="bg-white px-8 py-8">
      <h2 className="text-3xl font-bold text-purple-600 mb-6">
        Customer Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column - Customer Details */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Customer</h3>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{customerName}</p>
            <p className="text-base text-gray-600">{email}</p>
            <p className="text-base text-gray-600">Phone: {phone}</p>
          </div>
        </div>

        {/* Right Column - Billing Address */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Billing Address
          </h3>
          <div className="space-y-1">
            <p className="text-base text-gray-600">{billingAddress.line1}</p>
            <p className="text-base text-gray-600">{billingAddress.line2}</p>
            <p className="text-base text-gray-600">{billingAddress.country}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 border-b border-gray-200"></div>
    </div>
  );
}
