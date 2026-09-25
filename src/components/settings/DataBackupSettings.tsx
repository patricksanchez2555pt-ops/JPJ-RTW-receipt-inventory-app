import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useColorStore } from '@/store/useColorStore';
import { useCustomerPricingStore } from '@/store/useCustomerPricingStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useFontScaleStore } from '@/store/useFontScaleStore';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useProductStore } from '@/store/useProductStore';
import { useSizeStore } from '@/store/useSizeStore';
import { useTransactionStore } from '@/store/useTransactionStore';

const BACKUP_VERSION = 1;

type BackupData = {
  version: number;
  exportedAt: string;

  colors: ReturnType<typeof useColorStore.getState>['colors'];
  customerPrices: ReturnType<typeof useCustomerPricingStore.getState>['customerPrices'];
  customers: ReturnType<typeof useCustomerStore.getState>['customers'];
  fontScale: number;
  inventory: ReturnType<typeof useInventoryStore.getState>['inventory'];
  products: ReturnType<typeof useProductStore.getState>['products'];
  sizes: ReturnType<typeof useSizeStore.getState>['sizes'];
  transactions: ReturnType<typeof useTransactionStore.getState>['transactions'];
};

export default function DataBackupSettings() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  function buildBackupData(): BackupData {
    const colorState = useColorStore.getState();
    const customerPricingState = useCustomerPricingStore.getState();
    const customerState = useCustomerStore.getState();
    const fontScaleState = useFontScaleStore.getState();
    const inventoryState = useInventoryStore.getState();
    const productState = useProductStore.getState();
    const sizeState = useSizeStore.getState();
    const transactionState = useTransactionStore.getState();

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),

      colors: colorState.colors,
      customerPrices: customerPricingState.customerPrices,
      customers: customerState.customers,
      fontScale: fontScaleState.fontScale,
      inventory: inventoryState.inventory,
      products: productState.products,
      sizes: sizeState.sizes,
      transactions: transactionState.transactions,
    };
  }

  async function handleExport() {
    try {
      setIsExporting(true);

      const backupData = buildBackupData();
      const json = JSON.stringify(backupData, null, 2);

      const fileName = `jpj-rtw-backup-${new Date().toISOString().slice(0, 10)}.json`;

      const file = new File(Paths.cache, fileName);

      file.create({
        overwrite: true,
      });

      file.write(json);

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert('Export Complete', `Backup was created at:\n${file.uri}`);
        return;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export JPJ RTW Data',
        UTI: 'public.json',
      });
    } catch (error) {
      console.error('Export error:', error);

      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Unable to export application data.',
      );
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport() {
    try {
      setIsImporting(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const selectedFile = result.assets[0];

      if (!selectedFile?.uri) {
        throw new Error('No file was selected.');
      }

      const file = new File(selectedFile.uri);
      const json = await file.text();

      const backup = JSON.parse(json) as Partial<BackupData>;

      validateBackup(backup);

      Alert.alert(
        'Restore Backup',
        'Importing this file will replace all current application data. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Import',
            style: 'destructive',
            onPress: () => {
              restoreBackup(backup as BackupData);
            },
          },
        ],
      );
    } catch (error) {
      console.error('Import error:', error);

      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Unable to import application data.',
      );
    } finally {
      setIsImporting(false);
    }
  }

  function validateBackup(backup: Partial<BackupData>) {
    if (!backup || typeof backup !== 'object') {
      throw new Error('The selected file is not a valid backup.');
    }

    if (backup.version !== BACKUP_VERSION) {
      throw new Error(`Unsupported backup version: ${backup.version ?? 'unknown'}.`);
    }

    if (!Array.isArray(backup.colors)) {
      throw new Error('Backup is missing colors data.');
    }

    if (!Array.isArray(backup.customerPrices)) {
      throw new Error('Backup is missing customer pricing data.');
    }

    if (!Array.isArray(backup.customers)) {
      throw new Error('Backup is missing customers data.');
    }

    if (!Array.isArray(backup.products)) {
      throw new Error('Backup is missing products data.');
    }

    if (!Array.isArray(backup.sizes)) {
      throw new Error('Backup is missing sizes data.');
    }

    if (!Array.isArray(backup.transactions)) {
      throw new Error('Backup is missing transactions data.');
    }

    if (
      !backup.inventory ||
      typeof backup.inventory !== 'object' ||
      Array.isArray(backup.inventory)
    ) {
      throw new Error('Backup is missing inventory data.');
    }

    if (typeof backup.fontScale !== 'number') {
      throw new Error('Backup is missing font scale data.');
    }
  }

  function restoreBackup(backup: BackupData) {
    try {
      /*
       * Restore colors
       */
      useColorStore.getState().setAllColors(backup.colors);

      /*
       * Restore customers
       */
      useCustomerStore.setState({
        customers: backup.customers,
      });

      /*
       * Restore customer-specific pricing
       */
      useCustomerPricingStore.setState({
        customerPrices: backup.customerPrices,
      });

      /*
       * Restore products
       */
      useProductStore.getState().setAllProducts(backup.products);

      /*
       * Restore sizes
       */
      useSizeStore.getState().setAllSizes(backup.sizes);

      /*
       * Restore inventory
       */
      useInventoryStore.getState().setAllInventory(Object.values(backup.inventory));

      /*
       * Restore transactions
       */
      useTransactionStore.getState().setAllTransactions(backup.transactions);

      /*
       * Restore font scale
       */
      useFontScaleStore.getState().setFontScale(backup.fontScale);

      Alert.alert('Import Complete', 'All JPJ RTW data has been restored successfully.');
    } catch (error) {
      console.error('Restore error:', error);

      Alert.alert(
        'Restore Failed',
        error instanceof Error ? error.message : 'Unable to restore application data.',
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Data Backup</Text>

          <Text style={styles.subtitle}>
            Export all application data to a JSON file or restore data from a previous backup.
          </Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={handleExport}
          disabled={isExporting || isImporting}
          style={({ pressed }) => [
            styles.button,
            styles.exportButton,
            pressed && styles.pressed,
            (isExporting || isImporting) && styles.disabled,
          ]}
        >
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Exporting...' : 'Download Data'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleImport}
          disabled={isExporting || isImporting}
          style={({ pressed }) => [
            styles.button,
            styles.importButton,
            pressed && styles.pressed,
            (isExporting || isImporting) && styles.disabled,
          ]}
        >
          <Text style={styles.importButtonText}>
            {isImporting ? 'Importing...' : 'Upload Data'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.warning}>Importing a backup replaces the current application data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#252B35',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: '#707A8A',
  },

  buttons: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },

  button: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exportButton: {
    backgroundColor: '#1745D1',
  },

  importButton: {
    borderWidth: 1,
    borderColor: '#D8DDE5',
    backgroundColor: '#F5F7FA',
  },

  exportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  importButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#252B35',
  },

  warning: {
    marginTop: 12,
    fontSize: 11,
    color: '#8A6A32',
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.5,
  },
});
