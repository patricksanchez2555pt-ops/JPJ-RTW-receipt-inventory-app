import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '../../../types/localModels';
import TransactionProductGroup from './TransactionProductGroup';
import TransactionSummary from './TransactionSummary';

type Props = {
  transaction: Transaction;
  onClose: () => void;

  getProductName: (productId: string) => string;
  getColorName: (colorId: string) => string;
  getSizeName: (sizeId: string) => string;
};

type ProductGroup = {
  productId: string;
  productName: string;
  colors: {
    colorId: string;
    colorName: string;
    items: Transaction['items'];
  }[];
};

export default function TransactionDetails({
  transaction,
  onClose,
  getProductName,
  getColorName,
  getSizeName,
}: Props) {
  const groupedItems = useMemo(() => {
    const productMap = new Map<string, ProductGroup>();

    for (const item of transaction.items) {
      let productGroup = productMap.get(item.productId);

      if (!productGroup) {
        productGroup = {
          productId: item.productId,
          productName: getProductName(item.productId),
          colors: [],
        };

        productMap.set(item.productId, productGroup);
      }

      let colorGroup = productGroup.colors.find((color) => color.colorId === item.colorId);

      if (!colorGroup) {
        colorGroup = {
          colorId: item.colorId,
          colorName: getColorName(item.colorId),
          items: [],
        };

        productGroup.colors.push(colorGroup);
      }

      colorGroup.items.push(item);
    }

    return Array.from(productMap.values());
  }, [transaction.items, getProductName, getColorName]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const totalQuantity = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transaction Details</Text>

          <Text style={styles.id}>#{transaction.id.replace('tx-', '')}</Text>
        </View>

        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      {/* CUSTOMER */}
      <View style={styles.customer}>
        <Text style={styles.customerLabel}>CUSTOMER</Text>

        <Text style={styles.customerName}>{transaction.buyerName || 'Walk-in Customer'}</Text>

        <Text style={styles.date}>
          {formatDate(transaction.date)} • {formatTime(transaction.date)}
        </Text>
      </View>

      {/* ITEMS HEADER */}
      <View style={styles.itemsHeader}>
        <View>
          <Text style={styles.itemsTitle}>Added Items</Text>

          <Text style={styles.itemsSubtitle}>
            {totalQuantity} pcs • {groupedItems.length} product
            {groupedItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* GROUPED ITEMS */}
      <ScrollView
        style={styles.items}
        contentContainerStyle={styles.itemsContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedItems.map((product) => (
          <View key={product.productId} style={styles.productSection}>
            {product.colors.map((color) => (
              <TransactionProductGroup
                key={`${product.productId}-${color.colorId}`}
                productName={product.productName}
                colorName={color.colorName}
                items={color.items}
                getSizeName={getSizeName}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {/* SUMMARY */}
      <TransactionSummary
        subtotal={transaction.subtotal}
        discount={transaction.discount}
        total={transaction.total}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 390,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    backgroundColor: '#FFFFFF',
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A23',
  },

  id: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#1745D1',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F5F7',
  },

  closeText: {
    marginTop: -3,
    fontSize: 25,
    color: '#687284',
  },

  customer: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },

  customerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A93A1',
    letterSpacing: 0.5,
  },

  customerName: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: '800',
    color: '#252B35',
  },

  date: {
    marginTop: 4,
    fontSize: 12,
    color: '#7A8494',
  },

  itemsHeader: {
    marginTop: 18,
    paddingHorizontal: 18,
  },

  itemsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#252B35',
  },

  itemsSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#7A8494',
  },

  items: {
    flex: 1,
    marginTop: 10,
  },

  itemsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },

  productSection: {
    gap: 8,
  },
});
