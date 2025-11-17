import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';

export interface ProceedActionsPdfProps {
  validUntil: string;
  accountManager: string;
  quoteId: string;
  baseUrl?: string;
}

export const ProceedActionsPdf: React.FC<ProceedActionsPdfProps> = ({
  validUntil,
  accountManager,
  quoteId,
  baseUrl = 'https://quarrylink.com',
}) => {
  const approveUrl = `${baseUrl}/quote-review?quoteId=${quoteId}&action=approve`;
  const declineUrl = `${baseUrl}/quote-review?quoteId=${quoteId}&action=decline`;

  return (
    <View style={styles.proceedSection}>
      <Text style={styles.proceedHeading}>Ready to Proceed?</Text>

      {/* Description */}
      <Text style={styles.proceedDescription}>
        Please review the quotation details above and select your preferred action below. We're here to help with any questions or modifications you may need.
      </Text>

      {/* Action Buttons */}
      <View style={styles.proceedButtons}>
        {/* Decline Button */}
        <View style={styles.proceedButtonWrapper}>
          <Link src={declineUrl} style={styles.proceedButtonLink}>
            <View
              style={[styles.proceedButton, styles.proceedButtonDecline]}
            >
              <Text
                style={[
                  styles.proceedButtonText,
                  styles.proceedButtonTextDecline,
                ]}
              >
                Decline Quote
              </Text>
            </View>
          </Link>
        </View>

        {/* Approve Button */}
        <View style={styles.proceedButtonWrapper}>
          <Link src={approveUrl} style={styles.proceedButtonLink}>
            <View
              style={[styles.proceedButton, styles.proceedButtonApprove]}
            >
              <Text
                style={[
                  styles.proceedButtonText,
                  styles.proceedButtonTextApprove,
                ]}
              >
                Approve Quote
              </Text>
            </View>
          </Link>
        </View>
      </View>

      {/* Bottom Text */}
      <View style={styles.proceedFooter}>
        <Text style={styles.proceedFooterText}>
          This quotation is valid until{' '}
          <Text style={styles.proceedFooterHighlight}>{validUntil}</Text>
        </Text>
        <Text style={styles.proceedFooterText}>
          Need assistance? Contact your account manager{' '}
          <Text style={styles.proceedFooterHighlight}>{accountManager}</Text>
        </Text>
      </View>
    </View>
  );
};
