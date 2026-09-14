import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCustomerStore } from '@/store/useCustomerStore';
import { f } from '@/utils/fontScale';

import CustomerPricing from './components/CustomerPricing';

type Props = {
  customerId: string | null;
};

export default function CustomerEditor({ customerId }: Props) {
  const customer = useCustomerStore((state) =>
    state.customers.find((item) => item.id === customerId),
  );

  const updateCustomer = useCustomerStore((state) => state.updateCustomer);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!customer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName('');
      setDescription('');
      return;
    }

    setName(customer.name);
    setDescription(customer.description ?? '');
  }, [customerId, customer]);

  if (!customer) {
    return (
      <View style={styles.emptyEditor}>
        <Text style={styles.emptyEditorTitle}>Select a customer</Text>

        <Text style={styles.emptyEditorText}>
          Select a customer from the list or create a new one.
        </Text>
      </View>
    );
  }

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Invalid Customer', 'Customer name cannot be empty.');

      return;
    }

    updateCustomer(customer.id, {
      name: trimmedName,
      description: description.trim(),
    });

    Alert.alert('Saved', 'Customer information has been saved.');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* CUSTOMER INFORMATION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.sectionTitle}>Customer Information</Text>

            <Text style={styles.sectionSubtitle}>
              Update the customer&apos;s basic information.
            </Text>
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Customer name"
            placeholderTextColor="#9AA2AF"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            placeholderTextColor="#9AA2AF"
            style={[styles.input, styles.descriptionInput]}
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* CUSTOMER PRICING */}
      <CustomerPricing customerId={customer.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  content: {
    padding: 28,
    paddingBottom: 60,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    padding: 22,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: f(17),
    fontWeight: '700',
    color: '#151A23',
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: f(13),
    color: '#687284',
  },

  saveButton: {
    marginLeft: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: '#1745D1',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: f(14),
    fontWeight: '700',
  },

  field: {
    marginTop: 18,
  },

  label: {
    marginBottom: 7,
    fontSize: f(13),
    fontWeight: '600',
    color: '#151A23',
  },

  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    fontSize: f(15),
    color: '#151A23',
  },

  descriptionInput: {
    minHeight: 90,
    paddingTop: 11,
  },

  emptyEditor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyEditorTitle: {
    fontSize: f(20),
    fontWeight: '700',
    color: '#151A23',
  },

  emptyEditorText: {
    marginTop: 6,
    fontSize: f(14),
    color: '#687284',
  },
});
