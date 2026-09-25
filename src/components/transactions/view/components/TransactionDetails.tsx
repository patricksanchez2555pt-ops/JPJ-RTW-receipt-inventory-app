import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDate, formatTime } from '@/utils/dateUtils';
import { f } from '@/utils/fontScale';

import { useTransactionStore } from '../../../../store/useTransactionStore';
import type { Transaction } from '../../../../types/localModels';
import AddedItemsPanel from '../../components/added-items-panel/AddedItemsPanel';
import type { AddedTransactionItem } from '../../form/types';

type Props = {
  transaction: Transaction;
  addedItems: AddedTransactionItem[];
  onClose: () => void;
  onEdit: () => void;
};

export default function TransactionDetails({ transaction, addedItems, onClose, onEdit }: Props) {
  const [isTopExpanded, setIsTopExpanded] = useState(true);

  const updateTransaction = useTransactionStore((state) => state.updateTransaction);

  const paidAmount = Number(transaction.paidAmount ?? 0);

  const subtotal = useMemo(() => {
    return (transaction.items ?? []).reduce((sum, item) => sum + item.total, 0);
  }, [transaction.items]);

  const discount = Number(transaction.discount ?? 0);

  const total = Math.max(0, subtotal - discount);

  const remainingBalance = Math.max(0, total - paidAmount);

  const isPaid = paidAmount >= total;

  function handleMarkAsPaid() {
    if (isPaid) {
      return;
    }

    Alert.alert(
      'Mark as Paid',
      `Mark transaction #${transaction.id.replace(
        'tx-',
        '',
      )} as fully paid?\n\nRemaining balance: ₱${remainingBalance.toLocaleString()}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark as Paid',
          onPress: () => {
            updateTransaction({
              ...transaction,
              paidAmount: total,
            });

            Alert.alert('Payment Updated', 'Transaction has been marked as fully paid.');
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      {/* COLLAPSIBLE TOP SECTION */}
      <View style={styles.topSection}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setIsTopExpanded((current) => !current)}
            style={styles.headerTitleContainer}
          >
            
            <View style={styles.headerTitleRow}>
              
              <Text style={styles.title}>Transaction Details</Text>
              <Text style={styles.collapseIcon}>{isTopExpanded ? '−' : '+'}</Text>
            </View>
            {!isTopExpanded && (
              <View style={styles.collapsedInfo}>
                <Text style={styles.collapsedId}>#{transaction.id.replace('tx-', '')}</Text>

                <Text style={styles.collapsedSeparator}>•</Text>

                <Text style={styles.collapsedCustomer} numberOfLines={1}>
                  {transaction.buyerName || 'Walk-in Customer'}
                </Text>

                <Text style={styles.collapsedSeparator}>•</Text>

                <Text style={styles.collapsedTotal}>₱{total.toLocaleString()}</Text>
              </View>
            )}
            {isTopExpanded && (
              <View>
                <Text style={styles.id}>#{transaction.id.replace('tx-', '')}</Text>

                <Text style={styles.date}>
                  {formatDate(transaction.date)} • {formatTime(transaction.date)}
                </Text>
              </View>
            )}
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
        </View>
        {/* CUSTOMER + PAYMENT + SUMMARY */}
        {isTopExpanded && (
          <View style={styles.customerRow}>
            {/* CUSTOMER */}
            <View style={styles.customer}>
              <Text style={styles.customerLabel}>CUSTOMER</Text>

              <Text style={styles.customerName} numberOfLines={2}>
                {transaction.buyerName || 'Walk-in Customer'}
              </Text>
            </View>

            {/* PAYMENT */}
            <View style={styles.payment}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Paid Amount</Text>

                <Text style={styles.paidValue}>₱{paidAmount.toLocaleString()}</Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Remaining Balance</Text>

                <Text style={[styles.remainingValue, isPaid && styles.paidInFullValue]}>
                  ₱{remainingBalance.toLocaleString()}
                </Text>
              </View>

              <Pressable
                onPress={handleMarkAsPaid}
                disabled={isPaid}
                style={({ pressed }) => [
                  styles.markPaidButton,
                  isPaid && styles.markPaidButtonDisabled,
                  pressed && !isPaid && styles.markPaidButtonPressed,
                ]}
              >
                <Text style={[styles.markPaidText, isPaid && styles.markPaidTextDisabled]}>
                  {isPaid ? '✓ Fully Paid' : 'Mark as Paid'}
                </Text>
              </Pressable>
            </View>

            {/* SUMMARY */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>

                <Text style={styles.summaryValue}>₱{subtotal.toLocaleString()}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>

                <Text style={styles.discountValue}>-₱{discount.toLocaleString()}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>

                <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
      {/* GROUPED ITEMS */}
      <View style={styles.items}>
        <AddedItemsPanel
          items={addedItems}
          buyersName={transaction.buyerName}
          transactionDate={transaction.date}
          total={total}
          isViewOnly
        />
      </View>
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

  // TOP COLLAPSIBLE SECTION
  topSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  // HEADER
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitleContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  title: {
    fontSize: f(18),
    fontWeight: '800',
    color: '#151A23',
  },

  id: {
    marginTop: 3,
    fontSize: f(12),
    fontWeight: '700',
    color: '#1745D1',
  },

  date: {
    marginTop: 4,
    fontSize: f(12),
    color: '#7A8494',
  },

  collapseIcon: {
    width: 24,
    height: 24,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: f(20),
    fontWeight: '700',
    color: '#687284',
  },

  collapsedInfo: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },

  collapsedId: {
    fontSize: f(11),
    fontWeight: '700',
    color: '#1745D1',
  },

  collapsedCustomer: {
    flexShrink: 1,
    fontSize: f(11),
    color: '#7A8494',
  },

  collapsedSeparator: {
    fontSize: f(11),
    color: '#B0B6C0',
  },

  collapsedTotal: {
    fontSize: f(12),
    fontWeight: '800',
    color: '#1745D1',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },

  editButton: {
    minWidth: 58,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1745D1',
  },

  editButtonPressed: {
    opacity: 0.75,
  },

  editText: {
    fontSize: f(12),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F5F7',
  },

  closeButtonPressed: {
    backgroundColor: '#E8EBEF',
  },

  closeText: {
    marginTop: -3,
    fontSize: f(25),
    color: '#687284',
  },

  // CUSTOMER + PAYMENT + SUMMARY
  customerRow: {
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },

  // CUSTOMER
  customer: {
    flex: 1,
    minWidth: 0,
    minHeight: 86,
    padding: 14,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },

  customerLabel: {
    fontSize: f(10),
    fontWeight: '800',
    color: '#8A93A1',
    letterSpacing: 0.5,
  },

  customerName: {
    marginTop: 5,
    fontSize: f(15),
    fontWeight: '800',
    color: '#252B35',
  },

  // PAYMENT
  payment: {
    flex: 1.15,
    minWidth: 0,
    minHeight: 86,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 5,
  },

  paymentLabel: {
    flexShrink: 1,
    fontSize: f(11),
    color: '#7A8494',
  },

  paidValue: {
    fontSize: f(14),
    fontWeight: '800',
    color: '#2F6B45',
  },

  remainingValue: {
    fontSize: f(14),
    fontWeight: '900',
    color: '#C45A5A',
  },

  paidInFullValue: {
    color: '#2F6B45',
  },

  markPaidButton: {
    minHeight: 30,
    marginTop: 8,
    paddingHorizontal: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1745D1',
  },

  markPaidButtonPressed: {
    opacity: 0.75,
  },

  markPaidButtonDisabled: {
    backgroundColor: '#EAF7EF',
  },

  markPaidText: {
    fontSize: f(11),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  markPaidTextDisabled: {
    color: '#21864A',
  },

  // SUMMARY
  summary: {
    flex: 1.1,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 3,
  },

  summaryLabel: {
    fontSize: f(12),
    color: '#7A8494',
  },

  summaryValue: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#3A424F',
  },

  discountValue: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#C45A5A',
  },

  totalRow: {
    marginTop: 4,
    paddingTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#DCE1E9',
  },

  totalLabel: {
    fontSize: f(14),
    fontWeight: '800',
    color: '#252B35',
  },

  totalValue: {
    fontSize: f(17),
    fontWeight: '900',
    color: '#1745D1',
  },

  // ITEMS
  items: {
    flex: 1,
    minHeight: 0,
    marginTop: 10,
  },
});
