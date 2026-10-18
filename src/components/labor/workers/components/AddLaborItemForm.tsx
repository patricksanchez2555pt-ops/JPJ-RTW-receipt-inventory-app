import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Operation, Product, Size } from '@/types/localModels';
import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

import ProductSelector from '../../../common/ProductSelector'; // Make sure the path matches your project structure

interface AddLaborItemFormProps {
  products: Product[];
  operations: Operation[];
  sizes: Size[];
  initialDate: string;
  workerId: string;
  getLaborRate: (
    productId: string,
    sizeId: string,
    operationId: string,
  ) => { ratePerUnit: number } | undefined;
  onSave: (entry: {
    productId: string;
    operationId: string;
    sizeId: string;
    workerId: string;
    date: string;
    quantity: number;
    ratePerUnit: number;
  }) => void;
  onCancel: () => void;
}

export default function AddLaborItemForm({
  products,
  operations,
  sizes,
  initialDate,
  workerId,
  getLaborRate,
  onSave,
  onCancel,
}: AddLaborItemFormProps) {
  const initialProduct = products.length > 0 ? products[0].id : '';
  const initialOps = operations.filter((op) => op.productId === initialProduct);
  const initialSizes = sizes.filter((sz) => sz.productId === initialProduct);

  const [formDate, setFormDate] = useState(initialDate);
  const [formProductId, setFormProductId] = useState(initialProduct);
  const [formOperationId, setFormOperationId] = useState(
    initialOps.length > 0 ? initialOps[0].id : '',
  );
  const [formSizeId, setFormSizeId] = useState(initialSizes.length > 0 ? initialSizes[0].id : '');
  const [formQuantity, setFormQuantity] = useState('1');

  const selectedProductObj = products.find((p) => p.id === formProductId) || products[0];
  const availableFormOps = operations.filter((op) => op.productId === formProductId);
  const availableFormSizes = sizes.filter((sz) => sz.productId === formProductId);
  const currentFormRate =
    getLaborRate(formProductId, formSizeId, formOperationId)?.ratePerUnit ?? 0;

  const handleProductChange = (product: Product) => {
    setFormProductId(product.id);
    const prodOps = operations.filter((op) => op.productId === product.id);
    const prodSizes = sizes.filter((sz) => sz.productId === product.id);
    setFormOperationId(prodOps.length > 0 ? prodOps[0].id : '');
    setFormSizeId(prodSizes.length > 0 ? prodSizes[0].id : '');
  };

  const handleSave = () => {
    if (!formProductId || !formOperationId || !formSizeId) return;

    const qty = parseInt(formQuantity, 10);
    const parsedQty = isNaN(qty) || qty <= 0 ? 1 : qty;

    onSave({
      productId: formProductId,
      sizeId: formSizeId,
      operationId: formOperationId,
      workerId,
      date: formDate,
      quantity: parsedQty,
      ratePerUnit: currentFormRate,
    });
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>New Labor Entry</Text>

      <View style={styles.formGrid}>
        {/* Date Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Date (MM-DD-YYYY)</Text>
          <TextInput
            style={styles.formInput}
            value={formDate}
            onChangeText={setFormDate}
            placeholder="MM-DD-YYYY"
          />
        </View>

        {/* Product Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Product</Text>
          <ProductSelector
            products={products}
            selectedProduct={selectedProductObj}
            onSelect={handleProductChange}
          />
        </View>

        {/* Operation Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Operation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {availableFormOps.map((op) => (
              <Pressable
                key={op.id}
                style={[styles.chip, formOperationId === op.id && styles.chipActive]}
                onPress={() => setFormOperationId(op.id)}
              >
                <Text style={[styles.chipText, formOperationId === op.id && styles.chipTextActive]}>
                  {op.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Size Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Size</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {availableFormSizes.map((sz) => (
              <Pressable
                key={sz.id}
                style={[styles.chip, formSizeId === sz.id && styles.chipActive]}
                onPress={() => setFormSizeId(sz.id)}
              >
                <Text style={[styles.chipText, formSizeId === sz.id && styles.chipTextActive]}>
                  {sz.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Quantity & Computed Rate */}
        <View style={styles.formRowInline}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.formLabel}>Quantity</Text>
            <TextInput
              style={styles.formInput}
              keyboardType="number-pad"
              value={formQuantity}
              onChangeText={setFormQuantity}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, justifyContent: 'center' }]}>
            <Text style={styles.formLabel}>Rate / Unit</Text>
            <Text style={styles.rateDisplay}>₱{formatNumber(currentFormRate)}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable style={styles.cancelFormBtn} onPress={onCancel}>
          <Text style={styles.cancelFormBtnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveFormBtn} onPress={handleSave}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.saveFormBtnText}>Save Entry</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  formGrid: {
    gap: 10,
  },
  formGroup: {
    gap: 4,
  },
  formRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formLabel: {
    fontSize: f(11),
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
    fontSize: f(13),
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  rateDisplay: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#16A34A',
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#1745D1',
    borderColor: '#1745D1',
  },
  chipText: {
    fontSize: f(12),
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelFormBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelFormBtnText: {
    color: '#475569',
    fontSize: f(13),
    fontWeight: '600',
  },
  saveFormBtn: {
    flex: 2,
    backgroundColor: '#1745D1',
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveFormBtnText: {
    color: '#FFFFFF',
    fontSize: f(13),
    fontWeight: '700',
  },
});
