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
  website,
  businessName,
}: QuoteFooterProps) {
  return (
    <footer className="bg-[#314158] text-white px-8 py-8 rounded-b-lg">
      {/* Three columns without bold headings (except Website) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-6">
        {/* Column 1: Email & Phone - Center on mobile, Left on desktop */}
        <div className="text-white/90 text-sm text-center md:text-left">
          <p>{email}</p>
          <p>{phone}</p>
        </div>

        {/* Column 2: Address - Always center */}
        <div className="text-white/90 text-sm text-center">
          <p>{addressLine1}</p>
          <p>{addressLine2}</p>
        </div>

        {/* Column 3: Website - Center on mobile, Right on desktop */}
        <div className="text-center md:text-right">
          <h3 className="font-semibold mb-1 text-sm">Website</h3>
          <p className="text-white/90 text-sm">{website}</p>
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
