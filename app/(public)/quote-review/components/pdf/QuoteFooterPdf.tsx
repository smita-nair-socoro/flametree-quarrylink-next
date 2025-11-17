import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';

export interface QuoteFooterPdfProps {
  contactInfo: {
    company: string;
    phone: string;
    email: string;
  };
  officeAddress: {
    address: string;
    city: string;
    abn: string;
  };
  website: {
    url: string;
    portalInfo: string;
    support: string;
  };
}

export const QuoteFooterPdf: React.FC<QuoteFooterPdfProps> = ({
  contactInfo,
  officeAddress,
  website,
}) => {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerBg}>
        <View style={styles.footerGrid}>
          {/* Column 1: Contact Information */}
          <View style={styles.footerColumn}>
            <Text style={styles.footerHeading}>Contact Information</Text>
            <Text style={styles.footerText}>{contactInfo.company}</Text>
            <Text style={styles.footerText}>{contactInfo.phone}</Text>
            <Link
              src={`mailto:${contactInfo.email}`}
              style={styles.footerLink}
            >
              {contactInfo.email}
            </Link>
          </View>

          {/* Column 2: Office Address */}
          <View style={styles.footerColumn}>
            <Text style={styles.footerHeading}>Office Address</Text>
            <Text style={styles.footerText}>{officeAddress.address}</Text>
            <Text style={styles.footerText}>{officeAddress.city}</Text>
            <Text style={styles.footerText}>ABN: {officeAddress.abn}</Text>
          </View>

          {/* Column 3: Website */}
          <View style={styles.footerColumn}>
            <Text style={styles.footerHeading}>Website</Text>
            <Link
              src={`https://${website.url}`}
              style={styles.footerLink}
            >
              {website.url}
            </Link>
            <Text style={styles.footerText}>{website.portalInfo}</Text>
            <Text style={styles.footerText}>{website.support}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
