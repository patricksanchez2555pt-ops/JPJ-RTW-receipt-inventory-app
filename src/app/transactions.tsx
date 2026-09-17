import { View } from 'react-native';

import Transactions from '../components/transactions/view/Transactions';

export default function TransactionsPage() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <Transactions />
    </View>
  );
}
