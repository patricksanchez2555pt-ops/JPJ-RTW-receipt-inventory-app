import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatNumber } from '@/utils/formatNumber';

import type { AddedTransactionItem } from '../../../form/types';
import type { ColorGroup, ColorProductGroup } from '../types';
import TransactionItemRow from './TransactionItemRow';

const FONT_SCALE = 1.25;
const f = (n: number) => Math.round(n * FONT_SCALE);

type Props = {
  productGroups: ColorProductGroup[];
  highlightedSet: Set<string>;
  showUnitPrice: boolean;
  itemLayoutsRef: React.RefObject<Record<string, number>>;
  isViewOnly?: boolean;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onRemoveColorGroup: (productId: string, groupId: string) => void;
};

export default function ColorView({
  productGroups,
  highlightedSet,
  showUnitPrice,
  itemLayoutsRef,
  isViewOnly = false,
  onIncrease,
  onDecrease,
  onRemove,
  onRemoveColorGroup,
}: Props) {
  return (
    <>
      {productGroups.map((productGroup) => {
        const groups = Object.values(productGroup.colorGroups) as ColorGroup[];

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
                  ₱{formatNumber(productGroup.subTotal)}
                </Text>
              </View>
            </View>

            {groups.map((group) => (
              <View key={group.id} style={styles.colorGroup}>
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

                    <Text style={styles.colorHeaderValue}>{group.quantity} pcs</Text>
                  </View>

                  <View style={styles.colorTotalContainer}>
                    <Text style={styles.colorHeaderLabel}>Color Total</Text>

                    <Text style={styles.colorHeaderValue}>₱{formatNumber(group.subTotal)}</Text>
                  </View>

                  {isViewOnly ? null : (
                    <Pressable
                      onPress={() => onRemoveColorGroup(productGroup.productId, group.id)}
                      style={({ pressed }) => [styles.deleteGroupButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.deleteGroupText}>Delete</Text>
                    </Pressable>
                  )}
                </View>

                {group.items.map((item: AddedTransactionItem) => (
                  <TransactionItemRow
                    key={item.id}
                    item={item}
                    highlighted={highlightedSet.has(item.id)}
                    showUnitPrice={showUnitPrice}
                    itemLayoutsRef={itemLayoutsRef}
                    label={item.size?.name ?? 'Unknown Size'}
                    isViewOnly={isViewOnly}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                    onRemove={onRemove}
                  />
                ))}
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  productGroup: {
    borderWidth: 1,
    borderColor: '#E0E4EA',
    borderRadius: 10,
    overflow: 'hidden',
  },

  productHeader: {
    minHeight: 50,
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
    fontSize: f(12),
    fontWeight: '700',
  },

  productSubtitle: {
    marginTop: 3,
    color: '#687284',
    fontSize: f(9),
  },

  productHeaderTotal: {
    width: 130,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  productHeaderTotalLabel: {
    fontSize: f(9),
    color: '#687284',
    fontWeight: '600',
  },

  productHeaderTotalValue: {
    marginTop: 2,
    fontSize: f(12),
    fontWeight: '700',
  },

  colorGroup: {
    backgroundColor: '#FFFFFF',
  },

  groupHeader: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#242525',
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
    fontSize: f(15),
    fontWeight: '700',
    color: '#e8eaee',
  },

  colorQuantityContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorTotalContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorHeaderLabel: {
    fontSize: f(8),
    color: '#7f8080',
    fontWeight: '600',
    marginBottom: 3,
  },

  colorHeaderValue: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#c8c8cb',
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
    fontSize: f(8),
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.6,
  },
});
