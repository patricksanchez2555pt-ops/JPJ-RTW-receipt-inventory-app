import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { LaborItem } from '@/types/localModels';
import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

import LaborProductGroup from './components/labor-product-group/LaborProductGroup';

type OperationOption = { id: string; name: string; productId: string };
type SizeOption = { id: string; name: string; productId: string; price?: number };
type PickerState = { itemId: string; type: 'operation' | 'size'; productId: string } | null;
type ProductGroup = {
  productId: string;
  productName: string;
  items: LaborItem[];
  productTotalPieces: number;
  productTotalEarned: number;
};
type DateGroup = {
  date: string;
  formattedLabel: string;
  products: ProductGroup[];
  dateTotalPieces: number;
  dateTotalEarned: number;
};

type Props = {
  groups: DateGroup[];
  operations: OperationOption[];
  sizes: SizeOption[];
  operationById: Map<string, OperationOption>;
  sizeById: Map<string, SizeOption>;
  activePicker: PickerState;
  setActivePicker: (value: PickerState) => void;
  onAddEntry: (date: string, productId: string, sizeId: string) => void;
  onSelect: (item: LaborItem, type: 'operation' | 'size', id: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDelete: (itemId: string) => void;
};

export default function LaborEntriesList(props: Props) {
  const {
    groups,
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

  return (
    <FlatList
      style={styles.entryList}
      data={groups}
      keyExtractor={(group) => group.date}
      contentContainerStyle={styles.entryListContent}
      renderItem={({ item: dateGroup }) => (
        <View style={styles.dateGroupContainer}>
          <View style={styles.dateGroupHeader}>
            <View style={styles.dateHeaderBadge}>
              <Ionicons name="calendar-outline" size={13} color="#1745D1" />
              <Text style={styles.dateHeaderText}>{dateGroup.formattedLabel}</Text>
            </View>
            <Text style={styles.dateHeaderSubtotal}>
              ₱{formatNumber(dateGroup.dateTotalEarned)} ({dateGroup.dateTotalPieces} pcs)
            </Text>
          </View>

          {dateGroup.products.map((group) => (
            <LaborProductGroup
              key={group.productId}
              productId={group.productId}
              productName={group.productName}
              items={group.items}
              totalPieces={group.productTotalPieces}
              totalEarned={group.productTotalEarned}
              operations={operations}
              sizes={sizes}
              operationById={operationById}
              sizeById={sizeById}
              activePicker={activePicker}
              setActivePicker={setActivePicker}
              onAddEntry={(productId, sizeId) => onAddEntry(dateGroup.date, productId, sizeId)}
              onSelect={onSelect}
              onQuantityChange={onQuantityChange}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No labor entries</Text>
          <Text style={styles.emptyText}>No work was recorded for this worker in this period.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  entryList: {
    flex: 1,
  },
  entryListContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  dateGroupContainer: {
    marginBottom: 16,
  },
  dateGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  dateHeaderText: {
    color: '#1745D1',
    fontSize: f(12),
    fontWeight: '700',
  },
  dateHeaderSubtotal: {
    color: '#64748B',
    fontSize: f(12),
    fontWeight: '600',
  },
  emptyState: {
    flexGrow: 1,
    minHeight: 160,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: f(16),
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 4,
    color: '#64748B',
    fontSize: f(13),
    textAlign: 'center',
  },
});
