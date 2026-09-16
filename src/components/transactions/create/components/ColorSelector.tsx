import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import type { Color } from '../../../../types/localModels.ts';

type Props = {
  colors: Color[];
  selectedColor: Color | null;
  onSelect: (color: Color) => void;
};

export default function ColorSelector({ colors, selectedColor, onSelect }: Props) {
  const [showText, setShowText] = useState(true);

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Select Color</Text>

        <Pressable onPress={() => setShowText((current) => !current)} style={styles.toggleButton}>
          <Text style={styles.toggleText}>{showText ? 'Hide text' : 'Show text'}</Text>
        </Pressable>
      </View>

      <View style={styles.colors}>
        {colors.map((color) => {
          const selected = selectedColor?.id === color.id;

          return (
            <Pressable
              key={color.id}
              onPress={() => onSelect(color)}
              style={[
                styles.colorButton,
                !showText && styles.colorButtonCompact,
                selected && styles.selectedColorButton,
              ]}
            >
              <View style={[styles.colorCircle, { backgroundColor: color.hexValue }]} />

              {showText && <Text style={styles.colorText}>{color.name}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  title: {
    fontSize: f(16),
    fontWeight: '700',
  },

  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
  },

  toggleText: {
    fontSize: f(12),
    fontWeight: '600',
    color: '#1745D1',
  },

  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  colorButton: {
    minWidth: 120,
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  colorButtonCompact: {
    minWidth: 52,
    width: 52,
    paddingHorizontal: 0,
    justifyContent: 'center',
    gap: 0,
  },

  selectedColorButton: {
    borderColor: '#1745D1',
    backgroundColor: '#EEF3FF',
  },

  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CBD0D8',
  },

  colorText: {
    fontSize: f(15),
    fontWeight: '600',
  },
});
