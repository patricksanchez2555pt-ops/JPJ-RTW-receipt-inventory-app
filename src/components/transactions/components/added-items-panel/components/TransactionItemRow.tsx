import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatNumber } from '@/utils/formatNumber';

import type { AddedTransactionItem } from '../../../form/types';

const FONT_SCALE = 1.25;
const f = (n: number) => Math.round(n * FONT_SCALE);

type Props = {
  item: AddedTransactionItem;
  highlighted: boolean;
  showUnitPrice: boolean;
  itemLayoutsRef: React.RefObject<Record<string, number>>;
  label: string;
  colorHex?: string;
  isViewOnly?: boolean;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

export default function TransactionItemRow({
  item,
  highlighted,
  showUnitPrice,
  itemLayoutsRef,
  label,
  colorHex,
  isViewOnly = false,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;

  const rowTotal = item.quantity * unitPrice;

  return (
    <View
      onLayout={(event) => {
        const layoutY = event.nativeEvent.layout.y;
        const layouts = itemLayoutsRef.current;

        if (layouts[item.id] !== layoutY) {
          layouts[item.id] = layoutY;
        }
      }}
      style={[styles.itemRow, highlighted && styles.highlightedItemRow]}
    >
      <View style={[styles.sizeContainer]}>
        {colorHex ? (
          <View style={[styles.colorItem]}>
            <View
              style={[
                styles.colorDot,
                {
                  backgroundColor: colorHex,
                },
              ]}
            />

            <Text style={styles.sizeName}>{label}</Text>
          </View>
        ) : (
          <Text style={[styles.sizeName]}>{label}</Text>
        )}
      </View>

      {showUnitPrice && (
        <View style={styles.unitPriceContainer}>
          <Text style={styles.unitPrice}>₱{formatNumber(unitPrice)}</Text>
        </View>
      )}

      <View style={styles.rowTotalContainer}>
        <Text style={styles.rowTotal}>₱{formatNumber(rowTotal)}</Text>
      </View>

      {isViewOnly ? (
        <View style={styles.rowQuantityContainer}>
          <Text style={styles.rowQuantity}>{item.quantity}</Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    minHeight: 50,
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
    fontSize: f(10),
    fontWeight: '600',
  },

  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD0D8',
  },

  unitPriceContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unitPrice: {
    fontSize: f(10),
    fontWeight: '600',
    color: '#4F5868',
  },

  rowTotalContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowTotal: {
    fontSize: f(10),
    fontWeight: '700',
    color: '#20242B',
  },

  rowQuantityContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowQuantity: {
    fontSize: f(14),
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
    fontSize: f(10),
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
});
