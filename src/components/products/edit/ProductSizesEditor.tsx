import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Size } from '@/types/localModels';
import { f } from '@/utils/fontScale';

interface Props {
  productId: string;
  sizes: Size[];
  onAdd: () => void;
  onSave: (sizeId: string, name: string, price: number) => void;
  onDelete: (sizeId: string) => void;
}

export default function ProductSizesEditor({ sizes, onAdd, onSave, onDelete }: Props) {
  const [sizeNames, setSizeNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(sizes.map((s) => [s.id, s.name])),
  );
  const [sizePrices, setSizePrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(sizes.map((s) => [s.id, String(s.price)])),
  );

  function hasChanges(size: Size) {
    const currentName = sizeNames[size.id] ?? size.name;
    const currentPrice = sizePrices[size.id] ?? String(size.price);
    const parsedPrice = Number(currentPrice.replace(/[^0-9.]/g, ''));
    return currentName.trim() !== size.name || parsedPrice !== size.price;
  }

  function handleSave(size: Size) {
    const name = (sizeNames[size.id] ?? size.name).trim();
    const priceText = sizePrices[size.id] ?? String(size.price);
    const price = Number(priceText.replace(/[^0-9.]/g, ''));

    if (!name) {
      Alert.alert('Invalid Size', 'Size name cannot be empty.');
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    onSave(size.id, name, price);
  }

  return (
    <View style={styles.editorSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Sizes & Prices</Text>
          <Text style={styles.sectionSubtitle}>
            {sizes.length} size{sizes.length === 1 ? '' : 's'}
          </Text>
        </View>

        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {sizes.map((size) => {
        const name = sizeNames[size.id] ?? size.name;
        const price = sizePrices[size.id] ?? String(size.price);
        const changed = hasChanges(size);

        return (
          <View key={size.id} style={[styles.editorCard, changed && styles.unsavedCard]}>
            <View style={styles.sizeRow}>
              <TextInput
                value={name}
                onChangeText={(value) => setSizeNames((cur) => ({ ...cur, [size.id]: value }))}
                style={[styles.sizeInput, changed && styles.unsavedInput]}
                placeholder="Size"
                placeholderTextColor="#9AA2AF"
              />

              <View style={[styles.priceInputContainer, changed && styles.unsavedInput]}>
                <Text style={styles.currency}>₱</Text>
                <TextInput
                  value={price}
                  onChangeText={(value) => setSizePrices((cur) => ({ ...cur, [size.id]: value }))}
                  style={styles.priceInput}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#9AA2AF"
                />
              </View>

              <Pressable
                onPress={() => handleSave(size)}
                disabled={!changed}
                style={({ pressed }) => [
                  styles.saveIconButton,
                  !changed && styles.disabledSaveButton,
                  changed && styles.unsavedSaveButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="checkmark" size={19} color={changed ? '#1745D1' : '#AAB2C0'} />
              </Pressable>

              <Pressable onPress={() => onDelete(size.id)} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={20} color="#C62828" />
              </Pressable>
            </View>

            {changed && <Text style={styles.unsavedText}>Unsaved changes</Text>}
          </View>
        );
      })}

      {sizes.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No sizes added.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  editorSection: { flex: 1, minWidth: 0 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: f(17), fontWeight: '800', color: '#151A23' },
  sectionSubtitle: { marginTop: 3, color: '#707989', fontSize: f(13) },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1745D1',
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '700' },
  editorCard: {
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 8,
    backgroundColor: '#FAFBFC',
  },
  unsavedCard: { borderColor: '#F0B429', backgroundColor: '#FFFBEB' },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sizeInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    color: '#151A23',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 105,
    height: 40,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  currency: { marginLeft: 8, fontSize: f(15), color: '#707989' },
  priceInput: { flex: 1, height: 40, paddingHorizontal: 5, color: '#151A23', textAlign: 'right' },
  saveIconButton: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#EEF3FF',
  },
  unsavedSaveButton: { backgroundColor: '#FFF3CD', borderWidth: 1, borderColor: '#F0B429' },
  disabledSaveButton: { backgroundColor: '#F2F4F7' },
  iconButton: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  unsavedInput: { borderColor: '#F0B429', backgroundColor: '#FFFDF5' },
  unsavedText: {
    marginTop: 6,
    marginLeft: 2,
    fontSize: f(11),
    fontWeight: '600',
    color: '#B7791F',
  },
  emptyBox: {
    padding: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D8DDE5',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: { color: '#8A93A2' },
  pressed: { opacity: 0.7 },
});
