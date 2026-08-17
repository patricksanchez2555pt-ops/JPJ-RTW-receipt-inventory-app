import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AddedTransactionItem } from './types';

type Props = {
  items: AddedTransactionItem[];
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

type GroupedItems = {
  key: string;
  productName: string;
  colorName: string;
  colorHex: string;
  items: AddedTransactionItem[];
};

function groupItems(items: AddedTransactionItem[]): GroupedItems[] {
  const groups = new Map<string, GroupedItems>();

  for (const item of items) {
    const key = `${item.productId}-${item.colorId}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        productName: item.product?.name ?? 'Unknown Product',
        colorName: item.color?.name ?? 'Unknown Color',
        colorHex: item.color?.hexValue ?? '#CCCCCC',
        items: [],
      });
    }

    groups.get(key)!.items.push(item);
  }

  return Array.from(groups.values());
}

export default function AddedItemsPanel({ items, onIncrease, onDecrease, onRemove }: Props) {
  const groups = groupItems(items);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Added Items</Text>

        <View style={styles.count}>
          <Text style={styles.countText}>{items.length} items</Text>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {groups.map((group) => (
          <View key={group.key} style={styles.group}>
            {/* Group header */}
            <View style={styles.groupHeader}>
              <View
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: group.colorHex,
                  },
                ]}
              />

              <View>
                <Text style={styles.productName}>{group.productName}</Text>

                <Text style={styles.colorName}>{group.colorName}</Text>
              </View>
            </View>

            {/* Sizes */}
            {group.items.map((item) => {
              const unitPriceNumber = typeof item.unitPrice === 'number' ? item.unitPrice : 0;

              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.sizeContainer}>
                    <Text style={styles.sizeName}>{item.size?.name ?? 'Unknown Size'}</Text>

                    <Text style={styles.price}>₱{unitPriceNumber.toFixed(2)} each</Text>
                  </View>

                  <View style={styles.actions}>
                    <Pressable style={styles.quantityButton} onPress={() => onDecrease(item.id)}>
                      <Text style={styles.buttonText}>−</Text>
                    </Pressable>

                    <View style={styles.quantity}>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                    </View>

                    <Pressable style={styles.quantityButton} onPress={() => onIncrease(item.id)}>
                      <Text style={styles.buttonText}>+</Text>
                    </Pressable>

                    <Pressable style={styles.deleteButton} onPress={() => onRemove(item.id)}>
                      <Text style={styles.deleteText}>×</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
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
    height: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
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
    gap: 12,
  },

  group: {
    borderWidth: 1,
    borderColor: '#E0E4EA',
    borderRadius: 10,
    overflow: 'hidden',
  },

  groupHeader: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9FB',
  },

  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CBD0D8',
  },

  productName: {
    fontSize: 15,
    fontWeight: '700',
  },

  colorName: {
    marginTop: 3,
    color: '#687284',
    fontSize: 13,
  },

  itemRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E8ED',
  },

  sizeContainer: {
    flex: 1,
  },

  sizeName: {
    fontSize: 15,
    fontWeight: '600',
  },

  price: {
    marginTop: 3,
    fontSize: 12,
    color: '#7B8493',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
