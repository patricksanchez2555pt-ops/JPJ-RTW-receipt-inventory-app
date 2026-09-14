import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Customer } from '@/types/localModels';
import { f } from '@/utils/fontScale';

type Props = {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
  onAddCustomer: () => void;
};

export default function CustomerList({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
}: Props) {
  return (
    <View style={styles.sidebar}>
      {/* HEADER */}
      <View style={styles.sidebarHeader}>
        <View>
          <Text style={styles.title}>Customers</Text>

          <Text style={styles.customerCount}>
            {customers.length} customer
            {customers.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <Pressable style={styles.addButton} onPress={onAddCustomer}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      {/* LIST */}
      <ScrollView style={styles.customerList} contentContainerStyle={styles.customerListContent}>
        {customers.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={styles.emptyTitle}>No customers</Text>

            <Text style={styles.emptyText}>Add a customer to configure custom pricing.</Text>
          </View>
        ) : (
          customers.map((customer) => {
            const selected = customer.id === selectedCustomerId;

            return (
              <Pressable
                key={customer.id}
                onPress={() => onSelectCustomer(customer.id)}
                style={[styles.customerRow, selected && styles.customerRowSelected]}
              >
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>
                    {customer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.customerRowContent}>
                  <Text
                    style={[styles.customerName, selected && styles.customerNameSelected]}
                    numberOfLines={1}
                  >
                    {customer.name}
                  </Text>

                  {customer.description ? (
                    <Text style={styles.customerDescription} numberOfLines={1}>
                      {customer.description}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#DCE1E9',
  },

  sidebarHeader: {
    minHeight: 80,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: f(22),
    fontWeight: '700',
    color: '#151A23',
  },

  customerCount: {
    marginTop: 3,
    fontSize: f(13),
    color: '#687284',
  },

  addButton: {
    backgroundColor: '#1745D1',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 7,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: f(14),
    fontWeight: '700',
  },

  customerList: {
    flex: 1,
  },

  customerListContent: {
    paddingVertical: 8,
  },

  customerRow: {
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },

  customerRowSelected: {
    backgroundColor: '#EEF3FF',
    borderLeftColor: '#1745D1',
  },

  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8ECF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  customerAvatarText: {
    fontSize: f(15),
    fontWeight: '700',
    color: '#4A5568',
  },

  customerRowContent: {
    flex: 1,
  },

  customerName: {
    fontSize: f(15),
    fontWeight: '600',
    color: '#151A23',
  },

  customerNameSelected: {
    color: '#1745D1',
  },

  customerDescription: {
    marginTop: 3,
    fontSize: f(12),
    color: '#687284',
  },

  emptyList: {
    padding: 25,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: f(15),
    fontWeight: '600',
    color: '#151A23',
  },

  emptyText: {
    marginTop: 5,
    fontSize: f(13),
    lineHeight: 19,
    textAlign: 'center',
    color: '#687284',
  },
});
