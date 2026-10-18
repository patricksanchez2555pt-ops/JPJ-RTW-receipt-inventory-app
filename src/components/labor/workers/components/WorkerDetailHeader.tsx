import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Worker } from '@/types/localModels';
import { f } from '@/utils/fontScale';
import { formatNumber } from '@/utils/formatNumber';

type Props = {
  worker: Worker;
  startDate: string;
  endDate: string;
  totalPieces: number;
  totalEarned: number;
  onBack: () => void;
};

export default function WorkerDetailHeader({
  worker,
  startDate,
  endDate,
  totalPieces,
  totalEarned,
  onBack,
}: Props) {
  return (
    <>
      <View style={styles.detailHeader}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={18} color="#1745D1" />
          <Text style={styles.backButtonText}>Workers</Text>
        </Pressable>
        <Text style={styles.dateRange}>
          {startDate} to {endDate}
        </Text>
      </View>

      <View style={styles.workerSummary}>
        <View style={styles.workerIdentity}>
          <View style={styles.workerAvatar}>
            <Text style={styles.workerAvatarText}>
              {worker.name.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.workerIdentityText}>
            <Text style={styles.workerDetailName} numberOfLines={1}>
              {worker.name}
            </Text>
            <Text style={styles.workerPhone} numberOfLines={1}>
              {worker.phone || 'No contact provided'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pieces</Text>
            <Text style={styles.statValue}>{totalPieces}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Earned</Text>
            <Text style={styles.earnedValue}>₱{formatNumber(totalEarned)}</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  detailHeader: {
    minHeight: 40,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    minHeight: 36,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonText: {
    color: '#1745D1',
    fontSize: f(14),
    fontWeight: '600',
  },
  dateRange: {
    color: '#64748B',
    fontSize: f(12),
    fontWeight: '500',
  },
  workerSummary: {
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  workerIdentity: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  workerAvatar: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  workerAvatarText: {
    color: '#1745D1',
    fontSize: f(15),
    fontWeight: '700',
  },
  workerIdentityText: {
    flex: 1,
    minWidth: 0,
  },
  workerDetailName: {
    color: '#0F172A',
    fontSize: f(15),
    fontWeight: '700',
  },
  workerPhone: {
    marginTop: 1,
    color: '#64748B',
    fontSize: f(11),
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'flex-end',
  },
  statLabel: {
    color: '#64748B',
    fontSize: f(10),
    fontWeight: '600',
  },
  statValue: {
    marginTop: 1,
    color: '#0F172A',
    fontSize: f(14),
    fontWeight: '700',
  },
  earnedValue: {
    marginTop: 1,
    color: '#16A34A',
    fontSize: f(14),
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 10,
    backgroundColor: '#E2E8F0',
  },
  pressed: {
    opacity: 0.7,
  },
});
