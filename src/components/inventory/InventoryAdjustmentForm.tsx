import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ColorSelector from '@/components/common/ColorSelector';
import ProductSelector from '@/components/common/ProductSelector';
import QuantitySelector from '@/components/common/QuantitySelector';
import SizeSelector from '@/components/common/SizeSelector';
import { useColorStore } from '@/store/useColorStore';
import { getInventoryKey, useInventoryStore } from '@/store/useInventoryStore';
import { useProductStore } from '@/store/useProductStore';
import { useSizeStore } from '@/store/useSizeStore';
import type { Color, InventoryLocation, Product, Size } from '@/types/localModels';
import { f } from '@/utils/fontScale';

import AddedItemsPanel from '../transactions/components/added-items-panel/AddedItemsPanel';
import type { AddedTransactionItem } from '../transactions/form/types';

type AdjustmentType = 'in' | 'out';

type Props = {
  type: AdjustmentType;
  initialProduct: Product | null;
  location: InventoryLocation;
  onCancel: () => void;
  onSave: (product: Product | null) => void;
};

export default function InventoryAdjustmentForm({
  type,
  initialProduct,
  location,
  onCancel,
  onSave,
}: Props) {
  const products = useProductStore((state) => state.products);
  const colors = useColorStore((state) => state.colors);
  const sizes = useSizeStore((state) => state.sizes);
  const getQuantity = useInventoryStore((state) => state.getQuantity);
  const setQuantity = useInventoryStore((state) => state.setQuantity);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [quantity, setFormQuantity] = useState(1);
  const [items, setItems] = useState<AddedTransactionItem[]>([]);
  const [highlightedItemIds, setHighlightedItemIds] = useState<string[]>([]);

  const productColors = useMemo(
    () => colors.filter((color) => color.productId === selectedProduct?.id),
    [colors, selectedProduct],
  );
  const productSizes = useMemo(
    () => sizes.filter((size) => size.productId === selectedProduct?.id),
    [sizes, selectedProduct],
  );

  const isStockIn = type === 'in';
  const title = isStockIn ? 'Stock In' : 'Stock Out';

  function handleProductSelect(product: Product) {
    setSelectedProduct(product);
    setSelectedColor(null);
    setSelectedSizes([]);
  }

  function handleSizeToggle(size: Size) {
    setSelectedSizes((current) =>
      current.some((item) => item.id === size.id)
        ? current.filter((item) => item.id !== size.id)
        : [...current, size],
    );
  }

  function addItems(passedQuantity?: number) {
    const itemQuantity = passedQuantity ?? quantity;

    if (!selectedProduct || !selectedColor || selectedSizes.length === 0 || itemQuantity <= 0) {
      Alert.alert('Incomplete Selection', 'Select a product, color, size, and quantity.');
      return;
    }

    const addedItemIds: string[] = [];

    setItems((current) => {
      const updated = [...current];

      selectedSizes.forEach((size) => {
        const existingIndex = updated.findIndex(
          (item) =>
            item.productId === selectedProduct.id &&
            item.colorId === selectedColor.id &&
            item.sizeId === size.id,
        );

        if (existingIndex >= 0) {
          const existing = updated[existingIndex];
          const newQuantity = existing.quantity + itemQuantity;

          updated[existingIndex] = {
            ...existing,
            quantity: newQuantity,
            total: newQuantity * existing.unitPrice,
          };
          addedItemIds.push(existing.id);
        } else {
          const itemId = `${Date.now()}-${size.id}`;

          updated.push({
            id: itemId,
            transactionId: '',
            productId: selectedProduct.id,
            colorId: selectedColor.id,
            sizeId: size.id,
            quantity: itemQuantity,
            unitPrice: size.price,
            total: itemQuantity * size.price,
            product: selectedProduct,
            color: selectedColor,
            size,
          });
          addedItemIds.push(itemId);
        }
      });

      return updated;
    });

    setHighlightedItemIds(addedItemIds);
    setSelectedSizes([]);
  }

  function updateItemQuantity(itemId: string, amount: number) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const updatedQuantity = Math.max(1, item.quantity + amount);
        return {
          ...item,
          quantity: updatedQuantity,
          total: updatedQuantity * item.unitPrice,
        };
      }),
    );
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  function saveAdjustment() {
    if (items.length === 0) {
      Alert.alert('No Items', 'Add at least one item to the adjustment.');
      return;
    }

    if (!isStockIn) {
      const insufficientItem = items.find((item) => {
        const key = getInventoryKey(item.productId, item.colorId, item.sizeId, location);
        return item.quantity > getQuantity(key);
      });

      if (insufficientItem) {
        const key = getInventoryKey(
          insufficientItem.productId,
          insufficientItem.colorId,
          insufficientItem.sizeId,
          location,
        );
        Alert.alert(
          'Insufficient Inventory',
          `Only ${getQuantity(key)} pcs available for ${insufficientItem.product.name} / ${insufficientItem.color.name} / ${insufficientItem.size.name}.`,
        );
        return;
      }
    }

    items.forEach((item) => {
      const key = getInventoryKey(item.productId, item.colorId, item.sizeId, location);
      const currentQuantity = getQuantity(key);
      const updatedQuantity = currentQuantity + (isStockIn ? item.quantity : -item.quantity);

      setQuantity(item.productId, item.colorId, item.sizeId, updatedQuantity, location);
    });

    onSave(selectedProduct);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {isStockIn ? 'Add items to' : 'Deduct items from'} {location} inventory.
          </Text>
        </View>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <ScrollView
          style={styles.left}
          contentContainerStyle={styles.leftContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              onSelect={handleProductSelect}
            />

            <View style={styles.section}>
              <ColorSelector
                colors={productColors}
                selectedColor={selectedColor}
                onSelect={setSelectedColor}
              />
            </View>

            <View style={styles.section}>
              <SizeSelector
                sizes={productSizes}
                selectedSizes={selectedSizes}
                onToggle={handleSizeToggle}
                onDeselectAll={() => setSelectedSizes([])}
              />
            </View>

            <View style={styles.section}>
              <QuantitySelector
                quantity={quantity}
                onChange={setFormQuantity}
                addItems={addItems}
              />
            </View>

            <Pressable
              onPress={() => addItems()}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            >
              <Text style={styles.addButtonText}>+ Add to Adjustment</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.right}>
          <Text style={styles.itemsTitle}>Items to {isStockIn ? 'Add' : 'Deduct'}</Text>
          <AddedItemsPanel
            items={items}
            highlightedItemIds={highlightedItemIds}
            showAmounts={false}
            showPrintButton={false}
            showPriceToggle={false}
            showViewModeSelector={false}
            emptyMessage="No items added yet."
            onIncrease={(id) => updateItemQuantity(id, 1)}
            onDecrease={(id) => updateItemQuantity(id, -1)}
            onRemove={removeItem}
          />

          <Pressable
            onPress={saveAdjustment}
            style={({ pressed }) => [
              styles.saveButton,
              !items.length && styles.saveButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {isStockIn ? 'Save Stock In' : 'Save Stock Out'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: '#06132F',
    fontSize: f(22),
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748B',
    fontSize: f(13),
    marginTop: 3,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F3F6',
  },
  cancelText: {
    color: '#475569',
    fontSize: f(14),
    fontWeight: '600',
  },
  content: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    gap: 16,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  leftContent: {
    paddingBottom: 20,
  },
  right: {
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  card: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 12,
  },
  section: {
    marginTop: 24,
  },
  addButton: {
    minHeight: 48,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#1745D1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#1745D1',
    fontSize: f(15),
    fontWeight: '700',
  },
  itemsTitle: {
    color: '#06132F',
    fontSize: f(17),
    fontWeight: '700',
  },
  saveButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
