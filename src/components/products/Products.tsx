import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useColorStore } from '../../store/useColorStore';
import { useProductStore } from '../../store/useProductStore';
import { useSizeStore } from '../../store/useSizeStore';
import ProductCreate from './create/ProductCreate';
import ProductEdit from './edit/ProductEdit';
import ProductList from './list/ProductList';

export default function Products() {
  const products = useProductStore((state) => state.products);
  const colors = useColorStore((state) => state.colors);
  const sizes = useSizeStore((state) => state.sizes);

  const [creatingProduct, setCreatingProduct] = useState(false);
  const [isListCollapsed, setIsListCollapsed] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products[0]?.id ?? null,
  );

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;

  function handleProductDeleted() {
    const remainingProduct = products.find((product) => product.id !== selectedProductId);

    setSelectedProductId(remainingProduct?.id ?? null);
  }

  return (
    <View style={styles.container}>
      {!isListCollapsed && (
        <View style={styles.listPanel}>
          <View style={styles.listHeader}>
            <Pressable
              style={styles.collapseButton}
              onPress={() => setIsListCollapsed(true)}
              accessibilityLabel="Collapse product list"
            >
              <Ionicons name="chevron-back" size={20} color="#4B5563" />
            </Pressable>
          </View>

          <View style={styles.listContent}>
            <ProductList
              products={products}
              colors={colors}
              sizes={sizes}
              selectedProductId={selectedProductId}
              onSelect={(product) => {
                setCreatingProduct(false);
                setSelectedProductId(product.id);
              }}
              onCreateProduct={() => {
                setCreatingProduct(true);
                setSelectedProductId(null);
              }}
            />
          </View>
        </View>
      )}

      {isListCollapsed && (
        <View style={styles.collapsedPanel}>
          <Pressable
            style={styles.expandButton}
            onPress={() => setIsListCollapsed(false)}
            accessibilityLabel="Expand product list"
          >
            <Ionicons name="chevron-forward" size={20} color="#4B5563" />
          </Pressable>
        </View>
      )}

      <View style={styles.editorPanel}>
        {creatingProduct ? (
          <ProductCreate
            onCancel={() => setCreatingProduct(false)}
            onCreated={(product) => {
              setCreatingProduct(false);
              setSelectedProductId(product.id);
            }}
          />
        ) : (
          selectedProduct && (
            <ProductEdit
              key={selectedProduct.id}
              product={selectedProduct}
              onDeleted={handleProductDeleted}
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
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
  },

  listPanel: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: '#DCE1E9',
    backgroundColor: '#FFFFFF',
  },

  listHeader: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  listContent: {
    flex: 1,
  },

  collapsedPanel: {
    width: 48,
    borderRightWidth: 1,
    borderRightColor: '#DCE1E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 8,
  },

  collapseButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editorPanel: {
    flex: 1,
    minWidth: 0,
  },
});
