import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SidebarItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
};

const NAV_ITEMS: SidebarItem[] = [
  {
    label: 'Inventory',
    icon: 'cube-outline',
    route: '/inventory',
  },
  {
    label: 'Create Transaction',
    icon: 'cart-outline',
    route: '/create-transaction',
  },
  {
    label: 'Transactions',
    icon: 'receipt-outline',
    route: '/transactions',
  },
  {
    label: 'Products',
    icon: 'pricetag-outline',
    route: '/products',
  },
  {
    label: 'Reports',
    icon: 'bar-chart-outline',
    route: '/reports',
  },
  {
    label: 'Settings',
    icon: 'settings-outline',
    route: '/settings',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const activeItem = NAV_ITEMS.find((item) => item.route === pathname)?.label ?? 'Inventory';

  const handleNavigation = (route: Href) => {
    router.push(route);
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>JPJ RTW</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <Pressable
              key={item.label}
              onPress={() => handleNavigation(item.route)}
              style={({ pressed }) => [
                styles.navItem,
                isActive && styles.activeNavItem,
                pressed && styles.pressedNavItem,
              ]}
            >
              <Ionicons name={item.icon} size={27} color="#FFFFFF" />

              <Text style={[styles.navText, isActive && styles.activeNavText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Logout */}
      <View style={styles.bottomSection}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressedNavItem]}
        >
          <Ionicons name="log-out-outline" size={27} color="#FFFFFF" />

          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    backgroundColor: '#06132F',
    paddingHorizontal: 14,
  },

  logoContainer: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  navigation: {
    gap: 10,
  },

  navItem: {
    minHeight: 58,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },

  activeNavItem: {
    backgroundColor: '#1745D1',
  },

  pressedNavItem: {
    opacity: 0.7,
  },

  navText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },

  activeNavText: {
    fontWeight: '700',
  },

  bottomSection: {
    marginTop: 'auto',
    paddingBottom: 18,
  },

  logoutButton: {
    minHeight: 58,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
