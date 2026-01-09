import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';

export interface CustomerInfoPdfProps {
  customerName: string;
  email: string;
  phone: string;
  billingAddress: {
    line1: string;
    line2: string;
    line3: string;
  };
}

export const CustomerInfoPdf: React.FC<CustomerInfoPdfProps> = ({
  customerName,
  email,
  phone,
  billingAddress,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Customer Information</Text>

      <View style={styles.twoColumn}>
        {/* Left Column - Customer Details */}
        <View style={styles.column}>
          <Text style={styles.label}>Customer</Text>
          <Text style={styles.value}>{customerName}</Text>
          <Text style={styles.valueSmall}>{email}</Text>
          <Text style={styles.valueSmall}>Phone: {phone}</Text>
        </View>

        {/* Right Column - Billing Address */}
        <View style={styles.column}>
          <Text style={styles.label}>Billing Address</Text>
          <Text style={styles.valueSmall}>{billingAddress.line1}</Text>
          <Text style={styles.valueSmall}>{billingAddress.line2}</Text>
          <Text style={styles.valueSmall}>{billingAddress.line3}</Text>
        </View>
      </View>
      <View style={styles.separator} />
    </View>
  );
};
