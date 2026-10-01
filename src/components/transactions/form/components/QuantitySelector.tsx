import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { f } from '@/utils/fontScale';

type Props = {
  quantity: number;
  onChange: (quantity: number) => void;
  addItems: (quantity?: number) => void;
};

const PER_PCS = Array.from({ length: 12 }, (_, index) => {
  const value = index + 1;

  return {
    label: `${value} ${value === 1 ? 'pc' : 'pcs'}`,
    value,
  };
});

const PER_DZN = Array.from({ length: 12 }, (_, index) => {
  const value = index + 1;

  return {
    label: `${value} ${value === 1 ? 'dzn' : 'dzns'}`,
    value: value * 12,
  };
});

type QuantityMode = 'pcs' | 'dzn';

export default function QuantitySelector({ quantity, onChange, addItems }: Props) {
  const [customQuantity, setCustomQuantity] = useState('');
  const [clickedQuantity, setClickedQuantity] = useState<number | null>(null);
  const [quantityMode, setQuantityMode] = useState<QuantityMode>('pcs');

  const presets = quantityMode === 'pcs' ? PER_PCS : PER_DZN;

  const isPresetQuantity = presets.some((item) => item.value === quantity);

  const handleModeChange = (mode: QuantityMode) => {
    setQuantityMode(mode);
    setCustomQuantity('');
    onChange(1);
  };

  const handleCustomQuantityChanged = (value: string) => {
    if (value === '') {
      setCustomQuantity('');
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const parsed = Number(value);

    if (parsed > 0) {
      setCustomQuantity(value);

      const actualQuantity = quantityMode === 'dzn' ? parsed * 12 : parsed;

      onChange(actualQuantity);
    }
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Quantity</Text>

        <View style={styles.modeContainer}>
          <Pressable
            onPress={() => handleModeChange('pcs')}
            style={[styles.modeButton, quantityMode === 'pcs' && styles.modeButtonSelected]}
          >
            <Text style={[styles.modeText, quantityMode === 'pcs' && styles.modeTextSelected]}>
              Piece
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleModeChange('dzn')}
            style={[styles.modeButton, quantityMode === 'dzn' && styles.modeButtonSelected]}
          >
            <Text style={[styles.modeText, quantityMode === 'dzn' && styles.modeTextSelected]}>
              Dozen
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.container}>
        {presets.map((item) => {
          const isClicked = clickedQuantity === item.value;

          return (
            <Pressable
              key={item.label}
              onPress={() => {
                const value = Number(item.value);

                onChange(value);

                setCustomQuantity(quantityMode === 'dzn' ? String(value / 12) : String(value));

                setClickedQuantity(item.value);

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

        <View
          style={[
            styles.customContainer,
            !isPresetQuantity && quantity > 0 && styles.customSelected,
          ]}
        >
          <Text style={styles.customLabel}>
            Custom {quantityMode === 'dzn' ? 'Dozens' : 'Quantity'}
          </Text>

          <TextInput
            value={customQuantity}
            onChangeText={handleCustomQuantityChanged}
            placeholder={quantityMode === 'dzn' ? 'Dzns' : 'Qty'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  title: {
    fontSize: f(16),
    fontWeight: '700',
  },

  modeContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  modeButton: {
    height: 36,
    minWidth: 72,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  modeButtonSelected: {
    backgroundColor: '#EEF3FF',
  },

  modeText: {
    fontSize: f(13),
    fontWeight: '600',
    color: '#6B7280',
  },

  modeTextSelected: {
    color: '#1745D1',
    fontWeight: '700',
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
