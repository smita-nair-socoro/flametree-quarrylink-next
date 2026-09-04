import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { centsToDollars, formatDollars } from '@/lib/utils/currency';
import { QuoteCurrencyTax } from '@/lib/types/quotation';

export interface SummaryPaymentPdfProps {
  totalProducts: number;
  estimatedDelivery: string;
  subtotal: number;
  gst: number;
  total: number;
  currencyTax: QuoteCurrencyTax;
  validUntil: string;
  quoteId: string;
  baseUrl?: string;
  includeDeliveryPrices?: boolean;
  productSubtotal?: number;
  deliverySubtotal?: number;
  showDigitalPlatformFee?: boolean;
  digitalPlatformFeeLabel?: string;
  digitalPlatformFeeAmount?: number;
}

export const SummaryPaymentPdf: React.FC<SummaryPaymentPdfProps> = ({
  totalProducts,
  estimatedDelivery,
  subtotal,
  gst,
  total,
  currencyTax,
  includeDeliveryPrices = false,
  productSubtotal,
  deliverySubtotal,
  showDigitalPlatformFee = false,
  digitalPlatformFeeLabel = 'digital platform fee',
  digitalPlatformFeeAmount = 0,
}) => {
  const { currencySymbol, taxLabel, taxRateLabel, exTaxLabel } = currencyTax;
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.separator} />
      {showDigitalPlatformFee && (
        <View style={styles.feeNoticeBanner}>
          <Text style={styles.feeNoticeText}>
            Please note: A {digitalPlatformFeeLabel} of {currencySymbol}
            {formatDollars(digitalPlatformFeeAmount)} applies per docket.
          </Text>
        </View>
      )}
      <View style={styles.twoColumn}>
        {/* Left Column - Summary */}
        <View style={[styles.column, { justifyContent: 'center' }]}>
          {/* Summary Section */}
          <Text style={styles.summaryHeading}>Summary</Text>
          <View style={styles.mb12}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Total Products:</Text>{' '}
              {totalProducts} items
            </Text>
            {estimatedDelivery && (
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Estimated Date:</Text>{' '}
                {estimatedDelivery}
              </Text>
            )}
          </View>
        </View>

        {/* Right Column - Payment Card */}
        <View style={[styles.column, styles.paymentColumn]}>
          <View style={styles.paymentCard}>
            {includeDeliveryPrices ? (
              <>
                {/* Product Subtotal */}
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Product Subtotal:</Text>
                  <Text style={styles.paymentValue}>
                    {currencySymbol}
                    {centsToDollars(productSubtotal || 0)}
                  </Text>
                </View>

                {/* Delivery Subtotal */}
                <View style={styles.paymentRow}>
                  <Text style={styles.deliverySubtotalLabel}>
                    Delivery Subtotal:
                  </Text>
                  <Text style={styles.deliverySubtotalValue}>
                    {currencySymbol}
                    {centsToDollars(deliverySubtotal || 0)}
                  </Text>
                </View>

                {/* GST */}
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>{taxRateLabel}:</Text>
                  <Text style={styles.paymentValue}>
                    {currencySymbol}
                    {centsToDollars(gst)}
                  </Text>
                </View>

                {/* Total */}
                <View style={styles.totalSeparator}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
                    <Text style={styles.totalAmount}>
                      {currencySymbol}
                      {centsToDollars(total)}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Subtotal */}
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Subtotal {exTaxLabel}:</Text>
                  <Text style={styles.paymentValue}>
                    {currencySymbol}
                    {centsToDollars(subtotal)}
                  </Text>
                </View>

                {/* GST */}
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>{taxRateLabel}:</Text>
                  <Text style={styles.paymentValue}>
                    {currencySymbol}
                    {centsToDollars(gst)}
                  </Text>
                </View>

                {/* Total */}
                <View style={styles.totalSeparator}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      TOTAL AMOUNT (Incl. {taxLabel}):
                    </Text>
                    <Text style={styles.totalAmount}>
                      {currencySymbol}
                      {centsToDollars(total)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
