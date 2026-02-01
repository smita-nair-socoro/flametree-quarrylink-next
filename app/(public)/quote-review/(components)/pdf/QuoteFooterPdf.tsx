import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';

export interface QuoteFooterPdfProps {
  email: string; // Tenant email (e.g., support@quarrylink.com.au)
  phone: string; // Tenant phone (e.g., (02) 7229 1427)
  addressLine1: string; // First address line (e.g., Suite 1102/132 Arthur St)
  addressLine2: string; // Second address line (e.g., NORTH SYDNEY NSW 2060)
  addressLine3: string; // Third address line - Country (e.g., AUSTRALIA)
  website: string; // Tenant website (e.g., www.quarrylink.com.au)
  businessName: string; // For copyright (e.g., QuarryLink)
  abn: string; // ABN number (e.g., 12 345 678 901)
}

export const QuoteFooterPdf: React.FC<QuoteFooterPdfProps> = ({
  email,
  phone,
  addressLine1,
  addressLine2,
  addressLine3,
  businessName,
  abn,
}) => {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerBg}>
        {/* Three columns with headers */}
        <View style={styles.footerGrid}>
          {/* Column 1: Business Details */}
          <View style={styles.footerColumn}>
            <Text style={styles.footerColumnHeader}>Business Details</Text>
            <Text style={styles.footerText}>{businessName}</Text>
            <Text style={styles.footerText}>ABN: {abn}</Text>
          </View>

          {/* Column 2: Office Address */}
          <View style={styles.footerColumn}>
            <Text style={styles.footerColumnHeader}>Office Address</Text>
            <Text style={styles.footerText}>{addressLine1}</Text>
            <Text style={styles.footerText}>{addressLine2}</Text>
            <Text style={styles.footerText}>{addressLine3}</Text>
          </View>

          {/* Column 3: Business Contact */}
          <View style={styles.footerColumn}>
            <Text style={styles.footerColumnHeader}>Business Contact</Text>
            <Text style={styles.footerText}>{phone}</Text>
            <Link src={`mailto:${email}`} style={styles.footerLink}>
              {email}
            </Link>
          </View>
        </View>
        <View style={styles.footerSeparator} />

        {/* Copyright */}
        <Text style={styles.footerCopyright}>
          © {new Date().getFullYear()} {businessName}. All rights reserved.
        </Text>
      </View>
    </View>
  );
};
