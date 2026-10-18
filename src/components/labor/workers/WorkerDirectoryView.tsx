import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import { useLaborItemStore } from '../../../store/useLaborItemStore';
import { useLaborRateStore } from '../../../store/useLaborRateStore';
import { useOperationStore } from '../../../store/useOperationStore';
import { useProductStore } from '../../../store/useProductStore';
import { useSizeStore } from '../../../store/useSizeStore';
import { useWorkerStore } from '../../../store/useWorkerStore';
import type { LaborItem, Worker } from '../../../types/localModels';
import LaborEntriesList from './components/labor-entries/LaborEntriesList';
import WorkerDetailHeader from './components/WorkerDetailHeader';
import WorkerList from './components/WorkerList';

interface WorkerDirectoryViewProps {
  startDate: string;
  endDate: string;
}

interface GroupedProductEntry {
  productId: string;
  productName: string;
  items: LaborItem[];
  productTotalPieces: number;
  productTotalEarned: number;
}

interface GroupedDateEntry {
  date: string;
  formattedLabel: string;
  products: GroupedProductEntry[];
  dateTotalPieces: number;
  dateTotalEarned: number;
}

type PickerState = {
  itemId: string;
  type: 'operation' | 'size';
  productId: string;
} | null;

const parseDateString = (dateStr: string): Date => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
  }
  return new Date(Number.NaN);
};

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}-${year}`;
};

const getFormattedDateLabel = (dateStr: string): string => {
  const dateObj = parseDateString(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  return `${dayName}, ${dateStr}`;
};

const getDatesInRange = (startStr: string, endStr: string): string[] => {
  const start = parseDateString(startStr);
  const end = parseDateString(endStr);
  const dates: string[] = [];

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDateToString(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const WorkerDirectoryView: React.FC<WorkerDirectoryViewProps> = ({ startDate, endDate }) => {
  const workers = useWorkerStore((state) => state.workers);
  const laborItems = useLaborItemStore((state) => state.laborItems);
  const addLaborItem = useLaborItemStore((state) => state.addLaborItem);
  const updateLaborItem = useLaborItemStore((state) => state.updateLaborItem);
  const deleteLaborItem = useLaborItemStore((state) => state.deleteLaborItem);

  const operations = useOperationStore((state) => state.operations);
  const products = useProductStore((state) => state.products);
  const sizes = useSizeStore((state) => state.sizes);
  const getLaborRate = useLaborRateStore((state) => state.getLaborRate);

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [activePicker, setActivePicker] = useState<PickerState>(null);

  const activeRangeDates = useMemo(() => getDatesInRange(startDate, endDate), [startDate, endDate]);
  const activeDateSet = useMemo(() => new Set(activeRangeDates), [activeRangeDates]);

  const allItems = useMemo(
    () =>
      Object.values(laborItems)
        .flatMap((workerItems) => Object.values(workerItems))
        .filter((item) => activeDateSet.has(item.date)),
    [laborItems, activeDateSet],
  );

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const operationById = useMemo(
    () => new Map(operations.map((operation) => [operation.id, operation])),
    [operations],
  );
  const sizeById = useMemo(() => new Map(sizes.map((size) => [size.id, size])), [sizes]);

  const groupedWorkerEntries = useMemo((): GroupedDateEntry[] => {
    if (!selectedWorker) return [];

    const workerItems = allItems.filter((item) => item.workerId === selectedWorker.id);
    const dateMap = new Map<string, Map<string, LaborItem[]>>();

    workerItems.forEach((item) => {
      if (!dateMap.has(item.date)) dateMap.set(item.date, new Map());
      const productMap = dateMap.get(item.date)!;
      if (!productMap.has(item.productId)) productMap.set(item.productId, []);
      productMap.get(item.productId)!.push(item);
    });

    const sortedDates = Array.from(dateMap.keys()).sort(
      (a, b) => parseDateString(b).getTime() - parseDateString(a).getTime(),
    );

    return sortedDates.map((date) => {
      const productMap = dateMap.get(date)!;
      let dateTotalPieces = 0;
      let dateTotalEarned = 0;

      const productEntries = Array.from(productMap.entries()).map(([productId, items]) => {
        const productTotalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
        const productTotalEarned = items.reduce((sum, item) => sum + item.subtotal, 0);
        dateTotalPieces += productTotalPieces;
        dateTotalEarned += productTotalEarned;

        const sortedItems = [...items].sort(
          (a, b) => (sizeById.get(a.sizeId)?.price ?? 0) - (sizeById.get(b.sizeId)?.price ?? 0),
        );

        return {
          productId,
          productName: productById.get(productId)?.name ?? 'Unknown Product',
          items: sortedItems,
          productTotalPieces,
          productTotalEarned,
        };
      });

      return {
        date,
        formattedLabel: getFormattedDateLabel(date),
        products: productEntries,
        dateTotalPieces,
        dateTotalEarned,
      };
    });
  }, [allItems, selectedWorker, productById, sizeById]);

  const getTotals = (workerId: string) => {
    const items = allItems.filter((item) => item.workerId === workerId);
    return {
      totalPieces: items.reduce((sum, item) => sum + item.quantity, 0),
      totalEarned: items.reduce((sum, item) => sum + item.subtotal, 0),
    };
  };

  const handleAddLaborItemForProduct = (date: string, productId: string, sizeId: string) => {
    if (!selectedWorker) return;

    const productOperations = operations.filter((operation) => operation.productId === productId);
    const productSizes = sizes.filter((size) => size.productId === productId);
    if (!productOperations.length || !productSizes.length) return;

    const operationId = productOperations[0].id;
    const rate = getLaborRate(productId, sizeId, operationId);

    addLaborItem({
      productId,
      sizeId,
      operationId,
      workerId: selectedWorker.id,
      date,
      quantity: 1,
      ratePerUnit: rate?.ratePerUnit ?? 0,
    });
  };

  const handleUpdateItemSelection = (
    item: LaborItem,
    type: 'operation' | 'size',
    newId: string,
  ) => {
    const updates: Partial<LaborItem> = {};
    const newOperationId = type === 'operation' ? newId : item.operationId;
    const newSizeId = type === 'size' ? newId : item.sizeId;

    if (type === 'operation') updates.operationId = newId;
    else updates.sizeId = newId;

    const rate = getLaborRate(item.productId, newSizeId, newOperationId);
    if (rate) updates.ratePerUnit = rate.ratePerUnit;

    updateLaborItem(item.id, updates);
    setActivePicker(null);
  };

  if (selectedWorker) {
    const workerItems = allItems.filter((item) => item.workerId === selectedWorker.id);
    const totalPieces = workerItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalEarnings = workerItems.reduce((sum, item) => sum + item.subtotal, 0);

    return (
      <View style={styles.container}>
        <WorkerDetailHeader
          worker={selectedWorker}
          startDate={startDate}
          endDate={endDate}
          totalPieces={totalPieces}
          totalEarned={totalEarnings}
          onBack={() => {
            setSelectedWorker(null);
            setActivePicker(null);
          }}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Labor Breakdown</Text>
          <View style={styles.entryCount}>
            <Text style={styles.entryCountText}>{workerItems.length} entries</Text>
          </View>
        </View>

        <LaborEntriesList
          groups={groupedWorkerEntries}
          operations={operations}
          sizes={sizes}
          operationById={operationById}
          sizeById={sizeById}
          activePicker={activePicker}
          setActivePicker={setActivePicker}
          onAddEntry={handleAddLaborItemForProduct}
          onSelect={handleUpdateItemSelection}
          onQuantityChange={(itemId, quantity) => updateLaborItem(itemId, { quantity })}
          onDelete={deleteLaborItem}
        />
      </View>
    );
  }

  return (
    <WorkerList
      workers={workers}
      getTotals={getTotals}
      startDate={startDate}
      endDate={endDate}
      onSelectWorker={(worker) => setSelectedWorker(worker)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  sectionHeader: {
    minHeight: 30,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: f(15),
    fontWeight: '700',
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
});
