import { StyleSheet, Font } from '@react-pdf/renderer';

// Register Geist font
Font.register({
  family: 'Geist',
  src: '/fonts/Geist.ttf',
});

// Brand colors matching the web design
export const colors = {
  // Primary brand colors
  purple: '#5C34A5',
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
  blue: '#2B7FFF',

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
    paddingTop: 172,
    paddingBottom: 90,
    paddingHorizontal: 40,
    fontFamily: 'Geist',
    backgroundColor: colors.white,
  },

  // Fixed header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  headerGradient: {
    backgroundColor: colors.purple,
    paddingVertical: 14,
    paddingHorizontal: 40,
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
    width: 30,
    height: 30,
    marginRight: 8,
  },

  initialsLogo: {
    width: 30,
    height: 30,
    marginRight: 8,
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.black,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },

  initialsText: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
  },

  brandName: {
    fontSize: fontSize.xl,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.white,
  },

  headerRight: {
    alignItems: 'flex-end',
  },

  quoteNumber: {
    fontSize: fontSize.lg,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.white,
  },

  quotationLabel: {
    fontSize: fontSize.xs,
    color: colors.white,
    marginTop: 2,
  },

  headerInfo: {
    flexDirection: 'row',
  },

  headerColumn: {
    flex: 1,
    paddingRight: 30,
  },

  headerLabel: {
    fontSize: fontSize.xs,
    color: colors.white,
    marginBottom: 4,
    lineHeight: 1.4,
  },

  headerValue: {
    fontSize: 11,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 1.4,
  },

  // Status badge in header
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Fixed footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  footerBg: {
    backgroundColor: colors.darkBlue,
    padding: 20,
  },

  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    alignSelf: 'center',
  },

  footerColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  footerRightColumn: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },

  footerLeftColumn: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },

  footerText: {
    fontSize: fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
    opacity: 0.9,
  },

  footerLink: {
    fontSize: fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    textDecoration: 'none',
    opacity: 0.9,
  },

  footerSeparator: {
    borderWidth: 0.5,
    borderColor: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    opacity: 0.3,
    width: '95%',
    alignSelf: 'center',
  },

  footerCopyright: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },

  // Main content area
  content: {
    flexGrow: 1,
  },

  // Section styles
  section: {
    marginBottom: 10,
  },

  sectionWithBg: {
    marginBottom: 5,
    padding: 0,
    borderRadius: 8,
  },

  sectionHeading: {
    fontSize: fontSize.lg,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.purple,
    marginBottom: 5,
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    marginTop: 14,
    marginBottom: 10,
    marginHorizontal: -40,
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
    fontFamily: 'Geist',
    fontWeight: 'bold',
    marginBottom: 6,
  },

  statusBannerText: {
    fontSize: fontSize.sm,
    lineHeight: 1.4,
  },

  // Grid layouts
  twoColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },

  column: {
    flex: 1,
    paddingRight: 24,
  },

  // Make the payment column a bit wider than the summary column
  paymentColumn: {
    flex: 1.2,
  },

  fourColumn: {
    flexDirection: 'row',
  },

  quarterColumn: {
    flex: 1,
    paddingRight: 12,
  },

  // Typography
  label: {
    fontSize: fontSize.sm,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.gray700,
    marginBottom: 6,
  },

  value: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
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
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },

  badgeDelivery: {
    backgroundColor: colors.blue,
    borderWidth: 1,
    borderColor: colors.blue,
  },

  badgeCollection: {
    backgroundColor: '#FED7AA',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  badgeText: {
    fontSize: fontSize.xs,
    fontFamily: 'Geist',
    fontWeight: 'bold',
  },

  badgeTextDelivery: {
    color: colors.white,
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
    fontFamily: 'Geist',
    fontWeight: 'bold',
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
    fontFamily: 'Geist',
    fontWeight: 'bold',
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
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.gray900,
  },

  // Summary section
  summaryHeading: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 12,
  },

  summaryText: {
    fontSize: fontSize.sm,
    color: colors.gray900,
    marginBottom: 6,
  },

  summaryLabel: {
    fontFamily: 'Geist',
    fontWeight: 'bold',
  },

  // Terms list
  termsHeading: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
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
    width: '100%',
    padding: 8,
    backgroundColor: colors.white,
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  paymentLabel: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.gray900,
  },

  paymentValue: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.gray900,
  },

  totalSeparator: {
    borderTopWidth: 1,
    borderTopColor: colors.gray300,
    paddingTop: 8,
    marginTop: 8,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.purple,
  },

  totalAmount: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.purple,
  },

  // Proceed Actions section
  proceedSection: {
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingVertical: 40,
  },

  proceedHeading: {
    fontSize: fontSize['2xl'],
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 12,
    textAlign: 'center',
  },

  proceedDescription: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 1.5,
    paddingHorizontal: 60,
  },

  proceedButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },

  proceedButtonWrapper: {
    marginHorizontal: 8,
  },

  proceedButtonLink: {
    textDecoration: 'none',
  },

  proceedButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },

  proceedButtonDecline: {
    backgroundColor: colors.red,
  },

  proceedButtonApprove: {
    backgroundColor: colors.green,
  },

  proceedButtonText: {
    fontSize: fontSize.base,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'none',
  },

  proceedButtonTextDecline: {
    color: colors.white,
  },

  proceedButtonTextApprove: {
    color: colors.white,
  },

  proceedFooter: {
    alignItems: 'center',
  },

  proceedFooterText: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: 4,
    textAlign: 'center',
  },

  proceedFooterHighlight: {
    fontFamily: 'Geist',
    fontWeight: 'bold',
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
