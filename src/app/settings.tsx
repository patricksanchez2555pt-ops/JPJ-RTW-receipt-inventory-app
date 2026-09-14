import { StyleSheet, View } from 'react-native';

import FontScaleSettings from '@/components/settings/FontScaleSettings';
import PrinterSettings from '@/components/settings/PrinterSettings';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <FontScaleSettings />
      <PrinterSettings />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
});
