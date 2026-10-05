import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';

import Sidebar from '../components/layout/Sidebar/Sidebar';

export default function RootLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <GestureHandlerRootView style={[styles.root, isKeyboardVisible && styles.keyboardVisible]}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left']}>
          <Sidebar
            collapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((previous) => !previous)}
          />

          <View style={styles.content}>
            <Tabs
              screenOptions={{
                headerShown: false,
                tabBarStyle: { display: 'none' },
              }}
            />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    maxWidth: 2160,
  },

  keyboardVisible: {
    marginBottom: 400,
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
