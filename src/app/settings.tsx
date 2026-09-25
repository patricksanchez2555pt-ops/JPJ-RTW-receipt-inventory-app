import { ScrollView, StyleSheet } from 'react-native';

import FontScaleSettings from '@/components/settings/FontScaleSettings';
import PrinterSettings from '@/components/settings/PrinterSettings';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <FontScaleSettings />
      <PrinterSettings />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
});
