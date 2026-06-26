import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './styles';
import { centsToDollars } from '@/lib/utils/currency';
import { QUOTE_ITEM_TYPE } from '@/lib/types/quotation-enums';
import { QuoteCurrencyTax } from '@/lib/types/quotation';

export interface Product {
  name: string;
  type?: string;
  deliveryAddress: string;
  truckType: string;
  capacity: string;
  quantity: string;
  totalPrice: number;
  deliveryPrice?: number;
}

export interface ProductsTablePdfProps {
  products: Product[];
  currencyTax: QuoteCurrencyTax;
  includeDeliveryPrices?: boolean;
}

const getTypeBadgeStyle = (type: string) => {
  switch (type.toUpperCase()) {
    case 'DELIVERY':
      // bg-blue-100 text-blue-800 border-blue-800
      return { backgroundColor: '#DBEAFE', borderColor: '#1E40AF', color: '#1E40AF' };
    case 'COLLECTION':
      // bg-orange-100 text-orange-900 border-orange-900
      return { backgroundColor: '#FFEDD5', borderColor: '#7C2D12', color: '#7C2D12' };
    default:
      return { backgroundColor: '#F3F4F6', borderColor: '#6B7280', color: '#6B7280' };
  }
};

export const ProductsTablePdf: React.FC<ProductsTablePdfProps> = ({
  products,
  currencyTax,
  includeDeliveryPrices = false,
}) => {
  const { currencySymbol, exTaxLabel } = currencyTax;
  // Dynamic column widths based on whether delivery prices are shown
  const isCollection =
    products.length > 0 &&
    products.every(
      (product) =>
        String(product.type || '').toUpperCase() === QUOTE_ITEM_TYPE.COLLECTION,
    );
  const colWidths = isCollection
    ? includeDeliveryPrices
      ? {
          product: '35%',
          qty: '20%',
          delivery: '20%',
          type: '10%',
          price: '15%',
        }
      : { product: '40%', qty: '25%', type: '15%', price: '20%' }
    : includeDeliveryPrices
      ? {
          product: '40%',
          qty: '12%',
          delivery: '15%',
          type: '15%',
          price: '18%',
        }
      : { product: '45%', qty: '15%', type: '20%', price: '20%' };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Products & Services</Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text
          style={[
            styles.tableHeaderText,
            { width: colWidths.product, paddingRight: 8 },
          ]}
        >
          Product
        </Text>
        <Text
          style={[
            styles.tableHeaderText,
            { width: colWidths.qty, paddingRight: 8 },
          ]}
        >
          Quantity
        </Text>
        {includeDeliveryPrices && (
          <Text
            style={[
              styles.tableHeaderText,
              { width: colWidths.delivery, paddingRight: 4 },
            ]}
          >
            Delivery
          </Text>
        )}
        <Text
          style={[
            styles.tableHeaderText,
            { width: colWidths.type, paddingRight: 8 },
          ]}
        >
          Type
        </Text>
        <Text
          style={[
            styles.tableHeaderText,
            { width: colWidths.price, textAlign: 'right' },
          ]}
        >
          {includeDeliveryPrices ? 'Product Price' : 'Total Price'} {exTaxLabel}
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

            {/* Quantity Column */}
            <View
              style={{
                width: colWidths.qty,
                paddingRight: 8,
                justifyContent: 'center',
              }}
            >
              <Text style={styles.quantity}>{product.quantity}</Text>
            </View>

            {/* Delivery Price Column - only shown when includeDeliveryPrices is true */}
            {includeDeliveryPrices && (
              <View
                style={{
                  width: colWidths.delivery,
                  paddingRight: 4,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <View style={styles.deliveryPriceBadge}>
                  <Text style={styles.deliveryPriceText}>
                    {currencySymbol}
                    {centsToDollars(product.deliveryPrice || 0)}
                  </Text>
                </View>
              </View>
            )}

            {/* Type Column */}
            <View
              style={{
                width: colWidths.type,
                paddingRight: 8,
                justifyContent: 'center',
              }}
            >
              {product.type ? (() => {
                const badgeStyle = getTypeBadgeStyle(product.type);
                return (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: badgeStyle.backgroundColor,
                        borderColor: badgeStyle.borderColor,
                      },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: badgeStyle.color }]}>
                      {product.type.replace(/_/g, ' ')}
                    </Text>
                  </View>
                );
              })() : <Text style={styles.quantity}>—</Text>}
            </View>

            {/* Price Column */}
            <View
              style={{
                width: colWidths.price,
                textAlign: 'right',
                justifyContent: 'center',
              }}
            >
              <Text style={styles.price}>
                {currencySymbol}
                {centsToDollars(displayPrice)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
