'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

export interface QuoteNavbarProps {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  accountManager: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'DRAFT';
  onDownloadPDF?: () => void;
}

export function QuoteNavbar({
  quoteNumber,
  dateIssued,
  validUntil,
  accountManager,
  status,
  onDownloadPDF,
}: QuoteNavbarProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500 text-white';
      case 'DECLINED':
        return 'bg-red-500 text-white';
      case 'PENDING':
        return 'bg-yellow-400 text-black';
      case 'DRAFT':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-6 rounded-t-lg">
      {/* Top Row */}
      <div className="flex items-start justify-between mb-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-bold text-2xl">Q</span>
          </div>
          <h1 className="text-3xl font-bold">QuarryLink</h1>
        </div>

        {/* Download Button & Quote Number */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onDownloadPDF}
            variant="secondary"
            className="bg-white text-gray-700 hover:bg-gray-100"
            size="default"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>

          <div className="text-right">
            <div className="text-3xl font-bold">{quoteNumber}</div>
            <div className="text-sm text-purple-200">QUOTATION</div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Info Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-2">
          <div>
            <div className="text-sm text-purple-200">Date Issued</div>
            <div className="text-base font-medium">{dateIssued}</div>
          </div>
          <div>
            <div className="text-sm text-purple-200">Account Manager</div>
            <div className="text-base font-medium">{accountManager}</div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div>
            <div className="text-sm text-purple-200">Valid Until</div>
            <div className="text-base font-medium">{validUntil}</div>
          </div>
          <div>
            <div className="text-sm text-purple-200">Status</div>
            <Badge className={`${getStatusColor()} font-semibold px-3 py-1`}>
              {status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
