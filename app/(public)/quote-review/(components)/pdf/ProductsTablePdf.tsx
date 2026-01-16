import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { centsToDollars } from '@/lib/utils/currency';

export interface Product {
  name: string;
  deliveryAddress: string;
  truckType: string;
  capacity: string;
  quantity: string;
  totalPrice: number;
  deliveryPrice?: number;
}

export interface ProductsTablePdfProps {
  products: Product[];
  includeDeliveryPrices?: boolean;
}

export const ProductsTablePdf: React.FC<ProductsTablePdfProps> = ({
  products,
  includeDeliveryPrices = false,
}) => {
  // Dynamic column widths based on whether delivery prices are shown
  const colWidths = includeDeliveryPrices
    ? { product: '28%', truck: '25%', qty: '12%', delivery: '15%', price: '20%' }
    : { product: '35%', truck: '30%', qty: '15%', price: '20%' };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Products & Services</Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { width: colWidths.product, paddingRight: 8 }]}>
          Product
        </Text>
        <Text style={[styles.tableHeaderText, { width: colWidths.truck, paddingRight: 8 }]}>
          Truck Configuration
        </Text>
        <Text style={[styles.tableHeaderText, { width: colWidths.qty, paddingRight: 8 }]}>
          Quantity
        </Text>
        {includeDeliveryPrices && (
          <Text style={[styles.tableHeaderText, { width: colWidths.delivery, paddingRight: 8 }]}>
            Delivery
          </Text>
        )}
        <Text style={[styles.tableHeaderText, { width: colWidths.price, textAlign: 'right' }]}>
          {includeDeliveryPrices ? 'Product Price' : 'Total Price'} (ex-GST)
        </Text>
      </View>

      {/* Table Rows */}
      {products.map((product, index) => {
        // Calculate the price to display
        const displayPrice = includeDeliveryPrices
          ? product.totalPrice
          : product.totalPrice + (product.deliveryPrice || 0);

        return (
          <View key={index} style={styles.tableRow}>
            {/* Product Column */}
            <View style={{ width: colWidths.product, paddingRight: 8 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCode}>{product.deliveryAddress}</Text>
            </View>

            {/* Truck Configuration Column */}
            <View style={{ width: colWidths.truck, paddingRight: 8 }}>
              <Text style={styles.truckType}>{product.truckType}</Text>
              <Text style={styles.capacity}>{product.capacity}</Text>
            </View>

            {/* Quantity Column */}
            <View style={{ width: colWidths.qty, paddingRight: 8, justifyContent: 'center' }}>
              <Text style={styles.quantity}>{product.quantity}</Text>
            </View>

            {/* Delivery Price Column - only shown when includeDeliveryPrices is true */}
            {includeDeliveryPrices && (
              <View style={{ width: colWidths.delivery, paddingRight: 8, justifyContent: 'center' }}>
                <View style={styles.deliveryPriceBadge}>
                  <Text style={styles.deliveryPriceText}>
                    ${centsToDollars(product.deliveryPrice || 0)}
                  </Text>
                </View>
              </View>
            )}

            {/* Price Column */}
            <View style={{ width: colWidths.price, textAlign: 'right', justifyContent: 'center' }}>
              <Text style={styles.price}>
                ${centsToDollars(displayPrice)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
