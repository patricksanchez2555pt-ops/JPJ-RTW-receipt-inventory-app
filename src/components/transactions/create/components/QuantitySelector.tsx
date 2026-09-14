import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { f } from '@/utils/fontScale';

type Props = {
  quantity: number;
  onChange: (quantity: number) => void;
  addItems: (quantity?: number) => void;
};

const QUANTITIES = Array.from({ length: 12 }, (_, index) => {
  const value = index + 1;

  return {
    label: `${value} ${value === 1 ? 'pc' : 'pcs'}`,
    value,
  };
});

export default function QuantitySelector({ quantity, onChange, addItems }: Props) {
  const [customQuantity, setCustomQuantity] = useState('');

  const [clickedQuantity, setClickedQuantity] = useState<number | null>(null);

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
          const isClicked = clickedQuantity === item.value;

          return (
            <Pressable
              key={item.label}
              onPress={() => {
                const value = Number(item.value);

                // update parent quantity state first
                onChange(value);

                // highlight button
                setClickedQuantity(item.value);

                // call addItems with the explicit value to avoid stale state
                addItems(value);

                setTimeout(() => {
                  setClickedQuantity(null);
                }, 500);
              }}
              style={[styles.button, isClicked && styles.buttonClicked]}
            >
              <Text style={[styles.text, isClicked && styles.textClicked]}>{item.label}</Text>
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
    fontSize: f(16),
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

  text: {
    fontSize: f(14),
    fontWeight: '600',
    color: '#1A1A1A',
  },

  buttonClicked: {
    borderColor: '#1745D1',
    backgroundColor: '#EEF3FF',
  },

  textClicked: {
    color: '#1745D1',
    fontWeight: '700',
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
    fontSize: f(16),
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
  },
});
