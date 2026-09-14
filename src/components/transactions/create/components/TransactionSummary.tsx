import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Customer } from '../../../../types/localModels';
import { formatNumber } from '@/utils/formatNumber';

type Props = {
  customers: Customer[];
  selectedCustomerId: string | null;

  itemCount: number;
  discount: number;
  subtotal: number;
  total: number;

  onCustomerSelect: (customerId: string | null) => void;
  onDiscountChange: (value: number) => void;
  onCustomerNameChange: (name: string) => void;
  onSave: () => void;
  onPrint: () => void;
};

export default function TransactionSummary({
  customers,
  selectedCustomerId,
  itemCount,
  discount,
  subtotal,
  total,
  onCustomerNameChange,
  onCustomerSelect,
  onDiscountChange,
  onSave,
  onPrint,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) {
      return null;
    }

    return customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  }, [customers, selectedCustomerId]);

  /*
   * Search customers.
   *
   * Customers whose names START with the search text
   * are shown first, followed by customers whose names
   * simply contain the search text.
   */
  const customerSuggestions = useMemo(() => {
    const search = customerSearch.trim().toLowerCase();

    if (!search) {
      return [];
    }

    const startsWith = customers.filter((customer) =>
      customer.name.toLowerCase().startsWith(search),
    );

    const contains = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) &&
        !customer.name.toLowerCase().startsWith(search),
    );

    return [...startsWith, ...contains].slice(0, 6);
  }, [customers, customerSearch]);

  function handleCustomerChange(value: string) {
    setCustomerSearch(value);
    onCustomerNameChange(value);
    setShowSuggestions(true);

    /*
     * Once the user starts typing something different,
     * the previous customer is no longer selected.
     */
    if (selectedCustomerId) {
      onCustomerSelect(null);
    }
  }

  function handleCustomerSelect(customer: Customer) {
    setCustomerSearch(customer.name);
    onCustomerSelect(customer.id);
    setShowSuggestions(false);
  }

  function clearCustomer() {
    setCustomerSearch('');
    onCustomerSelect(null);
    setShowSuggestions(false);
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Pressable
        onPress={() => setCollapsed((current) => !current)}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View>
          {collapsed && <Text style={styles.collapsedTotal}>₱{formatNumber(total)}</Text>}
        </View>

        <Ionicons name={collapsed ? 'chevron-up' : 'chevron-down'} size={24} color="#4D5665" />
      </Pressable>

      {/* CONTENT */}
      {!collapsed && (
        <View style={styles.content}>
          {/* CUSTOMER */}
          <Text style={styles.label}>Customer</Text>

          <View style={styles.customerContainer}>
            <TextInput
              value={customerSearch}
              onChangeText={handleCustomerChange}
              onFocus={() => {
                if (customerSearch.trim().length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Search customer..."
              placeholderTextColor="#9AA2AF"
              style={styles.input}
            />

            {customerSearch.length > 0 && (
              <Pressable onPress={clearCustomer} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>×</Text>
              </Pressable>
            )}
          </View>

          {/* SUGGESTIONS */}
          {showSuggestions && customerSuggestions.length > 0 && (
            <View style={styles.suggestions}>
              {customerSuggestions.map((customer) => (
                <Pressable
                  key={customer.id}
                  onPress={() => handleCustomerSelect(customer)}
                  style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}
                >
                  <Text style={styles.suggestionName}>{customer.name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* SELECTED CUSTOMER */}
          {selectedCustomer && (
            <View style={styles.selectedCustomer}>
              <Ionicons name="checkmark-circle" size={18} color="#1745D1" />

              <Text style={styles.selectedCustomerText}>{selectedCustomer.name}</Text>
            </View>
          )}

          {/* TOTAL ITEMS */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Items</Text>

            <Text style={styles.amount}>
              {itemCount} {itemCount === 1 ? 'pc' : 'pcs'}
            </Text>
          </View>

          {/* SUBTOTAL */}
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>

            <Text style={styles.amount}>₱{formatNumber(subtotal)}</Text>
          </View>

          {/* DISCOUNT */}
          <View style={styles.row}>
            <Text style={styles.label}>Discount</Text>

            <View style={styles.discountControls}>
              <Pressable
                onPress={() => onDiscountChange(2 * itemCount)}
                style={({ pressed }) => [styles.lessButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.lessButtonText}>Less 2</Text>
              </Pressable>

              <Pressable
                onPress={() => onDiscountChange(5 * itemCount)}
                style={({ pressed }) => [styles.lessButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.lessButtonText}>Less 5</Text>
              </Pressable>

              <TextInput
                value={discount === 0 ? '' : String(discount)}
                onChangeText={(value) => {
                  const numeric = Number(value.replace(/[^0-9.]/g, ''));

                  onDiscountChange(Number.isNaN(numeric) ? 0 : numeric);
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9AA2AF"
                style={styles.discountInput}
              />
            </View>
          </View>

          {/* TOTAL */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>

            <Text style={styles.total}>₱{formatNumber(total)}</Text>
          </View>

          {/* BUTTONS */}
          <View style={styles.buttonRow}>
            <Pressable
              onPress={onSave}
              style={({ pressed }) => [
                styles.actionButton,
                styles.saveButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>Save Transaction</Text>
            </Pressable>

            <Pressable
              onPress={onPrint}
              style={({ pressed }) => [
                styles.actionButton,
                styles.printButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>Print Receipt</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 12,
    overflow: 'visible',
    zIndex: 10,
  },

  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerPressed: {
    opacity: 0.7,
  },

  collapsedTotal: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: '#1745D1',
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    zIndex: 10,
  },

  label: {
    fontSize: 14,
    color: '#4D5665',
    marginBottom: 7,
  },

  /*
   * Customer autocomplete
   */
  customerContainer: {
    position: 'relative',
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 40,
    color: '#151A23',
  },

  clearButton: {
    position: 'absolute',
    right: 4,
    top: 5,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButtonText: {
    fontSize: 22,
    color: '#7B8493',
  },

  suggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 73,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 100,
    elevation: 8,
  },

  suggestion: {
    minHeight: 46,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
  },

  suggestionPressed: {
    backgroundColor: '#F2F5FF',
  },

  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#151A23',
  },

  selectedCustomer: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: '#F2F5FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  selectedCustomerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1745D1',
  },

  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#151A23',
  },

  discountControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  lessButton: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0F3F8',
    borderWidth: 1,
    borderColor: '#D8DDE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lessButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1745D1',
  },

  discountInput: {
    width: 110,
    height: 42,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'right',
    color: '#151A23',
  },

  totalRow: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#DCE1E9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#151A23',
  },

  total: {
    fontSize: 24,
    fontWeight: '800',
    color: '#151A23',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },

  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButton: {
    backgroundColor: '#1745D1',
  },

  printButton: {
    backgroundColor: '#087F23',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  buttonPressed: {
    opacity: 0.8,
  },
});
