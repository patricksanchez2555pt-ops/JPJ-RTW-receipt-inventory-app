import { ScrollView, StyleSheet } from 'react-native';

import InventoryTable from '../components/inventoryTable/InventoryTable';

export default function InventoryView() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InventoryTable
        productName="Jogging Pants"
        colors={[
          { name: 'Black', hexValue: '#000000' },
          { name: 'Blue', hexValue: '#0000FF' },
          { name: 'Red', hexValue: '#FF0000' },
          { name: 'White', hexValue: '#FFFFFF' },
          { name: 'Green', hexValue: '#008000' },
          { name: 'Yellow', hexValue: '#FFFF00' },
          { name: 'Pink', hexValue: '#FFC0CB' },
          { name: 'Purple', hexValue: '#800080' },
        ]}
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
