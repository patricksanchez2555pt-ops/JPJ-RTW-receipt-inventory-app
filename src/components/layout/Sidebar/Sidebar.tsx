import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type SidebarItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
};

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
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
  // {
  //   label: 'Products',
  //   icon: 'pricetag-outline',
  //   route: '/products',
  // },
  // {
  //   label: 'Reports',
  //   icon: 'bar-chart-outline',
  //   route: '/reports',
  // },
  {
    label: 'Settings',
    icon: 'settings-outline',
    route: '/settings',
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const activeItem = NAV_ITEMS.find((item) => item.route === pathname)?.label ?? '';

  const handleNavigation = (route: Href) => {
    router.push(route);
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <View style={[styles.sidebar, collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded]}>
      <ScrollView
        style={[styles.scrollView, collapsed && styles.scrollViewCollapsed]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo and toggle button */}
        <View style={styles.logoContainer}>
          <Pressable style={styles.logoBox} onPress={() => handleNavigation('/inventory')}>
            {!collapsed && <Text style={styles.logoText}>JPJ RTW</Text>}

            {collapsed && <Text style={styles.logoShortText}>JPJ</Text>}
          </Pressable>

          <Pressable
            onPress={onToggle}
            style={({ pressed }) => [styles.toggleButton, pressed && styles.pressedNavItem]}
          >
            <Ionicons
              name={collapsed ? 'chevron-forward-outline' : 'chevron-back-outline'}
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
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
                  collapsed && styles.navItemCollapsed,
                  isActive && styles.activeNavItem,
                  pressed && styles.pressedNavItem,
                ]}
              >
                <Ionicons name={item.icon} size={27} color="#FFFFFF" />

                {!collapsed && (
                  <Text style={[styles.navText, isActive && styles.activeNavText]}>
                    {item.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Logout always at bottom */}
      <View style={[styles.bottomSection, collapsed && styles.bottomSectionCollapsed]}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            collapsed && styles.logoutButtonCollapsed,
            pressed && styles.pressedNavItem,
          ]}
        >
          <Ionicons name="log-out-outline" size={27} color="#FFFFFF" />

          {!collapsed && <Text style={styles.logoutText}>Logout</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: '#06132F',
  },

  sidebarExpanded: {
    width: 220,
  },

  sidebarCollapsed: {
    width: 76,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 14,
  },

  scrollViewCollapsed: {
    paddingHorizontal: 8,
  },

  scrollContent: {
    paddingBottom: 10,
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

  logoShortText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  toggleButton: {
    position: 'absolute',
    right: 8,
    top: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
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

  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
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
    paddingHorizontal: 14,
    paddingBottom: 18,
    paddingTop: 10,
  },

  bottomSectionCollapsed: {
    paddingHorizontal: 8,
  },

  logoutButton: {
    minHeight: 58,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },

  logoutButtonCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
