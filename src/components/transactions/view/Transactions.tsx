import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColorStore } from '@/store/useColorStore';
import { useProductStore } from '@/store/useProductStore';
import { useSizeStore } from '@/store/useSizeStore';
import { f } from '@/utils/fontScale';

import { useTransactionStore } from '../../../store/useTransactionStore';
import TransactionForm from '../form/TransactionForm';
import type { AddedTransactionItem } from '../form/types';
import TransactionDetails from './components/TransactionDetails';
import TransactionList from './components/TransactionList';

export default function Transactions() {
  const transactions = useTransactionStore((state) => state.transactions);

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const selectedTransaction = useMemo(() => {
    if (!selectedTransactionId) {
      return null;
    }

    return transactions.find((transaction) => transaction.id === selectedTransactionId);
  }, [transactions, selectedTransactionId]);

  const products = useProductStore((state) => state.products);
  const colors = useColorStore((state) => state.colors);
  const sizes = useSizeStore((state) => state.sizes);

  const addedItems = useMemo<AddedTransactionItem[]>(() => {
    return (selectedTransaction?.items ?? []).flatMap((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const color = colors.find((entry) => entry.id === item.colorId);
      const size = sizes.find((entry) => entry.id === item.sizeId);

      if (!product || !color || !size) {
        return [];
      }

      return [
        {
          ...item,
          product,
          color,
          size,
        },
      ];
    });
  }, [selectedTransaction, products, colors, sizes]);

  const hasSelectedTransaction = !!selectedTransaction;

  if (isEditMode) {
    return (
      <TransactionForm
        title="Edit Transaction"
        subtitle={selectedTransactionId ?? ''}
        transaction={selectedTransaction}
        addedItems={addedItems}
        onClose={() => {
          setIsEditMode(false);
        }}
        onUpdate={() => {
          setIsEditMode(false);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transactions</Text>

          <Text style={styles.subtitle}>
            Manage completed transactions, payments, and order details.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {transactions.length} transaction
            {transactions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.transactionList,
            hasSelectedTransaction ? styles.transactionListWithDetails : styles.transactionListFull,
          ]}
        >
          <TransactionList
            transactions={transactions}
            selectedTransactionId={selectedTransactionId}
            onSelect={setSelectedTransactionId}
          />
        </View>

        {selectedTransaction && (
          <View style={styles.transactionDetails}>
            <TransactionDetails
              addedItems={addedItems}
              onEdit={() => {
                setIsEditMode(true);
              }}
              transaction={selectedTransaction}
              onClose={() => setSelectedTransactionId(null)}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    padding: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: f(26),
    fontWeight: '800',
    color: '#151A23',
  },

  subtitle: {
    marginTop: 4,
    fontSize: f(14),
    color: '#707989',
    maxWidth: 600,
  },

  formContainer: {
    flex: 1,
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
    fontSize: f(13),
    fontWeight: '700',
    color: '#596273',
  },

  content: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },

  transactionList: {
    height: '100%',
  },

  transactionListFull: {
    width: '100%',
  },

  transactionListWithDetails: {
    width: '40%',
  },

  transactionDetails: {
    width: '60%',
    height: '100%',
  },
});
