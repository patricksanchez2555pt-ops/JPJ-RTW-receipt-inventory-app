import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatNumber } from '@/utils/formatNumber';

import type { AddedTransactionItem } from '../../types';
import { computeGroups, getSortedSizeGroup } from './helpers';

// Global scale for fonts in this panel. Increase to make text larger.
const FONT_SCALE = 1.25;
const f = (n: number) => Math.round(n * FONT_SCALE);

type Props = {
  items: AddedTransactionItem[];
  highlightedItemIds?: string[];
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

type ViewMode = 'color' | 'size';

export default function AddedItemsPanel({
  items,
  highlightedItemIds = [],
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('color');
  const [showColors, setShowColors] = useState(false);
  const [showUnitPrice, setShowUnitPrice] = useState(true);

  const { colorProductGroups, productSizeGroups } = useMemo(() => computeGroups(items), [items]);

  const scrollViewRef = useRef<ScrollView>(null);

  const itemLayouts = useRef<Record<string, number>>({});
  const contentHeight = useRef(0);
  const viewportHeight = useRef(0);

  const highlightedSet = useMemo(() => new Set(highlightedItemIds), [highlightedItemIds]);

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
        const lastProductGroup = colorProductGroups[colorProductGroups.length - 1];

        const lastColorGroup = lastProductGroup
          ? Object.values(lastProductGroup.colorGroups).at(-1)
          : undefined;

        const isBottomGroup =
          lastColorGroup?.items.some((item) => item.id === firstItemId) ?? false;

        scrollViewRef.current?.scrollTo({
          y: isBottomGroup ? maxScrollY : 0,
          animated: isBottomGroup,
        });

        return;
      }

      const lastProductGroup = productSizeGroups[productSizeGroups.length - 1];

      const lastSizeGroup = lastProductGroup
        ? getSortedSizeGroup(lastProductGroup.sizeGroups).at(-1)
        : undefined;

      const isBottomGroup = lastSizeGroup?.items.some((item) => item.id === firstItemId) ?? false;

      scrollViewRef.current?.scrollTo({
        y: isBottomGroup ? maxScrollY : 0,
        animated: isBottomGroup,
      });
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedItemIds, viewMode]);

  function onRemoveColorGroupHandler(productId: string, groupId: string) {
    const productGroup = colorProductGroups.find((p) => p.productId === productId);

    if (!productGroup) {
      return;
    }

    const group = productGroup.colorGroups[groupId];

    if (!group) {
      return;
    }

    group.items.forEach((item: AddedTransactionItem) => {
      onRemove(item.id);
    });
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* FIXED TITLE */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Items</Text>
        </View>

        {/* SCROLLABLE HEADER CONTROLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.headerControlsScroll}
          contentContainerStyle={styles.headerRight}
          bounces={false}
        >
          {/* UNIT PRICE TOGGLE */}
          <Pressable
            onPress={() => setShowUnitPrice((current) => !current)}
            style={({ pressed }) => [
              styles.showUnitPriceButton,
              showUnitPrice && styles.showUnitPriceButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.showUnitPriceButtonText,
                showUnitPrice && styles.showUnitPriceButtonTextActive,
              ]}
            >
              Unit Price
            </Text>
          </Pressable>

          {/* SHOW COLORS */}
          {viewMode === 'size' && (
            <Pressable
              onPress={() => setShowColors((current) => !current)}
              style={({ pressed }) => [
                styles.showColorsButton,
                showColors && styles.showColorsButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.showColorsButtonText,
                  showColors && styles.showColorsButtonTextActive,
                ]}
              >
                Colors
              </Text>
            </Pressable>
          )}

          {/* VIEW MODE */}
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

          {/* ITEM COUNT */}
          <View style={styles.count}>
            <Text style={styles.countText}>{items.length} items</Text>
          </View>
        </ScrollView>
      </View>

      {/* LIST */}
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
          ? Object.values(colorProductGroups).map((productGroup) => {
              const groups = Object.values(productGroup.colorGroups);
              const productTotal = productGroup.subTotal;

              return (
                <View key={productGroup.productId} style={styles.productGroup}>
                  {/* PRODUCT HEADER */}
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

                  {/* COLOR GROUPS */}
                  {groups.map((group) => {
                    const colorTotal = group.subTotal;
                    const colorQuantity = group.quantity;

                    return (
                      <View key={group.id} style={styles.colorGroup}>
                        {/* COLOR HEADER */}
                        <View style={styles.groupHeader}>
                          <View
                            style={[
                              styles.colorDot,
                              {
                                backgroundColor: group.hexValue,
                              },
                            ]}
                          />

                          <View style={styles.groupInfo}>
                            <Text style={styles.colorName}>{group.name}</Text>
                          </View>

                          <View style={styles.colorQuantityContainer}>
                            <Text style={styles.colorHeaderLabel}>Quantity</Text>

                            <Text style={styles.colorHeaderValue}>{colorQuantity} pcs</Text>
                          </View>

                          <View style={styles.colorTotalContainer}>
                            <Text style={styles.colorHeaderLabel}>Color Total</Text>

                            <Text style={styles.colorHeaderValue}>₱{formatNumber(colorTotal)}</Text>
                          </View>

                          <Pressable
                            onPress={() =>
                              onRemoveColorGroupHandler(productGroup.productId, group.id)
                            }
                            style={({ pressed }) => [
                              styles.deleteGroupButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={styles.deleteGroupText}>Delete</Text>
                          </Pressable>
                        </View>

                        {/* ITEMS */}
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

                              {/* UNIT PRICE */}
                              {showUnitPrice && (
                                <View style={styles.unitPriceContainer}>
                                  <Text style={styles.unitPrice}>
                                    ₱{formatNumber(unitPriceNumber)}
                                  </Text>
                                </View>
                              )}

                              {/* ROW TOTAL */}
                              <View style={styles.rowTotalContainer}>
                                <Text style={styles.rowTotal}>₱{formatNumber(rowTotal)}</Text>
                              </View>

                              {/* ACTIONS */}
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
              const groups = getSortedSizeGroup(productGroup.sizeGroups);
              const productTotal = productGroup.subTotal;

              return (
                <View key={productGroup.productId} style={styles.productGroup}>
                  {/* PRODUCT HEADER */}
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

                  {/* SIZE GROUPS */}
                  {groups.map((group) => (
                    <View key={group.id} style={styles.colorGroup}>
                      {/* SIZE HEADER */}
                      <View style={styles.sizeGroupHeader}>
                        <View style={styles.sizeNameContainer}>
                          <Text style={styles.sizeGroupName}>{group.name}</Text>
                        </View>

                        {showUnitPrice && (
                          <View style={styles.sizePriceContainer}>
                            <Text style={styles.sizeHeaderLabel}>Price</Text>

                            <Text style={styles.sizeHeaderValue}>₱{formatNumber(group.price)}</Text>
                          </View>
                        )}

                        <View style={styles.sizeQuantityContainer}>
                          <Text style={styles.sizeHeaderLabel}>Quantity</Text>

                          <Text style={styles.sizeHeaderValue}>{group.quantity} pcs</Text>
                        </View>

                        <View style={styles.sizeSubtotalContainer}>
                          <Text style={styles.sizeHeaderLabel}>Subtotal</Text>

                          <Text style={styles.sizeHeaderValue}>
                            ₱{formatNumber(group.subTotal)}
                          </Text>
                        </View>
                      </View>

                      {/* COLOR ITEMS */}
                      {showColors &&
                        group.items.map((item) => {
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
                                <View style={styles.colorItem}>
                                  <View
                                    style={[
                                      styles.colorDot,
                                      {
                                        backgroundColor: item.color?.hexValue ?? '#000000',
                                      },
                                    ]}
                                  />

                                  <Text style={styles.sizeName}>
                                    {item.color?.name ?? 'Unknown Color'}
                                  </Text>
                                </View>
                              </View>

                              {/* UNIT PRICE */}
                              {showUnitPrice && (
                                <View style={styles.unitPriceContainer}>
                                  <Text style={styles.unitPrice}>
                                    ₱{formatNumber(unitPriceNumber)}
                                  </Text>
                                </View>
                              )}

                              {/* ROW TOTAL */}
                              <View style={styles.rowTotalContainer}>
                                <Text style={styles.rowTotal}>₱{formatNumber(rowTotal)}</Text>
                              </View>

                              {/* ACTIONS */}
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
                  ))}
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

  /* UNIT PRICE TOGGLE */
  showUnitPriceButton: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  showUnitPriceButtonActive: {
    backgroundColor: '#EEF1F5',
    borderColor: '#C8CED8',
  },

  showUnitPriceButtonText: {
    fontSize: f(12),
    fontWeight: '600',
    color: '#687284',
  },

  showUnitPriceButtonTextActive: {
    color: '#20242B',
  },

  /* VIEW MODE */
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

  /* SHOW COLORS */
  showColorsButton: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  showColorsButtonActive: {
    backgroundColor: '#EEF1F5',
    borderColor: '#C8CED8',
  },

  showColorsButtonText: {
    fontSize: f(12),
    fontWeight: '600',
    color: '#687284',
  },

  showColorsButtonTextActive: {
    color: '#20242B',
  },

  /* COUNT */
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

  /* LIST */
  list: {
    flex: 1,
  },

  listContent: {
    padding: 12,
    paddingBottom: 32,
    gap: 12,
  },

  /* PRODUCT */
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
    fontSize: f(15),
    fontWeight: '700',
  },

  productSubtitle: {
    marginTop: 3,
    color: '#687284',
    fontSize: f(12),
  },

  colorGroup: {
    backgroundColor: '#FFFFFF',
  },

  /* GROUP HEADER */
  groupHeader: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAFBFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  sizeGroupHeader: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  sizeNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  sizeGroupName: {
    fontSize: f(17),
    fontWeight: '700',
    color: '#20242B',
  },

  /*
   * Column alignment:
   *
   * By Color:
   *   unit price  = 100
   *   row total   = 120
   *
   * By Size:
   *   price       = 100
   *   quantity    = 120
   *   subtotal    = 120
   */

  sizePriceContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sizeQuantityContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sizeSubtotalContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sizeHeaderLabel: {
    fontSize: f(12),
    color: '#687284',
    fontWeight: '600',
    marginBottom: 3,
  },

  sizeHeaderValue: {
    fontSize: f(17),
    color: '#20242B',
    fontWeight: '700',
  },

  /* COLOR */
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD0D8',
  },

  colorName: {
    fontSize: f(14),
    fontWeight: '700',
  },

  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  /*
   * Matches the By Size columns:
   *
   * Quantity -> Size Price column
   * Color Total -> Size Subtotal column
   */

  colorQuantityContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorTotalContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorHeaderLabel: {
    fontSize: f(11),
    color: '#687284',
    fontWeight: '600',
    marginBottom: 3,
  },

  colorHeaderValue: {
    fontSize: f(15),
    fontWeight: '700',
    color: '#20242B',
  },

  /* PRODUCT TOTAL */
  productHeaderTotal: {
    width: 130,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  productHeaderTotalLabel: {
    fontSize: f(11),
    color: '#687284',
    fontWeight: '600',
  },

  productHeaderTotalValue: {
    marginTop: 2,
    fontSize: f(16),
    fontWeight: '700',
  },

  /* READ ONLY */
  readOnlyLabel: {
    marginTop: 3,
    color: '#687284',
    fontSize: f(12),
  },

  readOnlyBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EEF1F5',
  },

  readOnlyBadgeText: {
    fontSize: f(11),
    fontWeight: '600',
    color: '#687284',
  },

  /* ITEM ROW */
  sizeContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  sizeName: {
    fontSize: f(15),
    fontWeight: '600',
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

  /*
   * Unit price column.
   * It is completely removed from the layout when hidden.
   */
  unitPriceContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unitPrice: {
    fontSize: f(14),
    fontWeight: '600',
    color: '#4F5868',
  },

  rowTotalContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowTotal: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#20242B',
  },

  /* ACTIONS */
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
    fontSize: f(14),
  },

  buttonText: {
    fontSize: f(20),
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
    fontSize: f(24),
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
    fontSize: f(12),
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.6,
  },
});
