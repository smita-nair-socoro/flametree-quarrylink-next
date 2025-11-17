import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { centsToDollars } from '@/lib/utils/currency';

export interface Product {
  name: string;
  code: string;
  truckType: string;
  capacity: string;
  quantity: string;
  totalPrice: number;
}

export interface ProductsTablePdfProps {
  products: Product[];
}

export const ProductsTablePdf: React.FC<ProductsTablePdfProps> = ({
  products,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Products & Services</Text>
      <View style={styles.separator} />

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colProduct]}>
          Product
        </Text>
        <Text style={[styles.tableHeaderText, styles.colTruck]}>
          Truck Configuration
        </Text>
        <Text style={[styles.tableHeaderText, styles.colQty]}>Quantity</Text>
        <Text style={[styles.tableHeaderText, styles.colPrice]}>
          Total Price
        </Text>
      </View>

      {/* Table Rows */}
      {products.map((product, index) => (
        <View key={index} style={styles.tableRow}>
          {/* Product Column */}
          <View style={styles.colProduct}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCode}>{product.code}</Text>
          </View>

          {/* Truck Configuration Column */}
          <View style={styles.colTruck}>
            <Text style={styles.truckType}>{product.truckType}</Text>
            <Text style={styles.capacity}>{product.capacity}</Text>
          </View>

          {/* Quantity Column */}
          <View style={styles.colQty}>
            <Text style={styles.quantity}>{product.quantity}</Text>
          </View>

          {/* Total Price Column */}
          <View style={styles.colPrice}>
            <Text style={styles.price}>${centsToDollars(product.totalPrice)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};
