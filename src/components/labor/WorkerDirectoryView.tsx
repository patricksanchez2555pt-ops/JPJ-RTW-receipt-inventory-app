import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useLaborItemStore } from '../../store/useLaborItemStore';
import { useOperationStore } from '../../store/useOperationStore';
import { useProductStore } from '../../store/useProductStore';
import { useSizeStore } from '../../store/useSizeStore';
import { useWorkerStore } from '../../store/useWorkerStore';
import type { LaborItem, Worker } from '../../types/localModels';

export const WorkerDirectoryView: React.FC = () => {
  const workers = useWorkerStore((state) => state.getAllWorkers());
  const getAllLaborItems = useLaborItemStore((state) => state.getAllLaborItems);
  const deleteLaborItem = useLaborItemStore((state) => state.deleteLaborItem);

  const getOperationById = useOperationStore((state) => state.getOperationById);
  const getProductById = useProductStore((state) => state.getProductById);
  const getAllSizes = useSizeStore((state) => state.getAllSizes);

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const allItems = getAllLaborItems();

  if (selectedWorker) {
    const workerItems = allItems.filter((item) => item.workerId === selectedWorker.id);
    const totalEarnings = workerItems.reduce((acc, item) => acc + item.subtotal, 0);

    return (
      <View style={styles.container}>
        {/* Detail Header / Back Action */}
        <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedWorker(null)}>
          <Text style={styles.backBtnText}>← Back to Workers List</Text>
        </TouchableOpacity>

        <View style={styles.workerDetailBanner}>
          <Text style={styles.workerDetailName}>{selectedWorker.name}</Text>
          <Text style={styles.workerDetailSub}>
            Total Earned: <Text style={styles.highlightText}>${totalEarnings.toFixed(2)}</Text>
          </Text>
        </View>

        {/* Detailed Breakdown List */}
        <FlatList
          data={workerItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: LaborItem }) => {
            const product = getProductById(item.productId);
            const operation = getOperationById(item.operationId);
            const size = getAllSizes().find((s) => s.id === item.sizeId);

            return (
              <View style={styles.laborItemCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.itemTitle}>
                    {product?.name ?? 'Product'} - {size?.name ?? 'Size'}
                  </Text>
                  <Text style={styles.itemDate}>{item.date}</Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.operationTag}>
                    Operation: {operation?.name ?? item.operationId}
                  </Text>
                  <Text style={styles.itemQtyText}>
                    Qty: {item.quantity} × ${item.ratePerUnit.toFixed(2)}
                  </Text>
                  <Text style={styles.itemSubtotal}>${item.subtotal.toFixed(2)}</Text>
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteLaborItem(item.id)}>
                  <Text style={styles.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No recorded labor entries for this worker.</Text>
          }
        />
      </View>
    );
  }

  return (
    <FlatList
      data={workers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      renderItem={({ item }: { item: Worker }) => {
        const workerItems = allItems.filter((i) => i.workerId === item.id);
        const totalPieces = workerItems.reduce((acc, i) => acc + i.quantity, 0);
        const totalEarned = workerItems.reduce((acc, i) => acc + i.subtotal, 0);

        return (
          <TouchableOpacity style={styles.workerCard} onPress={() => setSelectedWorker(item)}>
            <View>
              <Text style={styles.workerName}>{item.name}</Text>
              <Text style={styles.workerPhone}>{item.phone || 'No contact provided'}</Text>
            </View>

            <View style={styles.workerStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{totalPieces}</Text>
                <Text style={styles.statLabel}>Pieces</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>${totalEarned.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Earned</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  listPadding: { padding: 12 },
  backBtn: { paddingVertical: 8, marginBottom: 8 },
  backBtnText: { color: '#214bf3', fontWeight: '600', fontSize: 14 },
  workerDetailBanner: {
    backgroundColor: '#0b132b',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  workerDetailName: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  workerDetailSub: { color: '#94a3b8', marginTop: 4 },
  highlightText: { color: '#38bdf8', fontWeight: 'bold' },
  workerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  workerName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  workerPhone: { color: '#64748b', fontSize: 12, marginTop: 2 },
  workerStats: { flexDirection: 'row' },
  statBox: { alignItems: 'flex-end', marginLeft: 16 },
  statNum: { fontSize: 14, fontWeight: '700', color: '#0b132b' },
  statLabel: { fontSize: 10, color: '#64748b' },
  laborItemCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemTitle: { fontWeight: 'bold', color: '#0f172a' },
  itemDate: { fontSize: 11, color: '#64748b' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  operationTag: { fontSize: 12, color: '#334155' },
  itemQtyText: { fontSize: 12, color: '#475569' },
  itemSubtotal: { fontWeight: 'bold', color: '#166534' },
  deleteBtn: { marginTop: 8, alignSelf: 'flex-end' },
  deleteBtnText: { color: '#ef4444', fontSize: 11, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 24 },
});
