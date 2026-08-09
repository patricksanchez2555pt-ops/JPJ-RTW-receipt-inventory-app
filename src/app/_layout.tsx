import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import InventoryView from '../components/inventory/InventoryView';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import CreateTransactionView from '../components/create-transaction/CreateTransactionView';
// import TransactionsView from '../components/transactions/TransactionsView';
// import ProductsView from '../components/products/ProductsView';
// import ReportsView from '../components/reports/ReportsView';
// import SettingsView from '../components/settings/SettingsView';

export default function RootLayout() {
  const [activeItem, setActiveItem] = useState('Inventory');

  const renderView = () => {
    switch (activeItem) {

      case 'Create Transaction':
        return <CreateTransactionView />;

      // case 'Transactions':
      //   return <TransactionsView />;

      // case 'Products':
      //   return <ProductsView />;

      // case 'Reports':
      //   return <ReportsView />;

      // case 'Settings':
      //   return <SettingsView />;

      default:
        return <InventoryView />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left']}>
      <Sidebar
        activeItem={activeItem}
        onItemPress={setActiveItem}
      />

      <View style={styles.content}>
        {renderView()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },

  content: {
    flex: 1,
  },
});