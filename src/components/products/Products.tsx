import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useColorStore } from '../../store/useColorStore';
import { useProductStore } from '../../store/useProductStore';
import { useSizeStore } from '../../store/useSizeStore';
import ProductCreate from './components/create/ProductCreate';
import ProductEdit from './components/edit/ProductEdit';
import ProductList from './components/list/ProductList';

export default function Products() {
  const products = useProductStore((state) => state.products);
  const colors = useColorStore((state) => state.colors);
  const sizes = useSizeStore((state) => state.sizes);

  const [creatingProduct, setCreatingProduct] = useState(false);

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
      <View style={styles.listPanel}>
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
            <ProductEdit key={selectedProduct.id} product={selectedProduct} onDeleted={handleProductDeleted} />
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

  editorPanel: {
    flex: 1,
  },
});
