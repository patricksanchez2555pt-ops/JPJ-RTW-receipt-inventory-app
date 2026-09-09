import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  quantity: number;
  onChange: (quantity: number) => void;
  addItems: () => void;
};

const QUANTITIES = [
  { label: '1 pc', value: 1 },
  { label: '3 pcs', value: 3 },
  { label: '6 pcs', value: 6 },
  { label: '12 pcs', value: 12 },
];

export default function QuantitySelector({ quantity, onChange, addItems }: Props) {
  const [customQuantity, setCustomQuantity] = useState<string | null>('');

  const isPresetQuantity = QUANTITIES.some((item) => item.value === quantity);

  const handleCustomQuantityChanged = (value: string) => {
    // Allow completely empty input
    if (value === '') {
      setCustomQuantity('');
      return;
    }

    // Numbers only
    if (!/^\d+$/.test(value)) {
      return;
    }

    const parsed = Number(value);

    if (parsed > 0) {
      setCustomQuantity(value);
      onChange(parsed);
    }
  };

  return (
    <View>
      <Text style={styles.title}>4. Choose Quantity</Text>

      <View style={styles.container}>
        {QUANTITIES.map((item) => {
          const selected = quantity === item.value && isPresetQuantity;

          return (
            <Pressable
              key={item.label}
              onPress={() => {
                onChange(item.value);
                addItems();
              }}
              style={[styles.button, selected && styles.selectedButton]}
            >
              <Text style={[styles.text, selected && styles.selectedText]}>{item.label}</Text>
            </Pressable>
          );
        })}

        {/* Custom quantity */}
        <View
          style={[
            styles.customContainer,
            !isPresetQuantity && quantity > 0 && styles.customSelected,
          ]}
        >
          <Text style={styles.customLabel}>Custom</Text>

          <TextInput
            value={customQuantity}
            onChangeText={handleCustomQuantityChanged}
            placeholder="Qty"
            placeholderTextColor="#9AA3B2"
            keyboardType="number-pad"
            inputMode="numeric"
            style={styles.input}
            selectTextOnFocus
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  button: {
    flex: 1,
    minWidth: 90,
    height: 48,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  selectedButton: {
    backgroundColor: 'green',
    borderColor: 'green',
  },

  text: {
    fontWeight: '600',
    color: '#1A1A1A',
  },

  selectedText: {
    color: '#FFFFFF',
  },

  customContainer: {
    flexBasis: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },

  customSelected: {
    borderColor: '#1745D1',
    backgroundColor: '#EEF3FF',
  },

  customLabel: {
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },

  input: {
    width: 100,
    height: 38,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
  },
});
