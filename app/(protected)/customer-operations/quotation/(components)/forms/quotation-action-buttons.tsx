'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy,
  Send,
  CheckCircle,
  MoreHorizontal,
  Trash2,
  Download,
  Eye,
  Share2,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface QuotationActionButtonsProps {
  /** The quotation ID */
  quotationId: number | string;
  /** Whether the quote is already approved */
  isApproved?: boolean;
}

export function QuotationActionButtons({
  quotationId,
  isApproved = false,
}: QuotationActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Don't render anything if quotationId is invalid
  if (!quotationId || quotationId === 0) {
    return null;
  }

  const handleDuplicate = () => {
    console.log('Duplicate quotation:', quotationId);
  };

  const handleSendToCustomer = () => {
    console.log('Send to customer:', quotationId);
  };

  const handleApproveQuote = () => {
    console.log('Approve quotation:', quotationId);
  };

  const handleView = () => {
    console.log('View quotation:', quotationId);
  };

  const handleDownload = () => {
    console.log('Download quotation:', quotationId);
  };

  const handleShare = () => {
    console.log('Share quotation:', quotationId);
  };

  const handleDelete = () => {
    console.log('Delete quotation:', quotationId);
  };

  // Mobile version - everything in dropdown
  if (!isDesktop) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendToCustomer}>
            <Send className="h-4 w-4 mr-2" />
            Send to Customer
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleApproveQuote}
            className={isApproved ? 'text-green-600' : ''}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isApproved ? 'Approved' : 'Approve Quote'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Quote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Desktop version - toggle group layout
  return (
    <div className="inline-flex h-8 items-center justify-center rounded-md bg-background p-1 text-muted-foreground border">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDuplicate}
        className="h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
      >
        <Copy className="h-3.5 w-3.5 mr-1.5" />
        Duplicate
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSendToCustomer}
        className="h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
      >
        <Send className="h-3.5 w-3.5 mr-1.5" />
        Send to Customer
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleApproveQuote}
        className={`h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground ${
          isApproved ? 'text-green-600 hover:text-green-700' : ''
        }`}
      >
        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
        {isApproved ? 'Approved' : 'Approve Quote'}
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Quote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
