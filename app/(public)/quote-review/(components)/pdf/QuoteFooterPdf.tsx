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
}

export const QuoteFooterPdf: React.FC<QuoteFooterPdfProps> = ({
  email,
  phone,
  addressLine1,
  addressLine2,
  addressLine3,
  businessName,
}) => {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerBg}>
        {/* Two columns */}
        <View style={styles.footerGrid}>
          {/* Column 1: Email & Phone */}
          <View style={styles.footerLeftColumn}>
            <Link src={`mailto:${email}`} style={styles.footerLink}>
              {email}
            </Link>
            <Text style={styles.footerText}>{phone}</Text>
          </View>

          {/* Column 2: Address */}
          <View style={styles.footerRightColumn}>
            <Text style={styles.footerText}>{addressLine1}</Text>
            <Text style={styles.footerText}>{addressLine2}</Text>
            <Text style={styles.footerText}>{addressLine3}</Text>
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
