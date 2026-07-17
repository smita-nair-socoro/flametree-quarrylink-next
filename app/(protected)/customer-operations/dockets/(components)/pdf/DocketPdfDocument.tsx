import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { __iconNode as imageOffIconNode } from 'lucide-react/dist/esm/icons/image-off';
import { __iconNode as fileXIconNode } from 'lucide-react/dist/esm/icons/file-x';
import { __iconNode as circleCheckIconNode } from 'lucide-react/dist/esm/icons/circle-check';
import { docketPdfStyles as styles, colors } from './styles';
import { LucidePdfIcon } from './LucidePdfIcon';

// Pre-resolved, display-ready data (images as base64 data URLs)
export interface DocketPdfData {
  tenantName: string;
  docTitle: string;
  docketNumber: string;
  dateLabel: string;
  job: {
    jobNumber: string;
    projectName?: string;
  };
  product: {
    name?: string;
    truckType?: string;
    rego?: string;
  };
  loadSizeLabel: string;
  delivery: {
    pickupAddress?: string;
    pickupLatLong?: string;
    deliveryAddress?: string;
    deliveryLatLong?: string;
    contactName?: string;
    contactPhone?: string;
    notes?: string;
  };
  assignment?: {
    driverName?: string;
    truckRego?: string;
  };
  signOff?: {
    deliveredAtLabel?: string;
    receiverName?: string;
    receiverOnSite?: boolean;
    unloadedPhoto?: string;
    receiptPhoto?: string;
    signature?: string;
  };
  qrCode?: string;
}

const SignOffCheckIcon = () => (
  <LucidePdfIcon
    icon={circleCheckIconNode}
    size={12}
    color={colors.green}
    style={{ marginRight: 5 }}
  />
);

const ImageOffIcon = () => (
  <LucidePdfIcon
    icon={imageOffIconNode}
    color={colors.gray500}
    style={{ marginBottom: 4 }}
  />
);

const FileXIcon = () => (
  <LucidePdfIcon
    icon={fileXIconNode}
    color={colors.gray500}
    style={{ marginBottom: 4 }}
  />
);

const PhotoCell = ({
  label,
  src,
  placeholder,
  icon,
  last,
}: {
  label: string;
  src?: string;
  placeholder: string;
  icon: React.ReactNode;
  last?: boolean;
}) => (
  <View style={last ? styles.photoCellLast : styles.photoCell}>
    <Text style={styles.label}>{label}</Text>
    {src ? (
      // eslint-disable-next-line jsx-a11y/alt-text
      <Image style={styles.photoImage} src={src} />
    ) : (
      <View style={styles.photoBox}>
        {icon}
        <Text style={styles.photoPlaceholderText}>{placeholder}</Text>
      </View>
    )}
  </View>
);

export const DocketPdfDocument: React.FC<{ data: DocketPdfData }> = ({
  data,
}) => {
  const { job, product, delivery, assignment, signOff } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.tenantName}>{data.tenantName}</Text>
            <Text style={styles.docTitle}>{data.docTitle}</Text>
          </View>
          <View>
            <Text style={styles.docketNumber}>{data.docketNumber}</Text>
            <Text style={styles.docketDate}>Date: {data.dateLabel}</Text>
          </View>
        </View>

        {/* Job Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Job Reference</Text>
          <View style={styles.jobBox}>
            <Text style={styles.jobNumber}>{job.jobNumber}</Text>
            {job.projectName ? (
              <Text style={styles.jobProject}>{job.projectName}</Text>
            ) : null}
          </View>
        </View>

        {/* Product & Vehicle / Weights */}
        <View style={[styles.section, styles.twoColumn]}>
          <View style={styles.column}>
            <Text style={styles.sectionHeading}>Product &amp; Vehicle</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Product</Text>
              <Text style={styles.value}>{product.name || '—'}</Text>
            </View>
            <View style={styles.fieldRow}>
              <View style={styles.fieldRowItem}>
                <Text style={styles.label}>Truck Type</Text>
                <Text style={styles.value}>{product.truckType || '—'}</Text>
              </View>
              <View style={styles.fieldRowItem}>
                <Text style={styles.label}>Rego</Text>
                <Text style={styles.value}>{product.rego || '—'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.columnLast}>
            <Text style={styles.sectionHeading}>Weights</Text>
            <View style={styles.weightBox}>
              <Text style={styles.weightLabel}>Load Size</Text>
              <Text style={styles.weightValue}>{data.loadSizeLabel}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Delivery Details</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Pickup Address</Text>
                <Text style={styles.valueRegular}>
                  {delivery.pickupAddress || '—'}
                </Text>
                {delivery.pickupLatLong ? (
                  <Text style={styles.valueRegular}>
                    {delivery.pickupLatLong}
                  </Text>
                ) : null}
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Contact</Text>
                <Text style={styles.value}>{delivery.contactName || '—'}</Text>
                {delivery.contactPhone ? (
                  <Text style={styles.valueMuted}>{delivery.contactPhone}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.columnLast}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Delivery Address</Text>
                <Text style={styles.valueRegular}>
                  {delivery.deliveryAddress || '—'}
                </Text>
                {delivery.deliveryLatLong ? (
                  <Text style={styles.valueRegular}>
                    {delivery.deliveryLatLong}
                  </Text>
                ) : null}
              </View>
              {delivery.notes ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Notes</Text>
                  <Text style={styles.valueItalic}>{delivery.notes}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Assignment */}
        {assignment ? (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 12 }]}>
              Assignment
            </Text>
            <View style={styles.fieldRow}>
              <View style={styles.fieldRowItem}>
                <Text style={styles.label}>Driver</Text>
                <Text style={styles.value}>
                  {assignment.driverName || '—'}
                </Text>
              </View>
              <View style={styles.fieldRowItem}>
                <Text style={styles.label}>Truck Rego</Text>
                <Text style={styles.value}>{assignment.truckRego || '—'}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Sign Off */}
        {signOff ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleRow}>
                <SignOffCheckIcon />
                <Text style={styles.cardTitle}>Sign Off</Text>
              </View>
              {signOff.deliveredAtLabel ? (
                <Text style={styles.cardHeaderNote}>
                  {signOff.deliveredAtLabel}
                </Text>
              ) : null}
            </View>
            <View style={styles.fieldRow}>
              <View style={styles.fieldRowItem}>
                <Text style={styles.label}>Receiver Name</Text>
                <Text style={styles.value}>{signOff.receiverName || '—'}</Text>
              </View>
              <View style={styles.fieldRowItem}>
                <Text style={styles.label}>Receiver On Site</Text>
                <Text style={styles.valueRegular}>
                  {signOff.receiverOnSite == null
                    ? '—'
                    : signOff.receiverOnSite
                      ? 'Yes'
                      : 'No'}
                </Text>
              </View>
            </View>
            <View style={styles.photoRow}>
              <PhotoCell
                label="Unloaded Photo"
                src={signOff.unloadedPhoto}
                placeholder="No photo provided"
                icon={<ImageOffIcon />}
              />
              <PhotoCell
                label="Receipt Photo"
                src={signOff.receiptPhoto}
                placeholder="No photo provided"
                icon={<ImageOffIcon />}
              />
              <PhotoCell
                label="Receiver Signature"
                src={signOff.signature}
                placeholder="No signature provided"
                icon={<FileXIcon />}
                last
              />
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} wrap={false}>
          <Text style={styles.footerNote}>
            Received the above goods in good order and condition.
          </Text>
          <View style={styles.footerRow}>
            <View style={styles.signatureBlock}>
              {signOff?.signature ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image style={styles.signatureImage} src={signOff.signature} />
              ) : null}
              <View style={styles.signatureLine}>
                <Text style={styles.signatureLabel}>Receiver Signature</Text>
              </View>
            </View>
            {data.qrCode ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image style={styles.qrImage} src={data.qrCode} />
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
};
