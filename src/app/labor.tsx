import { StyleSheet, View } from 'react-native';

import LaborManagementScreen from '@/components/labor/LaborManagementScreen';

export default function LaborScreen() {
  return (
    <View style={styles.container}>
      <LaborManagementScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
