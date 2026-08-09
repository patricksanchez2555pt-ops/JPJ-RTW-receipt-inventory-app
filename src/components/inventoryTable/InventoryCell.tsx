import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getInventoryKey, useInventoryStore } from '../../store/useInventoryStore';
import { COLOR_COLUMN_WIDTH, ROW_HEIGHT } from './constants';
import { getSubtleBgColor } from './utils';

type InventoryCellProps = {
  productId: string;
  sizeId: string;
  colorId: string;
  hexValue: string;
};

export function InventoryCell({ productId, sizeId, colorId, hexValue }: InventoryCellProps) {
  // Derive key for direct dictionary access
  const key = getInventoryKey(productId, colorId, sizeId);

  // Subscribe strictly to THIS cell's quantity
  const quantity = useInventoryStore((state) => state.getQuantity(key));
  const setQuantity = useInventoryStore((state) => state.setQuantity);

  const handleUpdate = (nextQty: number) => {
    setQuantity(productId, colorId, sizeId, Math.max(0, nextQty));
  };

  const handleChangeText = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    const parsed = clean === '' ? 0 : parseInt(clean, 10);
    handleUpdate(parsed);
  };

  return (
    <View style={[styles.inventoryCell, { backgroundColor: getSubtleBgColor(hexValue) }]}>
      <Pressable style={styles.quantityButton} onPress={() => handleUpdate(quantity - 1)}>
        <Text style={styles.quantityButtonText}>−</Text>
      </Pressable>

      <TextInput
        value={String(quantity)}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        selectTextOnFocus
        style={styles.quantityInput}
      />

      <Pressable style={styles.quantityButton} onPress={() => handleUpdate(quantity + 1)}>
        <Text style={styles.quantityButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inventoryCell: {
    width: COLOR_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E9EDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#06132F',
  },
  quantityInput: {
    width: 48,
    height: 36,
    borderWidth: 1,
    borderColor: '#CBD2DE',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#06132F',
    backgroundColor: '#FFFFFF',
  },
});
