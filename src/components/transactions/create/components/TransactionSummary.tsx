import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  buyerName: string;
  itemCount: number;
  discount: number;
  subtotal: number;
  total: number;
  onBuyerNameChange: (value: string) => void;
  onDiscountChange: (value: number) => void;
  onSave: () => void;
  onPrint: () => void;
};

export default function TransactionSummary({
  buyerName,
  itemCount,
  discount,
  subtotal,
  total,
  onBuyerNameChange,
  onDiscountChange,
  onSave,
  onPrint,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Pressable
        onPress={() => setCollapsed((current) => !current)}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View>{collapsed && <Text style={styles.collapsedTotal}>₱{total.toFixed(2)}</Text>}</View>

        <Ionicons name={collapsed ? 'chevron-up' : 'chevron-down'} size={24} color="#4D5665" />
      </Pressable>

      {/* CONTENT */}
      {!collapsed && (
        <View style={styles.content}>
          {/* BUYER NAME */}
          <Text style={styles.label}>Buyer Name</Text>

          <TextInput
            value={buyerName}
            onChangeText={onBuyerNameChange}
            placeholder="Enter buyer name"
            placeholderTextColor="#9AA2AF"
            style={styles.input}
          />

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

            <Text style={styles.amount}>₱{subtotal.toFixed(2)}</Text>
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

            <Text style={styles.total}>₱{total.toFixed(2)}</Text>
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
    overflow: 'hidden',
  },

  /*
   * Collapsible header
   */
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

  /*
   * Expanded content
   */
  content: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  label: {
    fontSize: 14,
    color: '#4D5665',
    marginBottom: 7,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
    color: '#151A23',
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

  /*
   * Discount
   */
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

  /*
   * Total
   */
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

  /*
   * Action buttons
   */
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
