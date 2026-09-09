import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useColorStore } from '../../store/useColorStore';
import { getInventoryKey } from '../../store/useInventoryStore';
import { useProductStore } from '../../store/useProductStore';
import { useSizeStore } from '../../store/useSizeStore';
import type { Color } from '../../types/localModels';
import { ROW_HEIGHT, SIZE_COLUMN_WIDTH, TABLE_HEIGHT } from './constants';
import { DraggableColorHeader } from './DraggableColorHeader';
import { InventoryCell } from './InventoryCell';

type InventoryTableProps = {
  productId: string;
};

export default function InventoryTable({ productId }: InventoryTableProps) {
  const product = useProductStore((state) => state.getProductById(productId));

  const rawColors = useColorStore(
    useShallow((state) => state.colors.filter((c) => c.productId === productId)),
  );

  const sizes = useSizeStore(
    useShallow((state) => state.sizes.filter((s) => s.productId === productId)),
  );

  const reorderColorsInStore = useColorStore((state) => state.reorderColors);

  const [reorderedColors, setReorderedColors] = useState<Color[] | null>(null);

  // Collapsed state
  const [collapsed, setCollapsed] = useState(false);

  const columnOrder = reorderedColors ?? rawColors;

  // Scroll refs
  const colorHeaderRef = useRef<ScrollView>(null);
  const sizeColumnRef = useRef<ScrollView>(null);
  const inventoryVerticalRef = useRef<ScrollView>(null);

  const syncingVertical = useRef(false);
  const syncingHorizontal = useRef(false);

  const handleHorizontalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (syncingHorizontal.current) return;

    const x = event.nativeEvent.contentOffset.x;

    syncingHorizontal.current = true;

    colorHeaderRef.current?.scrollTo({
      x,
      animated: false,
    });

    requestAnimationFrame(() => {
      syncingHorizontal.current = false;
    });
  };

  const handleInventoryVerticalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (syncingVertical.current) return;

    const y = event.nativeEvent.contentOffset.y;

    syncingVertical.current = true;

    sizeColumnRef.current?.scrollTo({
      y,
      animated: false,
    });

    requestAnimationFrame(() => {
      syncingVertical.current = false;
    });
  };

  const handleSizeColumnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (syncingVertical.current) return;

    const y = event.nativeEvent.contentOffset.y;

    syncingVertical.current = true;

    inventoryVerticalRef.current?.scrollTo({
      y,
      animated: false,
    });

    requestAnimationFrame(() => {
      syncingVertical.current = false;
    });
  };

  const reorderColumns = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newOrder = [...columnOrder];

    const [movedColumn] = newOrder.splice(fromIndex, 1);

    newOrder.splice(toIndex, 0, movedColumn);

    setReorderedColors(newOrder);

    reorderColorsInStore(productId, newOrder);
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => setCollapsed((current) => !current)}
          style={({ pressed }) => [styles.productHeaderButton, pressed && styles.pressed]}
        >
          <Ionicons
            name={collapsed ? 'chevron-forward' : 'chevron-down'}
            size={24}
            color="#06132F"
          />

          <View style={styles.productTitleContainer}>
            <Text style={styles.productName}>{product.name}</Text>

            <Text style={styles.productInfo}>
              {sizes.length} sizes • {columnOrder.length} colors
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
          onPress={() => {
            console.log(`Inventory saved locally for ${product.name}`);
          }}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      {/* TABLE */}
      {!collapsed && (
        <View style={styles.tableContainer}>
          {/* FIXED CORNER HEADER */}
          <View style={styles.cornerCell}>
            <Text style={styles.headerText}>Size</Text>
          </View>

          {/* COLOR HEADER */}
          <View style={styles.colorHeaderContainer}>
            <ScrollView
              ref={colorHeaderRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.colorHeaderRow}>
                {columnOrder.map((color, index) => (
                  <DraggableColorHeader
                    key={color.id}
                    color={color}
                    index={index}
                    totalColumns={columnOrder.length}
                    onDrop={reorderColumns}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* FIXED SIZE COLUMN */}
          <View style={styles.sizeColumnContainer}>
            <ScrollView
              ref={sizeColumnRef}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onScroll={handleSizeColumnScroll}
              scrollEventThrottle={16}
            >
              {sizes.map((size) => (
                <View key={size.id} style={styles.sizeCell}>
                  <Text style={styles.sizeText}>{size.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* INVENTORY BODY */}
          <View style={styles.inventoryContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              bounces={false}
              onScroll={handleHorizontalScroll}
              scrollEventThrottle={16}
            >
              <ScrollView
                ref={inventoryVerticalRef}
                showsVerticalScrollIndicator
                bounces={false}
                onScroll={handleInventoryVerticalScroll}
                scrollEventThrottle={16}
              >
                <View>
                  {sizes.map((size) => (
                    <View key={size.id} style={styles.row}>
                      {columnOrder.map((color) => (
                        <InventoryCell
                          key={getInventoryKey(productId, color.id, size.id)}
                          productId={productId}
                          sizeId={size.id}
                          colorId={color.id}
                          hexValue={color.hexValue}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  productHeaderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginRight: 16,
  },

  productTitleContainer: {
    marginLeft: 10,
    flex: 1,
  },

  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#06132F',
  },

  productInfo: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748B',
  },

  tableContainer: {
    height: TABLE_HEIGHT,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },

  cornerCell: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
    width: SIZE_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    backgroundColor: '#F3F5F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },

  colorHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: SIZE_COLUMN_WIDTH,
    right: 0,
    height: ROW_HEIGHT,
    zIndex: 10,
    backgroundColor: '#F3F5F8',
  },

  colorHeaderRow: {
    flexDirection: 'row',
  },

  sizeColumnContainer: {
    position: 'absolute',
    top: ROW_HEIGHT,
    left: 0,
    bottom: 0,
    width: SIZE_COLUMN_WIDTH,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
  },

  sizeCell: {
    width: SIZE_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },

  inventoryContainer: {
    position: 'absolute',
    top: ROW_HEIGHT,
    left: SIZE_COLUMN_WIDTH,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
  },

  headerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#06132F',
  },

  sizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06132F',
  },

  saveButton: {
    paddingHorizontal: 28,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },

  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
});
