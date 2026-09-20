import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import { useTransactionStore } from '../../../store/useTransactionStore';
import TransactionDetails from './components/TransactionDetails';
import TransactionList from './components/TransactionList';

export default function Transactions() {
  const transactions = useTransactionStore((state) => state.transactions);

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const selectedTransaction = useMemo(() => {
    if (!selectedTransactionId) {
      return null;
    }

    return transactions.find((transaction) => transaction.id === selectedTransactionId);
  }, [transactions, selectedTransactionId]);

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
        <View
          style={selectedTransaction ? styles.transactionList : styles.transactionListNoSelected}
        >
          <TransactionList
            transactions={transactions}
            selectedTransactionId={selectedTransactionId}
            onSelect={setSelectedTransactionId}
            hasDetails={!!selectedTransaction}
          />
        </View>

        {selectedTransaction && (
          <View style={styles.transactionDetails}>
            <TransactionDetails
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
  },

  transactionList: {
    width: '40%',
    height: '100%',
  },

  transactionListNoSelected: {
    width: '100%',
    height: '100%',
  },

  transactionDetails: {
    width: '60%',
    height: '100%',
  },
});
