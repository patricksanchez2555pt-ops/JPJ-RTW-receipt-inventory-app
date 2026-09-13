import { memo, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCustomerStore } from '@/store/useCustomerStore';

import CustomerList from './componets/CustomerList';
import CustomerEditor from './componets/cutomer-editor/CustomerEditor';

function Customers() {
  const customers = useCustomerStore((state) => state.customers);

  const addCustomer = useCustomerStore((state) => state.addCustomer);

  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);

  const getCustomer = useCustomerStore((state) => state.getCustomer);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    customers[0]?.id ?? null,
  );

  const sortedCustomers = useMemo(
    () =>
      [...customers].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          sensitivity: 'base',
        }),
      ),
    [customers],
  );

  const selectedCustomer = useMemo(
    () => (selectedCustomerId ? (getCustomer(selectedCustomerId) ?? null) : null),
    [getCustomer, selectedCustomerId],
  );

  /*
   * If the selected customer was deleted,
   * automatically select another customer.
   */
  useEffect(() => {
    if (selectedCustomerId && customers.some((customer) => customer.id === selectedCustomerId)) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCustomerId(sortedCustomers[0]?.id ?? null);
  }, [customers, selectedCustomerId, sortedCustomers]);

  const handleAddCustomer = () => {
    const customer = addCustomer({
      name: 'New Customer',
      description: '',
    });

    setSelectedCustomerId(customer.id);
  };

  const handleDeleteCustomer = () => {
    if (!selectedCustomer) {
      return;
    }

    Alert.alert(
      'Delete Customer',
      `Delete "${selectedCustomer.name}"? This will also remove their custom pricing.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            /*
             * The customer store handles both:
             * 1. Deleting the customer
             * 2. Deleting their custom pricing
             */
            deleteCustomer(selectedCustomer.id);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* LEFT CUSTOMER LIST */}
      <CustomerList
        customers={sortedCustomers}
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={setSelectedCustomerId}
        onAddCustomer={handleAddCustomer}
      />

      {/* RIGHT EDITOR */}
      <View style={styles.editor}>
        {/* PAGE HEADER */}
        <View style={styles.editorHeader}>
          <View>
            <Text style={styles.editorTitle}>Customer Details</Text>

            <Text style={styles.editorSubtitle}>
              Configure customer information and product pricing.
            </Text>
          </View>

          {selectedCustomer ? (
            <Pressable style={styles.deleteButton} onPress={handleDeleteCustomer}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          ) : null}
        </View>

        {/* CUSTOMER EDITOR */}
        <CustomerEditor customerId={selectedCustomerId} />
      </View>
    </View>
  );
}

export default memo(Customers);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
  },

  editor: {
    flex: 1,
  },

  editorHeader: {
    minHeight: 82,
    paddingHorizontal: 28,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DCE1E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  editorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#151A23',
  },

  editorSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#687284',
  },

  deleteButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E0B4B4',
    backgroundColor: '#FFF8F8',
  },

  deleteButtonText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '600',
  },
});
