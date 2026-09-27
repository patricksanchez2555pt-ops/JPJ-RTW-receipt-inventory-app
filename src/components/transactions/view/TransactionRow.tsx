import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

import type { Transaction } from '../../../types/localModels';

type Props = {
  transaction: Transaction;
  selected: boolean;
  isStatusShown: boolean;
  isDeleteButtonShown?: boolean;
  isEditButtonShown?: boolean;
  isMarkAsPaidButtonShown?: boolean;
  isSmallTotal?: boolean;
  onPress: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onMarkAsPaid?: () => void;
};

export default function TransactionRow({
  transaction,
  selected,
  isStatusShown,
  isDeleteButtonShown,
  isEditButtonShown,
  isMarkAsPaidButtonShown,
  isSmallTotal,
  onPress,
  onDelete,
  onEdit,
  onMarkAsPaid,
}: Props) {
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

  const paidAmount = Number(transaction.paidAmount ?? 0);
  const total = Number(transaction.total ?? 0);
  const isPaid = paidAmount >= total;

  const showMarkAsPaid =
    isMarkAsPaidButtonShown && !isPaid && onMarkAsPaid;

  const showActions =
    isEditButtonShown ||
    showMarkAsPaid ||
    isDeleteButtonShown;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.selectedRow,
        pressed && styles.pressedRow,
      ]}
    >
      <View style={styles.dateCol}>
        <Text style={styles.dateText} numberOfLines={1}>
          {formatDate(transaction.date)}
        </Text>

        <Text style={styles.timeText} numberOfLines={1}>
          {formatTime(transaction.date)}
        </Text>
      </View>

      <View style={styles.customerCol}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.customerText,
            !transaction.buyerName && styles.walkInText,
          ]}
        >
          {transaction.buyerName || 'Walk-in Customer'}
        </Text>

        <Text style={styles.transactionId} numberOfLines={1}>
          #{transaction.id.replace('tx-', '')}
        </Text>
      </View>

      <View style={styles.itemsCol}>
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>
            {transaction.items?.length ?? 0}
          </Text>
        </View>
      </View>

      <View style={styles.totalCol}>
        <Text
          style={[
            styles.totalText,
            isSmallTotal && styles.smallTotalText,
          ]}
          numberOfLines={1}
        >
          ₱{formatNumber(total)}
        </Text>
      </View>

      {isStatusShown && (
        <View style={styles.statusCol}>
          <View
            style={[
              styles.statusBadge,
              isPaid ? styles.paidBadge : styles.unpaidBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isPaid ? styles.paidText : styles.unpaidText,
              ]}
            >
              {isPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
        </View>
      )}

      {showActions && (
        <View style={styles.actionCol}>
          {showMarkAsPaid && (
            <Pressable
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                onMarkAsPaid?.();
              }}
              style={({ pressed }) => [
                styles.actionButton,
                styles.markPaidButton,
                pressed && styles.markPaidButtonPressed,
              ]}
            >
              <Text style={styles.markPaidText}>Mark Paid</Text>
            </Pressable>
          )}

          {isEditButtonShown && onEdit && (
            <Pressable
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                onEdit();
              }}
              style={({ pressed }) => [
                styles.actionButton,
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          )}

          {isDeleteButtonShown && (
            <Pressable
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                onDelete();
              }}
              style={({ pressed }) => [
                styles.actionButton,
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F4',
    gap: 6,
  },

  selectedRow: {
    backgroundColor: '#F0F4FF',
  },

  pressedRow: {
    opacity: 0.75,
  },

  dateCol: {
    flex: 1.4,
    minWidth: 0,
  },

  customerCol: {
    flex: 2.2,
    minWidth: 0,
  },

  itemsCol: {
    flex: 0.55,
    minWidth: 0,
    alignItems: 'center',
  },

  totalCol: {
    flex: 1.2,
    minWidth: 0,
    alignItems: 'flex-end',
  },

  statusCol: {
    flex: 0.9,
    minWidth: 0,
    alignItems: 'center',
  },

  actionCol: {
    flex: 1.8,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },

  customerText: {
    fontSize: f(13),
    fontWeight: '600',
    color: '#252B35',
  },

  walkInText: {
    color: '#8A93A1',
    fontWeight: '500',
  },

  transactionId: {
    marginTop: 3,
    fontSize: f(11),
    fontWeight: '600',
    color: '#1745D1',
  },

  dateText: {
    fontSize: f(13),
    fontWeight: '600',
    color: '#252B35',
  },

  timeText: {
    marginTop: 3,
    fontSize: f(11),
    color: '#8A93A1',
  },

  itemBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },

  itemBadgeText: {
    fontSize: f(12),
    fontWeight: '800',
    color: '#1745D1',
  },

  totalText: {
    fontSize: f(14),
    fontWeight: '800',
    color: '#151A23',
  },

  smallTotalText: {
    fontSize: f(8),
  },

  statusBadge: {
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  paidBadge: {
    backgroundColor: '#EAF7EF',
  },

  unpaidBadge: {
    backgroundColor: '#FFF3E8',
  },

  statusText: {
    fontSize: f(11),
    fontWeight: '800',
  },

  paidText: {
    color: '#21864A',
  },

  unpaidText: {
    color: '#C66A16',
  },

  actionButton: {
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 6,
  },

  editButton: {
    backgroundColor: '#EEF2FF',
  },

  editButtonPressed: {
    backgroundColor: '#DDE5FF',
  },

  editText: {
    fontSize: f(11),
    fontWeight: '700',
    color: '#1745D1',
  },

  markPaidButton: {
    backgroundColor: '#EAF7EF',
  },

  markPaidButtonPressed: {
    backgroundColor: '#D7F0E0',
  },

  markPaidText: {
    fontSize: f(11),
    fontWeight: '700',
    color: '#21864A',
  },

  deleteButton: {
    backgroundColor: '#FFFFFF',
  },

  deleteButtonPressed: {
    backgroundColor: '#FEECEC',
  },

  deleteText: {
    fontSize: f(11),
    fontWeight: '700',
    color: '#D64545',
  },
});