import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatPrintTransactions } from '@/helpers/printerFormatters';
import { parseDateInput } from '@/utils/dateUtils';
import { f } from '@/utils/fontScale';

import type { Transaction } from '../../../../types/localModels';
import TransactionRow from '../TransactionRow';

type Props = {
  transactions: Transaction[];
  selectedTransactionId: string | null;
  onDeleteTransaction: (id: string) => void;
  onSelect: (id: string | null) => void;
};

export default function TransactionList({
  transactions,
  selectedTransactionId,
  onDeleteTransaction,
  onSelect,
}: Props) {
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [unpaidOnly, setUnpaidOnly] = useState(false);

  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTransactionIds([]);
  }, [nameFilter, dateFilter, unpaidOnly]);

  function toggleTransactionSelection(id: string) {
    setSelectedTransactionIds((current) =>
      current.includes(id)
        ? current.filter((transactionId) => transactionId !== id)
        : [...current, id],
    );
  }

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
          onDeleteTransaction(transaction.id);

          setSelectedTransactionIds((current) => current.filter((id) => id !== transaction.id));

          if (selectedTransactionId === transaction.id) {
            onSelect(null);
          }
        },
      },
    ]);
  }

  function handlePrint() {
    const printText = formatPrintTransactions(
      selectedTransactionIds.map((curr): Transaction | undefined =>
        transactions.find((t) => t.id === curr),
      ),
    );
    console.log(printText);
  }

  /*
   * Filters
   */
  const normalizedName = nameFilter.trim().toLowerCase();
  const dateFilterRange = parseDateInput(dateFilter);

  const filteredTransactions = transactions.filter((transaction) => {
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

  /*
   * Selection state for visible transactions
   */
  const allVisibleSelected =
    filteredTransactions.length === selectedTransactionIds.length &&
    filteredTransactions.every((t) => selectedTransactionIds.includes(t.id));

  /*
   * Select / Deselect all visible transactions.
   *
   * Important:
   * - Selecting adds only visible IDs.
   * - Deselecting removes only visible IDs.
   * - Selections belonging to hidden transactions are preserved.
   */
  function handleSelectAll() {
    setSelectedTransactionIds(() => {
      if (allVisibleSelected) {
        return [];
      }

      return filteredTransactions.map((transaction) => transaction.id);
    });
  }

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
        {/* NAME */}
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

        {/* DATE */}
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

        {/* UNPAID */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: unpaidOnly }}
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

        {/* CLEAR */}
        <Pressable
          onPress={clearFilters}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>

      {/* ACTION BAR */}
      <View style={styles.actionBar}>
        <View style={styles.actionBarLeft}>
          {/* SELECT ALL VISIBLE */}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: allVisibleSelected,
            }}
            disabled={filteredTransactions.length === 0}
            onPress={handleSelectAll}
            style={({ pressed }) => [
              styles.selectAllButton,
              allVisibleSelected && styles.selectAllButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.checkbox, allVisibleSelected && styles.selectAllCheckboxActive]}>
              {allVisibleSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>

            <Text
              style={[
                styles.selectAllButtonText,
                allVisibleSelected && styles.selectAllButtonTextActive,
              ]}
            >
              {allVisibleSelected ? 'Deselect All' : 'Select All'}
            </Text>
          </Pressable>

          {/* PRINT SUMMARY */}
          <Pressable
            onPress={handlePrint}
            style={({ pressed }) => [styles.printButton, pressed && styles.pressed]}
          >
            <Text style={styles.printButtonIcon}>▤</Text>

            <Text style={styles.printButtonText}>Print Summary</Text>
          </Pressable>
        </View>

        {/* SELECTED COUNT */}
        {selectedTransactionIds.length > 0 && (
          <Text style={styles.selectedCount}>{selectedTransactionIds.length} selected</Text>
        )}
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
          {filteredTransactions.map((transaction) => {
            const isChecked = selectedTransactionIds.includes(transaction.id);

            return (
              <View key={transaction.id} style={styles.transactionRow}>
                {/* TRANSACTION CHECKBOX */}
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: isChecked,
                  }}
                  onPress={() => toggleTransactionSelection(transaction.id)}
                  style={({ pressed }) => [styles.checkboxButton, pressed && styles.pressed]}
                >
                  <View
                    style={[
                      styles.transactionCheckbox,
                      isChecked && styles.transactionCheckboxActive,
                    ]}
                  >
                    {isChecked && <Text style={styles.transactionCheckmark}>✓</Text>}
                  </View>
                </Pressable>

                {/* TRANSACTION */}
                <View style={styles.transactionContent}>
                  <TransactionRow
                    isStatusShown={selectedTransactionId === null}
                    isDeleteButtonShown={selectedTransactionId === null}
                    isEditButtonShown={selectedTransactionId === null}
                    isMarkAsPaidButtonShown={selectedTransactionId === null}
                    isSmallTotal={selectedTransactionId !== null}
                    transaction={transaction}
                    selected={transaction.id === selectedTransactionId}
                    onPress={() =>
                      onSelect(transaction.id === selectedTransactionId ? null : transaction.id)
                    }
                    onDelete={() => handleDelete(transaction)}
                    onEdit={() => {}}
                    onMarkAsPaid={() => {}}
                  />
                </View>
              </View>
            );
          })}
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

  /*
   * ACTION BAR
   */

  actionBar: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
    backgroundColor: '#FFFFFF',
  },

  actionBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  printButton: {
    height: 38,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },

  printButtonIcon: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  printButtonText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  selectAllButton: {
    height: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },

  selectAllButtonActive: {
    backgroundColor: '#EEF4FF',
    borderColor: '#AFC8F5',
  },

  selectAllButtonText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#596273',
  },

  selectAllButtonTextActive: {
    color: '#2563EB',
  },

  selectedCount: {
    fontSize: f(12),
    fontWeight: '600',
    color: '#687284',
  },

  /*
   * FILTER BAR
   */

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

  /*
   * UNPAID
   */

  unpaidButton: {
    height: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

  unpaidButtonText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#596273',
  },

  unpaidButtonTextActive: {
    color: '#C66A16',
  },

  /*
   * CHECKBOXES
   */

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

  selectAllCheckboxActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },

  checkmark: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /*
   * CLEAR
   */

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
    opacity: 0.65,
  },

  /*
   * TRANSACTION ROWS
   */

  transactionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  checkboxButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  transactionCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#B8C0CC',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  transactionCheckboxActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },

  transactionCheckmark: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  transactionContent: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 20,
  },

  /*
   * EMPTY STATES
   */

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
