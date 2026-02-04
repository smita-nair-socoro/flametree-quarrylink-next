'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TableBadges } from '@/components/table-badges';
import { Download } from 'lucide-react';
import { QUOTE_STATUS as QuoteStatus } from '@/lib/types/quotation-enums';
import { StripeTenantDetailsSnapshot } from '@/lib/types/quotation';

export interface QuoteNavbarProps {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  accountManager: string;
  status: QuoteStatus;
  onDownloadPDF?: () => void;
  tenantDetails?: StripeTenantDetailsSnapshot;
  logoUrl?: string;
}

// Helper component for initials logo
function InitialsLogo({ tenantName }: { tenantName: string }) {
  const initials = tenantName
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="flex-shrink-0 w-[55px] h-[55px] bg-white rounded-lg border-2 border-black flex items-center justify-center p-2">
      <span className="text-black font-bold text-xl">{initials}</span>
    </div>
  );
}

export function QuoteNavbar({
  quoteNumber,
  dateIssued,
  validUntil,
  accountManager,
  status,
  onDownloadPDF,
  tenantDetails,
  logoUrl,
}: QuoteNavbarProps) {
  // Determine if this is QuarryLink or a custom tenant
  const isQuarryLink =
    !tenantDetails || tenantDetails.tenantName === 'QuarryLink';
  const displayName = tenantDetails?.businessName || 'QuarryLink';

  // Dynamic styling based on tenant
  const bgColor = isQuarryLink
    ? 'bg-gradient-to-r from-[#8E51FF] to-[#553199]'
    : 'bg-[#e4e4e4]';
  const textColor = isQuarryLink ? 'text-white' : 'text-black';
  const labelColor = isQuarryLink ? 'text-white' : 'text-black';
  const downloadBtnClass = isQuarryLink
    ? 'bg-secondary text-sm text-secondary-foreground hover:bg-gray-100'
    : 'bg-black text-sm text-white hover:bg-gray-800';

  return (
    <div className={`${bgColor} ${textColor} px-8 py-6 rounded-t-lg`}>
      {/* Top Row */}
      <div className="flex flex-col md:flex-row flex-wrap items-start justify-start md:justify-between gap-4 mb-6">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0 w-full md:w-auto md:flex-1 md:max-w-[60%]">
          {isQuarryLink ? (
            <Image
              src="/quarrylink-logo.png"
              alt="QuarryLink logo"
              width={70}
              height={70}
              className="flex-shrink-0"
            />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt={`${displayName} logo`}
              className="flex-shrink-0 w-[55px] h-[55px] rounded-lg border-2 border-black object-cover"
            />
          ) : (
            <InitialsLogo tenantName={displayName} />
          )}
          <h1 className="text-[40px] sm:text-[50px] font-bold min-w-0 flex-1 break-words">
            {displayName}
          </h1>
        </div>

        {/* Download Button & Quote Number */}
        <div className="grid grid-cols-2 gap-8 w-full items-center md:w-auto md:flex md:flex-row md:gap-4 md:justify-end">
          <Button
            onClick={onDownloadPDF}
            variant="secondary"
            className={`${downloadBtnClass} whitespace-nowrap justify-self-start w-fit`}
            size="default"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>

          <div className="text-left md:text-right">
            <div className="font-bold text-[29px] break-words">
              {quoteNumber}
            </div>
            <div className={`${labelColor} text-sm`}>QUOTATION</div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Info Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-2">
          <div>
            <div className={`${labelColor} text-sm`}>Date Issued</div>
            <div className="text-[15px] font-medium">{dateIssued}</div>
          </div>
          <div>
            <div className={`${labelColor} text-sm`}>Account Manager</div>
            <div className="text-[15px] font-medium">{accountManager}</div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div>
            <div className={`${labelColor} text-sm`}>Valid Until</div>
            <div className="text-[15px] font-medium">{validUntil}</div>
          </div>
          <div>
            <div className={`${labelColor} text-sm`}>Status</div>
            <div>
              <TableBadges names={status} visibleCount={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
