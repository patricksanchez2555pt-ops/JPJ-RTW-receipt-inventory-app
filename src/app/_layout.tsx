import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRODUCTS, SIZES } from '@/constants';
import { useColorStore } from '@/store/useColorStore';
import { useCustomerPricingStore } from '@/store/useCustomerPricingStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useProductStore } from '@/store/useProductStore';
import { useSizeStore } from '@/store/useSizeStore';

import Sidebar from '../components/layout/Sidebar/Sidebar';

export default function RootLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Remove in future
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
  const customerStore = useCustomerStore.getState();
  const customerPricingStore = useCustomerPricingStore.getState();

  // Return early if products are already seeded
  if (!productStore.products.length) {
    // Seed Products
    productStore.setAllProducts(PRODUCTS);

    // Seed Jogging Pants Colors
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

    // Seed Leotard Colors
    const leothardsColors = [
      { name: 'Black', hexValue: '#000000' },
      { name: 'White', hexValue: '#FFFFFF' },
      { name: 'Skin tone', hexValue: '#f2c08e' },
    ];

    PRODUCTS.forEach((product) => {
      if (product.id === 'jogging-pants') {
        return;
      }

      leothardsColors.forEach((col, index) => {
        colorStore.addColor({
          id: `color-${product.id}-${index}`,
          productId: product.id,
          name: col.name,
          hexValue: col.hexValue,
        });
      });
    });

    // Seed Sizes
    sizeStore.setAllSizes(SIZES);
  }

  if (!customerStore.customers.length) {
    // Seed Customers
    const initialCustomers = [
      { name: 'John Doe' },
      { name: 'Jane Smith' },
      { name: 'Alice Johnson' },
      { name: 'Bob Brown' },
    ];
    initialCustomers.forEach((customer) => {
      customerStore.addCustomer({
        name: customer.name,
      });
    });
  }

  // seed initial customer pricing if the customer pricing store is empty
  if (!customerPricingStore.customerPrices.length) {
    const initialCustomerPricings = customerStore.customers.map((customer) => ({
      customerId: customer.id,
      productId: 'jogging-pants',
      price: 1500,
    }));

    const size = sizeStore.sizes.filter((size) => size.productId === 'jogging-pants')[0];

    initialCustomerPricings.forEach((pruning) => {
      customerPricingStore.addCustomerPrice({
        productId: pruning.productId,
        customerId: pruning.customerId,
        sizeId: size.id,
        price: 1000,
      });
    });
  }
}
