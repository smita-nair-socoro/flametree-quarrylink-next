import { StyleSheet } from '@react-pdf/renderer';

// Brand colors matching the web design
export const colors = {
  // Primary brand colors
  purple: '#8E51FF',
  purpleDark: '#553199',
  purpleLight: '#9F6FFF',

  // Status colors
  green: '#008236',
  greenLight: '#00A63E',
  greenBg: '#F0FDF4',
  greenBorder: '#B9F8CF',
  red: '#E7000B',
  redBg: '#FFE2E2',
  redBorder: '#FB2C36',
  yellow: '#FEF9C3',
  yellowDark: '#854D0E',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',

  // Neutral colors
  darkBlue: '#314158',
  gray900: '#0A0A0A',
  gray800: '#101828',
  gray700: '#364153',
  gray600: '#6A7282',
  gray500: '#737373',
  gray400: '#B9B9B9',
  gray300: '#E5E5E5',
  gray200: '#F5F5F5',
  gray100: '#FAFAFA',
  white: '#FFFFFF',
  black: '#0F172A',
};

// Font sizes
const fontSize = {
  xs: 8,
  sm: 10,
  base: 12,
  lg: 14,
  xl: 16,
  '2xl': 18,
  '3xl': 20,
  '4xl': 24,
  '5xl': 28,
};

// Create PDF styles
export const pdfStyles = StyleSheet.create({
  // Page layout
  page: {
    fontSize: fontSize.sm,
    paddingTop: 130,
    paddingBottom: 90,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },

  // Fixed header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },

  headerGradient: {
    backgroundColor: colors.purple,
    padding: 20,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },

  brandName: {
    fontSize: fontSize['4xl'],
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },

  headerRight: {
    alignItems: 'flex-end',
  },

  quoteNumber: {
    fontSize: fontSize['3xl'],
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },

  quotationLabel: {
    fontSize: fontSize.sm,
    color: colors.white,
    marginTop: 2,
  },

  headerInfo: {
    flexDirection: 'row',
  },

  headerColumn: {
    flex: 1,
    paddingRight: 20,
  },

  headerLabel: {
    fontSize: fontSize.sm,
    color: colors.white,
  },

  headerValue: {
    fontSize: fontSize.base,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },

  // Status badge in header
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  statusBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: 'Helvetica-Bold',
  },

  // Fixed footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },

  footerBg: {
    backgroundColor: colors.darkBlue,
    padding: 20,
  },

  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  footerColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  footerHeading: {
    fontSize: fontSize.base,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    marginBottom: 6,
    textAlign: 'center',
  },

  footerText: {
    fontSize: fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },

  footerLink: {
    fontSize: fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    textDecoration: 'none',
  },

  // Main content area
  content: {
    flexGrow: 1,
  },

  // Section styles
  section: {
    marginBottom: 16,
  },

  sectionHeading: {
    fontSize: fontSize.lg,
    fontFamily: 'Helvetica-Bold',
    color: colors.purple,
    marginBottom: 8,
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    marginBottom: 12,
  },

  separatorPurple: {
    borderBottomWidth: 3,
    borderBottomColor: colors.purple,
    marginTop: 16,
    marginBottom: 16,
  },

  // Status banner
  statusBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 16,
    flexDirection: 'row',
  },

  statusBannerGreen: {
    backgroundColor: colors.greenBg,
    borderColor: colors.greenBorder,
  },

  statusBannerRed: {
    backgroundColor: colors.redBg,
    borderColor: colors.redBorder,
  },

  statusBannerHeading: {
    fontSize: fontSize.lg,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },

  statusBannerText: {
    fontSize: fontSize.sm,
    lineHeight: 1.4,
  },

  // Grid layouts
  twoColumn: {
    flexDirection: 'row',
    gap: 48,
  },

  column: {
    flex: 1,
  },

  fourColumn: {
    flexDirection: 'row',
    gap: 24,
  },

  quarterColumn: {
    flex: 1,
  },

  // Typography
  label: {
    fontSize: fontSize.sm,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray700,
    marginBottom: 6,
  },

  value: {
    fontSize: fontSize.base,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray900,
    marginBottom: 4,
  },

  valueSmall: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: 2,
  },

  // Badge (for DELIVERY/COLLECTION)
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },

  badgeDelivery: {
    backgroundColor: colors.blueLight,
    borderColor: colors.blue,
  },

  badgeCollection: {
    backgroundColor: '#FED7AA',
    borderColor: '#EA580C',
  },

  badgeText: {
    fontSize: fontSize.xs,
    fontFamily: 'Helvetica-Bold',
  },

  badgeTextDelivery: {
    color: colors.blue,
  },

  badgeTextCollection: {
    color: '#EA580C',
  },

  // Table styles
  table: {
    width: '100%',
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.gray300,
    paddingBottom: 8,
    marginBottom: 8,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingVertical: 10,
  },

  tableHeaderText: {
    fontSize: fontSize.sm,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray700,
  },

  // Table columns - Products table
  colProduct: {
    width: '35%',
    paddingRight: 8,
  },

  colTruck: {
    width: '30%',
    paddingRight: 8,
  },

  colQty: {
    width: '15%',
    paddingRight: 8,
  },

  colPrice: {
    width: '20%',
    textAlign: 'right',
  },

  productName: {
    fontSize: fontSize.sm,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray900,
    marginBottom: 2,
  },

  productCode: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },

  truckType: {
    fontSize: fontSize.sm,
    color: colors.gray900,
    marginBottom: 2,
  },

  capacity: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },

  quantity: {
    fontSize: fontSize.sm,
    color: colors.gray900,
  },

  price: {
    fontSize: fontSize.sm,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray900,
  },

  // Summary section
  summaryHeading: {
    fontSize: fontSize.base,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray900,
    marginBottom: 12,
  },

  summaryText: {
    fontSize: fontSize.sm,
    color: colors.gray900,
    marginBottom: 6,
  },

  summaryLabel: {
    fontFamily: 'Helvetica-Bold',
  },

  // Terms list
  termsHeading: {
    fontSize: fontSize.base,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray900,
    marginTop: 16,
    marginBottom: 8,
  },

  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  bullet: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    marginRight: 6,
  },

  bulletText: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    flex: 1,
  },

  // Payment card
  paymentCard: {
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.white,
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  paymentLabel: {
    fontSize: fontSize.base,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray900,
  },

  paymentValue: {
    fontSize: fontSize.base,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray900,
  },

  paymentSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    marginVertical: 8,
  },

  totalSeparator: {
    borderTopWidth: 2,
    borderTopColor: colors.purple,
    paddingTop: 12,
    marginTop: 8,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: fontSize.lg,
    fontFamily: 'Helvetica-Bold',
    color: colors.purple,
  },

  totalAmount: {
    fontSize: fontSize.lg,
    fontFamily: 'Helvetica-Bold',
    color: colors.purple,
  },

  // Utility styles
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
});
