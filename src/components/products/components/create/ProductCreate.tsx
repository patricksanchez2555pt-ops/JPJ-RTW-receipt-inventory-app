import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useProductStore } from '../../../../store/useProductStore';
import type { Product } from '../../../../types/localModels';

type Props = {
  onCreated: (product: Product) => void;
  onCancel: () => void;
};

export default function CreateProduct({ onCreated, onCancel }: Props) {
  const addProduct = useProductStore((state) => state.addProduct);

  const [productName, setProductName] = useState('');

  function handleCreate() {
    const name = productName.trim();

    if (!name) {
      Alert.alert('Invalid Product', 'Product name cannot be empty.');
      return;
    }

    const id = `product-${Date.now()}`;

    const newProduct = {
      id,
      name,
    } as Omit<Product, 'createdAt'>;

    addProduct(newProduct);

    const createdProduct: Product = {
      ...newProduct,
      createdAt: new Date().toISOString(),
    };

    onCreated(createdProduct);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="cube-outline" size={22} color="#1745D1" />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>Create Product</Text>

            <Text style={styles.subtitle}>Add a new product to your inventory.</Text>
          </View>
        </View>

        {/* FORM */}

        <View style={styles.form}>
          <Text style={styles.label}>Product Name</Text>

          <TextInput
            value={productName}
            onChangeText={setProductName}
            style={styles.input}
            placeholder="e.g. Jogging Pants"
            placeholderTextColor="#9AA2AF"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />

          <Text style={styles.helpText}>
            You can add sizes, prices, and colors after creating the product.
          </Text>
        </View>

        {/* ACTIONS */}

        <View style={styles.actions}>
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />

            <Text style={styles.createButtonText}>Create Product</Text>
          </Pressable>
        </View>
      </View>
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

  content: {
    padding: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151A23',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#707989',
  },

  form: {
    maxWidth: 600,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#4D5665',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    paddingHorizontal: 13,
    fontSize: 15,
    color: '#151A23',
    backgroundColor: '#FFFFFF',
  },

  helpText: {
    marginTop: 8,
    fontSize: 13,
    color: '#8A93A2',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 32,
  },

  cancelButton: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#4D5665',
    fontWeight: '700',
  },

  createButton: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },
});
