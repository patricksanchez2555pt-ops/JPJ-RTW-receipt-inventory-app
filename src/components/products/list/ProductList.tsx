import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Color, Product, Size } from '../../../types/localModels';
import ProductRow from './components/ProductRow';

type Props = {
  products: Product[];
  colors: Color[];
  sizes: Size[];
  selectedProductId: string | null;
  onSelect: (product: Product) => void;
  onCreateProduct: () => void;
};

export default function ProductList({
  products,
  colors,
  sizes,
  selectedProductId,
  onSelect,
  onCreateProduct,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Products</Text>

          <Text style={styles.count}>{products.length}</Text>
        </View>

        <Pressable
          onPress={onCreateProduct}
          style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />

          <Text style={styles.createButtonText}>Create Product</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            colors={colors.filter((color) => color.productId === product.id)}
            sizes={sizes.filter((size) => size.productId === product.id)}
            selected={product.id === selectedProductId}
            onPress={() => onSelect(product)}
          />
        ))}

        {products.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={42} color="#B4BBC7" />

            <Text style={styles.emptyTitle}>No products yet</Text>

            <Text style={styles.emptyText}>Create your first product to get started.</Text>

            <Pressable
              onPress={onCreateProduct}
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />

              <Text style={styles.createButtonText}>Create Product</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    minHeight: 70,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EB',
    gap: 12,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#151A23',
  },

  count: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    backgroundColor: '#F0F3F8',
    color: '#687284',
    fontSize: 12,
    fontWeight: '700',
  },

  createButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  list: {
    flex: 1,
    padding: 10,
  },

  empty: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#151A23',
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    color: '#707989',
    fontSize: 14,
  },

  emptyButton: {
    marginTop: 18,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  pressed: {
    opacity: 0.7,
  },
});
