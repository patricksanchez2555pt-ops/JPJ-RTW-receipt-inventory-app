import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { toPrintableProducts } from '@/helper/receiptBuilder';
import type { PrintableTransaction } from '@/service/escPos';
import { printerService } from '@/service/printerService';

import { useColorStore } from '../../../store/useColorStore';
import { useCustomerPricingStore } from '../../../store/useCustomerPricingStore';
import { useCustomerStore } from '../../../store/useCustomerStore';
import { useProductStore } from '../../../store/useProductStore';
import { useSizeStore } from '../../../store/useSizeStore';
import { useTransactionStore } from '../../../store/useTransactionStore';
import type { Color, Product, Size } from '../../../types/localModels.ts';
import AddedItemsPanel from './components/added-items-panel/AddedItemsPanel';
import ColorSelector from './components/ColorSelector';
import ProductSelector from './components/ProductSelector';
import QuantitySelector from './components/QuantitySelector';
import SizeSelector from './components/SizeSelector';
import TransactionSummary from './components/TransactionSummary';
import type { AddedTransactionItem } from './types';

export default function CreateTransaction() {
  const PRODUCTS = useProductStore((state) => state.products);

  const COLORS = useColorStore((state) => state.colors);

  const SIZES = useSizeStore((state) => state.sizes);

  const CUSTOMERS = useCustomerStore((state) => state.customers);

  /*
   * Customer-specific pricing.
   *
   * Subscribe to customerPrices directly so the component
   * re-renders whenever pricing is changed.
   */
  const customerPrices = useCustomerPricingStore((state) => state.customerPrices);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PRODUCTS[0] ?? null);

  const [selectedColor, setSelectedColor] = useState<Color | null>(COLORS[0] ?? null);

  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);

  const [quantity, setQuantity] = useState(0);

  const [items, setItems] = useState<AddedTransactionItem[]>([]);

  const [buyerName, setBuyerName] = useState('');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [discount, setDiscount] = useState(0);

  const [highlightedItemIds, setHighlightedItemIds] = useState<string[]>([]);

  const productColors = useMemo(() => {
    if (!selectedProduct) {
      return [];
    }

    return COLORS.filter((color) => color.productId === selectedProduct.id);
  }, [selectedProduct, COLORS]);

  const productSizes = useMemo(() => {
    if (!selectedProduct) {
      return [];
    }

    return SIZES.filter((size) => size.productId === selectedProduct.id);
  }, [selectedProduct, SIZES]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const total = Math.max(0, subtotal - discount);

  /*
   * Get the effective price for a product/size.
   *
   * If a customer is selected and has a custom price,
   * that price is used.
   *
   * Otherwise, the normal size price is used.
   */
  function getEffectivePrice(productId: string, sizeId: string, defaultPrice: number) {
    if (!selectedCustomerId) {
      return defaultPrice;
    }

    const customerPrice = customerPrices.find(
      (price) =>
        price.customerId === selectedCustomerId &&
        price.productId === productId &&
        price.sizeId === sizeId,
    );

    return customerPrice?.price ?? defaultPrice;
  }

  function handleProductSelect(product: Product) {
    setSelectedProduct(product);
    setSelectedColor(null);
    setSelectedSizes([]);
  }

  function handleColorSelect(color: Color) {
    setSelectedColor(color);
  }

  function handleSizeToggle(size: Size) {
    setSelectedSizes((current) => {
      const exists = current.some((item) => item.id === size.id);

      const updated = exists ? current.filter((item) => item.id !== size.id) : [...current, size];

      return [...updated].sort((a, b) => a.price - b.price);
    });
  }

  function addItems(passedQuantity?: number) {
    const qty = passedQuantity ?? quantity;

    if (!selectedProduct) {
      Alert.alert('Select Product', 'Please select a product.');

      return;
    }

    if (!selectedColor) {
      Alert.alert('Select Color', 'Please select a color.');

      return;
    }

    if (selectedSizes.length === 0) {
      Alert.alert('Select Size', 'Please select at least one size.');

      return;
    }

    const newItemIds: string[] = [];

    setItems((current) => {
      const updated = [...current];

      for (const size of selectedSizes) {
        /*
         * Use the customer-specific price when
         * available.
         */
        const unitPrice = getEffectivePrice(selectedProduct.id, size.id, size.price);

        const existingIndex = updated.findIndex(
          (item) =>
            item.productId === selectedProduct.id &&
            item.colorId === selectedColor.id &&
            item.sizeId === size.id,
        );

        if (existingIndex >= 0) {
          const existing = updated[existingIndex];

          const newQuantity = existing.quantity + qty;

          updated[existingIndex] = {
            ...existing,
            quantity: newQuantity,
            unitPrice,
            total: newQuantity * unitPrice,
          };

          newItemIds.push(existing.id);
        } else {
          const newItemId = `${Date.now()}-${size.id}`;

          updated.push({
            id: newItemId,
            transactionId: '',
            productId: selectedProduct.id,
            colorId: selectedColor.id,
            sizeId: size.id,
            quantity: qty,
            unitPrice,
            total: qty * unitPrice,

            product: selectedProduct,
            color: selectedColor,
            size,
          });

          newItemIds.push(newItemId);
        }
      }

      return updated;
    });

    setHighlightedItemIds(newItemIds);

    setSelectedSizes([]);
  }

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  function updateQuantity(itemId: string, amount: number) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const newQuantity = Math.max(1, item.quantity + amount);

        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.unitPrice,
        };
      }),
    );
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  /*
   * Change the selected customer.
   *
   * Existing transaction items are repriced
   * using the newly selected customer's pricing.
   */
  function handleCustomerSelect(customerId: string | null) {
    setSelectedCustomerId(customerId);

    setItems((current) =>
      current.map((item) => {
        const defaultPrice = item.size?.price ?? item.unitPrice;

        const customerPrice = customerId
          ? customerPrices.find(
              (price) =>
                price.customerId === customerId &&
                price.productId === item.productId &&
                price.sizeId === item.sizeId,
            )
          : undefined;

        const unitPrice = customerPrice?.price ?? defaultPrice;

        return {
          ...item,
          unitPrice,
          total: item.quantity * unitPrice,
        };
      }),
    );
  }

  function saveTransaction() {
    if (items.length === 0) {
      Alert.alert('No Items', 'Add at least one item.');

      return;
    }

    /*
     * If the user typed a buyer name without selecting
     * an existing customer, create the customer first.
     */
    if (!selectedCustomerId && buyerName.trim()) {
      const customer = useCustomerStore.getState().addCustomer({
        name: buyerName.trim(),
      });

      setSelectedCustomerId(customer.id);
    }

    const customer = useCustomerStore.getState().getCustomer(selectedCustomerId ?? '');

    const transaction = useTransactionStore.getState().addTransaction({
      customerId: customer?.id,
      buyerName: customer?.name ?? buyerName,
      subtotal,
      discount,
      total,
      items,
    });

    console.log('TRANSACTION SAVED:', transaction);

    Alert.alert(
      'Transaction Saved',
      `Transaction #${transaction.id}\nTotal: ₱${transaction.total.toFixed(2)}`,
    );

    setItems([]);
    setBuyerName('');
    setDiscount(0);
    setSelectedSizes([]);
    setQuantity(0);
    setHighlightedItemIds([]);
    setSelectedCustomerId(null);

    setSelectedProduct(PRODUCTS[0] ?? null);

    setSelectedColor(null);
  }

  async function printTransaction() {
    try {
      const products = toPrintableProducts(items);

      const printableTransaction: PrintableTransaction = {
        buyerName,
        date: new Date().toISOString(),
        subtotal,
        discount,
        total,
        products,
      };

      await printerService.printReceipt(printableTransaction);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error('PRINT TRANSACTION ERROR:', error);

      Alert.alert('Print Failed', message);
    }
  }

  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <ScrollView
        style={styles.left}
        contentContainerStyle={styles.leftContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Create Transaction</Text>

            <Text style={styles.subtitle}>Add products to the transaction.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <ProductSelector
            products={PRODUCTS}
            selectedProduct={selectedProduct}
            onSelect={handleProductSelect}
          />

          <View style={styles.section}>
            <ColorSelector
              colors={productColors}
              selectedColor={selectedColor}
              onSelect={handleColorSelect}
            />
          </View>

          <View style={styles.section}>
            <SizeSelector
              sizes={productSizes}
              selectedSizes={selectedSizes}
              onToggle={handleSizeToggle}
              onDeselectAll={() => setSelectedSizes([])}
            />
          </View>

          <View style={styles.section}>
            <QuantitySelector quantity={quantity} onChange={setQuantity} addItems={addItems} />
          </View>

          <View style={styles.addSection}>
            <Text style={styles.selectedText}>
              {selectedSizes.length} size
              {selectedSizes.length !== 1 ? 's' : ''} selected
            </Text>

            <View style={styles.selectedSizes}>
              {selectedSizes.map((size) => (
                <View key={size.id} style={styles.selectedSize}>
                  <Text style={styles.selectedSizeText}>{size.name}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.selectionSummary}>
              {selectedColor?.name ?? 'No color'}
              {' • '}
              {quantity} pcs each
            </Text>

            <View style={styles.addButton} />
          </View>

          <Pressable
            onPress={addItems}
            style={({ pressed }) => [
              styles.addItemsButton,
              pressed && styles.addItemsButtonPressed,
            ]}
          >
            <Text style={styles.addItemsButtonText}>+ Add to Items List</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* RIGHT SIDE */}
      <View style={styles.right}>
        <AddedItemsPanel
          items={items}
          highlightedItemIds={highlightedItemIds}
          onIncrease={(id) => updateQuantity(id, 1)}
          onDecrease={(id) => updateQuantity(id, -1)}
          onRemove={removeItem}
        />

        <TransactionSummary
          customers={CUSTOMERS}
          selectedCustomerId={selectedCustomerId}
          itemCount={itemCount}
          discount={discount}
          subtotal={subtotal}
          total={total}
          onCustomerNameChange={setBuyerName}
          onCustomerSelect={handleCustomerSelect}
          onDiscountChange={setDiscount}
          onSave={saveTransaction}
          onPrint={printTransaction}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
  },

  left: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#DCE1E9',
  },

  leftContent: {
    padding: 20,
    paddingBottom: 40,
  },

  right: {
    flex: 1,
    padding: 20,
    gap: 14,
  },

  header: {
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 4,
    color: '#707989',
    fontSize: 14,
  },

  card: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 12,
  },

  section: {
    marginTop: 24,
  },

  addSection: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },

  selectedText: {
    fontSize: 14,
    fontWeight: '700',
  },

  selectedSizes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  selectedSize: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1745D1',
  },

  selectedSizeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  selectionSummary: {
    marginTop: 10,
    color: '#687284',
  },

  addButton: {
    display: 'none',
  },

  addItemsButton: {
    marginTop: 14,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addItemsButtonPressed: {
    opacity: 0.8,
  },

  addItemsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
