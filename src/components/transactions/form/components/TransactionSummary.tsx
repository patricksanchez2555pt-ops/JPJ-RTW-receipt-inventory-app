import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

import type { Customer } from '../../../../types/localModels';

type Props = {
  customers: Customer[];
  selectedCustomerId: string | null;

  itemCount: number;
  discount: number;
  subtotal: number;
  total: number;
  paidAmount: number;

  onCustomerSelect: (customerId: string | null) => void;
  onDiscountChange: (value: number) => void;
  onCustomerNameChange: (name: string) => void;
  onPaidAmountChange: (amount: number) => void;
  onSave: () => void;
};

export default function TransactionSummary({
  customers,
  selectedCustomerId,
  itemCount,
  discount,
  subtotal,
  total,
  paidAmount,
  onCustomerNameChange,
  onCustomerSelect,
  onDiscountChange,
  onPaidAmountChange,
  onSave,
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
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

            {/* SUGGESTIONS */}
            {showSuggestions && customerSuggestions.length > 0 && (
              <View style={styles.suggestions}>
                {customerSuggestions.map((customer) => (
                  <Pressable
                    key={customer.id}
                    onPress={() => handleCustomerSelect(customer)}
                    style={({ pressed }) => [
                      styles.suggestion,
                      pressed && styles.suggestionPressed,
                    ]}
                  >
                    <Text style={styles.suggestionName}>{customer.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

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

          {/* PAID AMOUNT */}
          <View style={styles.row}>
            <Text style={styles.label}>Paid Amount</Text>

            <View style={styles.paidAmountControls}>
              <TextInput
                value={paidAmount === 0 ? '' : String(paidAmount)}
                onChangeText={(value) => {
                  const numeric = Number(value.replace(/[^0-9.]/g, ''));

                  onPaidAmountChange(Number.isNaN(numeric) ? 0 : numeric);
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9AA2AF"
                style={styles.paidAmountInput}
              />

              <Pressable
                onPress={() => onPaidAmountChange(total)}
                style={({ pressed }) => [styles.payFullButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.payFullButtonText}>Pay Full</Text>
              </Pressable>
            </View>
          </View>

          {/* REMAINING AMOUNT */}
          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>Remaining Amount</Text>

            <Text style={styles.remainingAmount}>₱{formatNumber(total - paidAmount)}</Text>
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
          </View>
        </View>
      )}
    </ScrollView>
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

    // Allows the summary to size itself based on its content.
    flexGrow: 0,
  },

  scrollContent: {
    flexGrow: 0,
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
    fontSize: f(14),
    fontWeight: '700',
    color: '#1745D1',
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    zIndex: 10,
  },

  label: {
    fontSize: f(14),
    color: '#4D5665',
    marginBottom: 7,
  },

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
    fontSize: f(22),
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
    fontSize: f(14),
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
    fontSize: f(13),
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
    fontSize: f(16),
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
    fontSize: f(13),
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
    fontSize: f(18),
    fontWeight: '700',
    color: '#151A23',
  },

  total: {
    fontSize: f(24),
    fontWeight: '800',
    color: '#151A23',
  },

  paidAmountControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  paidAmountInput: {
    width: 120,
    height: 42,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'right',
    color: '#151A23',
    fontSize: f(16),
    fontWeight: '600',
  },

  payFullButton: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#E8F5EC',
    borderWidth: 1,
    borderColor: '#B8DCC2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  payFullButtonText: {
    fontSize: f(13),
    fontWeight: '700',
    color: '#087F23',
  },

  remainingRow: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  remainingLabel: {
    fontSize: f(15),
    fontWeight: '600',
    color: '#4D5665',
  },

  remainingAmount: {
    fontSize: f(18),
    fontWeight: '800',
    color: '#D97706',
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

  buttonText: {
    color: '#FFFFFF',
    fontSize: f(16),
    fontWeight: '700',
  },

  buttonPressed: {
    opacity: 0.8,
  },
});
