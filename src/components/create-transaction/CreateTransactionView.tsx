import { StyleSheet, Text, View } from 'react-native';

export default function CreateTransactionView() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Transaction</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },
});