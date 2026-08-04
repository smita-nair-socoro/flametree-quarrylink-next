import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { QUOTE_STATUS } from '@/lib/types/quotation-enums';
import { StripeTenantDetailsSnapshot } from '@/lib/types/quotation';
import { getInitials } from '@/lib/utils/user-helper';

export interface QuoteNavbarPdfProps {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  accountManager: string;
  status: QUOTE_STATUS;
  tenantDetails?: StripeTenantDetailsSnapshot;
  logoUrl?: string;
  logoError?: boolean;
}


// Status badge colors mapping - matches BADGE_COLORS in lib/utils
const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return {
        backgroundColor: '#DCFCE7', // green-100
        borderColor: '#166534', // green-900
        color: '#166534',
      };
    case 'DECLINED':
      return {
        backgroundColor: '#FFEDD5', // orange-100
        borderColor: '#9A3412', // orange-800
        color: '#9A3412',
      };
    case 'PENDING':
      return {
        backgroundColor: '#FEF9C3', // yellow-100
        borderColor: '#713F12', // yellow-900
        color: '#713F12',
      };
    case 'DRAFT':
      return {
        backgroundColor: '#F3F4F6', // gray-100
        borderColor: '#1F2937', // gray-800
        color: '#1F2937',
      };
    case 'CONVERTED_TO_JOB':
      return {
        backgroundColor: '#DBEAFE', // blue-100
        borderColor: '#1E3A8A', // blue-900
        color: '#1E3A8A',
      };
    case 'EXPIRED':
      return {
        backgroundColor: '#FEE2E2', // red-100
        borderColor: '#7F1D1D', // red-900
        color: '#7F1D1D',
      };
    case 'ARCHIVED':
      return {
        backgroundColor: '#F3F4F6', // gray-100
        borderColor: '#6B7280', // gray-500
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
  logoUrl,
  logoError = false,
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
            {logoUrl && !logoError ? (
              isQuarryLink ? (
                /* eslint-disable-next-line jsx-a11y/alt-text */
                <Image src={logoUrl} style={styles.logo} />
              ) : (
                <View style={styles.tenantLogoWrapper}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={logoUrl} style={styles.tenantLogo} />
                </View>
              )
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
                  {status.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
