import { ScrollView, StyleSheet } from 'react-native';

import InventoryTable from '../components/inventoryTable/InventoryTable';

export default function InventoryView() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InventoryTable
        productName="Jogging Pants"
        colors={['Black', 'Blue', 'Red', 'White', 'Green', 'Yellow', 'Pink', 'Purple']}
        sizes={['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']}
      />
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
