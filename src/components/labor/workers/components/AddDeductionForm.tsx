import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { f } from '@/utils/fontScale';

interface AddDeductionFormProps {
  workerId: string;
  initialDate: string;
  onSave: (deduction: { workerId: string; amount: number; label: string; date: string }) => void;
  onCancel: () => void;
}

export default function AddDeductionForm({
  workerId,
  initialDate,
  onSave,
  onCancel,
}: AddDeductionFormProps) {
  const [date, setDate] = useState(initialDate);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!label.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !date.trim()) return;

    onSave({
      workerId,
      label: label.trim(),
      amount: parsedAmount,
      date: date.trim(),
    });
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>New Worker Deduction</Text>

      <View style={styles.formGrid}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Date (MM-DD-YYYY)</Text>
          <TextInput
            style={styles.formInput}
            value={date}
            onChangeText={setDate}
            placeholder="MM-DD-YYYY"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Reason / Label</Text>
          <TextInput
            style={styles.formInput}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Cash Advance, Damaged Fabric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Amount (₱)</Text>
          <TextInput
            style={styles.formInput}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Deduction</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 10,
  },
  formGrid: {
    gap: 10,
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontSize: f(11),
    fontWeight: '600',
    color: '#991B1B',
    textTransform: 'uppercase',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
    fontSize: f(13),
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  cancelBtnText: {
    color: '#991B1B',
    fontSize: f(13),
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: f(13),
    fontWeight: '700',
  },
});
