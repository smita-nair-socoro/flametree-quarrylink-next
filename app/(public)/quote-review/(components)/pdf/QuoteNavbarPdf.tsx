import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { QUOTE_STATUS } from '@/lib/types/quotation-enums';
import { StripeTenantDetailsSnapshot } from '@/lib/types/quotation';

export interface QuoteNavbarPdfProps {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  accountManager: string;
  status: QUOTE_STATUS;
  tenantDetails?: StripeTenantDetailsSnapshot;
}

// Helper function to get initials from tenant name
const getInitials = (tenantName: string): string => {
  return tenantName
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};

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
  tenantDetails,
}) => {
  const statusStyle = getStatusBadgeStyle(status);

  // Determine if this is QuarryLink or a custom tenant
  const isQuarryLink = !tenantDetails || tenantDetails.tenantName === 'QuarryLink';
  const displayName = tenantDetails?.businessName || 'QuarryLink';
  const initials = isQuarryLink ? '' : getInitials(displayName);

  // Dynamic styles based on tenant
  const headerStyle = isQuarryLink
    ? styles.headerGradient
    : { ...styles.headerGradient, backgroundColor: '#e4e4e4' };
  const textColor = isQuarryLink ? '#FFFFFF' : '#000000';

  return (
    <View style={styles.header} fixed>
      <View style={headerStyle}>
        {/* Top Row: Logo and Quote Number */}
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            {isQuarryLink ? (
              <>
                {/* react-pdf/renderer's Image component doesn't support alt attribute */}
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image
                  src="/quarrylink-logo.png"
                  style={styles.logo}
                />
              </>
            ) : (
              <View style={styles.initialsLogo}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            )}
            <Text style={[styles.brandName, { color: textColor }]}>{displayName}</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={[styles.quoteNumber, { color: textColor }]}>{quoteNumber}</Text>
            <Text style={[styles.quotationLabel, { color: textColor }]}>QUOTATION</Text>
          </View>
        </View>

        {/* Bottom Row: Info Grid */}
        <View style={styles.headerInfo}>
          {/* Left Column */}
          <View style={styles.headerColumn}>
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.headerLabel, { color: textColor }]}>Date Issued</Text>
              <Text style={[styles.headerValue, { color: textColor }]}>{dateIssued}</Text>
            </View>
            <View>
              <Text style={[styles.headerLabel, { color: textColor }]}>Account Manager</Text>
              <Text style={[styles.headerValue, { color: textColor }]}>{accountManager}</Text>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.headerColumn}>
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.headerLabel, { color: textColor }]}>Valid Until</Text>
              <Text style={[styles.headerValue, { color: textColor }]}>{validUntil}</Text>
            </View>
            <View>
              <Text style={[styles.headerLabel, { color: textColor }]}>Status</Text>
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
