import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFontScaleStore } from '@/store/useFontScaleStore';

export default function FontScaleSettings() {
  const fontScale = useFontScaleStore((s) => s.fontScale);
  const setFontScale = useFontScaleStore((s) => s.setFontScale);

  const [value, setValue] = useState(String(fontScale));

  function save() {
    const parsed = Number(value);

    if (Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid value', 'Please enter a number greater than 0.');
      return;
    }

    setFontScale(parsed);
    Alert.alert('Saved', `UI scale set to ${parsed}`);
  }

  function reset() {
    setValue('1.2');
    setFontScale(1.2);
    Alert.alert('Reset', 'UI scale reset to 1.2');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UI Scale</Text>

      <Text style={styles.help}>Adjust global font multiplier used by components.</Text>

      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={setValue}
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>

        <Pressable style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.current}>Current scale: {fontScale}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  help: {
    color: '#6B7280',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1745D1',
    borderRadius: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#6B7280',
    borderRadius: 8,
  },
  resetText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  current: {
    marginTop: 8,
    color: '#374151',
  },
});
