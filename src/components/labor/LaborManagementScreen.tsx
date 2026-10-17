import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LaborMatrixTable } from './LaborMatrixTable';
import { WorkerDirectoryView } from './WorkerDirectoryView';

export default function LaborManagementScreen() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'workers'>('matrix');

  return (
    <View style={styles.container}>
      {/* Top Navigation Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'matrix' && styles.activeTabItem]}
          onPress={() => setActiveTab('matrix')}
        >
          <Text style={[styles.tabText, activeTab === 'matrix' && styles.activeTabText]}>
            Labor Items Matrix
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'workers' && styles.activeTabItem]}
          onPress={() => setActiveTab('workers')}
        >
          <Text style={[styles.tabText, activeTab === 'workers' && styles.activeTabText]}>
            Worker View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'matrix' ? (
          <LaborMatrixTable selectedDate="2026-10-17" />
        ) : (
          <WorkerDirectoryView />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#06132F',
    gap: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  activeTabItem: {
    backgroundColor: '#1745D1',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
