import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { COLOR_COLUMN_WIDTH, ROW_HEIGHT } from './constants';
import type { DraggableColorHeaderProps } from './types';

export function DraggableColorHeader({
  color,
  index,
  totalColumns,
  onDrop,
}: DraggableColorHeaderProps) {
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(250)
    .activeOffsetX([-5, 5])
    .onBegin(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const movement = event.translationX / COLOR_COLUMN_WIDTH;
      const targetIndex = Math.max(0, Math.min(totalColumns - 1, index + Math.round(movement)));

      translateX.value = withSpring(0);
      isDragging.value = false;

      if (targetIndex !== index) {
        onDrop(index, targetIndex);
      }
    })
    .onFinalize(() => {
      translateX.value = withSpring(0);
      isDragging.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: withSpring(isDragging.value ? 1.04 : 1) },
    ],
    zIndex: isDragging.value ? 100 : 0,
    elevation: isDragging.value ? 10 : 0,
    opacity: isDragging.value ? 0.9 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.colorHeaderCell, animatedStyle]}>
        <Text style={styles.dragIndicator}>⋮⋮</Text>
        <Text style={styles.headerText}>{color}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  colorHeaderCell: {
    width: COLOR_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F8',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },
  dragIndicator: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8A93A3',
    marginRight: 6,
    letterSpacing: -2,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#06132F',
  },
});
