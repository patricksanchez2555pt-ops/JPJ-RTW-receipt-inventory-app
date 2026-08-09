import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Sidebar from '../components/layout/Sidebar/Sidebar';

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left']}>
      <Sidebar />

      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },

  content: {
    flex: 1,
  },
});
