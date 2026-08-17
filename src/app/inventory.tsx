import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import InventoryTable from '../components/inventoryTable/InventoryTable';
import { useColorStore } from '../store/useColorStore';
import { useProductStore } from '../store/useProductStore';
import { useSizeStore } from '../store/useSizeStore';

const DEFAULT_PRODUCT_ID = 'prod-jogging-pants';
// seedInitialInventoryData();

export default function InventoryView() {
  const products = useProductStore((state) => state.products);

  useEffect(() => {
    console.log('inn');
    seedInitialInventoryData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {products.length > 0 ? (
        products.map((product) => <InventoryTable key={product.id} productId={product.id} />)
      ) : (
        <InventoryTable productId={DEFAULT_PRODUCT_ID} />
      )}
    </ScrollView>
  );
}

/**
 * Seeds initial store values if the products store is empty.
 */
function seedInitialInventoryData() {
  const productStore = useProductStore.getState();
  const colorStore = useColorStore.getState();
  const sizeStore = useSizeStore.getState();

  // Return early if products are already seeded
  if (productStore.products.length > 0) return;

  const productId = DEFAULT_PRODUCT_ID;

  // Seed Product
  productStore.addProduct({
    id: productId,
    name: 'Jogging Pants',
  });

  // Seed Colors
  const initialColors = [
    { name: 'Black', hexValue: '#000000' },
    { name: 'Blue', hexValue: '#0000FF' },
    { name: 'Red', hexValue: '#FF0000' },
    { name: 'White', hexValue: '#FFFFFF' },
    { name: 'Green', hexValue: '#008000' },
    { name: 'Yellow', hexValue: '#FFFF00' },
    { name: 'Pink', hexValue: '#FFC0CB' },
    { name: 'Purple', hexValue: '#800080' },
  ];

  initialColors.forEach((col, index) => {
    colorStore.addColor({
      id: `color-${productId}-${index}`,
      productId,
      name: col.name,
      hexValue: col.hexValue,
      order: index,
    });
  });

  // Seed Sizes & Default Prices
  const initialSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

  initialSizes.forEach((sizeName, index) => {
    const sizeId = `size-${productId}-${index}`;
    sizeStore.addSize({
      id: sizeId,
      productId,
      name: sizeName,
      order: index,
      price: 100,
    });
  });

  console.log(initialSizes);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 24,
  },
});
