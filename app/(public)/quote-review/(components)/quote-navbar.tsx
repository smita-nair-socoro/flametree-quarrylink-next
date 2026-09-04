'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TableBadges } from '@/components/table-badges';
import { Download, Loader2 } from 'lucide-react';
import {
  QUOTE_STATUS as QuoteStatus,
  LOGO_SIZE as LogoSize,
} from '@/lib/types/quotation-enums';
import { StripeTenantDetailsSnapshot } from '@/lib/types/quotation';

export interface QuoteNavbarProps {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  status: QuoteStatus;
  onDownloadPDF?: () => void;
  isPdfDownloading?: boolean;
  tenantDetails?: StripeTenantDetailsSnapshot;
  logoUrl?: string;
  logoError?: boolean;
  onLogoError?: () => void;
  logoSize?: LogoSize;
}

// Helper component for initials logo
function InitialsLogo({
  tenantName,
  size = 55,
}: Readonly<{
  tenantName: string;
  size?: number;
}>) {
  const initials = tenantName
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return (
    <div
      className="flex-shrink-0 bg-white rounded-lg border-2 border-black flex items-center justify-center p-2"
      style={{ width: size, height: size }}
    >
      <span className="text-black font-bold text-xl">{initials}</span>
    </div>
  );
}

export function QuoteNavbar({
  quoteNumber,
  dateIssued,
  validUntil,
  status,
  onDownloadPDF,
  isPdfDownloading = false,
  tenantDetails,
  logoUrl,
  logoError = false,
  onLogoError,
  logoSize,
}: Readonly<QuoteNavbarProps>) {
  // Determine if this is QuarryLink or a custom tenant
  const isQuarryLink =
    !tenantDetails || tenantDetails.tenantName === 'QuarryLink';
  const displayName = tenantDetails?.businessName || 'QuarryLink';
  // Defaults to the small-logo template unless the tenant has been
  // explicitly set to LARGE.
  const isLargeLogo = logoSize === LogoSize.LARGE;

  // Dynamic styling based on tenant
  const bgColor = isQuarryLink
    ? 'bg-gradient-to-r from-[#8E51FF] to-[#553199]'
    : 'bg-[#e4e4e4]';
  const textColor = isQuarryLink ? 'text-white' : 'text-black';
  const labelColor = isQuarryLink ? 'text-white' : 'text-black';
  const downloadBtnClass = isQuarryLink
    ? 'bg-secondary text-sm text-secondary-foreground hover:bg-gray-100'
    : 'bg-black text-sm text-white hover:bg-gray-800';

  // Fixed square logo used by the standard (small/medium) layout. The
  // explicit width/height style is required because Tailwind's preflight
  // sets `img { height: auto }`, which would otherwise override the square
  // box and break the object-cover crop.
  const renderLogo = (size: number) => {
    if (isQuarryLink) {
      return (
        <Image
          src="/quarrylink-logo.png"
          alt="QuarryLink logo"
          width={size}
          height={size}
          className="flex-shrink-0"
          style={{ width: size, height: size }}
        />
      );
    }
    if (logoUrl && !logoError) {
      return (
        <Image
          src={logoUrl}
          alt={`${displayName} logo`}
          width={size}
          height={size}
          className="flex-shrink-0 rounded-lg border-2 border-black object-cover"
          style={{ width: size, height: size }}
          onError={onLogoError}
        />
      );
    }
    return <InitialsLogo tenantName={displayName} size={size} />;
  };

  // Large-template logo: renders at its natural aspect ratio, auto-sized to
  // fit within the column (capped so it never overflows or looks stretched).
  const renderLargeLogo = () => {
    if (isQuarryLink) {
      return (
        <Image
          src="/quarrylink-logo.png"
          alt="QuarryLink logo"
          width={280}
          height={280}
          className="flex-shrink-0 w-auto h-auto max-w-full max-h-[170px]"
        />
      );
    }
    if (logoUrl && !logoError) {
      return (
        <Image
          src={logoUrl}
          alt={`${displayName} logo`}
          width={280}
          height={280}
          className="flex-shrink-0 object-contain w-auto h-auto max-w-full max-h-[170px]"
          onError={onLogoError}
        />
      );
    }
    return <InitialsLogo tenantName={displayName} size={70} />;
  };

  const downloadButton = (
    <Button
      onClick={onDownloadPDF}
      variant="secondary"
      className={`${downloadBtnClass} justify-self-start h-14 w-14`}
      size="icon"
      disabled={isPdfDownloading}
      aria-label={isPdfDownloading ? 'Generating PDF...' : 'Download PDF'}
    >
      {isPdfDownloading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Download className="w-6 h-6" />
      )}
    </Button>
  );

  const quoteNumberBlock = (
    <div className="text-left md:text-right">
      <div className="font-bold text-[29px] break-words">{quoteNumber}</div>
      <div className={`${labelColor} text-sm`}>QUOTATION</div>
    </div>
  );

  const infoGrid = (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-2">
        <div>
          <div className={`${labelColor} text-sm`}>Date Issued</div>
          <div className="text-[15px] font-medium">{dateIssued}</div>
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
  );

  if (isLargeLogo) {
    return (
      <div className={`${bgColor} ${textColor} px-8 py-6 rounded-t-lg`}>
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Left: Large logo above the business name - shrink-wraps to the
              logo's actual rendered width instead of reserving a fixed
              column, so there's no dead space beside a narrow logo.*/}
          <div className="flex flex-col items-start gap-3 w-fit max-w-full md:min-w-[40%] md:max-w-[55%]">
            {renderLargeLogo()}
            <h1 className="text-[18px] sm:text-[22px] font-bold break-words w-full">
              {displayName}
            </h1>
          </div>

          {/* Right: one shared 2-column grid for both the quote-number row
              and the info grid, both columns right-aligned with the same
              gap, so the quote number and the Valid Until/Status column
              share the exact same right edge. whitespace-nowrap lets the
              quote number overflow leftward into the gap rather than wrap
              if it's ever wider than the column. */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 content-between flex-1">
            {/* Row 1, Col 1: empty spacer above Date Issued */}
            <div />
            {/* Row 1, Col 2: Quote number + download icon */}
            <div className="flex items-start justify-end gap-4 px-6">
              <div className="text-right">
                <div className="font-bold text-[30px] whitespace-nowrap">
                  {quoteNumber}
                </div>
                <div className={`${labelColor} text-sm`}>QUOTATION</div>
              </div>
              <div className="pt-3">{downloadButton}</div>
            </div>

            {/* Row 2, Col 1 */}
            <div className="space-y-3 pl-6">
              <div>
                <div className={`${labelColor} text-sm`}>Date Issued</div>
                <div className="text-[16px] font-medium">{dateIssued}</div>
              </div>
            </div>

            {/* Row 2, Col 2 - right-aligned to match the quote number above */}
            <div className="space-y-3 text-right pr-6">
              <div>
                <div className={`${labelColor} text-sm`}>Valid Until</div>
                <div className="text-[16px] font-medium">{validUntil}</div>
              </div>
              <div>
                <div className={`${labelColor} text-sm`}>Status</div>
                <div className="flex justify-end">
                  <TableBadges names={status} visibleCount={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} ${textColor} px-8 py-6 rounded-t-lg`}>
      {/* Top Row */}
      <div className="flex flex-col md:flex-row flex-wrap items-start justify-start md:justify-between gap-4 mb-6">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0 w-full md:w-auto md:flex-1 md:max-w-[60%]">
          {renderLogo(isQuarryLink ? 70 : 60)}
          <h1 className="text-[20px] sm:text-[30px] font-bold min-w-0 flex-1 break-words">
            {displayName}
          </h1>
        </div>

        {/* Quote Number & Download Button */}
        <div className="grid grid-cols-2 gap-8 w-full items-center md:w-auto md:flex md:flex-row md:gap-4 md:justify-end">
          {quoteNumberBlock}
          {downloadButton}
        </div>
      </div>

      {/* Bottom Row - Info Grid */}
      {infoGrid}
    </div>
  );
}
