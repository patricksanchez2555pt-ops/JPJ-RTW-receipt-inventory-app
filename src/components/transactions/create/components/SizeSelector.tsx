import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PanGesture } from 'react-native-gesture-handler';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import type { Size } from '../../../../types/localModels.ts';

type Props = {
  sizes: Size[];
  selectedSizes: Size[];
  onToggle: (size: Size) => void;
  onDeselectAll: () => void;
};

export default function SizeSelector({ sizes, selectedSizes, onToggle, onDeselectAll }: Props) {
  const itemLayouts = useRef<{
    [key: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>({});

  const processedInCurrentDrag = useRef<Set<string>>(new Set());

  const [panGesture, setPanGesture] = useState<PanGesture | null>(null);

  const saveLayout = useCallback(
    (
      id: string,
      layout: {
        x: number;
        y: number;
        width: number;
        height: number;
      },
    ) => {
      itemLayouts.current[id] = layout;
    },
    [],
  );

  useEffect(() => {
    const handleTouchAtPoint = (touchX: number, touchY: number) => {
      sizes.forEach((size) => {
        const layout = itemLayouts.current[size.id];

        if (!layout) {
          return;
        }

        const isInsideX = touchX >= layout.x && touchX <= layout.x + layout.width;

        const isInsideY = touchY >= layout.y && touchY <= layout.y + layout.height;

        if (isInsideX && isInsideY && !processedInCurrentDrag.current.has(size.id)) {
          processedInCurrentDrag.current.add(size.id);

          onToggle(size);
        }
      });
    };

    const resetDragSession = () => {
      processedInCurrentDrag.current.clear();
    };

    const gesture = Gesture.Pan()
      .runOnJS(true)

      // Allows normal single presses to be handled by Pressable.
      // Dragging must move at least 10px before this gesture activates.
      .minDistance(10)

      .onBegin((event) => {
        resetDragSession();

        handleTouchAtPoint(event.x, event.y);
      })

      .onUpdate((event) => {
        handleTouchAtPoint(event.x, event.y);
      })

      .onFinalize(() => {
        resetDragSession();
      });

    setPanGesture(gesture);
  }, [sizes, onToggle]);

  const hasSelectedSizes = selectedSizes.length > 0;

  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>3. Select Size</Text>

          <Text style={styles.subtitle}>Tap or drag across multiple sizes</Text>
        </View>

        {hasSelectedSizes && (
          <Pressable
            onPress={onDeselectAll}
            style={({ pressed }) => [styles.deselectButton, pressed && styles.pressed]}
          >
            <Text style={styles.deselectText}>Deselect All</Text>
          </Pressable>
        )}
      </View>

      {panGesture ? (
        <GestureDetector gesture={panGesture}>
          <View style={styles.sizes} collapsable={false}>
            {sizes.map((size) => {
              const selected = selectedSizes.some((item) => item.id === size.id);

              return (
                <Pressable
                  key={size.id}
                  onLayout={(event) => {
                    saveLayout(size.id, event.nativeEvent.layout);
                  }}
                  style={[styles.sizeButton, selected && styles.selectedSizeButton]}
                >
                  <Text style={[styles.sizeText, selected && styles.selectedSizeText]}>
                    {size.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GestureDetector>
      ) : (
        <View style={styles.sizes}>
          {sizes.map((size) => {
            const selected = selectedSizes.some((item) => item.id === size.id);

            return (
              <Pressable
                key={size.id}
                onPress={() => onToggle(size)}
                onLayout={(event) => {
                  saveLayout(size.id, event.nativeEvent.layout);
                }}
                style={[styles.sizeButton, selected && styles.selectedSizeButton]}
              >
                <Text style={[styles.sizeText, selected && styles.selectedSizeText]}>
                  {size.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },

  subtitle: {
    color: '#7A8495',
    marginTop: 4,
    marginBottom: 12,
  },

  deselectButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#F1F3F6',
  },

  deselectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D14343',
  },

  pressed: {
    opacity: 0.7,
  },

  sizes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  sizeButton: {
    minWidth: 64,
    height: 48,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedSizeButton: {
    backgroundColor: '#1745D1',
    borderColor: '#1745D1',
  },

  sizeText: {
    fontSize: 15,
    fontWeight: '600',
  },

  selectedSizeText: {
    color: '#FFFFFF',
  },
});
