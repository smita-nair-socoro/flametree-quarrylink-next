'use client';

export interface QuoteFooterProps {
  email: string; // Tenant email (e.g., support@quarrylink.com.au)
  phone: string; // Tenant phone (e.g., (02) 7229 1427)
  addressLine1: string; // First address line (e.g., Suite 1102/132 Arthur St)
  addressLine2: string; // Second address line (e.g., North Sydney NSW 2060)
  website: string; // Tenant website (e.g., www.quarrylink.com.au)
  businessName: string; // For copyright (e.g., QuarryLink)
}

export function QuoteFooter({
  email,
  phone,
  addressLine1,
  addressLine2,
  businessName,
}: QuoteFooterProps) {
  return (
    <footer className="bg-[#314158] text-white px-8 py-8 rounded-b-lg">
      {/* Two columns with more centered content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-6 px-12">
        {/* Column 1: Email & Phone */}
        <div className="text-white/90 text-sm text-center md:text-left">
          <p>{email}</p>
          <p>{phone}</p>
        </div>

        {/* Column 2: Address */}
        <div className="text-white/90 text-sm text-center md:text-right">
          <p>{addressLine1}</p>
          <p>{addressLine2}</p>
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
