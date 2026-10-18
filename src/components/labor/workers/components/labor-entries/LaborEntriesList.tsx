import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Deduction, LaborItem } from '@/types/localModels';
import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

import LaborProductGroup from './components/labor-product-group/LaborProductGroup';

type OperationOption = { id: string; name: string; productId: string };
type SizeOption = { id: string; name: string; productId: string; price?: number };
type ColorOption = { id: string; name: string; productId: string; hexValue: string };
type PickerState = {
  itemId: string;
  type: 'operation' | 'size' | 'color';
  productId: string;
} | null;

type ColorGroup = {
  colorId: string;
  colorName: string;
  colorHex: string;
  items: LaborItem[];
  colorTotalPieces: number;
  colorTotalEarned: number;
};

type ProductGroup = {
  productId: string;
  productName: string;
  colors: ColorGroup[];
  productTotalPieces: number;
  productTotalEarned: number;
};

type DateGroup = {
  date: string;
  formattedLabel: string;
  products: ProductGroup[];
  dateTotalPieces: number;
  dateTotalEarned: number;
  deductions: Deduction[];
  dateTotalDeductions: number;
};

type Props = {
  groups: DateGroup[];
  operations: OperationOption[];
  sizes: SizeOption[];
  colors: ColorOption[];
  operationById: Map<string, OperationOption>;
  sizeById: Map<string, SizeOption>;
  colorById: Map<string, ColorOption>;
  activePicker: PickerState;
  setActivePicker: (value: PickerState) => void;
  onAddEntry: (date: string, productId: string, colorId: string) => void;
  onSelect: (item: LaborItem, type: 'operation' | 'size' | 'color', id: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDelete: (itemId: string) => void;
  onAddDeduction: (deduction: {
    workerId: string;
    amount: number;
    label: string;
    date: string;
    colorId?: string;
  }) => void;
  onDeleteDeduction: (id: string, date: string) => void;
  workerId: string;
};

export default function LaborEntriesList(props: Props) {
  const {
    groups,
    operations,
    sizes,
    colors,
    operationById,
    sizeById,
    colorById,
    activePicker,
    setActivePicker,
    onAddEntry,
    onSelect,
    onQuantityChange,
    onDelete,
    onAddDeduction,
    onDeleteDeduction,
    workerId,
  } = props;

  const [addingForDate, setAddingForDate] = useState<string | null>(null);
  const [deductionLabel, setDeductionLabel] = useState('');
  const [deductionAmount, setDeductionAmount] = useState('');

  const handleSaveDeduction = (date: string) => {
    const amountNum = parseFloat(deductionAmount);
    if (!deductionLabel.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onAddDeduction({
      workerId,
      label: deductionLabel.trim(),
      amount: amountNum,
      date,
    });

    setDeductionLabel('');
    setDeductionAmount('');
    setAddingForDate(null);
  };

  return (
    <FlatList
      style={styles.entryList}
      data={groups}
      keyExtractor={(group) => group.date}
      contentContainerStyle={styles.entryListContent}
      renderItem={({ item: dateGroup }) => {
        const netDateEarned = dateGroup.dateTotalEarned - dateGroup.dateTotalDeductions;
        const isAddingHere = addingForDate === dateGroup.date;

        return (
          <View style={styles.dateGroupContainer}>
            <View style={styles.dateGroupHeader}>
              <View style={styles.dateHeaderBadge}>
                <Ionicons name="calendar-outline" size={13} color="#1745D1" />
                <Text style={styles.dateHeaderText}>{dateGroup.formattedLabel}</Text>
              </View>
              <View style={styles.dateHeaderRight}>
                <Text style={styles.dateHeaderSubtotal}>
                  Earned: ₱{formatNumber(dateGroup.dateTotalEarned)} ({dateGroup.dateTotalPieces}{' '}
                  pcs)
                </Text>
                {dateGroup.dateTotalDeductions > 0 && (
                  <Text style={styles.dateHeaderDeduction}>
                    - Deductions: ₱{formatNumber(dateGroup.dateTotalDeductions)}
                  </Text>
                )}
                <Text style={styles.dateHeaderNet}>Net: ₱{formatNumber(netDateEarned)}</Text>
              </View>
            </View>

            {/* Deductions section inside date group */}
            <View style={styles.deductionsContainer}>
              <View style={styles.deductionsHeaderRow}>
                <Text style={styles.deductionsTitle}>Deductions</Text>
                <Pressable
                  style={styles.addDeductionBtn}
                  onPress={() => {
                    setAddingForDate(isAddingHere ? null : dateGroup.date);
                    setDeductionLabel('');
                    setDeductionAmount('');
                  }}
                >
                  <Ionicons name={isAddingHere ? 'close' : 'add'} size={12} color="#DC2626" />
                  <Text style={styles.addDeductionBtnText}>
                    {isAddingHere ? 'Cancel' : 'Add Deduction'}
                  </Text>
                </Pressable>
              </View>

              {isAddingHere && (
                <View style={styles.deductionFormCard}>
                  <TextInput
                    style={[styles.deductionInput, { flex: 2 }]}
                    placeholder="Reason (e.g. Cash Advance)"
                    value={deductionLabel}
                    onChangeText={setDeductionLabel}
                  />
                  <TextInput
                    style={[styles.deductionInput, { flex: 1 }]}
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={deductionAmount}
                    onChangeText={setDeductionAmount}
                  />
                  <Pressable
                    style={styles.saveDeductionBtn}
                    onPress={() => handleSaveDeduction(dateGroup.date)}
                  >
                    <Text style={styles.saveDeductionBtnText}>Save</Text>
                  </Pressable>
                </View>
              )}

              {dateGroup.deductions.map((ded) => (
                <View key={ded.id} style={styles.deductionItemRow}>
                  <Text style={styles.deductionItemLabel} numberOfLines={1}>
                    - {ded.label}
                  </Text>
                  <View style={styles.deductionItemRight}>
                    <Text style={styles.deductionItemAmount}>-₱{formatNumber(ded.amount)}</Text>
                    <Pressable
                      onPress={() => onDeleteDeduction(ded.id, dateGroup.date)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={13} color="#DC2626" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {dateGroup.products.map((productGroup) => {
              // Flatten or handle color groups inside the product view as needed
              const allProductItems = productGroup.colors.flatMap((c) => c.colors);

              return (
                <View key={productGroup.productId} style={styles.productBlock}>
                  <View style={styles.productHeaderRow}>
                    <Text style={styles.productTitleText}>{productGroup.productName}</Text>
                    <Text style={styles.productSubTotalText}>
                      ₱{formatNumber(productGroup.productTotalEarned)} (
                      {productGroup.productTotalPieces} pcs)
                    </Text>
                  </View>

                  {productGroup.colors.map((colorGroup) => (
                    <View key={colorGroup.colorId} style={styles.colorGroupCard}>
                      <View style={styles.colorBadgeRow}>
                        <View
                          style={[
                            styles.colorDot,
                            { backgroundColor: colorGroup.colorHex || '#CBD5E1' },
                          ]}
                        />
                        <Text style={styles.colorBadgeText}>{colorGroup.colorName}</Text>
                      </View>

                      <LaborProductGroup
                        productId={productGroup.productId}
                        productName={colorGroup.colorName}
                        items={colorGroup.items}
                        totalPieces={colorGroup.colorTotalPieces}
                        totalEarned={colorGroup.colorTotalEarned}
                        operations={operations}
                        sizes={sizes}
                        operationById={operationById}
                        sizeById={sizeById}
                        activePicker={activePicker}
                        setActivePicker={setActivePicker}
                        onAddEntry={(productId, sizeId) =>
                          onAddEntry(dateGroup.date, productId, colorGroup.colorId)
                        }
                        onSelect={onSelect}
                        onQuantityChange={onQuantityChange}
                        onDelete={onDelete}
                      />
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );
      }}
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
  },
  dateGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
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
  dateHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dateHeaderSubtotal: {
    color: '#64748B',
    fontSize: f(11),
    fontWeight: '600',
  },
  dateHeaderDeduction: {
    color: '#DC2626',
    fontSize: f(11),
    fontWeight: '600',
  },
  dateHeaderNet: {
    color: '#0F172A',
    fontSize: f(11),
    fontWeight: '700',
  },
  deductionsContainer: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deductionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  deductionsTitle: {
    color: '#991B1B',
    fontSize: f(12),
    fontWeight: '700',
  },
  addDeductionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addDeductionBtnText: {
    color: '#DC2626',
    fontSize: f(10),
    fontWeight: '700',
  },
  deductionFormCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  deductionInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 30,
    fontSize: f(12),
    color: '#0F172A',
  },
  saveDeductionBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDeductionBtnText: {
    color: '#FFFFFF',
    fontSize: f(11),
    fontWeight: '700',
  },
  deductionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  deductionItemLabel: {
    color: '#7F1D1D',
    fontSize: f(12),
    flex: 1,
  },
  deductionItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deductionItemAmount: {
    color: '#DC2626',
    fontSize: f(12),
    fontWeight: '700',
  },
  productBlock: {
    marginTop: 8,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  productHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productTitleText: {
    fontSize: f(13),
    fontWeight: '800',
    color: '#0F172A',
  },
  productSubTotalText: {
    fontSize: f(12),
    fontWeight: '600',
    color: '#64748B',
  },
  colorGroupCard: {
    marginBottom: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#CBD5E1',
  },
  colorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  colorBadgeText: {
    fontSize: f(11),
    fontWeight: '700',
    color: '#334155',
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
