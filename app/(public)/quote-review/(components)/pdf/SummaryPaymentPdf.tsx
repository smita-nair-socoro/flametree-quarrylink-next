import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { centsToDollars } from '@/lib/utils/currency';

export interface SummaryPaymentPdfProps {
  totalProducts: number;
  totalQuantity: string;
  estimatedDelivery: string;
  termsAndConditions: string[];
  subtotal: number;
  gst: number;
  total: number;
  validUntil: string;
  accountManager: string;
  quoteId: string;
  baseUrl?: string;
}

export const SummaryPaymentPdf: React.FC<SummaryPaymentPdfProps> = ({
  totalProducts,
  totalQuantity,
  estimatedDelivery,
  termsAndConditions,
  subtotal,
  gst,
  total,
}) => {
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.separator} />
      <View style={styles.twoColumn}>
        {/* Left Column - Summary & Terms */}
        <View style={styles.column}>
          {/* Summary Section */}
          <Text style={styles.summaryHeading}>Summary</Text>
          <View style={styles.mb12}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Total Products:</Text>{' '}
              {totalProducts} items
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Total Quantity:</Text>{' '}
              {totalQuantity}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Estimated Delivery:</Text>{' '}
              {estimatedDelivery}
            </Text>
          </View>

          {/* Terms & Conditions */}
          <Text style={styles.termsHeading}>Terms & Conditions</Text>
          <View>
            {termsAndConditions.map((term, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{term}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Column - Payment Card */}
        <View style={[styles.column, styles.paymentColumn]}>
          <View style={styles.paymentCard}>
            {/* Subtotal */}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal (ex-GST):</Text>
              <Text style={styles.paymentValue}>
                ${centsToDollars(subtotal)}
              </Text>
            </View>

            {/* GST */}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>GST (10%):</Text>
              <Text style={styles.paymentValue}>${centsToDollars(gst)}</Text>
            </View>

            {/* Total */}
            <View style={styles.totalSeparator}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL AMOUNT (Incl. GST):</Text>
                <Text style={styles.totalAmount}>${centsToDollars(total)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
