import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import {
  QUOTE_STATUS,
  LOGO_SIZE as LogoSize,
} from '@/lib/types/quotation-enums';
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
  logoSize?: LogoSize;
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
    // ARCHIVED falls back to the same neutral gray as the default case.
    default:
      return {
        backgroundColor: '#F3F4F6',
        borderColor: '#6B7280',
        color: '#6B7280',
      };
  }
};

interface LogoElementParams {
  isQuarryLink: boolean;
  isLargeLogo: boolean;
  logoUrl?: string;
  logoError: boolean;
  initials: string;
}

function renderLogoElement({
  isQuarryLink,
  isLargeLogo,
  logoUrl,
  logoError,
  initials,
}: Readonly<LogoElementParams>) {
  if (!logoUrl || logoError) {
    return (
      <View style={isLargeLogo ? styles.initialsLogoLarge : styles.initialsLogo}>
        <Text style={isLargeLogo ? styles.initialsTextLarge : styles.initialsText}>
          {initials}
        </Text>
      </View>
    );
  }

  if (isQuarryLink) {
    /* eslint-disable-next-line jsx-a11y/alt-text */
    return <Image src={logoUrl} style={isLargeLogo ? styles.tenantLogoLarge : styles.logo} />;
  }

  if (isLargeLogo) {
    // No crop wrapper: width fills half the column, height auto-scales to
    // the source image's aspect ratio.
    /* eslint-disable-next-line jsx-a11y/alt-text */
    return <Image src={logoUrl} style={styles.tenantLogoLarge} />;
  }

  return (
    <View style={styles.tenantLogoWrapper}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={logoUrl} style={styles.tenantLogo} />
    </View>
  );
}

interface HeaderInfoGridProps {
  dateIssued: string;
  accountManager: string;
  validUntil: string;
  status: string;
  statusStyle: { backgroundColor: string; borderColor: string; color: string };
  textColor: string;
}

function HeaderInfoGrid({
  dateIssued,
  accountManager,
  validUntil,
  status,
  statusStyle,
  textColor,
}: Readonly<HeaderInfoGridProps>) {
  return (
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
            <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
              {status.replaceAll('_', ' ')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

interface HeaderContentProps {
  displayName: string;
  quoteNumber: string;
  textColor: string;
  logoElement: React.ReactNode;
  infoGrid: React.ReactNode;
}

function LargeLogoHeader({
  displayName,
  quoteNumber,
  textColor,
  logoElement,
  infoGrid,
}: Readonly<HeaderContentProps>) {
  return (
    <View style={styles.headerTopLarge}>
      {/* Left: Large logo above the business name */}
      <View style={styles.headerLeftLarge}>
        {logoElement}
        <Text style={[styles.brandNameLarge, { color: textColor }]}>{displayName}</Text>
      </View>

      {/* Right: Quote number row, then info grid - both centered and spread
          across the full column height via headerRightLarge so it doesn't
          look sparse next to the taller logo/name column. */}
      <View style={styles.headerRightLarge}>
        <View style={styles.headerRightTopRow}>
          <View style={styles.headerRight}>
            <Text style={[styles.quoteNumber, { color: textColor }]}>{quoteNumber}</Text>
            <Text style={[styles.quotationLabel, { color: textColor }]}>QUOTATION</Text>
          </View>
        </View>
        {infoGrid}
      </View>
    </View>
  );
}

function StandardHeader({
  displayName,
  quoteNumber,
  textColor,
  logoElement,
  infoGrid,
}: Readonly<HeaderContentProps>) {
  return (
    <>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          {logoElement}
          <Text style={[styles.brandName, { color: textColor }]}>{displayName}</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.quoteNumber, { color: textColor }]}>{quoteNumber}</Text>
          <Text style={[styles.quotationLabel, { color: textColor }]}>QUOTATION</Text>
        </View>
      </View>

      {infoGrid}
    </>
  );
}

export const QuoteNavbarPdf: React.FC<QuoteNavbarPdfProps> = ({
  quoteNumber,
  dateIssued,
  validUntil,
  accountManager,
  status,
  tenantDetails,
  logoUrl,
  logoError = false,
  logoSize,
}) => {
  const statusStyle = getStatusBadgeStyle(status);

  // Determine if this is QuarryLink or a custom tenant
  const isQuarryLink = !tenantDetails || tenantDetails.tenantName === 'QuarryLink';
  const displayName = tenantDetails?.businessName || 'QuarryLink';
  const initials = isQuarryLink ? '' : getInitials(displayName);
  // Defaults to the large-logo template when the tenant hasn't been
  // explicitly set to SMALL or MEDIUM.
  const isLargeLogo = logoSize !== LogoSize.SMALL && logoSize !== LogoSize.MEDIUM;

  // Dynamic styles based on tenant
  const headerStyle = isQuarryLink
    ? styles.headerGradient
    : { ...styles.headerGradient, backgroundColor: '#e4e4e4' };
  const textColor = isQuarryLink ? '#FFFFFF' : '#000000';

  const logoElement = renderLogoElement({
    isQuarryLink,
    isLargeLogo,
    logoUrl,
    logoError,
    initials,
  });

  const infoGrid = (
    <HeaderInfoGrid
      dateIssued={dateIssued}
      accountManager={accountManager}
      validUntil={validUntil}
      status={status}
      statusStyle={statusStyle}
      textColor={textColor}
    />
  );

  const HeaderContent = isLargeLogo ? LargeLogoHeader : StandardHeader;

  return (
    <View style={isLargeLogo ? styles.headerLarge : styles.header} fixed>
      <View style={headerStyle}>
        <HeaderContent
          displayName={displayName}
          quoteNumber={quoteNumber}
          textColor={textColor}
          logoElement={logoElement}
          infoGrid={infoGrid}
        />
      </View>
    </View>
  );
};
