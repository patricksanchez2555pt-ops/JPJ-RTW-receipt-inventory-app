import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SidebarItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const NAV_ITEMS: SidebarItem[] = [
  {
    label: 'Inventory',
    icon: 'cube-outline',
  },
  {
    label: 'Create Transaction',
    icon: 'cart-outline',
  },
  {
    label: 'Transactions',
    icon: 'receipt-outline',
  },
  {
    label: 'Products',
    icon: 'pricetag-outline',
  },
  {
    label: 'Reports',
    icon: 'bar-chart-outline',
  },
  {
    label: 'Settings',
    icon: 'settings-outline',
  },
];

type SidebarProps = {
  activeItem: string;
  onItemPress?: (item: string) => void;
  onLogout?: () => void;
};

export default function Sidebar({ activeItem, onItemPress, onLogout }: SidebarProps) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Ionicons name="cube-outline" size={42} color="#FFFFFF" />
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <Pressable
              key={item.label}
              onPress={() => onItemPress?.(item.label)}
              style={({ pressed }) => [
                styles.navItem,
                isActive && styles.activeNavItem,
                pressed && styles.pressedNavItem,
              ]}
            >
              <Ionicons name={item.icon} size={27} color={isActive ? '#FFFFFF' : '#FFFFFF'} />

              <Text style={[styles.navText, isActive && styles.activeNavText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Logout */}
      <View style={styles.bottomSection}>
        <Pressable
          onPress={onLogout}
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
