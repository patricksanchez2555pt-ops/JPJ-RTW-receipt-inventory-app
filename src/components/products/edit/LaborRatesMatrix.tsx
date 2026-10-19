import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { LaborRate, Operation, Size } from '@/types/localModels';
import { f } from '@/utils/fontScale';

const COLUMN_WIDTH = 170;

interface Props {
  productId: string;
  sizes: Size[];
  operations: Operation[];
  laborRates: LaborRate[];
  onSaveRate: (sizeId: string, operationId: string, ratePerUnit: number) => void;
}

export default function LaborRatesMatrix({
  productId,
  sizes,
  operations,
  laborRates,
  onSaveRate,
}: Props) {
  const [rateInputs, setRateInputs] = useState<Record<string, string>>(() => {
    const initialRates: Record<string, string> = {};
    sizes.forEach((size) => {
      operations.forEach((op) => {
        const rateObj = laborRates.find(
          (r) => r.productId === productId && r.sizeId === size.id && r.operationId === op.id,
        );
        initialRates[`${size.id}_${op.id}`] = rateObj ? String(rateObj.ratePerUnit) : '0';
      });
    });
    return initialRates;
  });

  function hasChanges(sizeId: string, operationId: string) {
    const key = `${sizeId}_${operationId}`;
    const rateObj = laborRates.find(
      (r) => r.productId === productId && r.sizeId === sizeId && r.operationId === operationId,
    );
    const existingRate = rateObj ? rateObj.ratePerUnit : 0;
    const currentInput = rateInputs[key] ?? String(existingRate);
    const parsedRate = Number(currentInput.replace(/[^0-9.]/g, ''));
    return parsedRate !== existingRate;
  }

  function handleSaveRate(sizeId: string, operationId: string) {
    const key = `${sizeId}_${operationId}`;
    const inputVal = rateInputs[key] ?? '0';
    const ratePerUnit = Number(inputVal.replace(/[^0-9.]/g, ''));

    if (Number.isNaN(ratePerUnit) || ratePerUnit < 0) {
      Alert.alert('Invalid Rate', 'Please enter a valid labor rate.');
      return;
    }

    onSaveRate(sizeId, operationId, ratePerUnit);
    setRateInputs((cur) => ({ ...cur, [key]: String(ratePerUnit) }));
  }

  return (
    <View style={styles.sectionHeaderMargin}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Labor Rates</Text>
          <Text style={styles.sectionSubtitle}>
            Configure worker payment per operation and size
          </Text>
        </View>
      </View>

      {sizes.length > 0 && operations.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableContainer}>
          <View>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderText, styles.colSizeHeader]}>Size / Operation</Text>
              {operations.map((op) => (
                <Text
                  key={op.id}
                  style={[styles.tableHeaderText, styles.colOpHeader]}
                  numberOfLines={1}
                >
                  {op.name}
                </Text>
              ))}
            </View>

            {sizes.map((size) => (
              <View key={size.id} style={styles.tableRow}>
                <View style={styles.colSizeHeader}>
                  <Text style={styles.tableRowSizeText} numberOfLines={1}>
                    {size.name}
                  </Text>
                </View>

                {operations.map((op) => {
                  const key = `${size.id}_${op.id}`;
                  const rateObj = laborRates.find(
                    (r) =>
                      r.productId === productId && r.sizeId === size.id && r.operationId === op.id,
                  );
                  const defaultRateVal = rateObj ? String(rateObj.ratePerUnit) : '0';
                  const rateVal = rateInputs[key] ?? defaultRateVal;
                  const changed = hasChanges(size.id, op.id);

                  return (
                    <View
                      key={op.id}
                      style={[styles.colOpCell, changed && styles.unsavedCellContainer]}
                    >
                      <View style={[styles.rateInputBox, changed && styles.unsavedInput]}>
                        <Text style={styles.currency}>₱</Text>
                        <TextInput
                          value={rateVal}
                          onChangeText={(val) => setRateInputs((cur) => ({ ...cur, [key]: val }))}
                          style={styles.rateInput}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor="#9AA2AF"
                        />
                      </View>

                      <Pressable
                        onPress={() => handleSaveRate(size.id, op.id)}
                        disabled={!changed}
                        style={({ pressed }) => [
                          styles.saveRateButton,
                          !changed && styles.disabledSaveButton,
                          changed && styles.unsavedSaveButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={changed ? '#1745D1' : '#AAB2C0'}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {sizes.length === 0
              ? 'Add sizes above to configure labor rates.'
              : 'Add operations to this product to configure labor rates.'}
          </Text>
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
  tableContainer: {
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 8,
    backgroundColor: '#FAFBFC',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F4F8',
    borderBottomWidth: 1,
    borderBottomColor: '#DCE1E9',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEFEF',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  tableHeaderText: { fontWeight: '700', color: '#4D5665', fontSize: f(13) },
  colSizeHeader: { width: COLUMN_WIDTH, paddingRight: 10 },
  tableRowSizeText: { fontWeight: '700', color: '#151A23', fontSize: f(13) },
  colOpHeader: {
    width: COLUMN_WIDTH,
    textAlign: 'center',
    fontWeight: '700',
    color: '#4D5665',
    fontSize: f(13),
    paddingHorizontal: 4,
  },
  colOpCell: {
    width: COLUMN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  unsavedCellContainer: { backgroundColor: '#FFFBEB', borderRadius: 6, paddingVertical: 2 },
  rateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    height: 36,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  currency: { marginLeft: 8, fontSize: f(15), color: '#707989' },
  rateInput: {
    flex: 1,
    height: 36,
    width: 100,
    paddingHorizontal: 4,
    color: '#151A23',
    textAlign: 'right',
    fontSize: f(13),
  },
  saveRateButton: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#EEF3FF',
  },
  unsavedSaveButton: { backgroundColor: '#FFF3CD', borderWidth: 1, borderColor: '#F0B429' },
  disabledSaveButton: { backgroundColor: '#F2F4F7' },
  unsavedInput: { borderColor: '#F0B429', backgroundColor: '#FFFDF5' },
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
