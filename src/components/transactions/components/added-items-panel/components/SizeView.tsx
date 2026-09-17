import { StyleSheet, Text, View } from 'react-native';

import { formatNumber } from '@/utils/formatNumber';

import type { AddedTransactionItem } from '../../../create/types';
import { getSortedSizeGroup } from '../helpers';
import type { SizeProductGroup } from '../types';
import TransactionItemRow from './TransactionItemRow';

const FONT_SCALE = 1.25;
const f = (n: number) => Math.round(n * FONT_SCALE);

type Props = {
  productGroups: SizeProductGroup[];
  highlightedSet: Set<string>;
  showColors: boolean;
  showUnitPrice: boolean;
  itemLayoutsRef: React.RefObject<Record<string, number>>;
  isViewOnly?: boolean;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

export default function SizeView({
  productGroups,
  highlightedSet,
  showColors,
  showUnitPrice,
  itemLayoutsRef,
  isViewOnly = false,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  return (
    <>
      {productGroups.map((productGroup) => {
        const groups = getSortedSizeGroup(productGroup.sizeGroups);

        return (
          <View key={productGroup.productId} style={styles.productGroup}>
            <View style={styles.productHeader}>
              <View style={styles.groupInfo}>
                <Text style={styles.productName}>{productGroup.productName}</Text>

                <Text style={styles.readOnlyLabel}>Total by size</Text>
              </View>

              <View style={styles.productHeaderTotal}>
                <Text style={styles.productHeaderTotalLabel}>Product Total</Text>

                <Text style={styles.productHeaderTotalValue}>
                  ₱{formatNumber(productGroup.subTotal)}
                </Text>
              </View>

              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyBadgeText}>Read only</Text>
              </View>
            </View>

            {groups.map((group) => (
              <View key={group.id} style={styles.colorGroup}>
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

                    <Text style={styles.sizeHeaderValue}>₱{formatNumber(group.subTotal)}</Text>
                  </View>
                </View>

                {showColors &&
                  group.items.map((item: AddedTransactionItem) => (
                    <TransactionItemRow
                      key={item.id}
                      item={item}
                      highlighted={highlightedSet.has(item.id)}
                      showUnitPrice={showUnitPrice}
                      itemLayoutsRef={itemLayoutsRef}
                      label={item.color?.name ?? 'Unknown Color'}
                      colorHex={item.color?.hexValue ?? '#000000'}
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

  readOnlyLabel: {
    marginTop: 3,
    color: '#687284',
    fontSize: f(12),
  },

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

  colorGroup: {
    backgroundColor: '#FFFFFF',
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
});
