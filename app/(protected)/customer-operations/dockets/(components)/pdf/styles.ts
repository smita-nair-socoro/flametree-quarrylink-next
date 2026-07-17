import { StyleSheet, Font } from '@react-pdf/renderer';

// Register Geist font (same asset as the quote PDF)
Font.register({
  family: 'Geist',
  src: '/fonts/Geist.ttf',
});

// Disable word hyphenation - keeps words intact when wrapping
Font.registerHyphenationCallback((word) => [word]);

export const colors = {
  gray900: '#101828',
  gray700: '#364153',
  gray600: '#6A7282',
  gray500: '#99A1AF',
  gray300: '#E5E7EB',
  gray200: '#F3F4F6',
  gray100: '#F9FAFB',
  green: '#00A63E',
  white: '#FFFFFF',
};

export const docketPdfStyles = StyleSheet.create({
  page: {
    fontSize: 9,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 40,
    fontFamily: 'Geist',
    backgroundColor: colors.white,
    color: colors.gray900,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  docTitle: {
    fontSize: 9,
    color: colors.gray600,
  },
  docketNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  docketDate: {
    fontSize: 9,
    color: colors.gray600,
    textAlign: 'right',
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: colors.gray600,
    textTransform: 'uppercase',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    marginBottom: 16,
  },

  // Job reference box
  jobBox: {
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 10,
  },
  jobNumber: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  jobProject: {
    fontSize: 9,
    color: colors.gray700,
  },

  // Two-column layout
  twoColumn: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    paddingRight: 20,
  },
  columnLast: {
    flex: 1,
  },

  // Label / value pairs
  fieldGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 8,
    color: colors.gray600,
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  valueRegular: {
    fontSize: 9,
    color: colors.gray900,
    lineHeight: 1.4,
  },
  valueMuted: {
    fontSize: 9,
    color: colors.gray600,
    lineHeight: 1.4,
  },
  // Geist has no italic variant, so fall back to the built-in oblique font
  valueItalic: {
    fontSize: 9,
    color: colors.gray600,
    lineHeight: 1.4,
    fontFamily: 'Helvetica-Oblique',
  },

  fieldRow: {
    flexDirection: 'row',
  },
  fieldRowItem: {
    flex: 1,
    paddingRight: 12,
  },

  // Weights box
  weightBox: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  // Geist ships a single weight, so use the built-in bold for real heaviness
  weightValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },

  // Cards (Assignment / Sign Off)
  card: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderNote: {
    fontSize: 8,
    color: colors.gray600,
  },

  // Photo / signature placeholders
  photoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  photoCell: {
    flex: 1,
    paddingRight: 12,
  },
  photoCellLast: {
    flex: 1,
  },
  photoBox: {
    height: 100,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    height: 100,
    borderRadius: 4,
    objectFit: 'contain',
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  photoPlaceholderText: {
    fontSize: 7,
    color: colors.gray500,
  },
});
