import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import InventoryTable from '../components/inventory/InventoryTable';
import { useProductStore } from '../store/useProductStore';

export default function InventoryView() {
  const products = useProductStore((state) => state.products);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {products.length > 0 ? (
        products.map((product) => <InventoryTable key={product.id} productId={product.id} />)
      ) : (
        <InventoryTable productId={products[0]?.id} />
      )}
    </ScrollView>
  );
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
