import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import { useColorStore } from '../../../store/useColorStore';
import { useCustomerPricingStore } from '../../../store/useCustomerPricingStore';
import { useCustomerStore } from '../../../store/useCustomerStore';
import { useProductStore } from '../../../store/useProductStore';
import { useSizeStore } from '../../../store/useSizeStore';
import { useTransactionStore } from '../../../store/useTransactionStore';
import type { Color, Customer, Product, Size, Transaction } from '../../../types/localModels';
import AddedItemsPanel from '../components/added-items-panel/AddedItemsPanel';
import ColorSelector from './components/ColorSelector';
import ProductSelector from './components/ProductSelector';
import QuantitySelector from './components/QuantitySelector';
import SizeSelector from './components/SizeSelector';
import TransactionSummary from './components/TransactionSummary';
import type { AddedTransactionItem } from './types';

type Props = {
  transaction?: Transaction | null | undefined;
  addedItems?: AddedTransactionItem[];
  title?: string;
  subtitle?: string;
  onUpdate?: () => void;
  onClose?: () => void | undefined;
};

export default function TransactionForm({
  transaction = null,
  addedItems = [],
  title = 'Transaction Form',
  subtitle = 'Create a new transaction.',
  onUpdate = () => {},
  onClose = undefined,
}: Props) {
  const PRODUCTS = useProductStore((state) => state.products);

  const COLORS = useColorStore((state) => state.colors);

  const SIZES = useSizeStore((state) => state.sizes);

  const CUSTOMERS = useCustomerStore((state) => state.customers);

  const customerPrices = useCustomerPricingStore((state) => state.customerPrices);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(
    useCustomerStore((state) => state.getCustomer(transaction?.customerId ?? '')),
  );

  const [discount, setDiscount] = useState(transaction?.discount ?? 0);

  const [paidAmount, setPaidAmount] = useState(transaction?.paidAmount ?? 0);

  const [buyerName, setBuyerName] = useState(transaction?.buyerName ?? '');

  const [items, setItems] = useState<AddedTransactionItem[]>(addedItems ?? []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PRODUCTS[0] ?? null);

  const [selectedColor, setSelectedColor] = useState<Color | null>(COLORS[0] ?? null);

  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);

  const [quantity, setQuantity] = useState(0);

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

  function getEffectivePrice(productId: string, sizeId: string, defaultPrice: number) {
    if (!selectedCustomer) {
      return defaultPrice;
    }

    const customerPrice = customerPrices.find(
      (price) =>
        price.customerId === selectedCustomer.id &&
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

  function handleCustomerSelect(customerId: string | null) {
    const customer = customerId ? useCustomerStore.getState().getCustomer(customerId) : undefined;

    setSelectedCustomer(customer);

    setItems((current) =>
      current.map((item) => {
        const defaultPrice = item.size?.price ?? item.unitPrice;

        const customerPrice = customer
          ? customerPrices.find(
              (price) =>
                price.customerId === customer.id &&
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
    let customer = selectedCustomer;

    if (!customer && buyerName.trim()) {
      customer = useCustomerStore.getState().addCustomer({
        name: buyerName.trim(),
      });

      setSelectedCustomer(customer);
    }

    if (transaction?.id) {
      const updatedTransaction = useTransactionStore.getState().updateTransaction({
        ...transaction,
        customerId: customer?.id,
        buyerName: customer?.name ?? buyerName,
        subtotal,
        paidAmount,
        discount,
        total,
        items,
      });

      Alert.alert(
        'Transaction Updated',
        `Transaction #${updatedTransaction?.id}\nTotal: ₱${updatedTransaction?.total.toFixed(2)}`,
      );

      onUpdate();
    } else {
      const newTransaction = useTransactionStore.getState().addTransaction({
        customerId: customer?.id,
        buyerName: customer?.name ?? buyerName,
        subtotal,
        paidAmount,
        discount,
        total,
        items,
      });

      console.log('TRANSACTION SAVED:', newTransaction);

      Alert.alert(
        'Transaction Saved',
        `Transaction #${newTransaction.id}\nTotal: ₱${newTransaction.total.toFixed(2)}`,
      );
    }

    setItems([]);
    setDiscount(0);
    setPaidAmount(0);
    setSelectedCustomer(undefined);

    setBuyerName('');
    setQuantity(0);
    setHighlightedItemIds([]);

    setSelectedProduct(PRODUCTS[0] ?? null);
    setSelectedSizes([]);
    setSelectedColor(null);
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
            <Text style={styles.title}>{title}</Text>

            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {onClose && (
            <Pressable
              onPress={() => {
                onClose();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          )}
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
            onPress={() => addItems()}
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
          total={total}
          onIncrease={(id) => updateQuantity(id, 1)}
          onDecrease={(id) => updateQuantity(id, -1)}
          onRemove={removeItem}
        />

        <TransactionSummary
          customers={CUSTOMERS}
          selectedCustomerId={selectedCustomer?.id ?? null}
          itemCount={itemCount}
          discount={discount}
          subtotal={subtotal}
          total={total}
          paidAmount={paidAmount}
          onCustomerNameChange={setBuyerName}
          onCustomerSelect={handleCustomerSelect}
          onDiscountChange={setDiscount}
          onPaidAmountChange={setPaidAmount}
          onSave={saveTransaction}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: f(26),
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 4,
    color: '#707989',
    fontSize: f(14),
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F5F7',
  },

  closeText: {
    marginTop: -3,
    fontSize: f(25),
    color: '#687284',
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
    fontSize: f(14),
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
    fontSize: f(16),
    fontWeight: '700',
  },
});
