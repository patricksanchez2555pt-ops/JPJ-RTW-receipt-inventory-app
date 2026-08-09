import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLOR_COLUMN_WIDTH, ROW_HEIGHT } from './constants';
import type { InventoryCellProps } from './types';
import { getSubtleBgColor } from './utils';

export function InventoryCell({
  size,
  colorName,
  hexValue,
  initialQuantity = 0,
  onQuantityChange,
}: InventoryCellProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const updateQuantity = (newQuantity: number) => {
    setQuantity(newQuantity);
    onQuantityChange?.({
      size,
      color: colorName,
      quantity: newQuantity,
    });
  };

  const decrease = () => {
    const nextValue = Math.max(0, quantity - 1);
    updateQuantity(nextValue);
  };

  const increase = () => {
    const nextValue = quantity + 1;
    updateQuantity(nextValue);
  };

  const handleChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const nextValue = numericValue === '' ? 0 : Number(numericValue);
    updateQuantity(nextValue);
  };

  const subtleBg = getSubtleBgColor(hexValue);

  return (
    <View style={[styles.inventoryCell, { backgroundColor: subtleBg }]}>
      <Pressable style={styles.quantityButton} onPress={decrease}>
        <Text style={styles.quantityButtonText}>−</Text>
      </Pressable>

      <TextInput
        value={String(quantity)}
        onChangeText={handleChange}
        keyboardType="number-pad"
        selectTextOnFocus
        style={styles.quantityInput}
      />

      <Pressable style={styles.quantityButton} onPress={increase}>
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
    gap: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E9EDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#06132F',
  },
  quantityInput: {
    width: 55,
    height: 40,
    borderWidth: 1,
    borderColor: '#CBD2DE',
    borderRadius: 7,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#06132F',
    backgroundColor: '#FFFFFF',
  },
});
