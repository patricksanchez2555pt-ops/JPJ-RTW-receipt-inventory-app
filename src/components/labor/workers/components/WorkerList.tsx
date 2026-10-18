import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Worker } from '@/types/localModels';
import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

type Props = {
  workers: Worker[];
  getTotals: (workerId: string) => { totalPieces: number; totalEarned: number };
  startDate: string;
  endDate: string;
  onSelectWorker: (worker: Worker) => void;
};

export default function WorkerList({
  workers,
  getTotals,
  startDate,
  endDate,
  onSelectWorker,
}: Props) {
  return (
    <FlatList
      style={styles.workerList}
      data={workers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.workerListContent}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <View style={styles.listHeaderText}>
            <Text style={styles.listTitle}>Workers Directory</Text>
            <Text style={styles.listSubtitle}>
              Showing records from {startDate} to {endDate}
            </Text>
          </View>
          <View style={styles.entryCount}>
            <Text style={styles.entryCountText}>{workers.length}</Text>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const totals = getTotals(item.id);
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => onSelectWorker(item)}
            style={({ pressed }) => [styles.workerCard, pressed && styles.pressed]}
          >
            <View style={styles.workerCardHeader}>
              <View style={styles.workerIdentity}>
                <View style={styles.workerAvatar}>
                  <Text style={styles.workerAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.workerIdentityText}>
                  <Text style={styles.workerName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.workerPhone} numberOfLines={1}>
                    {item.phone || 'No contact provided'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8494" />
            </View>
            <View style={styles.workerStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Pieces Logged</Text>
                <Text style={styles.statValue}>{totals.totalPieces}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Earned</Text>
                <Text style={styles.earnedValue}>₱{formatNumber(totals.totalEarned)}</Text>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No workers</Text>
          <Text style={styles.emptyText}>Workers will appear here once they are added.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  workerList: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  workerListContent: {
    padding: 16,
    paddingBottom: 28,
    flexGrow: 1,
  },
  listHeader: {
    minHeight: 56,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listHeaderText: {
    flex: 1,
  },
  listTitle: {
    color: '#0F172A',
    fontSize: f(20),
    fontWeight: '700',
  },
  listSubtitle: {
    marginTop: 2,
    color: '#64748B',
    fontSize: f(12),
  },
  entryCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  entryCountText: {
    color: '#475569',
    fontSize: f(11),
    fontWeight: '700',
  },
  workerCard: {
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  workerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workerIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerAvatar: {
    width: 42,
    height: 42,
    marginRight: 12,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  workerAvatarText: {
    color: '#1745D1',
    fontSize: f(16),
    fontWeight: '700',
  },
  workerIdentityText: {
    flex: 1,
    minWidth: 0,
  },
  workerName: {
    color: '#0F172A',
    fontSize: f(15),
    fontWeight: '700',
  },
  workerPhone: {
    marginTop: 2,
    color: '#64748B',
    fontSize: f(12),
  },
  workerStats: {
    marginTop: 12,
    paddingTop: 10,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    color: '#64748B',
    fontSize: f(11),
    fontWeight: '600',
  },
  statValue: {
    marginTop: 2,
    color: '#0F172A',
    fontSize: f(15),
    fontWeight: '700',
  },
  earnedValue: {
    marginTop: 2,
    color: '#16A34A',
    fontSize: f(15),
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 12,
    backgroundColor: '#E2E8F0',
  },
  emptyState: {
    flexGrow: 1,
    minHeight: 160,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: f(16),
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 4,
    color: '#64748B',
    fontSize: f(13),
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
