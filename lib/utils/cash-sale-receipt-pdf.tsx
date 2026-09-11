'use client';

import * as React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import { CashSaleDetail } from '@/lib/types/payments';
import { centsToDollars } from '@/lib/utils/currency';
import { formatLocalDate } from '@/lib/utils/date';
import {
  colors,
  docketPdfStyles as styles,
} from '@/app/(protected)/customer-operations/dockets/(components)/pdf/styles';

function CashSaleReceiptPdfDocument({
  receipt,
  currencySymbol,
  tenantName,
}: {
  receipt: CashSaleDetail;
  currencySymbol: string;
  tenantName: string;
}) {
  const recordedLabel = receipt.recordedAt
    ? formatLocalDate(receipt.recordedAt)
    : '—';
  const paidLines = receipt.paidLineItems ?? [];
  const showPaidLines = paidLines.length > 0;
  const showSurcharge = (receipt.surchargeAmount ?? 0) > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.tenantName}>{tenantName || '—'}</Text>
            <Text style={styles.docTitle}>Cash Sale Receipt</Text>
          </View>
          <View>
            <Text style={styles.docketNumber}>{receipt.reference}</Text>
            <Text style={styles.docketDate}>Date: {recordedLabel}</Text>
          </View>
        </View>

        {receipt.voided ? (
          <View style={[styles.section, { marginBottom: 12 }]}>
            <Text style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: 12 }}>
              VOID
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Customer and payment</Text>
          <View style={styles.jobBox}>
            <Text style={styles.jobNumber}>
              {receipt.customerName || '—'}
            </Text>
            <Text style={styles.jobProject}>
              Job {receipt.jobNumber || '—'}
            </Text>
          </View>
          <View style={[styles.twoColumn, { marginTop: 12 }]}>
            <View style={styles.column}>
              <Text style={styles.label}>Payment type</Text>
              <Text style={styles.value}>{receipt.paymentType || '—'}</Text>
              <Text style={[styles.label, { marginTop: 8 }]}>
                Payment received by
              </Text>
              <Text style={styles.value}>
                {receipt.paymentReceivedBy || '—'}
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Recorded date</Text>
              <Text style={styles.value}>{recordedLabel}</Text>
              <Text style={[styles.label, { marginTop: 8 }]}>
                Total amount received
              </Text>
              <Text style={styles.value}>
                {currencySymbol}
                {centsToDollars(receipt.amount ?? 0)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {(receipt.paidLineItems?.length ?? 0) > 0
              ? `Paid line items (${receipt.paidLineItems?.length ?? 0})`
              : `Included dockets (${receipt.dockets?.length ?? 0})`}
          </Text>
          {showPaidLines ? (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray300,
                  paddingBottom: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ flex: 2, fontWeight: 'bold' }}>Product</Text>
                <Text style={{ flex: 0.7, fontWeight: 'bold' }}>Qty</Text>
                <Text style={{ flex: 0.8, fontWeight: 'bold' }}>Rate</Text>
                <Text
                  style={{ flex: 0.9, fontWeight: 'bold', textAlign: 'right' }}
                >
                  Amount
                </Text>
              </View>
              {paidLines.map((line, index) => (
                <View
                  key={`${line.sourceLineItemId ?? index}-${line.productName}`}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.gray200,
                  }}
                >
                  <Text style={{ flex: 2 }}>{line.productName}</Text>
                  <Text style={{ flex: 0.7 }}>
                    {line.quantity != null
                      ? `${line.quantity}${line.uom ? ` ${line.uom}` : ''}`
                      : '—'}
                  </Text>
                  <Text style={{ flex: 0.8 }}>
                    {currencySymbol}
                    {centsToDollars(line.unitPrice ?? 0)}
                  </Text>
                  <Text style={{ flex: 0.9, textAlign: 'right' }}>
                    {currencySymbol}
                    {centsToDollars(line.lineTotal ?? 0)}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <>
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: colors.gray300,
              paddingBottom: 6,
              marginBottom: 6,
            }}
          >
            <Text style={{ flex: 1.2, fontWeight: 'bold' }}>Docket</Text>
            <Text style={{ flex: 0.9, fontWeight: 'bold' }}>Type</Text>
            <Text style={{ flex: 1.4, fontWeight: 'bold' }}>Product</Text>
            <Text style={{ flex: 0.7, fontWeight: 'bold' }}>Qty</Text>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>Date</Text>
            <Text
              style={{ flex: 0.9, fontWeight: 'bold', textAlign: 'right' }}
            >
              Amount
            </Text>
          </View>
          {(receipt.dockets ?? []).map((line) => (
            <View
              key={line.docketId}
              style={{
                flexDirection: 'row',
                paddingVertical: 4,
                borderBottomWidth: 1,
                borderBottomColor: colors.gray200,
              }}
            >
              <Text style={{ flex: 1.2 }}>{line.docketNumber}</Text>
              <Text style={{ flex: 0.9 }}>{line.docketType || '—'}</Text>
              <Text style={{ flex: 1.4 }}>{line.productName || '—'}</Text>
              <Text style={{ flex: 0.7 }}>
                {line.quantity != null ? String(line.quantity) : '—'}
              </Text>
              <Text style={{ flex: 1 }}>
                {line.deliveryDate
                  ? formatLocalDate(line.deliveryDate)
                  : '—'}
              </Text>
              <Text style={{ flex: 0.9, textAlign: 'right' }}>
                {currencySymbol}
                {centsToDollars(line.amount ?? 0)}
              </Text>
            </View>
          ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Financial summary</Text>
          {showSurcharge ? (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingBottom: 6,
                }}
              >
                <Text>Material total</Text>
                <Text>
                  {currencySymbol}
                  {centsToDollars(receipt.materialAmount ?? 0)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingBottom: 6,
                }}
              >
                <Text>Credit Card surcharge (3.75%)</Text>
                <Text>
                  {currencySymbol}
                  {centsToDollars(receipt.surchargeAmount ?? 0)}
                </Text>
              </View>
            </>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: colors.gray100,
              borderRadius: 6,
              padding: 10,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>Total received</Text>
            <Text style={{ fontWeight: 'bold' }}>
              {currencySymbol}
              {centsToDollars(receipt.amount ?? 0)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadCashSaleReceiptPdf(
  receipt: CashSaleDetail,
  currencySymbol: string,
  tenantName?: string,
) {
  const blob = await pdf(
    <CashSaleReceiptPdfDocument
      receipt={receipt}
      currencySymbol={currencySymbol}
      tenantName={tenantName || '—'}
    />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${receipt.reference}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
