import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  type ProductConfigKey,
  seedCustomers,
  seedInitialData,
  seedLaborData,
  seedProductConfig,
} from '@/store/seedInitData';

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
  const [isSeeding, setIsSeeding] = useState(false);

  const runSeed = (title: string, message: string, action: () => void) => {
    if (isSeeding) return;

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Seed Data',
        onPress: () => {
          setIsSeeding(true);

          try {
            action();
            Alert.alert('Success', `${title} completed successfully.`);
          } catch (error) {
            console.error(`Failed to seed ${title}:`, error);

            Alert.alert('Error', `Failed to seed ${title}. Check the console for details.`);
          } finally {
            setIsSeeding(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>🗃️</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>Data Seeding</Text>
          <Text style={styles.cardSubtitle}>
            Initialize product configurations, labor data, and customers.
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
              disabled={isSeeding}
              onPress={() =>
                runSeed(`Seed ${label}`, `Seed the product, colors, and sizes for ${label}?`, () =>
                  seedProductConfig(key),
                )
              }
              style={({ pressed }) => [
                styles.productButton,
                pressed && styles.pressed,
                isSeeding && styles.disabled,
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
            disabled={isSeeding}
            onPress={() =>
              runSeed(
                'Seed Labor Data',
                'Seed workers, operations, and labor rates?',
                seedLaborData,
              )
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
              isSeeding && styles.disabled,
            ]}
          >
            <Text style={styles.actionButtonText}>Seed Labor Data</Text>
          </Pressable>

          <Pressable
            disabled={isSeeding}
            onPress={() =>
              runSeed('Seed Customers', 'Seed the initial customer data?', seedCustomers)
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
              isSeeding && styles.disabled,
            ]}
          >
            <Text style={styles.actionButtonText}>Seed Customers</Text>
          </Pressable>

          <Pressable
            disabled={isSeeding}
            onPress={() =>
              runSeed(
                'Seed All Initial Data',
                'Seed all product configurations, labor data, and customers?',
                seedInitialData,
              )
            }
            style={({ pressed }) => [
              styles.allButton,
              pressed && styles.pressed,
              isSeeding && styles.disabled,
            ]}
          >
            <Text style={styles.allButtonText}>Seed All Initial Data</Text>
          </Pressable>
        </View>
      </View>

      {/* Warning */}
      <View style={styles.warningContainer}>
        <Text style={styles.warningIcon}>ⓘ</Text>
        <Text style={styles.warning}>
          Seeding may update existing records. Review your seed functions before running them on
          production data.
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
