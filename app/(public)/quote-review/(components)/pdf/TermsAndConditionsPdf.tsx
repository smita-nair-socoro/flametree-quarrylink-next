import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import {
  DUMMY_NOTES,
  DUMMY_TERMS,
  DUMMY_DOCUMENTS,
  type QuoteDocument,
  type QuoteTermItem,
} from '../terms-and-conditions';

// ---- HTML tokenizer ----

interface Token {
  kind: 'open' | 'close' | 'selfclose' | 'text';
  tag: string;
  attrs: Record<string, string>;
  value: string;
}

/** O(n) tokenizer for the HTML subset Tiptap + DOMPurify produces. */
function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < html.length) {
    if (html[i] !== '<') {
      const end = html.indexOf('<', i);
      const raw = end === -1 ? html.slice(i) : html.slice(i, end);
      i = end === -1 ? html.length : end;
      const v = raw
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
      if (v) tokens.push({ kind: 'text', tag: '', attrs: {}, value: v });
    } else {
      const end = html.indexOf('>', i);
      if (end === -1) { i = html.length; break; }
      const inner = html.slice(i + 1, end);
      i = end + 1;

      if (inner.startsWith('/')) {
        const tag = inner.slice(1).trim().split(/\s/)[0].toLowerCase();
        tokens.push({ kind: 'close', tag, attrs: {}, value: '' });
      } else {
        const selfClose = inner.endsWith('/');
        const content = selfClose ? inner.slice(0, -1).trim() : inner.trim();
        const spaceIdx = content.search(/\s/);
        const tag = (spaceIdx === -1 ? content : content.slice(0, spaceIdx)).toLowerCase();
        const attrStr = spaceIdx === -1 ? '' : content.slice(spaceIdx + 1);

        // Extract only href and style — both patterns are O(n) on a short attr string
        const attrs: Record<string, string> = {};
        const hrefM = attrStr.match(/href=["']([^"']*)["']/);
        if (hrefM) attrs.href = hrefM[1];
        const styleM = attrStr.match(/style=["']([^"']*)["']/);
        if (styleM) attrs.style = styleM[1];

        const isSC = selfClose || tag === 'br';
        tokens.push({ kind: isSC ? 'selfclose' : 'open', tag, attrs, value: '' });
      }
    }
  }

  return tokens;
}

// ---- Inline renderer ----

/** Renders inline tokens as react-pdf nodes until the matching close tag. */
function renderInline(
  tokens: Token[],
  start: number,
  stopTag: string,
): { nodes: React.ReactNode[]; next: number } {
  const nodes: React.ReactNode[] = [];
  let i = start;

  while (i < tokens.length) {
    const t = tokens[i];

    if (t.kind === 'close' && t.tag === stopTag) {
      return { nodes, next: i + 1 };
    }

    if (t.kind === 'text') {
      nodes.push(t.value);
      i++;
      continue;
    }

    if (t.kind === 'selfclose' && t.tag === 'br') {
      nodes.push('\n');
      i++;
      continue;
    }

    if (t.kind === 'open') {
      const k = i;
      switch (t.tag) {
        case 'strong': {
          const r = renderInline(tokens, i + 1, 'strong');
          nodes.push(<Text key={k} style={{ fontWeight: 'bold' }}>{r.nodes}</Text>);
          i = r.next;
          break;
        }
        case 'em': {
          const r = renderInline(tokens, i + 1, 'em');
          nodes.push(<Text key={k} style={{ fontStyle: 'italic' }}>{r.nodes}</Text>);
          i = r.next;
          break;
        }
        case 'u': {
          const r = renderInline(tokens, i + 1, 'u');
          nodes.push(<Text key={k} style={{ textDecoration: 'underline' }}>{r.nodes}</Text>);
          i = r.next;
          break;
        }
        case 's': {
          const r = renderInline(tokens, i + 1, 's');
          nodes.push(<Text key={k} style={{ textDecoration: 'line-through' }}>{r.nodes}</Text>);
          i = r.next;
          break;
        }
        case 'a': {
          const href = t.attrs.href ?? '#';
          const r = renderInline(tokens, i + 1, 'a');
          nodes.push(
            <Link key={k} src={href} style={styles.rteLink}>
              {r.nodes}
            </Link>
          );
          i = r.next;
          break;
        }
        default:
          i++;
      }
      continue;
    }

    i++;
  }

  return { nodes, next: i };
}

// ---- Block renderer ----

/**
 * Converts sanitised Tiptap HTML to a react-pdf node array.
 * Handles: p (with text-align), ul, ol, li, strong, em, u, s, a, br.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderRteHtml(html: string, baseStyle: any): React.ReactNode[] {
  const tokens = tokenize(html);
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let isOl = false;
  let olCount = 0;

  while (i < tokens.length) {
    const t = tokens[i];

    if (t.kind !== 'open') { i++; continue; }

    const k = i;
    switch (t.tag) {
      case 'p': {
        const alignM = (t.attrs.style ?? '').match(/text-align:\s*(left|center|right)/);
        const textAlign = alignM ? (alignM[1] as 'left' | 'center' | 'right') : undefined;
        const r = renderInline(tokens, i + 1, 'p');
        const extra = textAlign ? { textAlign, marginBottom: 2 } : { marginBottom: 2 };
        blocks.push(<Text key={k} style={[baseStyle, extra]}>{r.nodes}</Text>);
        i = r.next;
        break;
      }
      case 'ul':
        isOl = false;
        i++;
        break;
      case 'ol':
        isOl = true;
        olCount = 0;
        i++;
        break;
      case 'li': {
        if (isOl) olCount++;
        const marker = isOl ? `${olCount}.` : '•';
        i++;
        const liNodes: React.ReactNode[] = [];
        while (i < tokens.length) {
          const lt = tokens[i];
          if (lt.kind === 'close' && lt.tag === 'li') { i++; break; }
          if (lt.kind === 'open' && lt.tag === 'p') {
            const r = renderInline(tokens, i + 1, 'p');
            liNodes.push(...r.nodes);
            i = r.next;
          } else if (lt.kind === 'text') {
            liNodes.push(lt.value);
            i++;
          } else {
            i++;
          }
        }
        blocks.push(
          <View key={k} style={styles.rteListItem}>
            <Text style={[baseStyle, styles.rteListMarker]}>{marker}</Text>
            <Text style={[baseStyle, { flex: 1 }]}>{liNodes}</Text>
          </View>
        );
        break;
      }
      default:
        i++;
    }
  }

  return blocks;
}

// ---- Sorting utility ----

function sortByDefault<T extends { name: string; isDefault?: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aD = a.isDefault ?? false;
    const bD = b.isDefault ?? false;
    if (aD !== bD) return aD ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// ---- Component ----

export interface TermsAndConditionsPdfProps {
  notes?: string[];
  terms?: QuoteTermItem[];
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

  // Heading travels with the first section so it's never orphaned alone at page bottom
  const headingOwner = hasNotes ? 'notes' : hasTerms ? 'terms' : 'documents';

  const sortedTerms = sortByDefault(terms);
  const sortedDocuments = sortByDefault(documents);

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
        <View>
          {headingOwner === 'terms' && (
            <Text style={styles.sectionHeading}>Notes & Terms</Text>
          )}
          <Text style={styles.label}>Terms & Conditions</Text>
          {sortedTerms.map((term) => (
            <View key={term.id} style={styles.termCardContainer} wrap={false}>
              <Text style={styles.termCardTitle}>{term.name}</Text>
              <View>{renderRteHtml(term.content, styles.termCardBody)}</View>
            </View>
          ))}
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
          {sortedDocuments.map((doc) => (
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
