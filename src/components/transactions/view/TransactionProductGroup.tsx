import { StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import type { TransactionItem } from '../../../types/localModels';

type Props = {
  productName: string;
  colorName: string;
  items: TransactionItem[];
  getSizeName: (sizeId: string) => string;
};

export default function TransactionProductGroup({
  productName,
  colorName,
  items,
  getSizeName,
}: Props) {
  return (
    <View style={styles.productGroup}>
      {/* PRODUCT */}
      <Text style={styles.productName}>{productName}</Text>

      {/* COLOR */}
      <View style={styles.colorHeader}>
        <View style={styles.colorDot} />

        <Text style={styles.colorName}>{colorName}</Text>

        <Text style={styles.colorCount}>
          {items.reduce((sum, item) => sum + item.quantity, 0)} pcs
        </Text>
      </View>

      {/* SIZES */}
      <View style={styles.sizes}>
        {items.map((item) => (
          <View key={item.id} style={styles.sizeRow}>
            <Text style={styles.sizeName}>{getSizeName(item.sizeId)}</Text>

            <Text style={styles.quantity}>{item.quantity} pcs</Text>

            <Text style={styles.unitPrice}>₱{item.unitPrice.toFixed(2)}</Text>

            <Text style={styles.itemTotal}>₱{item.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productGroup: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E5EB',
    backgroundColor: '#FFFFFF',
  },

  productName: {
    fontSize: f(14),
    fontWeight: '800',
    color: '#252B35',
  },

  colorHeader: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
    backgroundColor: '#1745D1',
  },

  colorName: {
    flex: 1,
    fontSize: f(12),
    fontWeight: '700',
    color: '#596273',
  },

  colorCount: {
    fontSize: f(11),
    fontWeight: '600',
    color: '#8A93A1',
  },

  sizes: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDF0F4',
  },

  sizeRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  sizeName: {
    flex: 1,
    fontSize: f(12),
    fontWeight: '600',
    color: '#252B35',
  },

  quantity: {
    width: 60,
    fontSize: f(12),
    color: '#5F6978',
  },

  unitPrice: {
    width: 75,
    fontSize: f(11),
    color: '#8A93A1',
    textAlign: 'right',
  },

  itemTotal: {
    width: 80,
    marginLeft: 10,
    fontSize: f(12),
    fontWeight: '800',
    color: '#252B35',
    textAlign: 'right',
  },
});
