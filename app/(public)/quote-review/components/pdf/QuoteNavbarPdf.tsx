import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';

export interface QuoteNavbarPdfProps {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  accountManager: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'DRAFT';
}

// Status badge colors mapping
const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return {
        backgroundColor: '#DCFCE7',
        borderColor: '#16A34A',
        color: '#16A34A',
      };
    case 'DECLINED':
      return {
        backgroundColor: '#FEE2E2',
        borderColor: '#DC2626',
        color: '#DC2626',
      };
    case 'PENDING':
      return {
        backgroundColor: '#FEF9C3',
        borderColor: '#854D0E',
        color: '#854D0E',
      };
    case 'DRAFT':
      return {
        backgroundColor: '#F3F4F6',
        borderColor: '#6B7280',
        color: '#6B7280',
      };
    default:
      return {
        backgroundColor: '#F3F4F6',
        borderColor: '#6B7280',
        color: '#6B7280',
      };
  }
};

export const QuoteNavbarPdf: React.FC<QuoteNavbarPdfProps> = ({
  quoteNumber,
  dateIssued,
  validUntil,
  accountManager,
  status,
}) => {
  const statusStyle = getStatusBadgeStyle(status);

  return (
    <View style={styles.header} fixed>
      <View style={styles.headerGradient}>
        {/* Top Row: Logo and Quote Number */}
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            {/* react-pdf/renderer's Image component doesn't support alt attribute */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src="/quarrylink-logo.png"
              style={styles.logo}
            />
            <Text style={styles.brandName}>QuarryLink</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.quoteNumber}>{quoteNumber}</Text>
            <Text style={styles.quotationLabel}>QUOTATION</Text>
          </View>
        </View>

        {/* Bottom Row: Info Grid */}
        <View style={styles.headerInfo}>
          {/* Left Column */}
          <View style={styles.headerColumn}>
            <View>
              <Text style={styles.headerLabel}>Date Issued</Text>
              <Text style={styles.headerValue}>{dateIssued}</Text>
            </View>
            <View>
              <Text style={styles.headerLabel}>Account Manager</Text>
              <Text style={styles.headerValue}>{accountManager}</Text>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.headerColumn}>
            <View>
              <Text style={styles.headerLabel}>Valid Until</Text>
              <Text style={styles.headerValue}>{validUntil}</Text>
            </View>
            <View>
              <Text style={styles.headerLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusStyle.backgroundColor,
                    borderColor: statusStyle.borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: statusStyle.color },
                  ]}
                >
                  {status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
