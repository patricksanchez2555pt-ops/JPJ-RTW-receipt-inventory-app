import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import { useColorStore } from '../../../store/useColorStore';
import { useLaborRateStore } from '../../../store/useLaborRateStore';
import { useOperationStore } from '../../../store/useOperationStore';
import { useProductStore } from '../../../store/useProductStore';
import { useSizeStore } from '../../../store/useSizeStore';
import type { Product } from '../../../types/localModels';
import LaborRatesMatrix from './LaborRatesMatrix';
import ProductColorsEditor from './ProductColorsEditor';
import ProductInfoForm from './ProductInfoForm';
import ProductOperationsEditor from './ProductOperationsEditor';
import ProductSizesEditor from './ProductSizesEditor';

type Props = {
  product: Product;
  onDeleted?: () => void;
};

export default function ProductEdit({ product, onDeleted }: Props) {
  const colors = useColorStore((state) => state.colors);
  const sizes = useSizeStore((state) => state.sizes);
  const operations = useOperationStore((state) => state.operations);
  const laborRates = useLaborRateStore((state) => state.laborRates);

  const updateProduct = useProductStore((state) => state.updateProduct);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  const updateColor = useColorStore((state) => state.updateColor);
  const addColor = useColorStore((state) => state.addColor);
  const deleteColor = useColorStore((state) => state.deleteColor);

  const updateSize = useSizeStore((state) => state.updateSize);
  const addSize = useSizeStore((state) => state.addSize);
  const deleteSize = useSizeStore((state) => state.deleteSize);

  const addOperation = useOperationStore((state) => state.addOperation);
  const updateOperation = useOperationStore((state) => state.updateOperation);
  const deleteOperation = useOperationStore((state) => state.deleteOperation);

  const addLaborRate = useLaborRateStore((state) => state.addLaborRate);

  // Collapse states for each section
  const [collapsedSections, setCollapsedSections] = useState({
    sizes: true,
    colors: true,
    operations: true,
    rates: true,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const productColors = useMemo(
    () => colors.filter((c) => c.productId === product.id),
    [colors, product.id],
  );
  const productSizes = useMemo(
    () => sizes.filter((s) => s.productId === product.id).sort((a, b) => a.price - b.price),
    [sizes, product.id],
  );
  const productOperations = useMemo(
    () => operations.filter((op) => op.productId === product.id),
    [operations, product.id],
  );

  function handleDeleteProduct() {
    Alert.alert('Delete Product', `Are you sure you want to delete "${product.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProduct(product.id);
          onDeleted?.();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Edit Product</Text>
            <Text style={styles.subtitle}>{product.name}</Text>
          </View>

          <Pressable
            onPress={handleDeleteProduct}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={18} color="#C62828" />
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>

        {/* 1. Name Editor */}
        <ProductInfoForm
          initialName={product.name}
          onSave={(newName) => updateProduct(product.id, newName)}
        />

        {/* 2. Sizes & Prices Section */}
        <View style={styles.collapsibleCard}>
          <Pressable style={styles.sectionHeader} onPress={() => toggleSection('sizes')}>
            <Text style={styles.sectionTitle}>Sizes & Prices ({productSizes.length})</Text>
            <Ionicons
              name={collapsedSections.sizes ? 'chevron-down' : 'chevron-up'}
              size={18}
              color="#4B5563"
            />
          </Pressable>
          {!collapsedSections.sizes && (
            <View style={styles.sectionBody}>
              <ProductSizesEditor
                productId={product.id}
                sizes={productSizes}
                onAdd={() =>
                  addSize({
                    id: `size-${Date.now()}`,
                    productId: product.id,
                    name: 'New Size',
                    price: 0,
                  })
                }
                onSave={(id, name, price) => updateSize(id, name, price)}
                onDelete={(id) => deleteSize(id)}
              />
            </View>
          )}
        </View>

        {/* 3. Colors Section */}
        <View style={styles.collapsibleCard}>
          <Pressable style={styles.sectionHeader} onPress={() => toggleSection('colors')}>
            <Text style={styles.sectionTitle}>Colors ({productColors.length})</Text>
            <Ionicons
              name={collapsedSections.colors ? 'chevron-down' : 'chevron-up'}
              size={18}
              color="#4B5563"
            />
          </Pressable>
          {!collapsedSections.colors && (
            <View style={styles.sectionBody}>
              <ProductColorsEditor
                colors={productColors}
                onAdd={() =>
                  addColor({
                    id: `color-${Date.now()}`,
                    productId: product.id,
                    name: 'New Color',
                    hexValue: '#CCCCCC',
                  })
                }
                onSave={(id, name, hex) => updateColor(id, name, hex)}
                onDelete={(id) => deleteColor(id)}
              />
            </View>
          )}
        </View>

        {/* 4. Operations Section */}
        <View style={styles.collapsibleCard}>
          <Pressable style={styles.sectionHeader} onPress={() => toggleSection('operations')}>
            <Text style={styles.sectionTitle}>Operations ({productOperations.length})</Text>
            <Ionicons
              name={collapsedSections.operations ? 'chevron-down' : 'chevron-up'}
              size={18}
              color="#4B5563"
            />
          </Pressable>
          {!collapsedSections.operations && (
            <View style={styles.sectionBody}>
              <ProductOperationsEditor
                operations={productOperations}
                onAdd={() => addOperation({ productId: product.id, name: 'New Operation' })}
                onSave={(id, name) => updateOperation(id, { name })}
                onDelete={(id) => deleteOperation(id)}
              />
            </View>
          )}
        </View>

        {/* 5. Labor Rates Matrix Section */}
        <View style={styles.collapsibleCard}>
          <Pressable style={styles.sectionHeader} onPress={() => toggleSection('rates')}>
            <Text style={styles.sectionTitle}>Labor Rates Matrix</Text>
            <Ionicons
              name={collapsedSections.rates ? 'chevron-down' : 'chevron-up'}
              size={18}
              color="#4B5563"
            />
          </Pressable>
          {!collapsedSections.rates && (
            <View style={styles.sectionBody}>
              <LaborRatesMatrix
                productId={product.id}
                sizes={productSizes}
                operations={productOperations}
                laborRates={laborRates}
                onSaveRate={(sizeId, operationId, ratePerUnit) =>
                  addLaborRate({ productId: product.id, sizeId, operationId, ratePerUnit })
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE1E9',
  },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerText: { flex: 1 },
  title: { fontSize: f(22), fontWeight: '800', color: '#151A23' },
  subtitle: { marginTop: 4, fontSize: f(14), color: '#707989' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0CACA',
    backgroundColor: '#FFF5F5',
  },
  deleteText: { color: '#C62828', fontWeight: '700' },
  collapsibleCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  sectionTitle: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionBody: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pressed: { opacity: 0.7 },
});
