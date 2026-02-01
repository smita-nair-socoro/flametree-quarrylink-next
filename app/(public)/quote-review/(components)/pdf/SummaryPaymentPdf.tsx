import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { centsToDollars } from '@/lib/utils/currency';

export interface SummaryPaymentPdfProps {
  totalProducts: number;
  estimatedDelivery: string;
  subtotal: number;
  gst: number;
  total: number;
  validUntil: string;
  accountManager: string;
  quoteId: string;
  baseUrl?: string;
  includeDeliveryPrices?: boolean;
  productSubtotal?: number;
  deliverySubtotal?: number;
}

export const SummaryPaymentPdf: React.FC<SummaryPaymentPdfProps> = ({
  totalProducts,
  estimatedDelivery,
  subtotal,
  gst,
  total,
  includeDeliveryPrices = false,
  productSubtotal,
  deliverySubtotal,
}) => {
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.separator} />
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
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Estimated Delivery:</Text>{' '}
              {estimatedDelivery}
            </Text>
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
                    ${centsToDollars(productSubtotal || 0)}
                  </Text>
                </View>

                {/* Delivery Subtotal */}
                <View style={styles.paymentRow}>
                  <Text style={styles.deliverySubtotalLabel}>
                    Delivery Subtotal:
                  </Text>
                  <Text style={styles.deliverySubtotalValue}>
                    ${centsToDollars(deliverySubtotal || 0)}
                  </Text>
                </View>

                {/* GST */}
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>GST (10%):</Text>
                  <Text style={styles.paymentValue}>
                    ${centsToDollars(gst)}
                  </Text>
                </View>

                {/* Total */}
                <View style={styles.totalSeparator}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
                    <Text style={styles.totalAmount}>
                      ${centsToDollars(total)}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
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
                  <Text style={styles.paymentValue}>
                    ${centsToDollars(gst)}
                  </Text>
                </View>

                {/* Total */}
                <View style={styles.totalSeparator}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      TOTAL AMOUNT (Incl. GST):
                    </Text>
                    <Text style={styles.totalAmount}>
                      ${centsToDollars(total)}
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
