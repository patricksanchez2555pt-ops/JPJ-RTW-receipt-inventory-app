import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import ProductSelector from '../components/common/ProductSelector';
import InventoryTable from '../components/inventory/InventoryTable';
import { useProductStore } from '../store/useProductStore';
import type { Product } from '../types/localModels';

export default function InventoryView() {
  const products = useProductStore((state) => state.products);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] ?? null);
  const [quantityMode, setQuantityMode] = useState<'pcs' | 'dzn'>('pcs');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <View style={styles.productSelectorContainer}>
            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              onSelect={(product) => setSelectedProduct(product)}
            />
          </View>

          <View style={styles.modeContainer}>
            <Pressable
              onPress={() => setQuantityMode('pcs')}
              style={[styles.modeButton, quantityMode === 'pcs' && styles.modeButtonSelected]}
            >
              <Text style={[styles.modeText, quantityMode === 'pcs' && styles.modeTextSelected]}>
                Piece
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setQuantityMode('dzn')}
              style={[styles.modeButton, quantityMode === 'dzn' && styles.modeButtonSelected]}
            >
              <Text style={[styles.modeText, quantityMode === 'dzn' && styles.modeTextSelected]}>
                Dozen
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            onPress={() => {
              console.log(`Inventory saved locally for ${selectedProduct?.name}`);
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>

        {selectedProduct && (
          <InventoryTable productId={selectedProduct.id} quantityMode={quantityMode} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    flex: 1,
    minHeight: 0,
    padding: 24,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  productSelectorContainer: {
    flex: 1,
  },

  modeContainer: {
    flexDirection: 'row',
    height: 44,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  modeButton: {
    minWidth: 72,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeButtonSelected: {
    backgroundColor: '#EEF3FF',
  },

  modeText: {
    fontSize: f(13),
    fontWeight: '600',
    color: '#6B7280',
  },

  modeTextSelected: {
    color: '#1745D1',
    fontWeight: '700',
  },

  saveButton: {
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: f(15),
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },
});
