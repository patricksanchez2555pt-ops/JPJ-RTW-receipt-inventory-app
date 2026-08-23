import { StyleSheet, Text, View } from 'react-native';

type Props = {
  subtotal: number;
  discount: number;
  total: number;
};

export default function TransactionSummary({ subtotal, discount, total }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>

        <Text style={styles.value}>₱{subtotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Discount</Text>

        <Text style={styles.discount}>-₱{discount.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL</Text>

        <Text style={styles.total}>₱{total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: '#E5E8ED',
    backgroundColor: '#FFFFFF',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    color: '#707989',
  },

  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252B35',
  },

  discount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D64545',
  },

  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: '#E5E8ED',
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#252B35',
  },

  total: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1745D1',
  },
});
