import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRODUCTS, SIZES } from '@/constants';
import { useColorStore } from '@/store/useColorStore';
import { useProductStore } from '@/store/useProductStore';
import { useSizeStore } from '@/store/useSizeStore';

import Sidebar from '../components/layout/Sidebar/Sidebar';

export default function RootLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // remove in future
  useEffect(() => {
    seedInitialInventoryData();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left']}>
        <Sidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((previous) => !previous)}
        />

        <View style={styles.content}>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  container: {
    flex: 1,
    flexDirection: 'row',
  },

  content: {
    flex: 1,
    minWidth: 0,
  },
});

/**
 * Seeds initial store values if the products store is empty.
 */
function seedInitialInventoryData() {
  const productStore = useProductStore.getState();
  const colorStore = useColorStore.getState();
  const sizeStore = useSizeStore.getState();

  // Return early if products are already seeded
  if (productStore.products.length > 0) return;

  // Seed Product
  productStore.setAllProducts(PRODUCTS);

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
      id: `color-jogging-pants-${index}`,
      productId: 'jogging-pants',
      name: col.name,
      hexValue: col.hexValue,
    });
  });

  const leothardsColors = [
    { name: 'Black', hexValue: '#000000' },
    { name: 'White', hexValue: '#FFFFFF' },
    { name: 'Skin tone', hexValue: '#f2c08e' },
  ];

  PRODUCTS.forEach((product) => {
    if (product.id === 'jogging-pants') return;
    leothardsColors.forEach((col, index) => {
      colorStore.addColor({
        id: `color-${product.id}-${index}`,
        productId: product.id,
        name: col.name,
        hexValue: col.hexValue,
      });
    });
  });

  sizeStore.setAllSizes(SIZES);
}
