'use client';

import { useMemo, useState } from 'react';
import type { Quotation, QuotationLineItem } from '@/lib/types/quotation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Check, X } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';

type QuoteReviewDocumentProps = {
  quoteId: string;
  payloadParam?: string;
};

const parsePayload = (encodedPayload?: string): Quotation | null => {
  if (!encodedPayload) return null;
  try {
    const decoded = decodeURIComponent(encodedPayload);
    return JSON.parse(decoded) as Quotation;
  } catch (error) {
    console.error('Failed to parse quotation payload:', error);
    return null;
  }
};

const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function QuoteReviewDocument({
  quoteId,
  payloadParam,
}: QuoteReviewDocumentProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);

  const quotation = useMemo(
    () => parsePayload(payloadParam),
    [payloadParam]
  );

  if (!quotation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Quotation Not Found
          </h2>
          <p className="text-gray-600">
            Unable to load quotation #{quoteId}
          </p>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleApprove = () => {
    console.log('Approve quotation:', quoteId);
    // TODO: Implement backend API call
    setApproveDialogOpen(false);
  };

  const handleDecline = () => {
    console.log('Decline quotation:', quoteId);
    // TODO: Implement backend API call
    setDeclineDialogOpen(false);
  };

  const totalWithGST = quotation.total_sell_price * 1.1;

  return (
    <>
      {/* Approve Dialog */}
      <ActionDialog
        open={approveDialogOpen}
        onOpenChangeAction={setApproveDialogOpen}
        title="Approve Quote"
        description={
          <div>
            <p className="mb-4">
              Are you sure you want to approve quote{' '}
              <strong>{quotation.quote_number}</strong>?
            </p>
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">
                Once approved, we'll begin processing your order and contact you
                with the next steps.
              </p>
            </div>
          </div>
        }
        confirmText="Approve Quote"
        confirmVariant="default"
        confirmCustomColor="#22C55E"
        confirmIcon={<Check className="h-4 w-4" />}
        onConfirmAction={handleApprove}
      />

      {/* Decline Dialog */}
      <ActionDialog
        open={declineDialogOpen}
        onOpenChangeAction={setDeclineDialogOpen}
        title="Decline Quote"
        description={
          <div>
            <p className="mb-4">
              Are you sure you want to decline quote{' '}
              <strong>{quotation.quote_number}</strong>?
            </p>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">
                This quote will be marked as declined. You can contact us if you
                change your mind.
              </p>
            </div>
          </div>
        }
        confirmText="Decline Quote"
        confirmVariant="destructive"
        confirmIcon={<X className="h-4 w-4" />}
        onConfirmAction={handleDecline}
      />

      {/* Main Document */}
      <div className="min-h-screen bg-gray-50">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-[984px] mx-auto px-8 py-6 flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-1">Quarry Link</h1>
              <p className="text-orange-100 text-sm">
                Professional Quarry Solutions
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              variant="secondary"
              className="bg-white/95 hover:bg-white text-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <div className="max-w-[984px] mx-auto px-8 py-8">
          {/* Quote Number and Status */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  QUOTATION {quotation.quote_number}
                </h2>
                <p className="text-gray-600">
                  Created on {formatDate(quotation.created_at)}
                </p>
              </div>
              <Badge
                variant={
                  quotation.status === 'APPROVED'
                    ? 'default'
                    : quotation.status === 'PENDING'
                    ? 'secondary'
                    : 'outline'
                }
                className="text-sm px-4 py-2"
              >
                {quotation.status}
              </Badge>
            </div>
          </div>

          {/* Customer Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">
                    {quotation.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">
                    {quotation.customer_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Name</p>
                  <p className="font-semibold text-gray-900">
                    {quotation.project_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Account Manager</p>
                  <p className="font-semibold text-gray-900">
                    {quotation.account_manager_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quote Type</p>
                  <p className="font-semibold text-gray-900">
                    {quotation.quote_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(quotation.expiry_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Quote Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Product</TableHead>
                      <TableHead>Quarry</TableHead>
                      <TableHead className="text-right">Product Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Truck Qty</TableHead>
                      <TableHead className="text-right">Loads</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.line_items && quotation.line_items.length > 0 ? (
                      quotation.line_items.map((item: QuotationLineItem) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-semibold">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.supplier_product_name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.quarry_name}</TableCell>
                          <TableCell className="text-right">
                            {item.product_sell_qty} {item.product_sell_uom}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.product_sell_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.truck_sell_qty} {item.truck_sell_uom}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.required_loads}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(
                              item.total_product_sell_price +
                                item.total_truck_sell_price
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-gray-500 py-8"
                        >
                          No line items available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div></div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal (ex GST)</span>
                    <span className="font-semibold">
                      {formatCurrency(quotation.total_sell_price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>GST (10%)</span>
                    <span className="font-semibold">
                      {formatCurrency(quotation.total_sell_price * 0.1)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total (inc GST)</span>
                    <span>{formatCurrency(totalWithGST)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <Button
              onClick={() => setApproveDialogOpen(true)}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              <Check className="h-5 w-5 mr-2" />
              Approve Quote
            </Button>
            <Button
              onClick={() => setDeclineDialogOpen(true)}
              size="lg"
              variant="destructive"
              className="px-8"
            >
              <X className="h-5 w-5 mr-2" />
              Decline Quote
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-12">
            <Separator className="mb-6" />
            <p className="mb-2">
              If you have any questions about this quotation, please contact
              your account manager.
            </p>
            <p className="font-semibold text-orange-600">
              www.quarrylink.com.au
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
