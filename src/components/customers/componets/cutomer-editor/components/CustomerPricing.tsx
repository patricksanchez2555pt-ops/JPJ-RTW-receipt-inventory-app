import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCustomerPricingStore } from '@/store/useCustomerPricingStore';
import { useProductStore } from '@/store/useProductStore';
import { useSizeStore } from '@/store/useSizeStore';

type Props = {
  customerId: string;
};

export default function CustomerPricing({ customerId }: Props) {
  const products = useProductStore((state) => state.products);
  const sizes = useSizeStore((state) => state.sizes);

  const getCustomerPricesForCustomer = useCustomerPricingStore(
    (state) => state.getCustomerPricesForCustomer,
  );

  const getCustomerPrice = useCustomerPricingStore((state) => state.getCustomerPrice);

  const addCustomerPrice = useCustomerPricingStore((state) => state.addCustomerPrice);

  const updateCustomerPrice = useCustomerPricingStore((state) => state.updateCustomerPrice);

  const deleteCustomerPrice = useCustomerPricingStore((state) => state.deleteCustomerPrice);

  /*
   * Stores only values currently being edited.
   *
   * IMPORTANT:
   * The key includes customerId so unsaved edits remain
   * separate when switching between customers.
   */
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});

  /*
   * Get all saved prices for the selected customer
   * using the store helper.
   */
  const selectedCustomerPrices = getCustomerPricesForCustomer(customerId);

  /*
   * Convert the customer's saved prices into a quick lookup map.
   */
  const customerPriceMap = useMemo(() => {
    const map: Record<string, number> = {};

    selectedCustomerPrices.forEach((customerPrice) => {
      map[`${customerPrice.productId}-${customerPrice.sizeId}`] = customerPrice.price;
    });

    return map;
  }, [selectedCustomerPrices]);

  /*
   * Group sizes by product.
   */
  const productSizes = useMemo(() => {
    return products.map((product) => ({
      product,
      sizes: sizes.filter((size) => size.productId === product.id),
    }));
  }, [products, sizes]);

  /*
   * Unique key for a price input.
   *
   * Includes customerId so unsaved values don't get mixed
   * between customers.
   */
  const getEditingKey = (productId: string, sizeId: string) => {
    return `${customerId}-${productId}-${sizeId}`;
  };

  /*
   * Get the value displayed in the input.
   */
  const getPriceValue = (productId: string, sizeId: string) => {
    const editingKey = getEditingKey(productId, sizeId);

    /*
     * If currently editing, keep the local value.
     */
    if (editingKey in editingPrices) {
      return editingPrices[editingKey];
    }

    /*
     * Otherwise use the saved customer price.
     */
    const customerPrice = customerPriceMap[`${productId}-${sizeId}`];

    return customerPrice !== undefined ? String(customerPrice) : '';
  };

  const handlePriceChange = (productId: string, sizeId: string, value: string) => {
    /*
     * Allow numbers and decimal point only.
     */
    const sanitized = value.replace(/[^0-9.]/g, '');

    /*
     * Prevent multiple decimal points.
     */
    const parts = sanitized.split('.');

    const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;

    const editingKey = getEditingKey(productId, sizeId);

    setEditingPrices((current) => ({
      ...current,
      [editingKey]: formatted,
    }));
  };

  const clearEditingPrice = (productId: string, sizeId: string) => {
    const editingKey = getEditingKey(productId, sizeId);

    setEditingPrices((current) => {
      const next = { ...current };

      delete next[editingKey];

      return next;
    });
  };

  const handleReset = (productId: string, sizeId: string) => {
    /*
     * Remove the unsaved local value.
     */
    clearEditingPrice(productId, sizeId);

    /*
     * Find the saved customer-specific price.
     */
    const existing = getCustomerPrice(customerId, productId, sizeId);

    /*
     * Remove the customer override.
     *
     * The product's default price will then be used.
     */
    if (existing) {
      deleteCustomerPrice(existing.id);
    }
  };

  const handleBlur = (productId: string, sizeId: string, defaultPrice: number) => {
    const editingKey = getEditingKey(productId, sizeId);

    /*
     * Nothing to save if the user never edited
     * this particular input.
     */
    if (!(editingKey in editingPrices)) {
      return;
    }

    const value = editingPrices[editingKey];

    const customPrice = value?.trim() ? Number.parseFloat(value) : NaN;

    /*
     * Find the existing saved customer price.
     */
    const existing = getCustomerPrice(customerId, productId, sizeId);

    /*
     * Empty input means:
     * use the default product price.
     */
    if (!Number.isFinite(customPrice)) {
      if (existing) {
        deleteCustomerPrice(existing.id);
      }

      clearEditingPrice(productId, sizeId);

      return;
    }

    /*
     * If the customer price is exactly the same
     * as the default price, there is no reason
     * to store a customer override.
     */
    if (customPrice === defaultPrice) {
      if (existing) {
        deleteCustomerPrice(existing.id);
      }

      clearEditingPrice(productId, sizeId);

      return;
    }

    /*
     * Update the existing customer-specific price.
     */
    if (existing) {
      updateCustomerPrice(existing.id, {
        price: customPrice,
      });
    } else {
      /*
       * Create a new customer-specific price.
       */
      addCustomerPrice({
        customerId,
        productId,
        sizeId,
        price: customPrice,
      });
    }

    /*
     * Remove the local editing value.
     *
     * The input will now display the saved value
     * from the Zustand store.
     */
    clearEditingPrice(productId, sizeId);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Custom Pricing</Text>

          <Text style={styles.sectionSubtitle}>Leave a price blank to use the default price.</Text>
        </View>
      </View>

      {productSizes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No products</Text>

          <Text style={styles.emptyText}>Create products and sizes first.</Text>
        </View>
      ) : (
        productSizes.map(({ product, sizes: productSizes }) => (
          <View key={product.id} style={styles.productSection}>
            <Text style={styles.productTitle}>{product.name}</Text>

            {productSizes.length === 0 ? (
              <Text style={styles.noSizes}>No sizes configured.</Text>
            ) : (
              <View style={styles.table}>
                {/* TABLE HEADER */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, styles.sizeColumn]}>Size</Text>

                  <Text style={[styles.headerText, styles.defaultColumn]}>Default</Text>

                  <Text style={[styles.headerText, styles.customColumn]}>Customer Price</Text>

                  <View style={styles.actionColumn} />
                </View>

                {/* SIZE ROWS */}
                {productSizes.map((size) => {
                  const savedPriceKey = `${product.id}-${size.id}`;

                  const editingKey = getEditingKey(product.id, size.id);

                  const value = getPriceValue(product.id, size.id);

                  const hasCustomPrice =
                    editingKey in editingPrices || customerPriceMap[savedPriceKey] !== undefined;

                  return (
                    <View key={size.id} style={styles.tableRow}>
                      <Text style={styles.sizeText}>{size.name}</Text>

                      <Text style={styles.defaultPrice}>₱{size.price.toFixed(2)}</Text>

                      <View style={styles.priceInputWrapper}>
                        <Text style={styles.currency}>₱</Text>

                        <TextInput
                          value={value}
                          onChangeText={(text) => handlePriceChange(product.id, size.id, text)}
                          onBlur={() => handleBlur(product.id, size.id, size.price)}
                          placeholder={size.price.toFixed(2)}
                          placeholderTextColor="#9AA2AF"
                          keyboardType="decimal-pad"
                          style={styles.priceInput}
                        />
                      </View>

                      <View style={styles.actionColumn}>
                        {hasCustomPrice ? (
                          <Pressable onPress={() => handleReset(product.id, size.id)}>
                            <Text style={styles.resetText}>Default</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE1E9',
  },

  header: {
    marginBottom: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#151A23',
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#687284',
  },

  productSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E8ED',
    paddingTop: 18,
    marginTop: 18,
  },

  productTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#151A23',
  },

  table: {
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 8,
    overflow: 'hidden',
  },

  tableHeader: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderBottomWidth: 1,
    borderBottomColor: '#DCE1E9',
  },

  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#687284',
  },

  tableRow: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8ED',
  },

  sizeColumn: {
    flex: 1,
  },

  defaultColumn: {
    width: 130,
  },

  customColumn: {
    width: 190,
  },

  actionColumn: {
    width: 80,
    alignItems: 'flex-end',
  },

  sizeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#151A23',
  },

  defaultPrice: {
    width: 130,
    fontSize: 14,
    color: '#687284',
  },

  priceInputWrapper: {
    width: 190,
    height: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 6,
  },

  currency: {
    marginRight: 4,
    fontSize: 14,
    color: '#687284',
  },

  priceInput: {
    flex: 1,
    height: 38,
    fontSize: 14,
    color: '#151A23',
  },

  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1745D1',
  },

  noSizes: {
    paddingVertical: 8,
    fontSize: 13,
    color: '#687284',
  },

  empty: {
    paddingVertical: 30,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#151A23',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: '#687284',
  },
});
