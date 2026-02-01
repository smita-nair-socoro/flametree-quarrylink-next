'use client';

export interface QuoteFooterProps {
  email: string; // Tenant email (e.g., support@quarrylink.com.au)
  phone: string; // Tenant phone (e.g., (02) 7229 1427)
  addressLine1: string; // First address line (e.g., Suite 1102/132 Arthur St)
  addressLine2: string; // Second address line (e.g., NORTH SYDNEY NSW 2060)
  addressLine3: string; // Third address line - Country (e.g., AUSTRALIA)
  website: string; // Tenant website (e.g., www.quarrylink.com.au)
  businessName: string; // For copyright (e.g., QuarryLink)
  abn: string; // ABN number (e.g., 12 345 678 901)
}

export function QuoteFooter({
  email,
  phone,
  addressLine1,
  addressLine2,
  addressLine3,
  businessName,
  abn,
}: QuoteFooterProps) {
  return (
    <footer className="bg-[#314158] text-white px-8 py-8 rounded-b-lg">
      {/* Three columns with headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-6 px-4">
        {/* Column 1: Business Details */}
        <div className="text-center">
          <h3 className="text-white font-semibold mb-3">Business Details</h3>
          <div className="text-white/70 text-sm space-y-1">
            <p>{businessName}</p>
            <p>ABN: {abn}</p>
          </div>
        </div>

        {/* Column 2: Office Address */}
        <div className="text-center">
          <h3 className="text-white font-semibold mb-3">Office Address</h3>
          <div className="text-white/70 text-sm space-y-1">
            <p>{addressLine1}</p>
            <p>{addressLine2}</p>
            <p>{addressLine3}</p>
          </div>
        </div>

        {/* Column 3: Business Contact */}
        <div className="text-center">
          <h3 className="text-white font-semibold mb-3">Business Contact</h3>
          <div className="text-white/70 text-sm space-y-1">
            <p>{phone}</p>
            <p>{email}</p>
          </div>
        </div>
      </div>

      {/* Separator line */}
      <div className="border-t border-white/20 mb-4"></div>

      {/* Copyright */}
      <div className="text-center text-white/70 text-xs">
        © {new Date().getFullYear()} {businessName}. All rights reserved.
      </div>
    </footer>
  );
}
