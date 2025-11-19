'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TableBadges, SimplePdfBadge } from '@/components/table-badges';
import { Download, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface QuoteNavbarProps {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  accountManager: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'DRAFT';
  onDownloadPDF?: () => void;
  // TEMPORARY: For testing both PDF export methods
  onDownloadPDFReactPdf?: () => void; // @react-pdf/renderer method
  forPdf?: boolean;
}

export function QuoteNavbar({
  quoteNumber,
  dateIssued,
  validUntil,
  accountManager,
  status,
  onDownloadPDF,
  onDownloadPDFReactPdf, // TEMPORARY: For testing @react-pdf/renderer method
  forPdf = false,
}: QuoteNavbarProps) {
  return (
    <div
      className={`bg-gradient-to-r from-[#8E51FF] to-[#553199] text-white px-8 py-6 ${
        forPdf ? '' : 'rounded-t-lg'
      }`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-6">
        {/* Logo */}
        {onDownloadPDF === undefined ? (
          <div style={{ display: 'inline-block' }}>
            <Image
              src="/quarrylink-logo.png"
              alt="QuarryLink logo"
              width={45}
              height={45}
              style={{
                width: '45px',
                height: '45px',
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: '12px',
              }}
            />
            <h1
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                fontSize: '39px',
                fontWeight: 'bold',
                paddingBottom: '25px',
              }}
            >
              QuarryLink
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Image
              src="/quarrylink-logo.png"
              alt="QuarryLink logo"
              width={45}
              height={45}
              style={{ width: '45px', height: '45px' }}
            />
            <h1 className="text-[39px] font-bold">QuarryLink</h1>
          </div>
        )}

        {/* Download Button & Quote Number */}
        <div className="flex items-center gap-4">
          {/* TEMPORARY: Dropdown to choose between PDF export methods */}
          {/* TODO: Remove this once we decide on the final PDF method */}
          {!forPdf && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-secondary text-sm text-secondary-foreground hover:bg-gray-100"
                  size="default"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onDownloadPDF}>
                  <div className="flex flex-col">
                    <span className="font-medium">HTML2Canvas (New)</span>
                    <span className="text-xs text-muted-foreground">
                      Canvas-based rendering
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownloadPDFReactPdf}>
                  <div className="flex flex-col">
                    <span className="font-medium">React-PDF (Old)</span>
                    <span className="text-xs text-muted-foreground">
                      @react-pdf/renderer method
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="text-right">
            <div
              className={`font-bold ${forPdf ? 'text-[48px]' : 'text-[29px]'}`}
              style={forPdf ? { letterSpacing: '0.5px' } : undefined}
            >
              {quoteNumber}
            </div>
            <div
              className={`text-white ${forPdf ? 'text-xl' : 'text-sm'}`}
              style={forPdf ? { letterSpacing: '1px' } : undefined}
            >
              QUOTATION
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Info Grid */}
      <div className={`grid grid-cols-2 ${forPdf ? 'gap-4' : 'gap-8'}`}>
        {/* Left Column */}
        <div className="space-y-2">
          <div>
            <div
              className={`text-white ${forPdf ? 'text-xl' : 'text-sm'}`}
              style={forPdf ? { letterSpacing: '0.3px' } : undefined}
            >
              Date Issued
            </div>
            <div
              className={`font-medium ${forPdf ? 'text-2xl' : 'text-[15px]'}`}
              style={forPdf ? { letterSpacing: '0.3px' } : undefined}
            >
              {dateIssued}
            </div>
          </div>
          <div>
            <div
              className={`text-white ${forPdf ? 'text-xl' : 'text-sm'}`}
              style={forPdf ? { letterSpacing: '0.3px' } : undefined}
            >
              Account Manager
            </div>
            <div
              className={`font-medium ${forPdf ? 'text-2xl' : 'text-[15px]'}`}
              style={forPdf ? { letterSpacing: '0.3px' } : undefined}
            >
              {accountManager}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div>
            <div
              className={`text-white ${forPdf ? 'text-xl' : 'text-sm'}`}
              style={forPdf ? { letterSpacing: '0.3px' } : undefined}
            >
              Valid Until
            </div>
            <div
              className={`font-medium ${forPdf ? 'text-2xl' : 'text-[15px]'}`}
              style={forPdf ? { letterSpacing: '0.3px' } : undefined}
            >
              {validUntil}
            </div>
          </div>
          <div>
            <div
              className={`text-white ${forPdf ? 'text-xl' : 'text-sm'}`}
              style={forPdf ? { letterSpacing: '0.3px' } : undefined}
            >
              Status
            </div>
            <div className={`${forPdf ? 'mt-2' : ''}`}>
              {forPdf ? (
                <SimplePdfBadge name={status} />
              ) : (
                <TableBadges names={status} visibleCount={1} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
