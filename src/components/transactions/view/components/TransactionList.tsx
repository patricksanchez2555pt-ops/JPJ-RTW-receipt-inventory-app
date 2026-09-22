import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import { useTransactionStore } from '../../../../store/useTransactionStore';
import type { Transaction } from '../../../../types/localModels';
import TransactionRow from '../TransactionRow';

type Props = {
  transactions: Transaction[];
  selectedTransactionId: string | null;
  onSelect: (id: string | null) => void;
};

export default function TransactionList({ transactions, selectedTransactionId, onSelect }: Props) {
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            isStatusShown={selectedTransactionId === null}
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
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    backgroundColor: '#FFFFFF',
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

  emptyTitle: {
    fontSize: f(18),
    fontWeight: '800',
    color: '#252B35',
  },

  emptySubtitle: {
    marginTop: 6,
    fontSize: f(13),
    color: '#7A8494',
  },
});
