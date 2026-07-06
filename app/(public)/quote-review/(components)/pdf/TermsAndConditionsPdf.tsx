import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import {
  DUMMY_NOTES,
  DUMMY_TERMS,
  DUMMY_DOCUMENTS,
  type QuoteDocument,
} from '../terms-and-conditions';

export interface TermsAndConditionsPdfProps {
  notes?: string[];
  terms?: string[];
  documents?: QuoteDocument[];
}

export const TermsAndConditionsPdf: React.FC<TermsAndConditionsPdfProps> = ({
  notes = DUMMY_NOTES,
  terms = DUMMY_TERMS,
  documents = DUMMY_DOCUMENTS,
}) => {
  const hasNotes = notes.length > 0;
  const hasTerms = terms.length > 0;
  const hasDocuments = documents.length > 0;

  if (!hasNotes && !hasTerms && !hasDocuments) return null;

  // The "Notes & Terms" heading should travel with whichever section renders
  // first, so it's never left orphaned alone at the bottom of a page.
  const headingOwner = hasNotes ? 'notes' : hasTerms ? 'terms' : 'documents';

  return (
    <View style={styles.sectionWithBg}>
      {hasNotes && (
        <View wrap={false}>
          <Text style={styles.sectionHeading}>Notes & Terms</Text>
          <Text style={styles.label}>Notes</Text>
          <View style={styles.notesBox}>
            {notes.map((note) => (
              <Text key={note} style={styles.noteText}>
                {note}
              </Text>
            ))}
          </View>
        </View>
      )}

      {hasTerms && (
        <View wrap={false}>
          {headingOwner === 'terms' && (
            <Text style={styles.sectionHeading}>Notes & Terms</Text>
          )}
          <Text style={styles.label}>Terms & Conditions</Text>
          <View style={styles.termsBox}>
            {terms.map((term, index) => (
              <View key={term} style={styles.termRow} wrap={false}>
                <Text style={styles.termNumber}>{index + 1}.</Text>
                <Text style={styles.termText}>{term}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.disclaimerText}>
            By approving this quote, the customer acknowledges these terms
            and conditions.
          </Text>
        </View>
      )}

      {hasDocuments && (
        <View wrap={false}>
          {headingOwner === 'documents' && (
            <Text style={styles.sectionHeading}>Notes & Terms</Text>
          )}
          <Text style={styles.label}>Documents</Text>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.documentRow} wrap={false}>
              <View style={{ flex: 1 }}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentMeta}>
                  {doc.type === 'file'
                    ? `${doc.fileType} · ${doc.fileName} · ${doc.fileSizeLabel}`
                    : doc.url}
                </Text>
              </View>
              {doc.type === 'link' && (
                <Link src={doc.url} style={styles.documentLink}>
                  Open link
                </Link>
              )}
            </View>
          ))}
          <Text style={styles.disclaimerText}>
            By approving this quote, the customer acknowledges these
            documents.
          </Text>
        </View>
      )}
    </View>
  );
};
