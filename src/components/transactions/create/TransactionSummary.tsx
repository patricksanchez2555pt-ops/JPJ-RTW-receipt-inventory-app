import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  buyerName: string;
  discount: number;
  subtotal: number;
  total: number;
  onBuyerNameChange: (value: string) => void;
  onDiscountChange: (value: number) => void;
  onSave: () => void;
};

export default function TransactionSummary({
  buyerName,
  discount,
  subtotal,
  total,
  onBuyerNameChange,
  onDiscountChange,
  onSave,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Buyer Name</Text>

      <TextInput
        value={buyerName}
        onChangeText={onBuyerNameChange}
        placeholder="Enter buyer name"
        style={styles.input}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>

        <Text style={styles.amount}>₱{subtotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Discount</Text>

        <TextInput
          value={discount === 0 ? '' : String(discount)}
          onChangeText={(value) => {
            const numeric = Number(value.replace(/[^0-9.]/g, ''));
            onDiscountChange(Number.isNaN(numeric) ? 0 : numeric);
          }}
          keyboardType="decimal-pad"
          placeholder="0"
          style={styles.discountInput}
        />
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL</Text>

        <Text style={styles.total}>₱{total.toFixed(2)}</Text>
      </View>

      <Pressable onPress={onSave} style={styles.saveButton}>
        <Text style={styles.saveText}>Save Transaction</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 12,
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
  },

  discountInput: {
    width: 110,
    height: 42,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'right',
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
  },

  total: {
    fontSize: 24,
    fontWeight: '800',
  },

  saveButton: {
    height: 52,
    marginTop: 18,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
