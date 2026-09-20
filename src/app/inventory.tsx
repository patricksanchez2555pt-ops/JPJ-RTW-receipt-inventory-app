import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import InventoryTable from '../components/inventory/InventoryTable';
import ProductSelector from '../components/transactions/form/components/ProductSelector';
import { useProductStore } from '../store/useProductStore';
import type { Product } from '../types/localModels';

export default function InventoryView() {
  const products = useProductStore((state) => state.products);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] ?? null);

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

          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            onPress={() => {
              console.log(`Inventory saved locally for ${selectedProduct?.name}`);
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>

        {selectedProduct && <InventoryTable productId={selectedProduct.id} />}
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
