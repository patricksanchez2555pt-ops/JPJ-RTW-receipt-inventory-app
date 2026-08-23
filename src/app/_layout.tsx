import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import Sidebar from '../components/layout/Sidebar/Sidebar';

export default function RootLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left']}>
        <Sidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((previous) => !previous)}
        />

        <View style={styles.content}>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  container: {
    flex: 1,
    flexDirection: 'row',
  },

  content: {
    flex: 1,
    minWidth: 0,
  },
});
