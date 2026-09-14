import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import type { Transaction } from '../../../types/localModels';

type Props = {
  transaction: Transaction;
  selected: boolean;
  onPress: () => void;
  onDelete: () => void;
};

export default function TransactionRow({ transaction, selected, onPress, onDelete }: Props) {
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

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.selectedRow,
        pressed && styles.pressedRow,
      ]}
    >
      <View style={styles.transactionCol}>
        <Text style={styles.transactionId}>#{transaction.id.replace('tx-', '')}</Text>
      </View>

      <View style={styles.dateCol}>
        <Text style={styles.dateText}>{formatDate(transaction.date)}</Text>

        <Text style={styles.timeText}>{formatTime(transaction.date)}</Text>
      </View>

      <View style={styles.customerCol}>
        <Text
          numberOfLines={1}
          style={[styles.customerText, !transaction.buyerName && styles.walkInText]}
        >
          {transaction.buyerName || 'Walk-in Customer'}
        </Text>
      </View>

      <View style={styles.itemsCol}>
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>{transaction.items?.length ?? 0}</Text>
        </View>
      </View>

      <View style={styles.totalCol}>
        <Text style={styles.totalText}>₱{transaction.total.toFixed(2)}</Text>
      </View>

      <View style={styles.actionCol}>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F4',
  },

  selectedRow: {
    backgroundColor: '#F0F4FF',
  },

  pressedRow: {
    opacity: 0.75,
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
    alignItems: 'center',
  },

  totalCol: {
    width: 120,
    alignItems: 'flex-end',
  },

  actionCol: {
    width: 80,
    alignItems: 'flex-end',
  },

  transactionId: {
    fontSize: f(13),
    fontWeight: '700',
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

  customerText: {
    fontSize: f(13),
    fontWeight: '600',
    color: '#252B35',
  },

  walkInText: {
    color: '#8A93A1',
    fontWeight: '500',
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

  deleteButton: {
    paddingHorizontal: 10,
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
