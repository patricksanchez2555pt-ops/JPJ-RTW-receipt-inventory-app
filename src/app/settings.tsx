import { ScrollView, StyleSheet } from 'react-native';

import DataBackupSettings from '@/components/settings/DataBackupSettings';
import DataSeedingSettings from '@/components/settings/DataSeedingSettings';
import FontScaleSettings from '@/components/settings/FontScaleSettings';
import PrinterSettings from '@/components/settings/PrinterSettings';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <FontScaleSettings />

      <DataBackupSettings />

      <DataSeedingSettings />

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
