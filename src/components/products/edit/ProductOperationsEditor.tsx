import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Operation } from '@/types/localModels';
import { f } from '@/utils/fontScale';

interface Props {
  operations: Operation[];
  onAdd: () => void;
  onSave: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductOperationsEditor({ operations, onAdd, onSave, onDelete }: Props) {
  const [operationNames, setOperationNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(operations.map((op) => [op.id, op.name])),
  );

  function hasChanges(op: Operation) {
    const currentName = operationNames[op.id] ?? op.name;
    return currentName.trim() !== op.name;
  }

  function handleSave(op: Operation) {
    const name = (operationNames[op.id] ?? op.name).trim();
    if (!name) {
      Alert.alert('Invalid Operation', 'Operation name cannot be empty.');
      return;
    }
    onSave(op.id, name);
  }

  return (
    <View style={styles.sectionHeaderMargin}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Operations</Text>
          <Text style={styles.sectionSubtitle}>
            {operations.length} operation{operations.length === 1 ? '' : 's'}
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

      {operations.map((op) => {
        const name = operationNames[op.id] ?? op.name;
        const changed = hasChanges(op);

        return (
          <View key={op.id} style={[styles.editorCard, changed && styles.unsavedCard]}>
            <View style={styles.sizeRow}>
              <TextInput
                value={name}
                onChangeText={(value) => setOperationNames((cur) => ({ ...cur, [op.id]: value }))}
                style={[styles.sizeInput, changed && styles.unsavedInput]}
                placeholder="Operation name (e.g. highspeed, edging)"
                placeholderTextColor="#9AA2AF"
              />

              <Pressable
                onPress={() => handleSave(op)}
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

              <Pressable onPress={() => onDelete(op.id)} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={20} color="#C62828" />
              </Pressable>
            </View>

            {changed && <Text style={styles.unsavedText}>Unsaved changes</Text>}
          </View>
        );
      })}

      {operations.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No operations added yet.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeaderMargin: { marginTop: 10, marginBottom: 28 },
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
  emptyText: { color: '#8A93A2', textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
