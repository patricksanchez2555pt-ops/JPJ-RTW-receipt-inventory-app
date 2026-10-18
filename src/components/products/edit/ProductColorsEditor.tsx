import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Color } from '@/types/localModels';
import { f } from '@/utils/fontScale';

interface Props {
  colors: Color[];
  onAdd: () => void;
  onSave: (colorId: string, name: string, hexValue: string) => void;
  onDelete: (colorId: string) => void;
}

export default function ProductColorsEditor({ colors, onAdd, onSave, onDelete }: Props) {
  const [colorNames, setColorNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(colors.map((c) => [c.id, c.name])),
  );
  const [colorHexValues, setColorHexValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(colors.map((c) => [c.id, c.hexValue])),
  );

  function hasChanges(color: Color) {
    const currentName = colorNames[color.id] ?? color.name;
    const currentHex = colorHexValues[color.id] ?? color.hexValue;
    return (
      currentName.trim() !== color.name ||
      currentHex.trim().toUpperCase() !== color.hexValue.toUpperCase()
    );
  }

  function handleSave(color: Color) {
    const name = (colorNames[color.id] ?? color.name).trim();
    const hexValue = (colorHexValues[color.id] ?? color.hexValue).trim().toUpperCase();

    if (!name) {
      Alert.alert('Invalid Color', 'Color name cannot be empty.');
      return;
    }
    if (!/^#[0-9A-F]{6}$/.test(hexValue)) {
      Alert.alert('Invalid Color', 'HEX color must be in the format #FFFFFF.');
      return;
    }

    onSave(color.id, name, hexValue);
  }

  return (
    <View style={styles.editorSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Colors</Text>
          <Text style={styles.sectionSubtitle}>
            {colors.length} color{colors.length === 1 ? '' : 's'}
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

      {colors.map((color) => {
        const name = colorNames[color.id] ?? color.name;
        const hexValue = colorHexValues[color.id] ?? color.hexValue;
        const changed = hasChanges(color);
        const validHex = /^#[0-9A-Fa-f]{6}$/.test(hexValue);

        return (
          <View key={color.id} style={[styles.editorCard, changed && styles.unsavedCard]}>
            <View style={styles.colorEditRow}>
              <View
                style={[styles.colorPreview, { backgroundColor: validHex ? hexValue : '#CCCCCC' }]}
              />

              <TextInput
                value={name}
                onChangeText={(val) => setColorNames((cur) => ({ ...cur, [color.id]: val }))}
                style={[styles.colorNameInput, changed && styles.unsavedInput]}
                placeholder="Color name"
                placeholderTextColor="#9AA2AF"
              />

              <TextInput
                value={hexValue}
                onChangeText={(val) =>
                  setColorHexValues((cur) => ({ ...cur, [color.id]: val.toUpperCase() }))
                }
                style={[styles.hexInput, changed && styles.unsavedInput]}
                placeholder="#FFFFFF"
                placeholderTextColor="#9AA2AF"
                autoCapitalize="characters"
                maxLength={7}
              />

              <Pressable
                onPress={() => handleSave(color)}
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

              <Pressable onPress={() => onDelete(color.id)} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={20} color="#C62828" />
              </Pressable>
            </View>

            {changed && <Text style={styles.unsavedText}>Unsaved changes</Text>}
          </View>
        );
      })}

      {colors.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No colors added.</Text>
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
  colorEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorPreview: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    flexShrink: 0,
  },
  colorNameInput: {
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
  hexInput: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    color: '#151A23',
  },
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
