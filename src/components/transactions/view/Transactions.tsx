import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColorStore } from '../../../store/useColorStore';
import { useProductStore } from '../../../store/useProductStore';
import { useSizeStore } from '../../../store/useSizeStore';
import { useTransactionStore } from '../../../store/useTransactionStore';
import TransactionDetails from './TransactionDetails';
import TransactionList from './TransactionList';

export default function Transactions() {
  const transactions = useTransactionStore((state) => state.transactions);

  const products = useProductStore((state) => state.products);
  const colors = useColorStore((state) => state.colors);
  const sizes = useSizeStore((state) => state.sizes);

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const selectedTransaction = useMemo(() => {
    if (!selectedTransactionId) {
      return null;
    }

    return transactions.find((transaction) => transaction.id === selectedTransactionId);
  }, [transactions, selectedTransactionId]);

  function getProductName(productId: string) {
    return products.find((product) => product.id === productId)?.name ?? 'Unknown Product';
  }

  function getColorName(colorId: string) {
    return colors.find((color) => color.id === colorId)?.name ?? 'Unknown Color';
  }

  function getSizeName(sizeId: string) {
    return sizes.find((size) => size.id === sizeId)?.name ?? 'Unknown Size';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transactions</Text>

          <Text style={styles.subtitle}>View all completed transactions.</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {transactions.length} transaction
            {transactions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <TransactionList
          transactions={transactions}
          selectedTransactionId={selectedTransactionId}
          onSelect={setSelectedTransactionId}
          hasDetails={!!selectedTransaction}
        />

        {selectedTransaction && (
          <TransactionDetails
            transaction={selectedTransaction}
            onClose={() => setSelectedTransactionId(null)}
            getProductName={getProductName}
            getColorName={getColorName}
            getSizeName={getSizeName}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FA',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#151A23',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#707989',
  },

  countBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE1E9',
  },

  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#596273',
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
});
