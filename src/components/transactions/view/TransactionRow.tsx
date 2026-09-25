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
  isSmallTotal?: boolean;
  onPress: () => void;
  onDelete: () => void;
};

export default function TransactionRow({
  transaction,
  selected,
  isStatusShown,
  isDeleteButtonShown,
  isSmallTotal,
  onPress,
  onDelete,
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
          style={[styles.customerText, !transaction.buyerName && styles.walkInText]}
        >
          {transaction.buyerName || 'Walk-in Customer'}
        </Text>

        <Text style={styles.transactionId} numberOfLines={1}>
          #{transaction.id.replace('tx-', '')}
        </Text>
      </View>
      <View style={styles.itemsCol}>
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>{transaction.items?.length ?? 0}</Text>
        </View>
      </View>
      <View style={styles.totalCol}>
        <Text style={[styles.totalText, isSmallTotal && styles.smallTotalText]} numberOfLines={1}>
          ₱{formatNumber(total)}
        </Text>
      </View>
      {isStatusShown && (
        <View style={styles.statusCol}>
          <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
            <Text style={[styles.statusText, isPaid ? styles.paidText : styles.unpaidText]}>
              {isPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
        </View>
      )}

      {isDeleteButtonShown && (
        <View style={styles.actionCol}>
          <Pressable
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              onDelete();
            }}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
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

  // Relative column widths
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
    flex: 0.8,
    minWidth: 0,
    alignItems: 'flex-end',
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

  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 6,
  },

  deleteButtonPressed: {
    backgroundColor: '#FEECEC',
  },

  deleteText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#D64545',
  },
});
