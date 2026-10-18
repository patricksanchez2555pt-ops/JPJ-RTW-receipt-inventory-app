import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { LaborItem, Size } from '@/types/localModels';
import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

type OperationOption = { id: string; name: string; productId: string };
type PickerState = { itemId: string; type: 'operation' | 'size'; productId: string } | null;

type Props = {
  item: LaborItem;
  productId: string;
  operationName: string;
  sizeName: string;
  sizesOptions: Size[];
  operations: OperationOption[];
  activePicker: PickerState;
  setActivePicker: (value: PickerState) => void;
  onSelect: (item: LaborItem, type: 'operation' | 'size', id: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDelete: (itemId: string) => void;
};

export default function LaborItemRow({
  item,
  productId,
  operationName,
  sizeName,
  operations,
  sizesOptions,
  activePicker,
  setActivePicker,
  onSelect,
  onQuantityChange,
  onDelete,
}: Props) {
  const isOpOpen = activePicker?.itemId === item.id && activePicker.type === 'operation';
  const isSizeOpen = activePicker?.itemId === item.id && activePicker.type === 'size';

  const togglePicker = (type: 'operation' | 'size') => {
    const isOpen = type === 'operation' ? isOpOpen : isSizeOpen;
    setActivePicker(isOpen ? null : { itemId: item.id, type, productId });
  };

  const options = isOpOpen ? operations.filter((op) => op.productId === productId) : sizesOptions;

  return (
    <View style={styles.laborItemWrapper}>
      <View style={styles.laborItemColumnRow}>
        <Pressable
          style={[styles.colOp, styles.dropdownTrigger]}
          onPress={() => togglePicker('operation')}
        >
          <Text style={styles.columnCellText} numberOfLines={1}>
            {operationName}
          </Text>
          <Ionicons name={isOpOpen ? 'chevron-up' : 'chevron-down'} size={12} color="#64748B" />
        </Pressable>

        <Pressable
          style={[styles.colSize, styles.dropdownTriggerSize]}
          onPress={() => togglePicker('size')}
        >
          <View style={styles.sizeBadge}>
            <Text style={styles.sizeBadgeText}>{sizeName}</Text>
          </View>
          <Ionicons name={isSizeOpen ? 'chevron-up' : 'chevron-down'} size={10} color="#64748B" />
        </Pressable>

        <View style={[styles.colRate]}>
          <TextInput
            style={styles.quantityInput}
            keyboardType="number-pad"
            selectTextOnFocus
            value={String(item.quantity)}
            onChangeText={(value) => {
              const parsed = parseInt(value, 10);
              onQuantityChange(item.id, Number.isNaN(parsed) ? 0 : parsed);
            }}
          />
          <Text style={styles.rateUnitText}>× ₱{formatNumber(item.ratePerUnit)}</Text>
        </View>

        <Text
          style={[styles.columnCellText, styles.colAmount, styles.amountHighlight]}
          numberOfLines={1}
        >
          ₱{formatNumber(item.subtotal)}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => onDelete(item.id)}
          style={({ pressed }) => [
            styles.deleteIconBtn,
            pressed && styles.pressed,
            styles.colActionSpacer,
          ]}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={14} color="#B42318" />
        </Pressable>
      </View>

      {(isOpOpen || isSizeOpen) && (
        <View style={styles.inlineDropdownList}>
          <ScrollView nestedScrollEnabled style={styles.inlineScroll}>
            {options.map((option) => {
              return (
                <Pressable
                  key={option.id}
                  style={[styles.dropdownOptionItem]}
                  onPress={() => onSelect(item, isOpOpen ? 'operation' : 'size', option.id)}
                >
                  <Text style={[styles.dropdownOptionText]}>{option.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  laborItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  laborItemColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  columnCellText: {
    fontSize: f(13),
    color: '#334155',
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
    alignItems: 'flex-start',
    paddingRight: 6,
    gap: 4,
  },
  colAmount: {
    flex: 1.3,
    textAlign: 'right',
    paddingRight: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  dropdownTriggerSize: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  sizeBadge: {
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  sizeBadgeText: {
    color: '#334155',
    fontSize: f(11),
    fontWeight: '600',
  },
  quantityInput: {
    width: 100,
    height: 32,
    textAlign: 'center',
    fontSize: f(13),
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  rateUnitText: {
    fontSize: f(11),
    color: '#64748B',
  },
  amountHighlight: {
    color: '#16A34A',
    fontWeight: '700',
  },
  deleteIconBtn: {
    padding: 2,
  },
  inlineDropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inlineScroll: {
    maxHeight: 140,
    padding: 4,
  },
  dropdownOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dropdownOptionText: {
    fontSize: f(13),
    color: '#334155',
  },
  colActionSpacer: {
    width: 24,
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.7,
  },
});
