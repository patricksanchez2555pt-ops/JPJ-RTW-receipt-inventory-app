import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AddedTransactionItem } from '../types';

type Props = {
  items: AddedTransactionItem[];
  highlightedItemIds?: string[];
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

type ViewMode = 'color' | 'size';

type ColorGroupedItems = {
  key: string;
  productId: string;
  colorId: string;
  productName: string;
  colorName: string;
  colorHex: string;
  items: AddedTransactionItem[];
};

type SizeGroupedItems = {
  key: string;
  productId: string;
  sizeId: string;
  productName: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
};

type ProductSizeGroup = {
  key: string;
  productId: string;
  productName: string;
  items: SizeGroupedItems[];
};

function formatNumber(value: number): string {
  return value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function groupByProductColor(items: AddedTransactionItem[]): ColorGroupedItems[] {
  const groups = new Map<string, ColorGroupedItems>();

  for (const item of items) {
    const key = `${item.productId}-${item.colorId}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        productId: item.productId,
        colorId: item.colorId,
        productName: item.product?.name ?? 'Unknown Product',
        colorName: item.color?.name ?? 'Unknown Color',
        colorHex: item.color?.hexValue ?? '#CCCCCC',
        items: [],
      });
    }

    groups.get(key)!.items.push(item);
  }

  for (const group of groups.values()) {
    group.items.sort((a, b) => {
      const sizeNameA = a.size?.name ?? '';
      const sizeNameB = b.size?.name ?? '';

      return sizeNameA.localeCompare(sizeNameB);
    });
  }

  return Array.from(groups.values()).sort((a, b) => {
    const productCompare = a.productName.localeCompare(b.productName);

    if (productCompare !== 0) {
      return productCompare;
    }

    return a.colorName.localeCompare(b.colorName);
  });
}

function groupByProductSize(items: AddedTransactionItem[]): SizeGroupedItems[] {
  const groups = new Map<string, SizeGroupedItems>();

  for (const item of items) {
    const key = `${item.productId}-${item.sizeId}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        productId: item.productId,
        sizeId: item.sizeId,
        productName: item.product?.name ?? 'Unknown Product',
        sizeName: item.size?.name ?? 'Unknown Size',
        quantity: 0,
        unitPrice: item.unitPrice ?? 0,
      });
    }

    const group = groups.get(key)!;

    group.quantity += item.quantity;
  }

  return Array.from(groups.values()).sort((a, b) => {
    const productCompare = a.productName.localeCompare(b.productName);

    if (productCompare !== 0) {
      return productCompare;
    }

    return a.sizeName.localeCompare(b.sizeName);
  });
}

function groupSizeGroupsByProduct(groups: SizeGroupedItems[]): ProductSizeGroup[] {
  const productGroups = new Map<string, ProductSizeGroup>();

  for (const group of groups) {
    if (!productGroups.has(group.productId)) {
      productGroups.set(group.productId, {
        key: group.productId,
        productId: group.productId,
        productName: group.productName,
        items: [],
      });
    }

    productGroups.get(group.productId)!.items.push(group);
  }

  return Array.from(productGroups.values());
}

function getColorGroupTotal(group: ColorGroupedItems): number {
  return group.items.reduce((sum, item) => sum + item.quantity * (item.unitPrice ?? 0), 0);
}

function getProductTotal(groups: ColorGroupedItems[]): number {
  return groups.reduce((sum, group) => {
    return sum + getColorGroupTotal(group);
  }, 0);
}

function getSizeProductTotal(items: SizeGroupedItems[]): number {
  return items.reduce((sum, item) => sum + item.quantity * (item.unitPrice ?? 0), 0);
}

export default function AddedItemsPanel({
  items,
  highlightedItemIds = [],
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('color');

  const colorGroups = useMemo(() => groupByProductColor(items), [items]);

  const sizeGroups = useMemo(() => groupByProductSize(items), [items]);

  const productSizeGroups = useMemo(() => groupSizeGroupsByProduct(sizeGroups), [sizeGroups]);

  const colorProductGroups = useMemo(() => {
    const products = new Map<string, ColorGroupedItems[]>();

    for (const group of colorGroups) {
      if (!products.has(group.productId)) {
        products.set(group.productId, []);
      }

      products.get(group.productId)!.push(group);
    }

    return Array.from(products.entries()).map(([productId, groups]) => ({
      productId,
      productName: groups[0]?.productName ?? 'Unknown Product',
      groups,
    }));
  }, [colorGroups]);

  const scrollViewRef = useRef<ScrollView>(null);

  const itemLayouts = useRef<Record<string, number>>({});
  const contentHeight = useRef(0);
  const viewportHeight = useRef(0);

  const highlightedSet = new Set(highlightedItemIds);

  useEffect(() => {
    if (highlightedItemIds.length === 0) {
      return;
    }

    let frame1: number | null = null;
    let frame2: number | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const scrollToNewItem = () => {
      const firstItemId = highlightedItemIds[0];

      if (itemLayouts.current[firstItemId] === undefined) {
        return;
      }

      const maxScrollY = Math.max(0, contentHeight.current - viewportHeight.current);

      if (viewMode === 'color') {
        const isBottomGroup =
          colorGroups.length > 0 &&
          colorGroups[colorGroups.length - 1].items.some((item) => item.id === firstItemId);

        scrollViewRef.current?.scrollTo({
          y: isBottomGroup ? maxScrollY : 0,
          animated: isBottomGroup,
        });
      } else {
        scrollViewRef.current?.scrollTo({
          y: maxScrollY,
          animated: true,
        });
      }
    };

    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        scrollToNewItem();

        timeout = setTimeout(() => {
          scrollToNewItem();
        }, 100);
      });
    });

    return () => {
      if (frame1 !== null) {
        cancelAnimationFrame(frame1);
      }

      if (frame2 !== null) {
        cancelAnimationFrame(frame2);
      }

      if (timeout !== null) {
        clearTimeout(timeout);
      }
    };
  }, [highlightedItemIds, colorGroups, viewMode]);

  function onRemoveGroupHandler(key: string) {
    const group = colorGroups.find((group) => group.key === key);

    if (!group) {
      return;
    }

    group.items.forEach((item) => {
      onRemove(item.id);
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Added Items</Text>

        <View style={styles.headerRight}>
          <View style={styles.modeSelector}>
            <Pressable
              onPress={() => setViewMode('color')}
              style={[styles.modeButton, viewMode === 'color' && styles.modeButtonActive]}
            >
              <Text
                style={[styles.modeButtonText, viewMode === 'color' && styles.modeButtonTextActive]}
              >
                By Color
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setViewMode('size')}
              style={[styles.modeButton, viewMode === 'size' && styles.modeButtonActive]}
            >
              <Text
                style={[styles.modeButtonText, viewMode === 'size' && styles.modeButtonTextActive]}
              >
                By Size
              </Text>
            </Pressable>
          </View>

          <View style={styles.count}>
            <Text style={styles.countText}>{items.length} items</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(_, height) => {
          contentHeight.current = height;
        }}
        onLayout={(event) => {
          viewportHeight.current = event.nativeEvent.layout.height;
        }}
      >
        {viewMode === 'color'
          ? colorProductGroups.map((productGroup) => {
              const productTotal = getProductTotal(productGroup.groups);

              return (
                <View key={productGroup.productId} style={styles.productGroup}>
                  <View style={styles.productHeader}>
                    <View style={styles.groupInfo}>
                      <Text style={styles.productName}>{productGroup.productName}</Text>

                      <Text style={styles.productSubtitle}>By color</Text>
                    </View>

                    <View style={styles.productHeaderTotal}>
                      <Text style={styles.productHeaderTotalLabel}>Product Total</Text>

                      <Text style={styles.productHeaderTotalValue}>
                        ₱{formatNumber(productTotal)}
                      </Text>
                    </View>
                  </View>

                  {productGroup.groups.map((group) => {
                    const colorTotal = getColorGroupTotal(group);

                    return (
                      <View key={group.key} style={styles.colorGroup}>
                        <View style={styles.groupHeader}>
                          <View
                            style={[
                              styles.colorDot,
                              {
                                backgroundColor: group.colorHex,
                              },
                            ]}
                          />

                          <View style={styles.groupInfo}>
                            <Text style={styles.colorName}>{group.colorName}</Text>
                          </View>

                          <View style={styles.colorTotalContainer}>
                            <Text style={styles.colorTotalLabel}>Color Total</Text>

                            <Text style={styles.colorTotal}>₱{formatNumber(colorTotal)}</Text>
                          </View>

                          <Pressable
                            onPress={() => onRemoveGroupHandler(group.key)}
                            style={({ pressed }) => [
                              styles.deleteGroupButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={styles.deleteGroupText}>Delete</Text>
                          </Pressable>
                        </View>

                        {group.items.map((item) => {
                          const unitPriceNumber =
                            typeof item.unitPrice === 'number' ? item.unitPrice : 0;

                          const rowTotal = item.quantity * unitPriceNumber;

                          const isHighlighted = highlightedSet.has(item.id);

                          return (
                            <View
                              key={item.id}
                              onLayout={(event) => {
                                itemLayouts.current[item.id] = event.nativeEvent.layout.y;
                              }}
                              style={[styles.itemRow, isHighlighted && styles.highlightedItemRow]}
                            >
                              <View style={styles.sizeContainer}>
                                <Text style={styles.sizeName}>
                                  {item.size?.name ?? 'Unknown Size'}
                                </Text>
                              </View>

                              <View style={styles.unitPriceContainer}>
                                <Text style={styles.unitPrice}>
                                  ₱{formatNumber(unitPriceNumber)}
                                </Text>
                              </View>

                              <View style={styles.rowTotalContainer}>
                                <Text style={styles.rowTotal}>₱{formatNumber(rowTotal)}</Text>
                              </View>

                              <View style={styles.actions}>
                                <Pressable
                                  style={styles.quantityButton}
                                  onPress={() => onDecrease(item.id)}
                                >
                                  <Text style={styles.buttonText}>−</Text>
                                </Pressable>

                                <View style={styles.quantity}>
                                  <Text style={styles.quantityText}>{item.quantity}</Text>
                                </View>

                                <Pressable
                                  style={styles.quantityButton}
                                  onPress={() => onIncrease(item.id)}
                                >
                                  <Text style={styles.buttonText}>+</Text>
                                </Pressable>

                                <Pressable
                                  style={styles.deleteButton}
                                  onPress={() => onRemove(item.id)}
                                >
                                  <Text style={styles.deleteText}>×</Text>
                                </Pressable>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              );
            })
          : productSizeGroups.map((productGroup) => {
              const productTotal = getSizeProductTotal(productGroup.items);

              return (
                <View key={productGroup.key} style={styles.productGroup}>
                  <View style={styles.readOnlyProductHeader}>
                    <View style={styles.groupInfo}>
                      <Text style={styles.productName}>{productGroup.productName}</Text>

                      <Text style={styles.readOnlyLabel}>Total by size</Text>
                    </View>

                    <View style={styles.productHeaderTotal}>
                      <Text style={styles.productHeaderTotalLabel}>Product Total</Text>

                      <Text style={styles.productHeaderTotalValue}>
                        ₱{formatNumber(productTotal)}
                      </Text>
                    </View>

                    <View style={styles.readOnlyBadge}>
                      <Text style={styles.readOnlyBadgeText}>Read only</Text>
                    </View>
                  </View>

                  {productGroup.items.map((item) => {
                    const unitPriceNumber = typeof item.unitPrice === 'number' ? item.unitPrice : 0;

                    const rowTotal = item.quantity * unitPriceNumber;

                    return (
                      <View key={item.key} style={styles.itemRow}>
                        <View style={styles.sizeContainer}>
                          <Text style={styles.sizeName}>{item.sizeName}</Text>
                        </View>

                        <View style={styles.unitPriceContainer}>
                          <Text style={styles.unitPrice}>₱{formatNumber(unitPriceNumber)}</Text>
                        </View>

                        <View style={styles.rowTotalContainer}>
                          <Text style={styles.rowTotal}>₱{formatNumber(rowTotal)}</Text>
                        </View>

                        <View style={styles.readOnlyQuantity}>
                          <Text style={styles.readOnlyQuantityText}>{item.quantity} pcs</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 12,
  },

  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
    gap: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  modeSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    overflow: 'hidden',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#687284',
  },

  modeButtonTextActive: {
    color: '#20242B',
  },

  count: {
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

  list: {
    flex: 1,
  },

  listContent: {
    padding: 12,
    paddingBottom: 32,
    gap: 12,
  },

  productGroup: {
    borderWidth: 1,
    borderColor: '#E0E4EA',
    borderRadius: 10,
    overflow: 'hidden',
  },

  productHeader: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
    gap: 16,
  },

  readOnlyProductHeader: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
    gap: 16,
  },

  groupInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 15,
    fontWeight: '700',
  },

  productSubtitle: {
    marginTop: 3,
    color: '#687284',
    fontSize: 12,
  },

  colorGroup: {
    backgroundColor: '#FFFFFF',
  },

  groupHeader: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAFBFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD0D8',
  },

  colorName: {
    fontSize: 14,
    fontWeight: '700',
  },

  colorTotalContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorTotalLabel: {
    fontSize: 10,
    color: '#687284',
    fontWeight: '600',
  },

  colorTotal: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    color: '#20242B',
  },

  productHeaderTotal: {
    width: 130,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  productHeaderTotalLabel: {
    fontSize: 11,
    color: '#687284',
    fontWeight: '600',
  },

  productHeaderTotalValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
  },

  readOnlyLabel: {
    marginTop: 3,
    color: '#687284',
    fontSize: 12,
  },

  readOnlyBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EEF1F5',
  },

  readOnlyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#687284',
  },

  deleteGroupButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1B5B5',
    backgroundColor: '#FFF5F5',
  },

  deleteGroupText: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.6,
  },

  itemRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  highlightedItemRow: {
    backgroundColor: '#FFF4B8',
  },

  sizeContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  sizeName: {
    fontSize: 15,
    fontWeight: '600',
  },

  unitPriceContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unitPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F5868',
  },

  rowTotalContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20242B',
  },

  actions: {
    width: 168,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },

  quantityButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantity: {
    minWidth: 48,
    height: 36,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D8DDE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    fontWeight: '600',
  },

  buttonText: {
    fontSize: 20,
  },

  deleteButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteText: {
    color: '#E53935',
    fontSize: 24,
  },

  readOnlyQuantity: {
    width: 168,
    height: 36,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FB',
  },

  readOnlyQuantityText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
