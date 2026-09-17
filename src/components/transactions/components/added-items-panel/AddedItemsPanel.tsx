import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { AddedTransactionItem } from '../../create/types';
import AddedItemsHeader from './components/AddedItemsHeader';
import ColorView from './components/ColorView';
import SizeView from './components/SizeView';
import { computeGroups, getSortedSizeGroup } from './helpers';

type Props = {
  items: AddedTransactionItem[];
  highlightedItemIds?: string[];
  isViewOnly?: boolean;
  onIncrease?: (itemId: string) => void;
  onDecrease?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
};

export type ViewMode = 'color' | 'size';

export default function AddedItemsPanel({
  items,
  highlightedItemIds = [],
  isViewOnly = false,
  onIncrease = () => undefined,
  onDecrease = () => undefined,
  onRemove = () => undefined,
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
      onRemove?.(item.id);
    });
  }

  return (
    <View style={styles.container}>
      <AddedItemsHeader
        itemCount={items.length}
        viewMode={viewMode}
        showColors={showColors}
        showUnitPrice={showUnitPrice}
        onViewModeChange={setViewMode}
        onShowColorsChange={setShowColors}
        onShowUnitPriceChange={setShowUnitPrice}
      />

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
        {viewMode === 'color' ? (
          <ColorView
            productGroups={colorProductGroups}
            highlightedSet={highlightedSet}
            showUnitPrice={showUnitPrice}
            itemLayoutsRef={itemLayouts}
            isViewOnly={isViewOnly}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
            onRemoveColorGroup={onRemoveColorGroupHandler}
          />
        ) : (
          <SizeView
            productGroups={productSizeGroups}
            highlightedSet={highlightedSet}
            showColors={showColors}
            showUnitPrice={showUnitPrice}
            itemLayoutsRef={itemLayouts}
            isViewOnly={isViewOnly}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
          />
        )}
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

  list: {
    flex: 1,
  },

  listContent: {
    padding: 12,
    paddingBottom: 32,
    gap: 12,
  },
});
