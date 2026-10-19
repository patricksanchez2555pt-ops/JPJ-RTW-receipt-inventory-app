import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import QuantitySelector from '@/components/common/QuantitySelector'; // Update path if necessary
import SizeSelector from '@/components/common/SizeSelector'; // Update path if necessary
import type { Color, Operation, Product, Size, Worker } from '@/types/localModels';
import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

import ColorSelector from '../../../common/ColorSelector';
import ProductSelector from '../../../common/ProductSelector';

interface AddLaborItemFormProps {
  products: Product[];
  operations: Operation[];
  sizes: Size[];
  colors: Color[];
  initialDate: string;
  worker: Worker;
  getLaborRate: (
    productId: string,
    sizeId: string,
    operationId: string,
  ) => { ratePerUnit: number } | undefined;
  onSave: (
    entries: {
      productId: string;
      operationId: string;
      sizeId: string;
      colorId: string;
      workerId: string;
      date: string;
      quantity: number;
      ratePerUnit: number;
    }[],
  ) => void;
  onCancel: () => void;
}

export default function AddLaborItemForm({
  products,
  operations,
  sizes,
  colors,
  initialDate,
  worker,
  getLaborRate,
  onSave,
  onCancel,
}: AddLaborItemFormProps) {
  const initialProduct = products.length > 0 ? products[0].id : '';
  const initialOps = operations.filter((op) => op.productId === initialProduct);
  const initialColors = colors.filter((c) => c.productId === initialProduct);

  const [formDate, setFormDate] = useState(initialDate);
  const [prevInitialDate, setPrevInitialDate] = useState(initialDate);

  // Adjust state during render if initialDate prop changes from the parent (React-recommended pattern)
  if (initialDate !== prevInitialDate) {
    setPrevInitialDate(initialDate);
    setFormDate(initialDate);
  }

  const [formProductId, setFormProductId] = useState(initialProduct);
  const [formColorId, setFormColorId] = useState(
    initialColors.length > 0 ? initialColors[0].id : '',
  );

  // Default to worker's default operation if available, otherwise fallback to the first operation
  const defaultWorkerOpId = worker.defaultOperations?.[0];
  const [formOperationId, setFormOperationId] = useState(
    defaultWorkerOpId && initialOps.some((op) => op.id === defaultWorkerOpId)
      ? defaultWorkerOpId
      : initialOps.length > 0
        ? initialOps[0].id
        : '',
  );

  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [formQuantity, setFormQuantity] = useState<number>(0);

  const selectedProductObj = products.find((p) => p.id === formProductId) || products[0];
  const availableFormColors = colors.filter((c) => c.productId === formProductId);
  const selectedColorObj =
    availableFormColors.find((c) => c.id === formColorId) || availableFormColors[0] || null;

  const availableFormOps = operations.filter((op) => op.productId === formProductId);
  const availableFormSizes = sizes.filter((sz) => sz.productId === formProductId);

  const workerId = worker?.id ?? '';

  const handleProductChange = (product: Product) => {
    setFormProductId(product.id);
    const prodOps = operations.filter((op) => op.productId === product.id);
    const prodSizes = sizes.filter((sz) => sz.productId === product.id);
    const prodColors = colors.filter((c) => c.productId === product.id);

    // Pick worker's default operation if it exists for this product, otherwise pick the first operation
    const matchingDefaultOp = prodOps.find((op) => worker.defaultOperations?.includes(op.id));
    setFormOperationId(
      matchingDefaultOp ? matchingDefaultOp.id : prodOps.length > 0 ? prodOps[0].id : '',
    );

    setSelectedSizes(prodSizes.length > 0 ? [prodSizes[0]] : []);
    setFormColorId(prodColors.length > 0 ? prodColors[0].id : '');
  };

  const handleToggleSize = (size: Size) => {
    setSelectedSizes((current) => {
      const exists = current.some((item) => item.id === size.id);
      if (exists) {
        if (current.length === 1) return current; // Keep at least one selected
        return current.filter((item) => item.id !== size.id);
      }
      return [...current, size];
    });
  };

  const handleSave = () => {
    if (!formProductId || !formOperationId || selectedSizes.length === 0 || !formColorId) return;

    const entries = selectedSizes.map((sz) => {
      const rateObj = getLaborRate(formProductId, sz.id, formOperationId);
      const ratePerUnit = rateObj?.ratePerUnit ?? 0;

      return {
        productId: formProductId,
        sizeId: sz.id,
        colorId: formColorId,
        operationId: formOperationId,
        workerId,
        date: formDate,
        quantity: formQuantity,
        ratePerUnit,
      };
    });

    onSave(entries);
    setSelectedSizes([]);
    setFormQuantity(0);
  };

  // Get preview rate using the first selected size for the summary display
  const previewRate =
    selectedSizes.length > 0
      ? (getLaborRate(formProductId, selectedSizes[0].id, formOperationId)?.ratePerUnit ?? 0)
      : 0;

  return (
    <ScrollView style={styles.formCard}>
      <View style={styles.formHeaderRow}>
        <Text style={styles.formTitle}>New Labor Entry</Text>
        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          onPress={onCancel}
          hitSlop={8}
        >
          <Ionicons name="close" size={18} color="#64748B" />
        </Pressable>
      </View>

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

        {/* Color Selector */}
        <View style={styles.formGroup}>
          <ColorSelector
            colors={availableFormColors}
            selectedColor={selectedColorObj}
            onSelect={(color) => setFormColorId(color.id)}
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

        {/* Size Selector (Multi-select) */}
        <View style={styles.formGroup}>
          <SizeSelector
            sizes={availableFormSizes}
            selectedSizes={selectedSizes}
            onToggle={handleToggleSize}
            onDeselectAll={() => {
              if (availableFormSizes.length > 0) {
                setSelectedSizes([]);
              }
            }}
          />
        </View>

        {/* Quantity & Dozen Selector */}
        <View style={styles.formGroup}>
          <QuantitySelector
            customQty={`${formQuantity}`}
            onQtyButtonClicked={(qty) => {
              setFormQuantity(formQuantity + qty);
            }}
            onCustomQtyChange={(qty) => setFormQuantity(Number(qty))}
          />
        </View>

        {/* Rate Preview Display */}
        <View style={styles.ratePreviewContainer}>
          <Text style={styles.formLabel}>Rate / Unit (Preview)</Text>
          <Text style={styles.rateDisplay}>₱{formatNumber(previewRate)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable style={styles.cancelFormBtn} onPress={onCancel}>
          <Text style={styles.cancelFormBtnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveFormBtn} onPress={handleSave}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.saveFormBtnText}>Save Entries ({selectedSizes.length})</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  formTitle: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  pressed: {
    opacity: 0.7,
  },
  formGrid: {
    gap: 14,
  },
  formGroup: {
    marginBottom: 20,
    gap: 4,
  },
  formLabel: {
    fontWeight: '700',
    fontSize: f(15),
    color: '#1A1A1A',
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
  ratePreviewContainer: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rateDisplay: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
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
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelFormBtn: {
    flex: 1,
    paddingVertical: 10,
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
    paddingVertical: 10,
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
