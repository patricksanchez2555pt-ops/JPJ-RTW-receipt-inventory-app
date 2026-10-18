import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { f } from '@/utils/fontScale';

interface Props {
  initialName: string;
  onSave: (newName: string) => void;
}

export default function ProductInfoForm({ initialName, onSave }: Props) {
  const [productName, setProductName] = useState(initialName);
  const productNameChanged = productName.trim() !== initialName;

  function handleSave() {
    const name = productName.trim();
    if (!name) {
      Alert.alert('Invalid Product', 'Product name cannot be empty.');
      return;
    }
    if (name === initialName) return;
    onSave(name);
    Alert.alert('Saved', 'Product name updated.');
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Product Information</Text>
      <Text style={styles.label}>Product Name</Text>

      <View style={[styles.inputRow, productNameChanged && styles.unsavedContainer]}>
        <TextInput
          value={productName}
          onChangeText={setProductName}
          style={[styles.input, productNameChanged && styles.unsavedInput]}
          placeholder="Product name"
          placeholderTextColor="#9AA2AF"
        />

        <Pressable
          onPress={handleSave}
          disabled={!productNameChanged}
          style={({ pressed }) => [
            styles.smallButton,
            !productNameChanged && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.smallButtonText}>Save</Text>
        </Pressable>
      </View>

      {productNameChanged && <Text style={styles.unsavedText}>Unsaved changes</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: f(17),
    fontWeight: '800',
    color: '#151A23',
    marginBottom: 8,
  },
  label: {
    marginBottom: 7,
    fontSize: f(14),
    color: '#4D5665',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#151A23',
    backgroundColor: '#FFFFFF',
  },
  smallButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#AAB2C0',
  },
  unsavedContainer: {
    borderRadius: 8,
  },
  unsavedInput: {
    borderColor: '#F0B429',
    backgroundColor: '#FFFDF5',
  },
  unsavedText: {
    marginTop: 6,
    marginLeft: 2,
    fontSize: f(11),
    fontWeight: '600',
    color: '#B7791F',
  },
  pressed: {
    opacity: 0.7,
  },
});
