import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import type { Product } from '../../../../types/localModels.ts';

type Props = {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
};

export default function ProductSelector({ products, selectedProduct, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  function handleSelect(product: Product) {
    onSelect(product);
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>1. Select Product</Text>

      {/* Dropdown button */}
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [
          styles.selectButton,
          pressed && styles.selectButtonPressed,
          open && styles.selectButtonOpen,
        ]}
      >
        <Text style={[styles.selectText, !selectedProduct && styles.placeholder]}>
          {selectedProduct?.name ?? 'Select a product'}
        </Text>

        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      {/* Dropdown options */}
      {open && (
        <View style={styles.dropdown}>
          {products.map((product) => {
            const selected = selectedProduct?.id === product.id;

            return (
              <Pressable
                key={product.id}
                onPress={() => handleSelect(product)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.selectedOption,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                  {product.name}
                </Text>

                {selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },

  title: {
    fontSize: f(16),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  selectButton: {
    height: 52,
    width: '100%',
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 16,
  },

  selectButtonOpen: {
    borderColor: '#1745D1',
  },

  selectButtonPressed: {
    opacity: 0.8,
  },

  selectText: {
    fontSize: f(15),
    color: '#1A1A1A',
  },

  placeholder: {
    color: '#8A93A3',
  },

  arrow: {
    fontSize: f(12),
    color: '#687284',
  },

  dropdown: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 10,

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 8,

    zIndex: 1001,
  },

  option: {
    minHeight: 52,

    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },

  selectedOption: {
    backgroundColor: '#EEF3FF',
  },

  optionPressed: {
    backgroundColor: '#F3F5F8',
  },

  optionText: {
    fontSize: f(15),
    color: '#1A1A1A',
  },

  selectedOptionText: {
    color: '#1745D1',
    fontWeight: '700',
  },

  check: {
    fontSize: f(18),
    fontWeight: '700',
    color: '#1745D1',
  },
});
