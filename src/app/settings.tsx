import { ScrollView, StyleSheet, Text } from 'react-native';

import AppExpirationSettings from '@/components/settings/AppExpirationSettings';
import DataBackupSettings from '@/components/settings/DataBackupSettings';
import DataSeedingSettings from '@/components/settings/DataSeedingSettings';
import FontScaleSettings from '@/components/settings/FontScaleSettings';
import PrinterSettings from '@/components/settings/PrinterSettings';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <AppExpirationSettings />

      <FontScaleSettings />

      <DataBackupSettings />

      <DataSeedingSettings />

      <PrinterSettings />
      <Text>Version 1.1.3</Text>
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
