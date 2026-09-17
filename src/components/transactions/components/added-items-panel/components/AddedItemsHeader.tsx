import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '../AddedItemsPanel';

type Props = {
  itemCount: number;
  viewMode: ViewMode;
  showColors: boolean;
  showUnitPrice: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onShowColorsChange: (value: boolean) => void;
  onShowUnitPriceChange: (value: boolean) => void;
};

const FONT_SCALE = 1.25;
const f = (n: number) => Math.round(n * FONT_SCALE);

export default function AddedItemsHeader({
  itemCount,
  viewMode,
  showColors,
  showUnitPrice,
  onViewModeChange,
  onShowColorsChange,
  onShowUnitPriceChange,
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.title}>Items</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.headerControlsScroll}
        contentContainerStyle={styles.headerRight}
        bounces={false}
      >
        <Pressable
          onPress={() => onShowUnitPriceChange(!showUnitPrice)}
          style={({ pressed }) => [
            styles.button,
            showUnitPrice && styles.buttonActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.buttonText, showUnitPrice && styles.buttonTextActive]}>
            Unit Price
          </Text>
        </Pressable>

        {viewMode === 'size' && (
          <Pressable
            onPress={() => onShowColorsChange(!showColors)}
            style={({ pressed }) => [
              styles.button,
              showColors && styles.buttonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.buttonText, showColors && styles.buttonTextActive]}>Colors</Text>
          </Pressable>
        )}
      </ScrollView>
      <View style={styles.modeSelector}>
        <Pressable
          onPress={() => onViewModeChange('color')}
          style={[styles.modeButton, viewMode === 'color' && styles.modeButtonActive]}
        >
          <Text
            style={[styles.modeButtonText, viewMode === 'color' && styles.modeButtonTextActive]}
          >
            By Color
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onViewModeChange('size')}
          style={[styles.modeButton, viewMode === 'size' && styles.modeButtonActive]}
        >
          <Text style={[styles.modeButtonText, viewMode === 'size' && styles.modeButtonTextActive]}>
            By Size
          </Text>
        </Pressable>
      </View>
      <View style={styles.count}>
        <Text style={styles.countText}>{itemCount} items</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    paddingLeft: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  headerTitleContainer: {
    flexShrink: 0,
    paddingRight: 12,
  },

  title: {
    fontSize: f(20),
    fontWeight: '700',
  },

  headerControlsScroll: {
    flex: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 18,
  },

  button: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  buttonActive: {
    backgroundColor: '#EEF1F5',
    borderColor: '#C8CED8',
  },

  buttonText: {
    fontSize: f(12),
    fontWeight: '600',
    color: '#687284',
  },

  buttonTextActive: {
    color: '#20242B',
  },

  modeSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
  },

  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },

  modeButtonActive: {
    backgroundColor: '#EEF1F5',
  },

  modeButtonText: {
    fontSize: f(12),
    fontWeight: '600',
    color: '#687284',
  },

  modeButtonTextActive: {
    color: '#20242B',
  },

  count: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 8,
  },

  countText: {
    fontWeight: '600',
    color: '#5F6878',
  },

  pressed: {
    opacity: 0.6,
  },
});
