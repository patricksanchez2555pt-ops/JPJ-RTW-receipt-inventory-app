import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Color } from '../../../../types/localModels.ts';

type Props = {
  colors: Color[];
  selectedColor: Color | null;
  onSelect: (color: Color) => void;
};

export default function ColorSelector({ colors, selectedColor, onSelect }: Props) {
  return (
    <View>
      <Text style={styles.title}>2. Select Color</Text>

      <View style={styles.colors}>
        {colors.map((color) => {
          const selected = selectedColor?.id === color.id;

          return (
            <Pressable
              key={color.id}
              onPress={() => onSelect(color)}
              style={[styles.colorButton, selected && styles.selectedColorButton]}
            >
              <View style={[styles.colorCircle, { backgroundColor: color.hexValue }]} />

              <Text style={styles.colorText}>{color.name}</Text>
            </Pressable>
          );
        })}
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
    fontSize: 15,
    fontWeight: '600',
  },
});
