'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TableBadges } from '@/components/table-badges';
import { Download } from 'lucide-react';
import { QUOTE_STATUS as QuoteStatus } from '@/lib/types/quotation-enums';

export interface QuoteNavbarProps {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  accountManager: string;
  status: QuoteStatus;
  onDownloadPDF?: () => void;
  onDownloadPDFReactPdf?: () => void;
}

export function QuoteNavbar({
  quoteNumber,
  dateIssued,
  validUntil,
  accountManager,
  status,
  onDownloadPDFReactPdf,
}: QuoteNavbarProps) {
  return (
    <div className="bg-gradient-to-r from-[#8E51FF] to-[#553199] text-white px-8 py-6 rounded-t-lg">
      {/* Top Row */}
      <div className="flex items-start justify-between mb-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/quarrylink-logo.png"
            alt="QuarryLink logo"
            width={70}
            height={70}
            style={{ width: '70px', height: '70px' }}
          />
          <h1 className="text-[60px] font-bold">QuarryLink</h1>
        </div>

        {/* Download Button & Quote Number */}
        <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                className="bg-secondary text-sm text-secondary-foreground hover:bg-gray-100"
                size="default"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>

          <div className="text-right">
            <div className="font-bold text-[29px]">{quoteNumber}</div>
            <div className="text-white text-sm">QUOTATION</div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Info Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-2">
          <div>
            <div className="text-white text-sm">Date Issued</div>
            <div className="text-[15px] font-medium">{dateIssued}</div>
          </div>
          <div>
            <div className="text-white text-sm">Account Manager</div>
            <div className="text-[15px] font-medium">{accountManager}</div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div>
            <div className="text-white text-sm">Valid Until</div>
            <div className="text-[15px] font-medium">{validUntil}</div>
          </div>
          <div>
            <div className="text-white text-sm">Status</div>
            <div>
              <TableBadges names={status} visibleCount={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
