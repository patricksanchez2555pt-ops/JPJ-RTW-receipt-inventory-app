import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTransactionStore } from '../../../store/useTransactionStore';
import type { Transaction } from '../../../types/localModels';
import TransactionRow from './TransactionRow';

type Props = {
  transactions: Transaction[];
  selectedTransactionId: string | null;
  onSelect: (id: string | null) => void;
  hasDetails: boolean;
};

export default function TransactionList({
  transactions,
  selectedTransactionId,
  onSelect,
  hasDetails,
}: Props) {
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);

  function handleDelete(transaction: Transaction) {
    Alert.alert('Delete Transaction', `Delete transaction #${transaction.id}?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(transaction.id);

          if (selectedTransactionId === transaction.id) {
            onSelect(null);
          }
        },
      },
    ]);
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Transactions</Text>

        <Text style={styles.emptySubtitle}>Transactions you save will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, hasDetails && styles.containerWithDetails]}>
      <View style={styles.tableHeader}>
        <View style={styles.transactionCol} />
        <View style={styles.dateCol} />
        <View style={styles.customerCol} />
        <View style={styles.itemsCol} />
        <View style={styles.totalCol} />
        <View style={styles.actionCol} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            selected={transaction.id === selectedTransactionId}
            onPress={() =>
              onSelect(transaction.id === selectedTransactionId ? null : transaction.id)
            }
            onDelete={() => handleDelete(transaction)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#252B35',
  },

  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#7A8494',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    backgroundColor: '#FFFFFF',
  },

  containerWithDetails: {
    flex: 1.45,
  },

  tableHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F7F8FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EB',
  },

  transactionCol: {
    width: 145,
  },

  dateCol: {
    width: 125,
  },

  customerCol: {
    flex: 1,
    minWidth: 120,
  },

  itemsCol: {
    width: 70,
  },

  totalCol: {
    width: 120,
  },

  actionCol: {
    width: 80,
  },

  listContent: {
    paddingBottom: 20,
  },

  emptyContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    width: 200,
    height: 100,
  },
});
