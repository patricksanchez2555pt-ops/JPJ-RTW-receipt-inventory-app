import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import ProductSelector from '../components/common/ProductSelector';
import InventoryAdjustmentForm from '../components/inventory/InventoryAdjustmentForm';
import InventoryTable from '../components/inventory/InventoryTable';
import { useProductStore } from '../store/useProductStore';
import type { InventoryLocation, Product } from '../types/localModels';

export default function InventoryView() {
  const products = useProductStore((state) => state.products);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] ?? null);
  const [quantityMode, setQuantityMode] = useState<'pcs' | 'dzn'>('pcs');
  const [inventoryLocation, setInventoryLocation] = useState<InventoryLocation>('store');
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out' | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          {adjustmentType ? (
            <Pressable
              onPress={() => setAdjustmentType(null)}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={styles.backButtonText}>‹ Inventory</Text>
            </Pressable>
          ) : (
            <>
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
                  <Text
                    style={[styles.modeText, quantityMode === 'pcs' && styles.modeTextSelected]}
                  >
                    Piece
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setQuantityMode('dzn')}
                  style={[styles.modeButton, quantityMode === 'dzn' && styles.modeButtonSelected]}
                >
                  <Text
                    style={[styles.modeText, quantityMode === 'dzn' && styles.modeTextSelected]}
                  >
                    Dozen
                  </Text>
                </Pressable>
              </View>

              <View style={styles.locationContainer}>
                <Pressable
                  onPress={() => setInventoryLocation('store')}
                  style={[
                    styles.locationButton,
                    inventoryLocation === 'store' && styles.locationButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.locationText,
                      inventoryLocation === 'store' && styles.locationTextSelected,
                    ]}
                  >
                    Store
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setInventoryLocation('warehouse')}
                  style={[
                    styles.locationButton,
                    inventoryLocation === 'warehouse' && styles.locationButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.locationText,
                      inventoryLocation === 'warehouse' && styles.locationTextSelected,
                    ]}
                  >
                    Warehouse
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [styles.stockInButton, pressed && styles.pressed]}
                onPress={() => setAdjustmentType('in')}
              >
                <Text style={styles.stockInButtonText}>In</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.stockOutButton, pressed && styles.pressed]}
                onPress={() => setAdjustmentType('out')}
              >
                <Text style={styles.stockOutButtonText}>Out</Text>
              </Pressable>
            </>
          )}
        </View>

        {adjustmentType ? (
          <InventoryAdjustmentForm
            key={adjustmentType}
            type={adjustmentType}
            initialProduct={selectedProduct}
            location={inventoryLocation}
            onCancel={() => setAdjustmentType(null)}
            onSave={(product) => {
              if (product) setSelectedProduct(product);
              setAdjustmentType(null);
            }}
          />
        ) : (
          selectedProduct && (
            <InventoryTable
              productId={selectedProduct.id}
              quantityMode={quantityMode}
              location={inventoryLocation}
            />
          )
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

  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  backButtonText: {
    color: '#1745D1',
    fontSize: f(16),
    fontWeight: '700',
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

  locationContainer: {
    flexDirection: 'row',
    height: 44,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  locationButton: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationButtonSelected: {
    backgroundColor: '#EEF3FF',
  },

  locationText: {
    fontSize: f(13),
    fontWeight: '600',
    color: '#6B7280',
  },

  locationTextSelected: {
    color: '#1745D1',
    fontWeight: '700',
  },

  stockInButton: {
    height: 44,
    minWidth: 64,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stockInButtonText: {
    color: '#FFFFFF',
    fontSize: f(15),
    fontWeight: '700',
  },

  stockOutButton: {
    height: 44,
    minWidth: 64,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stockOutButtonText: {
    color: '#FFFFFF',
    fontSize: f(15),
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },
});
