'use client';

import * as React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import { CashSaleDetail } from '@/lib/types/payments';
import { centsToDollars } from '@/lib/utils/currency';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  muted: { color: '#64748b' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 4, marginTop: 16 },
  col: { flex: 1 },
});

function CashSaleReceiptPdfDocument({
  receipt,
  currencySymbol,
}: {
  receipt: CashSaleDetail;
  currencySymbol: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Cash Sale Receipt {receipt.reference}</Text>
        {receipt.voided ? <Text>VOID</Text> : null}
        <View style={styles.row}>
          <Text>Job</Text>
          <Text>{receipt.jobNumber ?? '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text>Customer</Text>
          <Text>{receipt.customerName ?? '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text>Payment type</Text>
          <Text>{receipt.paymentType}</Text>
        </View>
        <View style={styles.row}>
          <Text>Received by</Text>
          <Text>{receipt.paymentReceivedBy ?? '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text>Recorded date</Text>
          <Text>{receipt.recordedAt ?? '—'}</Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.col}>Docket</Text>
          <Text style={styles.col}>Type</Text>
          <Text style={styles.col}>Product</Text>
          <Text style={styles.col}>Amount</Text>
        </View>
        {receipt.dockets.map((line) => (
          <View key={line.docketId} style={styles.row}>
            <Text style={styles.col}>{line.docketNumber}</Text>
            <Text style={styles.col}>{line.docketType}</Text>
            <Text style={styles.col}>{line.productName ?? '—'}</Text>
            <Text style={styles.col}>
              {currencySymbol}
              {centsToDollars(line.amount ?? 0)}
            </Text>
          </View>
        ))}
        <View style={[styles.row, { marginTop: 12 }]}>
          <Text>Total</Text>
          <Text>
            {currencySymbol}
            {centsToDollars(receipt.amount ?? 0)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadCashSaleReceiptPdf(
  receipt: CashSaleDetail,
  currencySymbol: string,
) {
  const blob = await pdf(
    <CashSaleReceiptPdfDocument
      receipt={receipt}
      currencySymbol={currencySymbol}
    />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${receipt.reference}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
