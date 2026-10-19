import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { LaborItem, Size } from '@/types/localModels';
import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

import LaborItemRow from './components/LaborItemRow';

type OperationOption = { id: string; name: string; productId: string };
type PickerState = { itemId: string; type: 'operation' | 'size'; productId: string } | null;

type Props = {
  productId: string;
  productName: string;
  items: LaborItem[];
  totalPieces: number;
  totalEarned: number;
  operations: OperationOption[];
  sizes: Size[];
  operationById: Map<string, OperationOption>;
  sizeById: Map<string, Size>;
  activePicker: PickerState;
  setActivePicker: (value: PickerState) => void;
  onAddEntry: (productId: string, sizeId: string) => void;
  onSelect: (item: LaborItem, type: 'operation' | 'size', id: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDelete: (itemId: string) => void;
};

export default function LaborProductGroup(props: Props) {
  const {
    productId,
    productName,
    items,
    totalPieces,
    totalEarned,
    operations,
    sizes,
    operationById,
    sizeById,
    activePicker,
    setActivePicker,
    onAddEntry,
    onSelect,
    onQuantityChange,
    onDelete,
  } = props;

  // Group items by operationId
  const itemsByOperation = items.reduce<Record<string, LaborItem[]>>((acc, item) => {
    if (!acc[item.operationId]) {
      acc[item.operationId] = [];
    }
    acc[item.operationId].push(item);
    return acc;
  }, {});

  const sizesInItemsPerOperation = items.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.operationId]) {
      acc[item.operationId] = [item.sizeId];
    } else {
      acc[item.operationId].push(item.sizeId);
    }
    return acc;
  }, {});

  const sizesPerOperation = operations.reduce<Record<string, Size[]>>((acc, op) => {
    acc[op.id] = sizes.filter(
      (size) => size.productId === productId && !sizesInItemsPerOperation[op.id]?.includes(size.id),
    );
    return acc;
  }, {});

  // Fallback size ID for adding an entry
  const firstOperationId = operations[0]?.id;
  const defaultSizeId = firstOperationId
    ? (sizesPerOperation[firstOperationId]?.[0]?.id ?? '')
    : '';

  // Get all operations that actually have items, or fallback to all operations if empty
  const activeOperationIds = Object.keys(itemsByOperation);

  return (
    <View style={styles.productGroupCard}>
      <View style={styles.productGroupHeader}>
        <Text style={styles.productGroupName}>{productName}</Text>
        <View style={styles.productGroupHeaderRight}>
          <Text style={styles.productGroupSub}>
            {totalPieces} pcs · ₱{formatNumber(totalEarned)}
          </Text>
          {/* <Pressable
            style={({ pressed }) => [styles.addEntryBtn, pressed && styles.pressed]}
            onPress={() => {
              onAddEntry(productId, defaultSizeId);
            }}
          >
            <Ionicons name="add" size={13} color="#1745D1" />
            <Text style={styles.addEntryBtnText}>Add Entry</Text>
          </Pressable> */}
        </View>
      </View>

      <View style={styles.columnHeaderRow}>
        <Text style={[styles.columnHeaderText, styles.colOp]}>Operation</Text>
        <Text style={[styles.columnHeaderText, styles.colSize]}>Size</Text>
        <Text style={[styles.columnHeaderText, styles.colRate]}>Qty @ Rate</Text>
        <Text style={[styles.columnHeaderText, styles.colAmount]}>Amount</Text>
        <View style={styles.colActionSpacer} />
      </View>

      {activeOperationIds.map((opId) => {
        const opItems = itemsByOperation[opId] || [];
        const operationObj = operationById.get(opId);
        const opTotalPieces = opItems.reduce((sum, item) => sum + item.quantity, 0);
        const opTotalEarned = opItems.reduce((sum, item) => sum + item.subtotal, 0);

        return (
          <View key={opId} style={styles.operationSubGroup}>
            <View style={styles.operationHeaderRow}>
              <Text style={styles.operationHeaderText}>{operationObj?.name ?? opId}</Text>
              <Text style={styles.operationHeaderSub}>
                {opTotalPieces} pcs · ₱{formatNumber(opTotalEarned)}
              </Text>
            </View>

            {opItems.map((item) => (
              <LaborItemRow
                key={item.id}
                item={item}
                productId={productId}
                operationName={operationObj?.name ?? item.operationId}
                sizeName={sizeById.get(item.sizeId)?.name ?? 'N/A'}
                operations={operations}
                sizesOptions={sizesPerOperation[item.operationId] ?? []}
                activePicker={activePicker}
                setActivePicker={setActivePicker}
                onSelect={onSelect}
                onQuantityChange={onQuantityChange}
                onDelete={onDelete}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  productGroupCard: {
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  productGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  productGroupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productGroupName: {
    color: '#0F172A',
    fontSize: f(14),
    fontWeight: '700',
  },
  productGroupSub: {
    color: '#475569',
    fontSize: f(12),
    fontWeight: '600',
  },
  addEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addEntryBtnText: {
    color: '#1745D1',
    fontSize: f(11),
    fontWeight: '700',
  },
  columnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 4,
  },
  columnHeaderText: {
    fontSize: f(11),
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  colOp: {
    flex: 2,
    paddingRight: 6,
  },
  colSize: {
    width: 150,
  },
  colRate: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 6,
    gap: 4,
  },
  colAmount: {
    flex: 1.3,
    textAlign: 'right',
    paddingRight: 8,
  },
  colActionSpacer: {
    width: 24,
    alignItems: 'flex-end',
  },
  operationSubGroup: {
    marginTop: 6,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 4,
  },
  operationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 4,
  },
  operationHeaderText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#334155',
  },
  operationHeaderSub: {
    fontSize: f(11),
    fontWeight: '600',
    color: '#64748B',
  },
  pressed: {
    opacity: 0.7,
  },
});
