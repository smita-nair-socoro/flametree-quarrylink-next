import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';

export interface ProjectDetailsPdfProps {
  projectName: string;
  deliveryDate: string;
  deliveryWindow: string;
}

export const ProjectDetailsPdf: React.FC<ProjectDetailsPdfProps> = ({
  projectName,
  deliveryDate,
  deliveryWindow,
}) => {
  return (
    <View style={styles.sectionWithBg}>
      <Text style={styles.sectionHeading}>Project Details</Text>
      {/* Type Badge */}
      {/* <View
        style={[
          styles.badge,
          isDelivery ? styles.badgeDelivery : styles.badgeCollection,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isDelivery ? styles.badgeTextDelivery : styles.badgeTextCollection,
          ]}
        >
          {type}
        </Text>
      </View> */}

      {/* Four Column Grid */}
      <View style={styles.fourColumn}>
        {/* Project Name */}
        <View style={styles.quarterColumn}>
          <Text style={styles.label}>Project Name</Text>
          <Text style={styles.valueSmall}>{projectName}</Text>
        </View>

        {/*  Estimated Start Date* */}
        <View style={styles.quarterColumn}>
          <Text style={styles.label}> Estimated Start Date*</Text>
          <Text style={styles.valueSmall}>{deliveryDate}</Text>
        </View>

        {/* Timeframe */}
        <View style={styles.quarterColumn}>
          <Text style={styles.label}>Timeframe</Text>
          <Text style={styles.valueSmall}>{deliveryWindow}</Text>
        </View>
      </View>
      <View style={styles.separator} />
    </View>
  );
};
