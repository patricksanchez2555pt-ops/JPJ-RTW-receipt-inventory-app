import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDate, formatTime } from '@/utils/dateUtils';
import { f } from '@/utils/fontScale';

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
  const paidAmount = transaction.paidAmount ?? 0;

  const subtotal = useMemo(() => {
    return (transaction.items ?? []).reduce((sum, item) => sum + item.total, 0);
  }, [transaction.items]);

  const discount = transaction.discount ?? 0;

  const total = useMemo(() => {
    return subtotal - discount;
  }, [subtotal, discount]);

  const remainingBalance = total - paidAmount;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transaction Details</Text>

          <Text style={styles.id}>#{transaction.id.replace('tx-', '')}</Text>

          <Text style={styles.date}>
            {formatDate(transaction.date)} • {formatTime(transaction.date)}
          </Text>
        </View>

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
      <View style={styles.customerRow}>
        {/* CUSTOMER */}
        <View style={styles.customer}>
          <Text style={styles.customerLabel}>CUSTOMER</Text>

          <Text style={styles.customerName}>{transaction.buyerName || 'Walk-in Customer'}</Text>
        </View>

        {/* PAYMENT */}
        <View style={styles.payment}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Paid Amount</Text>

            <Text style={styles.paidValue}>₱{paidAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Remaining Balance</Text>

            <Text style={[styles.remainingValue, remainingBalance === 0 && styles.paidInFullValue]}>
              ₱{remainingBalance.toLocaleString()}
            </Text>
          </View>
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
    height: '100%',
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

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

  customerRow: {
    marginHorizontal: 16,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },

  customer: {
    flex: 1,
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

  payment: {
    width: 210,
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
    paddingVertical: 5,
  },

  paymentLabel: {
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

  summary: {
    width: 250,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  items: {
    flex: 1,
    height: '100%',
    marginTop: 10,
  },
});
