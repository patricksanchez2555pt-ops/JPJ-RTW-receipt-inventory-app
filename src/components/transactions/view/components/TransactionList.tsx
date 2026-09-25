import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { parseDateInput } from '@/utils/dateUtils';
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

  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [unpaidOnly, setUnpaidOnly] = useState(false);

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

  const filteredTransactions = useMemo(() => {
    const normalizedName = nameFilter.trim().toLowerCase();
    const dateFilterRange = parseDateInput(dateFilter);

    return transactions.filter((transaction) => {
      /*
       * Name filter
       */
      if (normalizedName) {
        const buyerName = (transaction.buyerName ?? '').toLowerCase();

        if (!buyerName.includes(normalizedName)) {
          return false;
        }
      }

      /*
       * Date filter
       */
      if (dateFilterRange?.type !== 'invalid') {
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(dateFilterRange.startDate ?? '');
        const endDate = new Date(dateFilterRange.endDate ?? '');

        if (dateFilterRange?.type === 'single') {
          if (
            transactionDate.getMonth() !== startDate.getMonth() ||
            transactionDate.getDate() !== startDate.getDate() ||
            transactionDate.getFullYear() !== startDate.getFullYear()
          ) {
            return false;
          }
        } else {
          if (transactionDate < startDate || transactionDate > endDate) {
            return false;
          }
        }
      }

      /*
       * Unpaid filter
       */
      if (unpaidOnly) {
        const paidAmount = Number(transaction.paidAmount ?? 0);
        const total = Number(transaction.total ?? 0);

        if (paidAmount >= total) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, nameFilter, dateFilter, unpaidOnly]);

  function clearFilters() {
    setNameFilter('');
    setDateFilter('');
    setUnpaidOnly(false);
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
      {/* FILTER BAR */}
      <View style={styles.filterContainer}>
        <View style={styles.filterInputContainer}>
          <Text style={styles.filterLabel}>Name</Text>

          <TextInput
            value={nameFilter}
            onChangeText={setNameFilter}
            placeholder="Search buyer name..."
            placeholderTextColor="#9AA3B1"
            style={styles.filterInput}
            clearButtonMode="while-editing"
          />
        </View>

        <View style={styles.filterInputContainer}>
          <Text style={styles.filterLabel}>Date</Text>

          <TextInput
            value={dateFilter}
            onChangeText={setDateFilter}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9AA3B1"
            style={styles.filterInput}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <Pressable
          onPress={() => setUnpaidOnly((current) => !current)}
          style={({ pressed }) => [
            styles.unpaidButton,
            unpaidOnly && styles.unpaidButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.checkbox, unpaidOnly && styles.checkboxActive]}>
            {unpaidOnly && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <Text style={[styles.unpaidButtonText, unpaidOnly && styles.unpaidButtonTextActive]}>
            Unpaid
          </Text>
        </Pressable>

        <Pressable
          onPress={clearFilters}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>

      {/* RESULTS */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>No Matching Transactions</Text>

          <Text style={styles.noResultsSubtitle}>
            Try changing the name, date, or unpaid filter.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredTransactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              isStatusShown={selectedTransactionId === null}
              isDeleteButtonShown={selectedTransactionId === null}
              isSmallTotal={selectedTransactionId !== null}
              transaction={transaction}
              selected={transaction.id === selectedTransactionId}
              onPress={() =>
                onSelect(transaction.id === selectedTransactionId ? null : transaction.id)
              }
              onDelete={() => handleDelete(transaction)}
            />
          ))}
        </ScrollView>
      )}
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

  filterContainer: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
    backgroundColor: '#F8F9FB',
  },

  filterInputContainer: {
    flex: 1,
    minWidth: 120,
  },

  filterLabel: {
    marginBottom: 5,
    fontSize: f(11),
    fontWeight: '700',
    color: '#687284',
  },

  filterInput: {
    height: 38,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    fontSize: f(12),
    color: '#252B35',
  },

  unpaidButton: {
    height: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },

  unpaidButtonActive: {
    backgroundColor: '#FFF3E8',
    borderColor: '#F0C28F',
  },

  checkbox: {
    width: 17,
    height: 17,
    borderWidth: 1.5,
    borderColor: '#B8C0CC',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  checkboxActive: {
    borderColor: '#C66A16',
    backgroundColor: '#C66A16',
  },

  checkmark: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  unpaidButtonText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#596273',
  },

  unpaidButtonTextActive: {
    color: '#C66A16',
  },

  clearButton: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF1F5',
    borderWidth: 1,
    borderColor: '#D8DDE5',
  },

  clearButtonText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#596273',
  },

  pressed: {
    opacity: 0.6,
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

  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  noResultsTitle: {
    fontSize: f(16),
    fontWeight: '800',
    color: '#252B35',
  },

  noResultsSubtitle: {
    marginTop: 6,
    fontSize: f(13),
    color: '#7A8494',
    textAlign: 'center',
  },
});
