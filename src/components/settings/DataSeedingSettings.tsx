import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  type ProductConfigKey,
  seedCustomers,
  seedInitialData,
  seedLaborData,
  seedProductConfig,
} from '@/store/seedInitData';
import { useColorStore } from '@/store/useColorStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useDeductionStore } from '@/store/useDeductionStore';
import { useLaborItemStore } from '@/store/useLaborItemStore';
import { useLaborRateStore } from '@/store/useLaborRateStore';
import { useOperationStore } from '@/store/useOperationStore';
import { useProductStore } from '@/store/useProductStore';
import { useSizeStore } from '@/store/useSizeStore';
import { useWorkerStore } from '@/store/useWorkerStore';

const PRODUCT_CONFIG_BUTTONS: {
  key: ProductConfigKey;
  label: string;
}[] = [
  { key: 'JOGGING_PANTS', label: 'Jogging Pants' },
  { key: 'HIPHOP', label: 'Hiphop' },
  { key: 'LEOTARD_LONG', label: 'L/S' },
  { key: 'LEOTARD_SHORT', label: 'S/S' },
  { key: 'CYCLING_SHORTS', label: 'Cycling Shorts' },
  { key: 'JEANS', label: 'Jeans' },
  { key: 'TIGHTS_SAKBET', label: 'Tights / Sakbet' },
  { key: 'LEOTARD_SET_LONG', label: 'L/S Set' },
  { key: 'LEOTARD_SET_SHORT', label: 'S/S Set' },
];

export default function DataSeedingSettings() {
  const [isProcessing, setIsProcessing] = useState(false);

  const runAction = (
    title: string,
    message: string,
    action: () => void,
    successText = 'completed successfully.',
  ) => {
    if (isProcessing) return;

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: () => {
          setIsProcessing(true);

          try {
            action();
            Alert.alert('Success', `${title} ${successText}`);
          } catch (error) {
            console.error(`Failed during ${title}:`, error);

            Alert.alert('Error', `Failed during ${title}. Check the console for details.`);
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  const handleClearAll = () => {
    runAction(
      'Clear All Stores',
      'Are you sure you want to clear all data from every store? This action cannot be undone.',
      () => {
        useProductStore.setState({ products: [] });
        useColorStore.setState({ colors: [] });
        useSizeStore.setState({ sizes: [] });
        useOperationStore.setState({ operations: [] });
        useWorkerStore.setState({ workers: [] });
        useLaborRateStore.setState({ laborRates: [] });
        useLaborItemStore.setState({ laborItems: {} });
        useCustomerStore.setState({ customers: [] });
        useDeductionStore.setState({ deductions: {} });
      },
      'cleared successfully.',
    );
  };

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>🗃️</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>Data Seeding & Maintenance</Text>
          <Text style={styles.cardSubtitle}>
            Initialize or clear product configurations, labor data, and records.
          </Text>
        </View>
      </View>

      {/* Product Configurations */}
      <View style={styles.section}>
        <Text style={styles.title}>Seed Product Configuration</Text>
        <Text style={styles.subtitle}>
          Seed an individual product&apos;s catalog, colors, and sizes.
        </Text>

        <View style={styles.productGrid}>
          {PRODUCT_CONFIG_BUTTONS.map(({ key, label }) => (
            <Pressable
              key={key}
              disabled={isProcessing}
              onPress={() =>
                runAction(
                  `Seed ${label}`,
                  `Seed the product, colors, and sizes for ${label}?`,
                  () => seedProductConfig(key),
                )
              }
              style={({ pressed }) => [
                styles.productButton,
                pressed && styles.pressed,
                isProcessing && styles.disabled,
              ]}
            >
              <Text style={styles.productButtonText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Other Seed Data */}
      <View style={styles.section}>
        <Text style={styles.title}>Other Seed Data</Text>
        <Text style={styles.subtitle}>
          Initialize supporting data used throughout the application.
        </Text>

        <View style={styles.actions}>
          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction(
                'Seed Labor Data',
                'Seed workers, operations, and labor rates?',
                seedLaborData,
              )
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.actionButtonText}>Seed Labor Data</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Seed Customers', 'Seed the initial customer data?', seedCustomers)
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.actionButtonText}>Seed Customers</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction(
                'Seed All Initial Data',
                'Seed all product configurations, labor data, and customers?',
                seedInitialData,
              )
            }
            style={({ pressed }) => [
              styles.allButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.allButtonText}>Seed All Initial Data</Text>
          </Pressable>
        </View>
      </View>

      {/* Store Reset / Delete Section */}
      <View style={styles.section}>
        <Text style={styles.title}>Store Data Deletion</Text>
        <Text style={styles.subtitle}>
          Clear data for individual stores or wipe everything clean.
        </Text>

        <View style={styles.productGrid}>
          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Products', 'Clear all products?', () =>
                useProductStore.setState({ products: [] }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Products</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Colors', 'Clear all colors?', () =>
                useColorStore.setState({ colors: [] }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Colors</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Sizes', 'Clear all sizes?', () =>
                useSizeStore.setState({ sizes: [] }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Sizes</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Operations', 'Clear all operations?', () =>
                useOperationStore.setState({ operations: [] }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Operations</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Workers', 'Clear all workers?', () =>
                useWorkerStore.setState({ workers: [] }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Workers</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Labor Rates', 'Clear all labor rates?', () =>
                useLaborRateStore.setState({ laborRates: [] }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Labor Rates</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Labor Items', 'Clear all logged labor items?', () =>
                useLaborItemStore.setState({ laborItems: {} }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Labor Items</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Customers', 'Clear all customers?', () =>
                useCustomerStore.setState({ customers: [] }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Customers</Text>
          </Pressable>

          <Pressable
            disabled={isProcessing}
            onPress={() =>
              runAction('Clear Deductions', 'Clear all deductions?', () =>
                useDeductionStore.setState({ deductions: {} }),
              )
            }
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.deleteButtonText}>Clear Deductions</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 12 }}>
          <Pressable
            disabled={isProcessing}
            onPress={handleClearAll}
            style={({ pressed }) => [
              styles.dangerAllButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled,
            ]}
          >
            <Text style={styles.dangerAllButtonText}>Clear All Stores</Text>
          </Pressable>
        </View>
      </View>

      {/* Warning */}
      <View style={styles.warningContainer}>
        <Text style={styles.warningIcon}>ⓘ</Text>
        <Text style={styles.warning}>
          Seeding or clearing data directly affects persistent application stores. Use caution when
          running these actions on production data.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main card
  card: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // Card header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#252B35',
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#707A8A',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#252B35',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 18,
    color: '#707A8A',
  },

  // Product configuration buttons
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
  },
  productButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  // Delete store buttons
  deleteButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Other seed actions
  actions: {
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  allButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1745D1',
  },
  allButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dangerAllButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
  },
  dangerAllButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Warning
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  warningIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C2410C',
  },
  warning: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#9A3412',
  },

  // Interaction states
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
});
