'use client';

export interface QuoteFooterProps {
  contactInfo: {
    company: string;
    phone: string;
    email: string;
  };
  officeAddress: {
    address: string;
    city: string;
    abn: string;
  };
  website: {
    url: string;
    portalInfo: string;
    support: string;
  };
}

export function QuoteFooter({
  contactInfo,
  officeAddress,
  website,
}: QuoteFooterProps) {
  return (
    <footer className="bg-[#314158] text-white px-8 py-12 rounded-b-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto text-center">
        {/* Column 1: Contact Information */}
        <div>
          <h3 className="text-base font-semibold mb-2">Contact Information</h3>
          <div className="text-white text-sm">
            <p>{contactInfo.company}</p>
            <p>{contactInfo.phone}</p>
            <p>{contactInfo.email}</p>
          </div>
        </div>

        {/* Column 2: Office Address */}
        <div>
          <h3 className="text-base font-semibold mb-2">Office Address</h3>
          <div className=" text-white text-sm">
            <p>{officeAddress.address}</p>
            <p>{officeAddress.city}</p>
            <p>ABN: {officeAddress.abn}</p>
          </div>
        </div>

        {/* Column 3: Website */}
        <div>
          <h3 className="text-base font-semibold mb-2">Website</h3>
          <div className="text-white text-sm">
            <p>{website.url}</p>
            <p>{website.portalInfo}</p>
            <p>{website.support}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
