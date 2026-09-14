import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import type { Color, Product, Size } from '../../../../types/localModels';

type Props = {
  product: Product;
  colors: Color[];
  sizes: Size[];
  selected: boolean;
  onPress: () => void;
};

export default function ProductRow({ product, colors, sizes, selected, onPress }: Props) {
  const prices = sizes.map((size) => size.price);

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.indicator} />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>

        <Text style={styles.price}>
          {prices.length > 0
            ? minPrice === maxPrice
              ? `₱${minPrice.toFixed(2)}`
              : `₱${minPrice.toFixed(2)} – ₱${maxPrice.toFixed(2)}`
            : 'No prices'}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {colors.length} {colors.length === 1 ? 'color' : 'colors'}
          </Text>

          <Text style={styles.dot}>•</Text>

          <Text style={styles.metaText}>
            {sizes.length} {sizes.length === 1 ? 'size' : 'sizes'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 82,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 6,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  selected: {
    backgroundColor: '#EEF3FF',
  },

  pressed: {
    opacity: 0.75,
  },

  indicator: {
    width: 4,
    height: 44,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },

  content: {
    flex: 1,
  },

  name: {
    fontSize: f(15),
    fontWeight: '800',
    color: '#252B35',
  },

  price: {
    marginTop: 3,
    fontSize: f(12),
    fontWeight: '700',
    color: '#1745D1',
  },

  meta: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontSize: f(11),
    color: '#8992A1',
  },

  dot: {
    marginHorizontal: 5,
    fontSize: f(10),
    color: '#A0A7B2',
  },
});
